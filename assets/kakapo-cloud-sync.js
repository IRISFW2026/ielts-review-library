/* Kakapo private GitHub progress sync. No credentials or progress are embedded in the public site. */
(function () {
  "use strict";
  var CLOUD_CONFIG_KEY = "kakapo-cloud-config-v1";
  var CLOUD_TOKEN_KEY = "kakapo-cloud-token-session-v1";
  var REMOTE_PATH = "progress/kakapo.json";
  var DEFAULT_REPO = "IRISFW2026/ielts-progress-private";
  var STATUS_READY = "已连接私有仓库";
  var cfg = readJSON(CLOUD_CONFIG_KEY, {repo:DEFAULT_REPO, auto:true, remember:true, enabled:false});
  cfg = Object.assign({repo:DEFAULT_REPO, auto:true, remember:true, enabled:false},cfg);
  var app = null, token = "", connected = false, busy = false, queued = false;
  var pending = false, syncTimer = null, lastSynced = 0, lastPull = 0, inFlight = null;
  var suppressChanges = false, statusIsError=false, message = "未连接：学习记录仍保存在当前浏览器。";
  var ids = new Set(), lastRemoteSha = null;
  var SENTENCE_FLAG_PREFIX = '__sentenceDifficulty__:';
  var SENTENCE_REASON_IDS = new Set(['structure','translation','logic','misread','other']);

  function readJSON(key,fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function writeConfig() { try { localStorage.setItem(CLOUD_CONFIG_KEY,JSON.stringify(cfg)); } catch (_) {} }
  function readSession() { try { return sessionStorage.getItem(CLOUD_TOKEN_KEY)||""; } catch (_) { return ""; } }
  function saveSession() { try { if(cfg.remember && token) sessionStorage.setItem(CLOUD_TOKEN_KEY,token); else sessionStorage.removeItem(CLOUD_TOKEN_KEY); } catch (_) {} }
  function clearSession() { try { sessionStorage.removeItem(CLOUD_TOKEN_KEY); } catch (_) {} }
  function esc(v) { return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function validateRepo(full) {
    var m = /^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9_.-]{1,100})$/.exec(String(full||"").trim());
    if(!m || m[2]==="." || m[2]===".." || m[2].startsWith(".")) throw Error("请填写 owner/repository 格式的 GitHub 私有仓库名。");
    return {owner:m[1],name:m[2]};
  }
  function apiHeaders() { return {"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"}; }
  function baseUrl() { var r=validateRepo(cfg.repo); return "https://api.github.com/repos/"+encodeURIComponent(r.owner)+"/"+encodeURIComponent(r.name); }
  function filenameUrl() { return baseUrl()+"/contents/"+REMOTE_PATH; }
  function failure(code,context) {
    if(code===401) return "GitHub 令牌无效或已过期，请重新生成。";
    if(code===403) return "没有访问权限、令牌授权不足或遇到 GitHub 请求限额（403）。请检查仓库授权与 Contents 读写权限。";
    if(code===404) return context==="repo" ? "找不到私有仓库，或令牌未被授权访问它。请先建立 Private 仓库并添加 README。" : "未找到云端进度文件。";
    if(code===409||code===422) return "云端文件版本冲突；请稍后重新同步。";
    return "GitHub 请求失败（HTTP "+code+"）。";
  }
  function contentToBase64(text) {
    var bytes = new TextEncoder().encode(text),binary="";
    for(var i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    return btoa(binary);
  }
  function base64ToContent(str) {
    var binary=atob(String(str||"").replace(/\s/g,"")),bytes=new Uint8Array(binary.length);
    for(var i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  }
  function cleanRecord(id,r) {
    if(!ids.has(id) || !r || typeof r!=="object" || Array.isArray(r))return null;
    var level=Number(r.level);
    if(!Number.isInteger(level)||level<0||level>4)return null;
    var updated=Number.isFinite(r.updated)&&r.updated>=0?r.updated:0;
    if(level===0)return {level:0,updated:updated};
    var n=function(k,def,min,max){var x=r[k];return Number.isFinite(x)&&x>=min&&x<=max?x:def;};
    var record={level:level,updated:updated,
      due:n("due",0,0,9e15),reps:n("reps",0,0,1e7),
      intervalDays:n("intervalDays",0,0,3650),easeFactor:n("easeFactor",2.4,1,5),
      lapses:n("lapses",0,0,1e7),streak:n("streak",0,0,1e7)};
    if(typeof r.startedDay==="string" && /^\d{4}-\d{2}-\d{2}$/.test(r.startedDay))record.startedDay=r.startedDay;
    return record;
  }
  function cleanSentenceFlag(id,r) {
    var match=/^__sentenceDifficulty__:(\d{1,4})$/.exec(id);
    if(!match||Number(match[1])<1||Number(match[1])>1000||!r||typeof r!=="object"||Array.isArray(r))return null;
    if(!Number.isFinite(r.updated)||r.updated<0)return null;
    var reasons=Array.isArray(r.reasons)?Array.from(new Set(r.reasons.filter(function(x){return SENTENCE_REASON_IDS.has(x)}))).slice(0,5):[];
    return {updated:r.updated,createdAt:Number.isFinite(r.createdAt)&&r.createdAt>=0?r.createdAt:r.updated,removed:r.removed===true,reasons:reasons,note:typeof r.note==="string"?r.note.slice(0,2000):""};
  }
  function cleanState(input) {
    if(input==null)return {};
    if(typeof input!=="object"||Array.isArray(input))throw Error("云端进度文件结构无效，已停止同步，避免覆盖数据。");
    var out={},keys=Object.keys(input);
    if(keys.length>5000)throw Error("云端记录数量异常，已停止同步。");
    for(var id of keys) {
      if(id.indexOf(SENTENCE_FLAG_PREFIX)===0) {
        var flag=cleanSentenceFlag(id,input[id]);
        if(!flag)throw Error("云端难点句记录无效："+id+"。已停止同步。");
        out[id]=flag;continue;
      }
      if(!ids.has(id))continue;
      var x=cleanRecord(id,input[id]);
      if(!x)throw Error("云端词卡记录无效："+id+"。已停止同步。");
      out[id]=x;
    }
    return out;
  }
  function mergeStates(left,right) {
    var out={},names=new Set(Object.keys(left).concat(Object.keys(right)));
    for(var id of names) {
      var a=left[id],b=right[id];
      if(!a)out[id]=b;
      else if(!b)out[id]=a;
      else if(a.updated>b.updated)out[id]=a;
      else if(b.updated>a.updated)out[id]=b;
      else out[id]=JSON.stringify(a)>=JSON.stringify(b)?a:b;
    }
    return out;
  }
  function equal(a,b){var aa=Object.keys(a).sort(),bb=Object.keys(b).sort();return aa.length===bb.length && aa.every(function(k,i){return k===bb[i] && JSON.stringify(a[k])===JSON.stringify(b[k]);});}
  function currentState(){return cleanState(app.getState());}
  function updateStatus(text,isError) {
    message=text;statusIsError=!!isError;
    var mini=document.getElementById("cloud-mini-status");
    if(mini){mini.textContent=isError?"云端同步失败 · 请检查设置":busy?"云端同步中…":connected?"云端已连接 · "+(lastSynced?new Date(lastSynced).toLocaleTimeString():"等待同步"):"进度仅本地保存";mini.classList.toggle("cloud-error",!!isError);}
    var el=document.getElementById("cloud-status");
    if(el){el.textContent=text;el.classList.toggle("cloud-error",!!isError);}
    var b=document.getElementById("cloud-sync-now");
    if(b){b.disabled=!connected||busy;b.textContent=busy?"同步中…":"立即同步";}
    var c=document.getElementById("cloud-connect");
    if(c)c.disabled=busy;
  }
  function reportError(err){
    var text=err && err.message?err.message:"网络错误，未完成同步。";
    updateStatus("同步失败："+text,true);
  }
  function applyMerged(next) {
    var current=currentState(),merged=mergeStates(current,next);
    if(equal(current,merged))return false;
    suppressChanges=true;
    try { app.setState(merged); } finally { suppressChanges=false; }
    return true;
  }
  async function verifyRepoPrivate() {
    var r=await fetch(baseUrl(),{headers:apiHeaders(),cache:"no-store"});
    if(!r.ok)throw Error(failure(r.status,"repo"));
    var info=await r.json();
    if(info.private!==true)throw Error("已拒绝连接：只能同步到 Private 私有仓库，不能把个人学习记录写入公开仓库。");
    if(!info.default_branch)throw Error("私有仓库尚未初始化，请创建时勾选 README，然后重新连接。");
  }
  async function readRemote() {
    var res=await fetch(filenameUrl()+"?t="+Date.now(),{headers:apiHeaders(),cache:"no-store"});
    if(res.status===404)return {sha:null,state:{}};
    if(!res.ok)throw Error(failure(res.status,"file"));
    var data=await res.json(),parsed;
    if(data.type!=="file"||typeof data.content!=="string"||!data.sha)throw Error("云端文件不是有效的进度文件。");
    try { parsed=JSON.parse(base64ToContent(data.content)); } catch(e){throw Error("云端文件无法解析。已停止同步，防止覆盖。");}
    if(parsed.app!==app.appKey||![1,2].includes(parsed.schema))throw Error("云端文件属于不同的复习页或版本，已停止同步。");
    return {sha:data.sha,state:cleanState(parsed.state)};
  }
  async function putRemote(sha,records) {
    var payload={app:app.appKey,schema:2,updatedAt:new Date().toISOString(),state:records};
    var body={message:"Sync private Kakapo review progress",content:contentToBase64(JSON.stringify(payload))};
    if(sha)body.sha=sha;
    var res=await fetch(filenameUrl(),{method:"PUT",headers:Object.assign({"Content-Type":"application/json"},apiHeaders()),body:JSON.stringify(body),cache:"no-store"});
    if(res.status===409||res.status===422)return {conflict:true};
    if(!res.ok)throw Error(failure(res.status,"file"));
    return {conflict:false,body:await res.json()};
  }
  async function syncNow() {
    if(!connected||!token)return false;
    if(inFlight){queued=true;return inFlight;}
    inFlight=(async function(){
      busy=true;pending=false;
      updateStatus("正在与 GitHub 私有仓库核对词卡进度…");
      try {
        for(var attempt=0;attempt<4;attempt++){
          var remote=await readRemote();
          lastRemoteSha=remote.sha;
          var merged=mergeStates(currentState(),remote.state);
          if(remote.sha===null||!equal(merged,remote.state)) {
            var saved=await putRemote(remote.sha,merged);
            if(saved.conflict)continue;
          }
          applyMerged(merged);
          lastSynced=Date.now();lastPull=lastSynced;
          updateStatus(STATUS_READY+" · 上次同步 "+new Date(lastSynced).toLocaleTimeString()+" · "+Object.keys(merged).length+" 条记录。");
          return true;
        }
        throw Error("其他设备连续修改了云端文件；已保留本地记录，请重新同步。");
      } catch(e) {pending=true;reportError(e);return false;}
      finally {
        busy=false;inFlight=null;
        var again=queued;queued=false;
        var btn=document.getElementById("cloud-sync-now");if(btn)btn.disabled=!connected;
        if(again&&connected&&cfg.auto)requestSync(2500);
      }
    })();
    return inFlight;
  }
  function requestSync(delay) {
    if(!connected||!cfg.auto||suppressChanges)return;
    if(syncTimer)clearTimeout(syncTimer);
    syncTimer=setTimeout(function(){syncTimer=null;syncNow();},delay||1800);
  }
  function localChanged() {
    if(suppressChanges||!connected)return;
    pending=true;
    if(!busy)updateStatus("本地进度已保存，等待同步…");
    requestSync(1800);
  }
  async function connect(background) {
    if(!app)return false;
    if(!background) {
      var repoInput=document.getElementById("cloud-repo");
      if(repoInput)cfg.repo=repoInput.value.trim();
      var t=document.getElementById("cloud-token");
      if(t&&t.value.trim())token=t.value.trim();
      var remember=document.getElementById("cloud-remember");
      if(remember)cfg.remember=remember.checked;
      var auto=document.getElementById("cloud-auto");
      if(auto)cfg.auto=auto.checked;
    }
    try {
      validateRepo(cfg.repo);
      if(!token)throw Error("请先输入仅授予私有进度仓库 Contents 读写权限的 GitHub 令牌。");
      updateStatus("正在验证仓库是否为 Private…");
      await verifyRepoPrivate();
      connected=true;cfg.enabled=true;writeConfig();saveSession();
      var ok=await syncNow();
      if(!ok)updateStatus("已连接，但首次同步失败；本地进度保留。请检查网络后重试。",true);
      return ok;
    }catch(e){connected=false;reportError(e);return false;}
  }
  function disconnect() {
    connected=false;token="";cfg.enabled=false;writeConfig();clearSession();
    if(syncTimer)clearTimeout(syncTimer);syncTimer=null;
    updateStatus("已断开云端，原有本地学习记录仍然保留。");
  }
  function settingsHTML() {
    return '<section class="cloud-settings" aria-labelledby="cloud-title">'+
    '<h2 id="cloud-title">跨设备云端同步</h2>'+
    '<p class="small muted">仅同步词卡的复习进度；不上传题目、朗读音色或密码。云端存储必须使用你自己的 GitHub <strong>Private 私有仓库</strong>。断网可继续使用本地词库。</p>'+
    '<label>私有仓库（owner/repository）<input id="cloud-repo" type="text" spellcheck="false" autocomplete="off" value="'+esc(cfg.repo)+'" placeholder="'+DEFAULT_REPO+'"></label>'+
    '<label>GitHub Fine-grained Token（只授予此仓库 Contents: Read and write）<input id="cloud-token" type="password" spellcheck="false" autocomplete="off" placeholder="'+(token?"本标签页已连接令牌，留空即可":"github_pat_…")+'"></label>'+
    '<label class="cloud-check"><input id="cloud-auto" type="checkbox" '+(cfg.auto?"checked":"")+'><span>连接后自动同步（学习后、重新打开页面及返回标签页时）</span></label>'+
    '<label class="cloud-check"><input id="cloud-remember" type="checkbox" '+(cfg.remember?"checked":"")+'><span>只在当前标签页会话中暂存令牌，关闭标签页后失效</span></label>'+
    '<div class="cloud-actions"><button class="primary" type="button" id="cloud-connect">连接并合并</button><button type="button" id="cloud-sync-now" '+(!connected?'disabled':'')+'>立即同步</button><button type="button" id="cloud-disconnect">断开连接</button></div>'+
    '<p class="cloud-status small" role="status" aria-live="polite" id="cloud-status">'+esc(message)+'</p>'+
    '<details><summary>首次使用：创建安全的云端存储（需要一次设置）</summary><ol class="small muted">'+
    '<li><a href="https://github.com/new" target="_blank" rel="noopener noreferrer">在 GitHub 创建新仓库</a>，命名为 <code>ielts-progress-private</code>，选择 <strong>Private</strong>，勾选添加 README。</li>'+
    '<li><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">创建 Fine-grained Personal Access Token</a>：Repository access 只选这个私有仓库；Repository permissions 中仅将 <strong>Contents</strong> 设置为 <strong>Read and write</strong>；不要授予公开复习仓库写权限。</li>'+
    '<li>在 Windows 和 Mac 上打开同一篇复习页，使用相同的私有仓库与有效令牌连接。之后的记录会自动双向合并。</li></ol>'+
    '<p class="small muted"><strong>安全说明：</strong>令牌只发送到 <code>api.github.com</code>，不会写入公开 GitHub 仓库或导出文件。勾选暂存时会写入本标签页 sessionStorage；请只在自己可信的设备上使用。不要在聊天中发送令牌。两个设备的系统时间应大致准确，合并以每个词条最后修改时间为准。</p></details></section>';
  }
  function bindSettings() {
    var c=document.getElementById("cloud-connect"),n=document.getElementById("cloud-sync-now"),d=document.getElementById("cloud-disconnect");
    if(!c)return;
    c.onclick=function(){connect(false);};
    n.onclick=function(){syncNow();};
    d.onclick=disconnect;
    var a=document.getElementById("cloud-auto");
    if(a)a.onchange=function(){cfg.auto=a.checked;writeConfig();if(cfg.auto&&connected&&pending)requestSync(300);};
    var remember=document.getElementById("cloud-remember");
    if(remember)remember.onchange=function(){cfg.remember=remember.checked;writeConfig();saveSession();};
    updateStatus(message,statusIsError);
  }
  function init(config) {
    if(app)return;
    app=config;ids=new Set(config.ids||[]);
    var style=document.createElement("style");
    style.textContent=".cloud-settings{padding:18px;border:1px solid #cbded1;background:#f2f8f3;border-radius:16px;display:grid;gap:12px}.cloud-settings h2{margin:0;font-size:20px}.cloud-settings label:not(.cloud-check){display:grid;gap:6px;font-size:13px}.cloud-settings input[type=text],.cloud-settings input[type=password]{width:100%;min-width:0;padding:10px 12px;border:1px solid #b8cec0;border-radius:9px;background:#fff;color:var(--ink);font:inherit}.cloud-check{display:flex!important;gap:10px!important;align-items:flex-start;line-height:1.5;font-size:13px}.cloud-check input{margin-top:4px}.cloud-actions{display:flex;flex-wrap:wrap;gap:8px}.cloud-actions button{padding:9px 13px}.cloud-status{color:#377257}.cloud-status.cloud-error{color:#a5443c}.cloud-settings details{font-size:13px}.cloud-settings li{margin:9px 0}.cloud-settings code{overflow-wrap:anywhere}";
    style.textContent+=".cloud-mini{font-size:11px;line-height:1.65;margin:14px 7px 0;padding:8px 11px;border:1px solid #ccdcd2;border-radius:10px;color:#4b7462;background:#f0f7f0}.cloud-mini.cloud-error{color:#a0443b;background:#fff2ee;border-color:#ebc0b8}";
    document.head.appendChild(style);
    token=cfg.enabled?readSession():"";
    if(cfg.enabled && token) { setTimeout(function(){connect(true);},100); }
    else if(cfg.enabled) message="尚未连接：当前标签页没有令牌，请在学习设置中重新输入。";
    updateStatus(message,false);
    window.addEventListener("focus",function(){if(connected&&cfg.auto&&Date.now()-lastPull>45000)syncNow();});
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&connected&&cfg.auto&&Date.now()-lastPull>45000)syncNow();});
    setInterval(function(){if(connected&&cfg.auto&&document.visibilityState==="visible"&&Date.now()-lastPull>90000)syncNow();},90000);
  }
  window.KakapoCloudSync={init:init,settingsHTML:settingsHTML,bindSettings:bindSettings,localChanged:localChanged,syncNow:syncNow,disconnect:disconnect};
})();
