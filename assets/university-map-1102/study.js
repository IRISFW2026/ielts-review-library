'use strict';
// Reuses cards.js speech, safe rendering, progress validation and review scheduling.
const U=window.UNIVERSITY_MAP_1102;
const PRACTICE_KEY='iris-university-map-1102-practice-v1';
const PRACTICE_IDS=new Set([...U.models.map(m=>m.id),...U.corrections.map(e=>e.id)]);
let workbook={items:{},draft:{text:'',updated:0}},activeView='overview',sentenceId='m01',practiceScope='all',showChinese=false;
function validWorkbook(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||!obj.items||typeof obj.items!=='object'||Array.isArray(obj.items))throw Error('练习记录格式不正确');
 const clean={items:{},draft:{text:'',updated:0}};
 for(const [id,r] of Object.entries(obj.items)){
  if(!PRACTICE_IDS.has(id))continue;
  if(!r||typeof r.text!=='string'||r.text.length>10000||!Number.isFinite(r.updated)||r.updated<0||![0,1,2].includes(r.level))throw Error('句子记录无效');
  clean.items[id]={text:r.text,updated:r.updated,level:r.level};
 }
 if(obj.draft){if(typeof obj.draft.text!=='string'||obj.draft.text.length>100000||!Number.isFinite(obj.draft.updated)||obj.draft.updated<0)throw Error('复写记录无效');clean.draft={text:obj.draft.text,updated:obj.draft.updated};}
 return clean;
}
try{const raw=localStorage.getItem(PRACTICE_KEY);if(raw)workbook=validWorkbook(JSON.parse(raw));}catch{notify('练习记录未能读取，请导入之前的进度备份。');}
function saveWorkbook(){try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(workbook));}catch{notify('练习暂时无法保存，请导出记录备份。');}}
function saveItem(id,text,level=workbook.items[id]?.level||0){workbook.items[id]={text,level,updated:Date.now()};saveWorkbook();updatePracticeCount();}
window.universityBackup=()=>workbook;
window.universityImport=obj=>{
 const incoming=validWorkbook(obj);
 for(const [id,r] of Object.entries(incoming.items))if(!workbook.items[id]||r.updated>=workbook.items[id].updated)workbook.items[id]=r;
 if(incoming.draft.updated>=workbook.draft.updated)workbook.draft=incoming.draft;
 saveWorkbook();renderErrors();renderPractice();$('draft').value=workbook.draft.text;draftCount();
};
const wholeModel=()=>[1,2,3,4].map(p=>U.models.filter(m=>m.p===p).map(m=>m.en).join(' ')).join('\n\n');
function setView(v){if(!['overview','model','cards','errors','practice'].includes(v))return;stop();activeView=v;document.querySelectorAll('.view-panel').forEach(el=>el.hidden=el.id!=='panel-'+v);document.querySelectorAll('.study-nav [data-view]').forEach(b=>{if(b.dataset.view===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});history.replaceState(null,'','#'+v);if(v==='practice')renderPractice();}
function initOverview(){
 $('facts').innerHTML=U.facts.map(f=>`<tr><td>${esc(f[0])}</td><td>${esc(f[1])}</td><td><span lang="en">${esc(f[2])}</span><br>${audioButton(f[2])}</td></tr>`).join('');
 $('plan').innerHTML=[['01','引言','改写：现在布局＋未来规划。'],['02','概述','设施增加；选出最显著的变化。'],['03','左侧','办公与接待 → 停车场 → 体育设施。'],['04','右侧','教学区调整 → 新楼 → 教室总数。']].map(p=>`<section class="plan-step"><small>PARAGRAPH ${p[0]}</small><h3>${p[1]}</h3><p>${p[2]}</p></section>`).join('');
}
function renderModel(){
 const labels={1:'01 · 引言',2:'02 · 整体概述',3:'03 · 左侧设施',4:'04 · 右侧设施'};
 $('model-count').textContent=wholeModel().trim().split(/\s+/).length+'词 · 4段 · 11句 · 每句可单独朗读';
 $('model-text').innerHTML=[1,2,3,4].map(p=>`<article class="model-paragraph"><h3>${labels[p]}</h3>${U.models.filter(m=>m.p===p).map((m)=>`<section class="model-line"><p class="model-en" lang="en">${esc(m.en)}</p><div>${audioButton(m.en,'朗读')}${audioButton(m.en,'慢速',true)}</div><p class="model-zh"${showChinese?'':' hidden'}>${esc(m.zh)}</p><details><summary>第${Number(m.id.slice(1))}句 · ${esc(m.role)} · 展开解析</summary><p><strong>句意：</strong>${esc(m.zh)}</p><p><strong>结构与作用：</strong>${esc(m.note)}</p><p><strong>可迁移表达：</strong>${esc(m.pattern)}</p><div class="row"><button data-practice-id="${m.id}">用这句练中译英 →</button></div></details></section>`).join('')}</article>`).join('');
 $('patterns').innerHTML=[['A will be replaced by B.','A将被B取代。'],['A will be added in B.','将在B中增设A。'],['The number of classrooms will decrease from eleven to ten.','教室数量将从11间减少到10间。'],['The trees will be removed to make way for a new science lab.','树木将被移除，为新科学实验楼腾出空间。']].map(p=>`<div class="pattern-line"><div><b lang="en">${esc(p[0])}</b><br><span class="notice">${esc(p[1])}</span></div>${audioButton(p[0])}</div>`).join('');
}
function renderErrors(){
 $('errors-list').innerHTML=U.corrections.map((e,i)=>`<article class="error-item"><div class="error-head"><b>${String(i+1).padStart(2,'0')}</b><span class="badge">${esc(e.focus)}</span></div><p class="bad-sentence" lang="en">${esc(e.bad)}</p><label class="notice" for="try-${e.id}">先自己改一遍（自动保存）</label><textarea class="error-input" id="try-${e.id}" data-error-input="${e.id}" lang="en" placeholder="写下你的修改……">${esc(workbook.items[e.id]?.text||'')}</textarea><details class="correction"><summary>核对修改与原因</summary><p class="correct-sentence" lang="en">${esc(e.good)}</p><p>${esc(e.zh)}</p><div>${audioButton(e.good,'朗读修改句')}${audioButton(e.good,'慢速',true)}</div><ul>${e.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details></article>`).join('');
 $('toggle-errors').textContent='展开全部解析';
}
function practiceModels(){return U.models.filter(m=>practiceScope==='all'||(practiceScope==='overview'&&m.p===2)||(practiceScope==='weak'&&workbook.items[m.id]?.level!==2));}
function updatePracticeCount(){const n=U.models.filter(m=>workbook.items[m.id]?.level===2).length;$('practice-progress').textContent='已自评能独立写出 '+n+' / '+U.models.length+' 句 · 输入与自评自动保存';}
function renderPractice(){
 updatePracticeCount();const list=practiceModels();
 if(!list.some(m=>m.id===sentenceId))sentenceId=list[0]?.id||'';
 $('practice-select').innerHTML=list.length?list.map(m=>`<option value="${m.id}">第${Number(m.id.slice(1))}句 · ${esc(m.role)}${workbook.items[m.id]?.level===2?' ✓':''}</option>`).join(''):'<option>本范围已完成</option>';
 $('practice-select').value=sentenceId;$('practice-scope').value=practiceScope;
 const m=list.find(m=>m.id===sentenceId);
 if(!m){$('drill').innerHTML='<div class="empty-practice"><h3>本范围的句子都已掌握</h3><p>可以切回全部继续复习，或进入整篇复写。</p><button data-practice-reset>查看全部句子</button></div>';return;}
 $('drill').innerHTML=`<article class="drill-card"><span class="badge">第${Number(m.id.slice(1))}句 · ${esc(m.role)}</span><p class="drill-cn">${esc(m.zh)}</p><details class="drill-hints"><summary>需要一点提示？</summary><p lang="en">${m.keywords.map(esc).join(' → ')}</p>${m.keywords.map(k=>audioButton(k,'听关键词')).join('')}</details><label class="editor-label" for="sentence-answer">写出英文</label><textarea id="sentence-answer" spellcheck="false" lang="en" placeholder="先回忆结构，再写完整句子……">${esc(workbook.items[m.id]?.text||'')}</textarea><div class="row"><button class="primary" id="check-sentence">核对参考句</button><button id="listen-sentence">▷ 听原句提示</button><button id="next-sentence">跳过／下一句 →</button></div><div id="sentence-result" class="drill-result" hidden></div></article>`;
}
function normalizeSentence(s){return String(s).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}']+/gu,' ').trim();}
function checkSentence(){
 const m=U.models.find(m=>m.id===sentenceId);if(!m)return;const answer=$('sentence-answer').value;saveItem(m.id,answer);const exact=normalizeSentence(answer)===normalizeSentence(m.en);
 $('sentence-result').hidden=false;$('sentence-result').innerHTML=`<p><strong>${exact?'✓ 与参考句一致':'已展开参考：请检查信息、结构与表达'}</strong></p><p class="model-en" lang="en">${esc(m.en)}</p>${audioButton(m.en,'朗读参考句')}${audioButton(m.en,'慢速',true)}<p>${esc(m.note)}</p><p class="notice">核对仅忽略大小写与标点。与原句不同的表达也可能正确；请检查意思与语法。此处不是雅思自动评分。</p><div class="practice-grade"><button data-practice-grade="1">仍需复习</button><button data-practice-grade="2">我能独立写出</button><button id="retry-sentence">遮住答案再写</button></div>`;
}
function nextSentence(){const list=practiceModels();if(!list.length){renderPractice();return}const at=list.findIndex(m=>m.id===sentenceId);sentenceId=list[(at+1)%list.length].id;stop();renderPractice();}
function draftCount(){const text=$('draft').value.trim();$('draft-count').textContent=(text?text.split(/\s+/).length:0)+'词 · 当前浏览器自动保存';}
function timestamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return p(d.getMonth()+1)+p(d.getDate())+'-'+d.getFullYear()+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());}
function downloadText(text,name,type){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);}
function exportNotebook(){
 const parts=['# 大学校园地图题复习记录','导出时间：'+new Date().toLocaleString(),'## 我的整篇复写',workbook.draft.text||'（尚未复写）','## 逐句练习'];
 for(const m of U.models){const r=workbook.items[m.id];if(r)parts.push('### '+m.role,m.zh,'我的表达：'+(r.text||'（空）'),'参考：'+m.en,'自评：'+(r.level===2?'能独立写出':r.level===1?'待复习':'未自评'));}
 parts.push('## 我的纠错练习');for(const e of U.corrections){const r=workbook.items[e.id];if(r?.text)parts.push('### '+e.focus,'原句：'+e.bad,'我的修改：'+r.text,'参考：'+e.good,...e.issues);}
 parts.push('## 目标范文',wholeModel());downloadText(parts.join('\n\n'),timestamp()+'-写作-大学地图题-复习记录.md','text/markdown;charset=utf-8');
}
document.addEventListener('input',e=>{if(e.target.dataset.errorInput)saveItem(e.target.dataset.errorInput,e.target.value);if(e.target.id==='sentence-answer')saveItem(sentenceId,e.target.value);if(e.target.id==='draft'){workbook.draft={text:e.target.value,updated:Date.now()};saveWorkbook();draftCount();}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view)setView(b.dataset.view);
 if(b.dataset.practiceId){sentenceId=b.dataset.practiceId;practiceScope='all';setView('practice');$('sentence-practice').hidden=false;$('draft-practice').hidden=true;$('show-sentences').classList.add('active');$('show-draft').classList.remove('active');}
 if(b.id==='toggle-zh'){showChinese=!showChinese;document.querySelectorAll('.model-zh').forEach(el=>el.hidden=!showChinese);b.textContent=showChinese?'隐藏中文':'显示中文';b.setAttribute('aria-pressed',String(showChinese));}
 if(b.id==='copy-model'){try{await navigator.clipboard.writeText(wholeModel());notify('已复制整篇英文。');}catch{downloadText(wholeModel(),timestamp()+'-大学地图题-范文.txt','text/plain;charset=utf-8');notify('复制不可用，已导出纯文本范文。');}}
 if(b.id==='read-model')speak(U.models.map(m=>m.en),false,1);
 if(b.id==='toggle-errors'){const open=[...document.querySelectorAll('.correction')].some(el=>!el.open);document.querySelectorAll('.correction').forEach(el=>el.open=open);b.textContent=open?'收起全部解析':'展开全部解析';}
 if(b.id==='check-sentence')checkSentence();
 if(b.id==='listen-sentence'){const m=U.models.find(m=>m.id===sentenceId);if(m)speak(m.en);}
 if(b.id==='next-sentence')nextSentence();
 if(b.dataset.practiceGrade){const list=practiceModels(),at=list.findIndex(m=>m.id===sentenceId),next=list[(at+1)%list.length]?.id;saveItem(sentenceId,$('sentence-answer').value,Number(b.dataset.practiceGrade));sentenceId=next;stop();renderPractice();}
 if(b.id==='retry-sentence'){saveItem(sentenceId,'',0);stop();renderPractice();$('sentence-answer')?.focus();}
 if(b.hasAttribute('data-practice-reset')){practiceScope='all';renderPractice();}
 if(['show-sentences','show-draft'].includes(b.id)){const draft=b.id==='show-draft';stop();$('sentence-practice').hidden=draft;$('draft-practice').hidden=!draft;$('show-sentences').classList.toggle('active',!draft);$('show-draft').classList.toggle('active',draft);}
 if(b.id==='draft-map')$('draft-map-image').hidden=!$('draft-map-image').hidden;
 if(b.id==='export-text')exportNotebook();
});
$('practice-select').addEventListener('change',e=>{sentenceId=e.target.value;stop();renderPractice();});
$('practice-scope').addEventListener('change',e=>{practiceScope=e.target.value;stop();renderPractice();});
window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
initOverview();renderModel();renderErrors();renderPractice();$('draft').value=workbook.draft.text;draftCount();setView(['overview','model','cards','errors','practice'].includes(location.hash.slice(1))?location.hash.slice(1):'overview');
