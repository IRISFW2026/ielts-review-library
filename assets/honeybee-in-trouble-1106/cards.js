'use strict';
const DATA=window.HONEYBEE_DATA;
for(const c of DATA.cards){c.source=DATA.sources[c.sourceId];c.examples=DATA.exampleGroups[c.exampleGroup];}
const KEY='iris-honeybee-in-trouble-1106-v1';
const TYPE={word:'单词',phrase:'短语',collocation:'固定搭配',chunk:'句子语块'};
const LABEL={0:'未学',1:'不认识',2:'模糊',3:'认识',4:'熟练'};
const ALL_IDS=new Set(DATA.cards.map(c=>c.id));
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pathMaterial=document.body.dataset.material||'honeybee';
let records={},settings={rate:.9,voice:'',repeats:1},savedView={};
function validRecords(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('记录格式不正确');
 const out={};
 for(const [id,r] of Object.entries(obj)){
  if(!ALL_IDS.has(id))continue;
  if(!r||typeof r!=='object'||!Number.isInteger(r.level)||r.level<0||r.level>4)throw Error('掌握等级不正确');
  if(!Number.isFinite(r.due)||r.due<0||!Number.isInteger(r.reps)||r.reps<0)throw Error('复习时间或次数不正确');
  out[id]={level:r.level,due:r.due,reps:r.reps,favourite:r.favourite===true,lastSeen:Number.isFinite(r.lastSeen)?r.lastSeen:0};
 }
 return out;
}
try{const obj=JSON.parse(localStorage.getItem(KEY)||'{}');records=validRecords(obj.records||{});if(obj.settings){settings.rate=Number(obj.settings.rate)>=.6&&Number(obj.settings.rate)<=1.2?Number(obj.settings.rate):.9;settings.voice=typeof obj.settings.voice==='string'?obj.settings.voice:'';settings.repeats=[1,2,3].includes(obj.settings.repeats)?obj.settings.repeats:1}savedView=obj.view||{}}catch{}
const material=DATA.materials.find(m=>m.id===pathMaterial)||DATA.materials[0];
let focusedQuestion=null,paragraph='all';
let mode='cards',type='all',scope='all',priority='all',search='',queue=[],index=0,revealed=false,voices=[],utterance=null,sequence=0,gap=null,toastTimer=null,shuffled=false;
function rec(c){return records[c.id]||{level:0,due:0,reps:0,favourite:false,lastSeen:0}}
function notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records,settings,view:{...savedView,[material.id]:{id:queue[index]?.id,mode,type,scope,priority,search,focusedQuestion,paragraph}}}))}catch{notify('进度未能保存，请导出复习记录备份。')}}
function stop(){sequence++;clearTimeout(gap);if(window.speechSynthesis)window.speechSynthesis.cancel();utterance=null;$('audio-status').textContent='朗读已停止';}
function speak(texts,slow=false,repeats=settings.repeats){
 stop();if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){notify('当前浏览器不支持合成朗读，请使用支持英语朗读的浏览器。');return}
 const loaded=window.speechSynthesis.getVoices();voices=loaded.filter(v=>/^en(?:-|_)/i.test(v.lang));
 if(loaded.length&&!voices.length){notify('当前设备没有可用的英语音色，请在系统中添加英语语音后重试。');return}
 const token=sequence,items=(Array.isArray(texts)?texts:[texts]).flatMap(text=>Array.from({length:repeats},()=>String(text))),voice=voices.find(v=>v.voiceURI===settings.voice)||voices.find(v=>v.lang==='en-GB'&&/natural|online|daniel/i.test(v.name))||voices.find(v=>v.lang==='en-GB')||voices.find(v=>/natural|google|samantha/i.test(v.name))||voices[0];let at=0;
 function next(){if(token!==sequence)return;if(at>=items.length){$('audio-status').textContent='朗读完成';utterance=null;return}
  const u=new SpeechSynthesisUtterance(items[at].replace(/…/g,', ').replace(/\bA\b/g,'A').replace(/\[.*?\]/g,''));utterance=u;u.lang=voice?.lang||'en-GB';if(voice)u.voice=voice;u.rate=slow?.7:settings.rate;
  $('audio-status').textContent=`正在朗读 ${at+1} / ${items.length} · ${voice?.name||'默认英语音色'}`;
  u.onend=()=>{if(token!==sequence)return;at++;gap=setTimeout(next,550)};
  u.onerror=e=>{if(token===sequence&&!['canceled','interrupted'].includes(e.error)){$('audio-status').textContent='朗读未能完成';notify('语音播放失败，请切换英语音色后重试。')}};
  window.speechSynthesis.speak(u);
 }next();
}
function audioButton(en,label='朗读',slow=false){return `<button class="pronounce" data-say="${esc(en)}"${slow?' data-slow="1"':''} aria-label="${esc(label+' '+en)}">▷ ${esc(label)}</button>`}
function countStats(){const cards=DATA.cards.filter(c=>c.material===material.id);$('total').textContent=cards.length;$('learnt').textContent=cards.filter(c=>rec(c).level>0).length;$('mastered').textContent=cards.filter(c=>rec(c).level===4).length;$('due').textContent=cards.filter(c=>rec(c).level>0&&rec(c).due<=Date.now()).length}
function filtered(){const q=search.trim().toLocaleLowerCase();return DATA.cards.filter(c=>c.material===material.id&&(paragraph==='all'||c.paragraph===paragraph)&&(!focusedQuestion||c.questions.includes(focusedQuestion))&&(type==='all'||c.type===type)&&(priority==='all'||(priority==='weakq'?c.priority:priority==='4plus'?c.stars>=4:c.stars===Number(priority)))&&(scope==='all'||(scope==='new'&&rec(c).level===0)||(scope==='due'&&rec(c).level>0&&rec(c).due<=Date.now())||(scope==='weak'&&rec(c).level<3)||(scope==='mastered'&&rec(c).level===4)||(scope==='favourites'&&rec(c).favourite))&&(!q||[c.en,c.zh,c.note,c.source.en,c.source.zh,...c.collocations.flatMap(x=>[x.en,x.zh])].join(' ').toLocaleLowerCase().includes(q)))}
function rebuild(preferred){stop();queue=filtered();index=Math.max(0,queue.findIndex(c=>c.id===preferred));revealed=false;shuffled=false;render()}
function detail(c){return `<div class="back-term"><div class="term">${esc(c.en)}</div>${audioButton(c.en)}</div><p class="ipa">${esc(c.ipa)}</p><p class="meaning">${esc(c.zh)}</p><p class="stars" aria-label="${c.stars}星重要度">${stars(c)}</p><div class="badges"><span class="badge">${esc(c.origin)}</span><span class="badge">${esc(TYPE[c.type])}</span><span class="badge priority">${stars(c)}</span>${c.priority?'<span class="badge">错题关联</span>':''}</div>${c.note?`<p class="note">${esc(c.note)}</p>`:''}<div class="section-label"><h3>原文／题干定位句</h3><small>定位 ${esc(c.sourceId)}</small></div><div class="source"><p class="en" lang="en">${esc(c.source.en)}</p><p class="zh">${esc(c.source.zh)}</p>${audioButton(c.source.en,'原句朗读')}${audioButton(c.source.en,'慢速',true)}</div><div class="section-label"><h3>听说读写拓展</h3><small>自拟练习句 · 同主题表达迁移</small></div><div class="examples">${c.examples.map(e=>`<section class="example"><div class="example-label">${esc(e.skill)}</div><p class="en" lang="en">${esc(e.en)}</p><p class="zh">${esc(e.zh)}</p>${audioButton(e.en,'例句朗读')}${audioButton(e.en,'慢速',true)}</section>`).join('')}</div><div class="section-label"><h3>${esc(c.collocationLabel||'常见搭配')}</h3></div><div class="collocations">${c.collocations.map(e=>`<div class="collocation"><div><b lang="en">${esc(e.en)}</b><small>${esc(e.zh)}</small></div>${audioButton(e.en)}</div>`).join('')}</div>`}
function render(){countStats();$('extra').hidden=true;document.querySelector('.filters').hidden=false;document.querySelector('.roundbar').hidden=false;if(['questions','pairs','passage'].includes(mode)){renderExtra();persist();return;}$('count').textContent=`${queue.length} / ${material.count} 张${shuffled?' · 已打乱':''}`;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',b.dataset.mode===mode?'true':'false')});$('study').hidden=mode!=='cards';$('library').hidden=mode!=='library';
 if(!queue.length){const html=`<section class="empty"><h2>${scope==='due'?'暂时没有到期卡片':'当前筛选没有卡片'}</h2><p>${scope==='due'?'可以学习新卡，或切回全部继续复习。':'试试其他关键词，或清除筛选。'}</p><button class="primary" data-clear>查看全部卡片</button></section>`;$(mode==='cards'?'study':'library').innerHTML=html;return}
 if(mode==='library'){persist();$('library').innerHTML=queue.map(c=>`<details data-card="${esc(c.id)}"><summary><span class="list-term" lang="en">${esc(c.en)}</span><span class="badge priority">${stars(c)}</span><span class="badge">${esc(LABEL[rec(c).level])}</span><span class="list-zh">${esc(c.zh)}</span></summary><div class="detail-body" data-details="${esc(c.id)}"></div></details>`).join('');return}
 index=Math.min(index,queue.length-1);const c=queue[index],r=rec(c);
 $('study').innerHTML=`<article class="card" data-current="${esc(c.id)}"><div class="card-top"><span id="card-counter">${index+1} / ${queue.length} · ${esc(LABEL[r.level])}</span><div class="badges"><span class="badge priority">${stars(c)}</span>${c.priority?'<span class="badge">错题关联</span>':''}<span class="badge">${esc(TYPE[c.type])}</span></div><button class="star" data-star aria-pressed="${r.favourite}" aria-label="${r.favourite?'取消收藏':'收藏卡片'}">${r.favourite?'★':'☆'}</button></div>${revealed?`<div class="back">${detail(c)}</div><div class="grades" aria-label="评价本次掌握程度"><button data-grade="1">不认识<small>10 分钟后</small></button><button data-grade="2">模糊<small>1 天后</small></button><button data-grade="3">认识<small>3 天后</small></button><button data-grade="4">熟练<small>7 天后</small></button></div>`:`<div class="front"><button class="term" lang="en" data-flip aria-label="查看 ${esc(c.en)} 的中文与例句">${esc(c.en)}</button><div>${audioButton(c.en,'单词 / 语块发音')}${audioButton(c.en,'慢速',true)}</div><p class="front-hint">先回忆中文与用法，再翻到背面</p><button class="primary reveal" data-flip>翻到背面 ↻</button></div>`}</article><nav class="navigation" aria-label="卡片导航"><button data-prev${index===0?' disabled':''}>← 上一张</button><div class="nav-group">${revealed?'<button data-flip>回到正面 ↻</button><button data-all-audio>连播英文</button>':''}<button data-next${index===queue.length-1?' disabled':''}>下一张 →</button></div></nav>`;persist();
}
function flip(){if(mode!=='cards'||!queue.length)return;stop();revealed=!revealed;render()}
function move(delta){if(!queue.length)return;const next=index+delta;if(next<0||next>=queue.length){notify('已到本轮边界');return}stop();index=next;revealed=false;render();$('study').scrollIntoView({block:'start',behavior:'instant'})}
function grade(level){if(!revealed||!queue[index])return;const c=queue[index],next=queue[index+1]?.id,delays={1:600000,2:86400000,3:259200000,4:604800000};records[c.id]={...rec(c),level,due:Date.now()+delays[level],lastSeen:Date.now(),reps:rec(c).reps+1};persist();
 if(scope==='all'||scope==='favourites'){if(index<queue.length-1){move(1)}else{revealed=false;render();notify('本轮最后一张已记录，可切换筛选继续复习。')}}else{rebuild(next);if(!queue.length)notify('当前筛选已完成。')}
}
function clearFilters(){focusedQuestion=null;paragraph='all';$('paragraph').value='all';type='all';scope='all';priority='all';search='';$('type').value=type;$('scope').value=scope;$('priority').value=priority;$('search').value='';rebuild()}
function loadVoices(){voices=(window.speechSynthesis?.getVoices()||[]).filter(v=>/^en(?:-|_)/i.test(v.lang));$('voice').innerHTML='<option value="">自动选择英语音色</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} · ${esc(v.lang)}</option>`).join('');$('voice').value=voices.some(v=>v.voiceURI===settings.voice)?settings.voice:'';$('voice-hint').textContent=voices.length?`${voices.length} 个英语音色可用；默认优先英式英语。`:'正在等待设备提供英语音色；实际音色取决于当前系统。'}
function exportProgress(){const now=new Date(),pad=n=>String(n).padStart(2,'0'),stamp=pad(now.getMonth()+1)+pad(now.getDate())+'-'+now.getFullYear()+'-'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds());const blob=new Blob([JSON.stringify({format:KEY,version:1,exportedAt:now.toISOString(),records,settings,trials},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=stamp+'-阅读-Honeybee-in-trouble-复习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
async function importProgress(file){try{if(!file) return;if(file.size>2e6)throw Error('文件过大');const obj=JSON.parse(await file.text());if(obj.format!==KEY||obj.version!==1)throw Error('不是本词库的复习记录');const incoming=validRecords(obj.records);let count=0;for(const [id,r] of Object.entries(incoming)){if(!records[id]||r.lastSeen>=rec({id}).lastSeen){records[id]=r;count++}}if(obj.trials){for(const q of DATA.questions){const t=obj.trials[q.no];if(t&&q.choices.some(o=>o.key===t.choice))trials[q.no]={choice:t.choice,checked:t.checked===true}}saveTrials()}persist();rebuild(queue[index]?.id);notify(`已合并 ${count} 条复习记录；其他词库不受影响。`)}catch(e){notify('导入失败：'+e.message)}finally{$('import-file').value=''}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-say')){speak(b.dataset.say,!!b.dataset.slow);return}if(b.dataset.mode){stop();mode=b.dataset.mode;render();return}if(b.hasAttribute('data-flip'))flip();else if(b.hasAttribute('data-prev'))move(-1);else if(b.hasAttribute('data-next'))move(1);else if(b.hasAttribute('data-grade'))grade(Number(b.dataset.grade));else if(b.hasAttribute('data-star')){const c=queue[index];records[c.id]={...rec(c),favourite:!rec(c).favourite};persist();if(scope==='favourites')rebuild(c.id);else render()}else if(b.hasAttribute('data-clear'))clearFilters();else if(b.hasAttribute('data-shuffle')){stop();for(let i=queue.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}index=0;revealed=false;shuffled=true;render()}else if(b.hasAttribute('data-stop'))stop();else if(b.hasAttribute('data-all-audio')){const c=queue[index];if(c)speak([c.en,c.source.en,...c.examples.map(x=>x.en),...c.collocations.map(x=>x.en)])}else if(b.id==='export')exportProgress();else if(b.id==='import')$('import-file').click();else if(b.id==='voice-test')speak('Protecting native bees is beneficial to other local creatures. A diverse agricultural system can be more resilient.');});
// Render long card backs only when a library row is opened.
$('library').addEventListener('toggle',e=>{if(e.target.tagName!=='DETAILS'||!e.target.open)return;const node=e.target.querySelector('[data-details]');if(node&&!node.children.length){const c=DATA.cards.find(c=>c.id===node.dataset.details);node.innerHTML=detail(c)}},true);
$('search').addEventListener('input',e=>{focusedQuestion=null;search=e.target.value;rebuild()});for(const id of ['type','scope','priority','paragraph'])$(id).addEventListener('change',e=>{focusedQuestion=null;if(id==='type')type=e.target.value;if(id==='scope')scope=e.target.value;if(id==='priority')priority=e.target.value;if(id==='paragraph')paragraph=e.target.value;rebuild()});
$('voice').addEventListener('change',e=>{stop();settings.voice=e.target.value;persist()});$('rate').value=String(settings.rate);$('rate').addEventListener('change',e=>{stop();settings.rate=Number(e.target.value);persist()});$('repeats').value=String(settings.repeats);$('repeats').addEventListener('change',e=>{stop();settings.repeats=Number(e.target.value);persist()});$('import-file').addEventListener('change',e=>importProgress(e.target.files[0]));
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea,button,a,summary')||e.altKey||e.ctrlKey||e.metaKey||mode!=='cards')return;if(e.code==='Space'){e.preventDefault();flip()}else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowLeft')move(-1);else if(e.key.toLowerCase()==='p'&&queue[index])speak(queue[index].en);else if(e.key==='Escape')stop()});
window.addEventListener('pagehide',stop);if(window.speechSynthesis)window.speechSynthesis.addEventListener('voiceschanged',loadVoices);

function stars(c){return '★'.repeat(c.stars)+'☆'.repeat(5-c.stars)}
function textPair(s,label='英文朗读'){return `<p class="en" lang="en">${esc(s.en)}</p><p class="zh">${esc(s.zh)}</p>${audioButton(s.en,label)}${audioButton(s.en,'慢速',true)}`}

const QKEY=KEY+'-questions';let trials={};
try{const old=JSON.parse(localStorage.getItem(QKEY)||'{}');for(const q of DATA.questions){const t=old[q.no];if(t&&q.choices.some(o=>o.key===t.choice))trials[q.no]={choice:t.choice,checked:t.checked===true}}}catch{}
function saveTrials(){try{localStorage.setItem(QKEY,JSON.stringify(trials))}catch{notify('重练记录未能保存。')}}
function qKind(q){return q.no<=30?'YES / NO / NOT GIVEN':q.no<=35?'单项选择':'句尾匹配'}
function questionHTML(q){const t=trials[q.no]||{};return `<article class="question-card" data-wrong="${q.wrong}" id="question-${q.no}"><div class="question-head"><span class="badge">第 ${q.no} 题 · ${qKind(q)}</span><span class="badge ${q.wrong?'priority':''}">${q.wrong?'首次错题':'首次正确'}</span></div><p class="en" lang="en">${esc(q.en)}</p>${audioButton(q.en,'题干朗读')}<div class="trial-options" role="group" aria-label="第${q.no}题选项">${q.choices.map(o=>`<button data-qanswer="${q.no}" data-choice="${esc(o.key)}" aria-pressed="${t.choice===o.key}"><b>${esc(o.key)}</b>${q.no>30?' · '+esc(o.en):''}</button>`).join('')}</div><details><summary>查看题干中文与语块</summary><p class="meaning">${esc(q.zh)}</p><table><tbody>${q.chunks.map(c=>`<tr><td lang="en">${esc(c.en)} ${audioButton(c.en)}</td><td>${esc(c.zh)}</td></tr>`).join('')}</tbody></table>${q.no>30?'<p>'+q.choices.map(o=>esc(o.key+' · '+o.zh)).join('<br>')+'</p>':''}</details><button class="primary" data-qcheck="${q.no}" ${!t.choice?'disabled':''}>核对答案与原文依据</button><div class="trial-result" ${t.checked?'':'hidden'}>${t.checked?answerHTML(q,t):''}</div></article>`}
function answerHTML(q,t){return `<p role="status"><b>${t.choice===q.answer?'本次回答正确':'本次选择：'+esc(t.choice)} · 答案表：${esc(q.answer)}</b></p><p>首次选择：${esc(q.chosen)}；重练记录与首次结果分别保存。</p>${q.evidence.map(id=>`<div class="source"><span class="badge">${esc(id)}</span>${textPair(DATA.sources[id],'依据朗读')}</div>`).join('')}<p class="question-note">${esc(q.note)}</p><button data-openq="${q.no}">复习本题词汇 →</button>`}
function renderExtra(){
 $('study').hidden=true;$('library').hidden=true;$('extra').hidden=false;document.querySelector('.filters').hidden=true;document.querySelector('.roundbar').hidden=true;
 document.querySelectorAll('[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 if(mode==='questions'){
  $('count').textContent='14 道题 · 3 道首次错题';
  $('extra').innerHTML=`<p class="section-intro">先读懂题干并选择，再核对原文。27—30题判断观点；31—35题单选；36—40题句尾匹配。题干和选项按上传版本保留，其中部分英语措辞不规范，解释会提示。第29题答案依据存在争议，核对后查看说明。</p><div class="extra-actions"><button data-qscope="all">全部14题</button><button data-qscope="wrong">只看3道错题</button></div><div id="question-list">${DATA.questions.map(questionHTML).join('')}</div>`;
 }else if(mode==='pairs'){
  $('count').textContent=DATA.pairs.length+' 组关键对应';
  $('extra').innerHTML='<p class="section-intro">先看题目表达，回忆原文如何表达，再展开核对。保留对象、范围、条件与时间。</p>'+DATA.pairs.map(p=>`<details class="pair"><summary lang="en">${esc(p[0])}</summary>${audioButton(p[0],'题目表达朗读')}<p class="en" lang="en">${esc(p[1])}</p>${audioButton(p[1],'原文对应朗读')}<p class="meaning">${esc(p[2])}</p><p class="question-note">第${p[3]}题 · ${esc(p[4])}</p></details>`).join('');
 }else{
  const entries=Object.entries(DATA.sources).filter(([k])=>!k.startsWith('Q'));
  $('count').textContent='8 段 · '+entries.length+' 句';
  $('extra').innerHTML='<p class="section-intro">点开中文核对句意。重点难句另有结构提示；原文保留上传版本。单词卡背面使用同一份原句和译文。</p><div class="passage-tools">'+DATA.paragraphs.map(p=>`<a class="backlink" href="#passage-${p}">${p}段</a>`).join(' ')+'</div>'+DATA.paragraphs.map(p=>`<section id="passage-${p}"><h2>${p}段</h2><button data-openparagraph="${p}">复习${p}段全部词汇 →</button>${entries.filter(([k])=>k.startsWith(p)).map(([k,s])=>`<article class="question-card"><span class="badge">${esc(k)}</span><p class="en" lang="en">${esc(s.en)}</p>${audioButton(s.en,'原句朗读')}${audioButton(s.en,'慢速',true)}<details><summary>查看中文${s.note?'与结构提示':''}</summary><p class="zh">${esc(s.zh)}</p>${s.note?'<p class="question-note">'+esc(s.note)+'</p>':''}</details></article>`).join('')}</section>`).join('');
 }
 persist();
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.qscope)document.querySelectorAll('[data-wrong]').forEach(n=>n.hidden=b.dataset.qscope==='wrong'&&n.dataset.wrong!=='true');
 if(b.dataset.qanswer){const no=Number(b.dataset.qanswer);trials[no]={choice:b.dataset.choice,checked:false};saveTrials();const article=b.closest('article');article.querySelectorAll('[data-qanswer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));article.querySelector('[data-qcheck]').disabled=false;article.querySelector('.trial-result').hidden=true;}
 if(b.dataset.qcheck){const no=Number(b.dataset.qcheck),q=DATA.questions.find(q=>q.no===no),t=trials[no];if(!t?.choice)return;t.checked=true;saveTrials();const result=b.closest('article').querySelector('.trial-result');result.innerHTML=answerHTML(q,t);result.hidden=false;}
 if(b.dataset.openq||b.dataset.openparagraph){mode='cards';type='all';scope='all';priority='all';search='';focusedQuestion=b.dataset.openq?Number(b.dataset.openq):null;paragraph=b.dataset.openparagraph||'all';for(const [id,val] of Object.entries({type,scope,priority,search,paragraph}))$(id).value=val;rebuild();notify(focusedQuestion?'已显示第'+focusedQuestion+'题相关词汇。':'已显示'+paragraph+'段全部词汇。');}
});

const previous=savedView[material.id]||{};
if(['cards','library','questions','pairs','passage'].includes(previous.mode))mode=previous.mode;
if(['all','word','phrase','collocation','chunk'].includes(previous.type))type=previous.type;
if(['all','new','due','weak','mastered','favourites'].includes(previous.scope))scope=previous.scope;
if(['all','1','2','3','4','5','4plus','weakq'].includes(previous.priority))priority=previous.priority;
if(typeof previous.search==='string')search=previous.search;if(['all',...DATA.paragraphs,'Q'].includes(previous.paragraph))paragraph=previous.paragraph;
if(Number.isInteger(previous.focusedQuestion)&&previous.focusedQuestion>=27&&previous.focusedQuestion<=40)focusedQuestion=previous.focusedQuestion;
for(const [id,val] of Object.entries({type,scope,priority,search,paragraph}))$(id).value=val;
rebuild(savedView[material.id]?.id);loadVoices();

