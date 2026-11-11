'use strict';
const DATA=window.GLOBAL_WARMING_DATA;
for(const c of DATA.cards){c.source=DATA.sources[c.sourceId];c.examples=DATA.exampleGroups[c.exampleGroup];}
const KEY='iris-global-warming-new-zealand-1111-v1';
const TYPE={word:'单词',phrase:'短语',collocation:'固定搭配',idiom:'习语',proper:'专有名词',measurement:'数值表达','modal verb':'情态动词',prep:'介词'};
const LABEL={0:'未学',1:'不认识',2:'模糊',3:'认识',4:'熟练'};
const ALL_IDS=new Set(DATA.cards.map(c=>c.id));
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pathMaterial=document.body.dataset.material||'class-size';
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
let focusedQuestion=null,paragraph='all',quizAttempts={};
try{quizAttempts=JSON.parse(localStorage.getItem(KEY+'-quiz')||'{}')}catch{}
function saveQuiz(){try{localStorage.setItem(KEY+'-quiz',JSON.stringify(quizAttempts))}catch{notify('题目练习记录未能保存。')}}
let mode='cards',type='all',scope='all',priority='5',search='',queue=[],index=0,revealed=false,voices=[],utterance=null,sequence=0,gap=null,toastTimer=null,shuffled=false;
function rec(c){return records[c.id]||{level:0,due:0,reps:0,favourite:false,lastSeen:0}}
function notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records,settings,view:{...savedView,[material.id]:{id:queue[index]?.id,mode,type,scope,priority,search,focusedQuestion}}}))}catch{notify('进度未能保存，请导出复习记录备份。')}}
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
function filtered(){const q=search.trim().toLocaleLowerCase();return DATA.cards.filter(c=>c.material===material.id&&(!focusedQuestion||c.questions.includes(focusedQuestion))&&(paragraph==='all'||(paragraph==='Q'?/题干|选项/.test(c.origin):c.paragraph===paragraph&&!/题干|选项/.test(c.origin)))&&(type==='all'||c.type===type)&&(priority==='all'||(priority==='weakq'?c.priority:priority==='4plus'?c.stars>=4:c.stars===Number(priority)))&&(scope==='all'||(scope==='new'&&rec(c).level===0)||(scope==='due'&&rec(c).level>0&&rec(c).due<=Date.now())||(scope==='weak'&&rec(c).level<3)||(scope==='mastered'&&rec(c).level===4)||(scope==='favourites'&&rec(c).favourite))&&(!q||[c.en,c.zh,c.note,c.source.en,c.source.zh,...c.collocations.flatMap(x=>[x.en,x.zh])].join(' ').toLocaleLowerCase().includes(q)))}
function rebuild(preferred){stop();queue=filtered();index=Math.max(0,queue.findIndex(c=>c.id===preferred));revealed=false;shuffled=false;render()}
function detail(c){return `<div class="back-term"><div class="term">${esc(c.en)}</div>${audioButton(c.en)}</div><p class="ipa">${esc(c.ipa)}</p><p class="meaning">${esc(c.zh)}</p><p class="stars" aria-label="${c.stars}星重要度">${stars(c)}</p><div class="badges"><span class="badge">${esc(c.origin)}</span><span class="badge">${esc(TYPE[c.type])}</span><span class="badge priority">${stars(c)}</span>${c.priority?'<span class="badge">错题关联</span>':''}</div>${c.note?`<p class="note">${esc(c.note)}</p>`:''}<div class="section-label"><h3>原文／题干定位句</h3><small>原稿 ${c.sourceId.startsWith('Q')?'第 '+esc(c.sourceId.slice(1))+' 题':'第 '+esc(c.sourceId)+' 句'}</small></div><div class="source"><p class="en" lang="en">${esc(c.source.en)}</p><p class="zh">${esc(c.source.zh)}</p>${audioButton(c.source.en,'原句朗读')}${audioButton(c.source.en,'慢速',true)}</div><div class="section-label"><h3>听说读写拓展</h3><small>自拟练习句 · 同主题表达迁移</small></div><div class="examples">${c.examples.map(e=>`<section class="example"><div class="example-label">${esc(e.skill)}</div><p class="en" lang="en">${esc(e.en)}</p><p class="zh">${esc(e.zh)}</p>${audioButton(e.en,'例句朗读')}${audioButton(e.en,'慢速',true)}</section>`).join('')}</div><div class="section-label"><h3>常见固定搭配</h3></div><div class="collocations">${c.collocations.map(e=>`<div class="collocation"><div><b lang="en">${esc(e.en)}</b><small>${esc(e.zh)}</small></div>${audioButton(e.en)}</div>`).join('')}</div>`}
function render(){countStats();$('extra').hidden=true;document.querySelector('.filters').hidden=false;document.querySelector('.roundbar').hidden=false;if(['questions','pairs','passage','overview','table'].includes(mode)){renderExtra();persist();return;}$('count').textContent=`${queue.length} / ${material.count} 张${shuffled?' · 已打乱':''}`;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',b.dataset.mode===mode?'true':'false')});$('study').hidden=mode!=='cards';$('library').hidden=mode!=='library';
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
function clearFilters(){focusedQuestion=null;paragraph='all';type='all';scope='all';priority='all';search='';$('paragraph').value=paragraph;$('type').value=type;$('scope').value=scope;$('priority').value=priority;$('search').value='';rebuild()}
function loadVoices(){voices=(window.speechSynthesis?.getVoices()||[]).filter(v=>/^en(?:-|_)/i.test(v.lang));$('voice').innerHTML='<option value="">自动选择英语音色</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} · ${esc(v.lang)}</option>`).join('');$('voice').value=voices.some(v=>v.voiceURI===settings.voice)?settings.voice:'';$('voice-hint').textContent=voices.length?`${voices.length} 个英语音色可用；默认优先英式英语。`:'正在等待设备提供英语音色；实际音色取决于当前系统。'}
function exportProgress(){const now=new Date(),pad=n=>String(n).padStart(2,'0'),stamp=pad(now.getMonth()+1)+pad(now.getDate())+'-'+now.getFullYear()+'-'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds());const blob=new Blob([JSON.stringify({format:KEY,version:1,exportedAt:now.toISOString(),records,settings,quizAttempts},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=stamp+'-阅读-Global-Warming-in-New-Zealand-复习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
async function importProgress(file){try{if(!file) return;if(file.size>2e6)throw Error('文件过大');const obj=JSON.parse(await file.text());if(obj.format!==KEY||obj.version!==1)throw Error('不是本词库的复习记录');const incoming=validRecords(obj.records);if(obj.quizAttempts&&typeof obj.quizAttempts==='object')quizAttempts={...quizAttempts,...obj.quizAttempts};saveQuiz();let count=0;for(const [id,r] of Object.entries(incoming)){if(!records[id]||r.lastSeen>=rec({id}).lastSeen){records[id]=r;count++}}persist();rebuild(queue[index]?.id);notify(`已合并 ${count} 条复习记录；其他词库不受影响。`)}catch(e){notify('导入失败：'+e.message)}finally{$('import-file').value=''}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-say')){speak(b.dataset.say,!!b.dataset.slow);return}if(b.dataset.mode){stop();mode=b.dataset.mode;render();return}if(b.hasAttribute('data-flip'))flip();else if(b.hasAttribute('data-prev'))move(-1);else if(b.hasAttribute('data-next'))move(1);else if(b.hasAttribute('data-grade'))grade(Number(b.dataset.grade));else if(b.hasAttribute('data-star')){const c=queue[index];records[c.id]={...rec(c),favourite:!rec(c).favourite};persist();if(scope==='favourites')rebuild(c.id);else render()}else if(b.hasAttribute('data-clear'))clearFilters();else if(b.hasAttribute('data-shuffle')){stop();for(let i=queue.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}index=0;revealed=false;shuffled=true;render()}else if(b.hasAttribute('data-stop'))stop();else if(b.hasAttribute('data-all-audio')){const c=queue[index];if(c)speak([c.en,c.source.en,...c.examples.map(x=>x.en),...c.collocations.map(x=>x.en)])}else if(b.id==='export')exportProgress();else if(b.id==='import')$('import-file').click();else if(b.id==='voice-test')speak('Global warming has a different impact on various regions. Governments should take joint action to address climate change.');});
// Render long card backs only when a library row is opened.
$('library').addEventListener('toggle',e=>{if(e.target.tagName!=='DETAILS'||!e.target.open)return;const node=e.target.querySelector('[data-details]');if(node&&!node.children.length){const c=DATA.cards.find(c=>c.id===node.dataset.details);node.innerHTML=detail(c)}},true);
$('search').addEventListener('input',e=>{focusedQuestion=null;search=e.target.value;rebuild()});for(const id of ['paragraph','type','scope','priority'])$(id).addEventListener('change',e=>{focusedQuestion=null;if(id==='paragraph')paragraph=e.target.value;if(id==='type')type=e.target.value;if(id==='scope')scope=e.target.value;if(id==='priority')priority=e.target.value;rebuild()});
$('voice').addEventListener('change',e=>{stop();settings.voice=e.target.value;persist()});$('rate').value=String(settings.rate);$('rate').addEventListener('change',e=>{stop();settings.rate=Number(e.target.value);persist()});$('repeats').value=String(settings.repeats);$('repeats').addEventListener('change',e=>{stop();settings.repeats=Number(e.target.value);persist()});$('import-file').addEventListener('change',e=>importProgress(e.target.files[0]));
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea,button,a,summary')||e.altKey||e.ctrlKey||e.metaKey||mode!=='cards')return;if(e.code==='Space'){e.preventDefault();flip()}else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowLeft')move(-1);else if(e.key.toLowerCase()==='p'&&queue[index])speak(queue[index].en);else if(e.key==='Escape')stop()});
window.addEventListener('pagehide',stop);if(window.speechSynthesis)window.speechSynthesis.addEventListener('voiceschanged',loadVoices);

function stars(c){return '★'.repeat(c.stars)+'☆'.repeat(5-c.stars)}
function textPair(s,label='英文朗读'){return `<p class="en" lang="en">${esc(s.en)}</p><p class="zh">${esc(s.zh)}</p>${audioButton(s.en,label)}${audioButton(s.en,'慢速',true)}`}
function renderExtra(){
 $('study').hidden=true;$('library').hidden=true;$('extra').hidden=false;document.querySelector('.filters').hidden=true;document.querySelector('.roundbar').hidden=true;
 document.querySelectorAll('[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 if(mode==='overview'){
  $('count').textContent='A–J · 全文逻辑与三条因果链';
  const chains=[
   ['气候变化 → 农业减产',['SAM风带变化','夏季水汽减少','土壤水分流失增加','水分亏缺加重','关键生长期受到影响','谷物产量下降']],
   ['全球变暖 → 冰川变化',['全球变暖','积雪和冰川融化','质量平衡发生变化','冰川体积、厚度发生变化','冰体流动改变','冰川舌前进或后退']],
   ['海平面变化 → 地下水与农业风险',['海平面上升','地下水系统受到威胁','地下水盐度问题','农业生产可能下降']]
  ];
  const sectionHtml=DATA.sections.map(x=>'<article class="overview-item"><b>'+esc(x.id)+' · '+esc(x.title)+'</b><p>'+esc(x.summary)+'</p><button class="btn secondary" data-go-paragraph="'+esc(x.id)+'">查看'+esc(x.id)+'段词汇 →</button></article>').join('');
  const chainHtml=chains.map(chain=>'<section class="surface"><h2>'+esc(chain[0])+'</h2><div class="chain">'+chain[1].map((step,i)=>'<div class="chain-step">'+esc(step)+'</div>'+(i<chain[1].length-1?'<div class="chain-arrow">↓</div>':'')).join('')+'</div></section>').join('');
  $('extra').innerHTML='<section class="surface"><h2>文章核心主题</h2><p>文章讨论全球变暖对新西兰的多方面影响：气温与海洋调节、农业干旱、积雪与冰川、海平面、生态适应，以及国家和全球层面的应对。</p><p class="muted">核心观点：新西兰具有海洋调节带来的相对优势，但仍然面临农业、冰川和海岸环境风险；人类与动物都在适应变化，而全球问题需要共同应对。</p></section><section class="surface"><h2>全文段落导航</h2><div class="overview-grid">'+sectionHtml+'</div></section>'+chainHtml;
 }else if(mode==='questions'){
  $('count').textContent=DATA.questions.length+' 道题 · '+DATA.questions.filter(q=>q.wrong).length+' 道历史错题';
  $('extra').innerHTML='<p class="section-intro">先独立作答，再点击“核对答案”。提交后才显示正确答案、原文证据、同义替换与错因。历史首次作答记录保留在题目卡片中。</p><div class="extra-actions"><button data-qscope="all">全部14题</button><button data-qscope="wrong">只看7道错题</button></div><div id="question-list">'+DATA.questions.map(q=>questionHTML(q)).join('')+'</div>';
 }else if(mode==='pairs'){
  $('count').textContent=DATA.pairs.length+' 组同义替换';
  $('extra').innerHTML='<p class="section-intro">先看左侧原文表达，回忆题干或选项如何改写，再展开核对。每组保留对应题号与语义说明。</p>'+DATA.pairs.map(p=>'<details class="pair"><summary lang="en">'+esc(p.a)+'</summary>'+audioButton(p.a,'原文表达朗读')+'<p class="en" lang="en">'+esc(p.b)+'</p>'+audioButton(p.b,'替换表达朗读')+'<p class="meaning">'+esc(p.zh)+'</p><p class="question-note">关联题目：'+esc(p.q)+' · '+esc(p.note)+'</p></details>').join('');
 }else if(mode==='passage'){
  $('count').textContent=DATA.sections.length+' 段 · '+Object.keys(DATA.sources).filter(k=>/^[A-J]\d+$/.test(k)).length+' 句';
  $('extra').innerHTML='<p class="section-intro">原文按A–J分段，英文句子可朗读；展开后查看中文。译文用于理解文章逻辑。</p>'+DATA.sections.map(p=>'<section class="passage-section"><h2>'+esc(p.id)+'段 · '+esc(p.title)+'</h2><p class="muted">'+esc(p.summary)+'</p>'+Object.entries(DATA.sources).filter(([k])=>k.startsWith(p.id)&&/^[A-J]\d+$/.test(k)).map(([k,v])=>'<article class="question-card"><span class="badge">'+esc(k)+'</span><p class="en" lang="en">'+esc(v.en)+'</p>'+audioButton(v.en,'原句朗读')+audioButton(v.en,'慢速',true)+'<details><summary>查看中文翻译</summary><p class="zh">'+esc(v.zh)+'</p></details></article>').join('')+'</section>').join('');
 }else{
  $('count').textContent=DATA.cards.length+' 条词汇 · 六列完整索引';
  const rows=DATA.cards.map(c=>'<tr><td><b lang="en">'+esc(c.en)+'</b><br><span class="muted">'+esc(c.pos||TYPE[c.type]||c.type)+'</span></td><td>'+esc(TYPE[c.type]||c.type)+'</td><td>'+esc(c.zh)+'</td><td><span lang="en">'+esc(c.source.en)+'</span><br><span class="muted">'+esc(c.source.zh)+'</span></td><td>'+c.collocations.map(x=>'<span lang="en">'+esc(x.en)+'</span> — '+esc(x.zh)).join('<br>')+'</td><td><span class="stars">'+stars(c)+'</span></td></tr>').join('');
  $('extra').innerHTML='<p class="section-intro">六列完整词库：英文词汇/语块、词性或结构、中文含义、原文例句及翻译、常见搭配/同义替换、重要等级。默认按五星至一星排序。</p><div class="tablewrap"><table class="vocab-table"><thead><tr><th>英文词汇/语块</th><th>词性或结构</th><th>中文含义</th><th>原文例句及翻译</th><th>常见搭配/同义替换</th><th>重要等级</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 }
}
function questionHTML(q){
 const typeLabel=q.type==='mc'?'选择题':q.type==='fill'?'摘要填空':'YES / NO / NOT GIVEN';
 const input=q.type==='fill'?'<label class="answer-input">填写答案<input type="text" data-q-fill autocomplete="off" placeholder="输入英文答案"></label>':'<div class="options">'+(q.options||[]).map(([value,label])=>'<label><input type="radio" name="q-'+q.no+'" value="'+esc(value)+'"><span><b>'+esc(value)+'.</b> '+esc(label)+'</span></label>').join('')+'</div>';
 return '<article class="question-card" data-question="'+q.no+'" data-wrong="'+q.wrong+'"><div class="question-head"><span class="badge">第 '+q.no+' 题 · '+typeLabel+'</span><span class="badge '+(q.wrong?'priority':'')+'">'+(q.wrong?'历史错题':'首次作答正确')+'</span></div><p class="en" lang="en">'+esc(q.en)+'</p><p class="zh">'+esc(q.zh)+'</p>'+audioButton(q.en,'题干朗读')+audioButton(q.en,'慢速',true)+input+'<div class="question-actions"><button class="primary" data-check-q="'+q.no+'">核对答案</button><span class="muted small">首次作答：'+esc(q.chosen)+'</span></div><div class="answer-panel" data-feedback hidden></div></article>';
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.qscope){document.querySelectorAll('[data-wrong]').forEach(n=>n.hidden=b.dataset.qscope==='wrong'&&n.dataset.wrong!=='true');}
 if(b.dataset.goParagraph){mode='cards';paragraph=b.dataset.goParagraph;$('paragraph').value=paragraph;type='all';scope='all';priority='all';search='';for(const [id,val] of Object.entries({paragraph,type,scope,priority,search}))$(id).value=val;rebuild();return;}
 if(b.dataset.openq){const q=DATA.questions.find(q=>q.no===Number(b.dataset.openq));mode='cards';type='all';scope='all';priority='all';search='';focusedQuestion=q.no;for(const [id,val] of Object.entries({type,scope,priority,search}))$(id).value=val;rebuild();notify('已显示第'+q.no+'题相关词汇；更改筛选后返回完整词库。');return;}
 if(b.dataset.checkQ){
  const q=DATA.questions.find(q=>q.no===Number(b.dataset.checkQ));const node=document.querySelector('[data-question="'+q.no+'"]');let value='';
  if(q.type==='fill')value=node.querySelector('[data-q-fill]').value.trim();
  else value=node.querySelector('input[type=radio]:checked')?.value||'';
  if(!value){notify(q.type==='fill'?'请先填写答案。':'请先选择一个答案。');return;}
  const norm=x=>String(x||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9%]+/g,' ').trim();
  const accepted=q.accepted||[q.answer];const correct=accepted.some(a=>norm(a)===norm(value));
  quizAttempts[q.no]={answer:value,correct,at:Date.now()};saveQuiz();
  const evidence=q.evidence.map(id=>'<div class="source"><span class="badge">'+esc(id)+'</span>'+textPair(DATA.sources[id],'答案句朗读')+'</div>').join('');
  const chunks=q.chunks.map(x=>'<tr><td lang="en">'+esc(x[0])+' '+audioButton(x[0])+'</td><td>'+esc(x[1])+'</td></tr>').join('');
  node.querySelector('[data-feedback]').hidden=false;
  node.querySelector('[data-feedback]').innerHTML='<div class="answer '+(correct?'':'wrong')+'"><b>'+(correct?'回答正确':'再看一下原文依据')+'</b><p>你的答案：'+esc(value)+' · 正确答案：'+esc(q.answer)+'</p><p>首次作答：'+esc(q.chosen)+'</p></div><p>'+esc(q.explanation)+'</p><p class="answer-map">'+esc(q.mapping)+'</p><table><tbody>'+chunks+'</tbody></table><h3>原文依据</h3>'+evidence+'<p class="question-note">'+esc(q.note)+'</p><button data-openq="'+q.no+'">复习本题相关词汇 →</button>';
 }
});
const previous=savedView[material.id]||{};
if(['cards','library','questions','pairs','passage','overview','table'].includes(previous.mode))mode=previous.mode;
if(['all','word','phrase','collocation'].includes(previous.type))type=previous.type;
if(['all','new','due','weak','mastered','favourites'].includes(previous.scope))scope=previous.scope;
if(['all','1','2','3','4','5','4plus','weakq'].includes(previous.priority))priority=previous.priority;
if(typeof previous.search==='string')search=previous.search;
if(Number.isInteger(previous.focusedQuestion)&&previous.focusedQuestion>=27&&previous.focusedQuestion<=40)focusedQuestion=previous.focusedQuestion;
for(const [id,val] of Object.entries({type,scope,priority,search}))$(id).value=val;
rebuild(savedView[material.id]?.id);loadVoices();

