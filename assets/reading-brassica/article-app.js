'use strict';

const CONFIG=window.READING_REVIEW_CONFIG;
const DATA=window.READING_REVIEW_DATA;
const listening=CONFIG.skill==='listening' ? window.ListeningStudy : null;
const PARAGRAPH_RANGE=CONFIG.paragraphRange||(DATA.sentences[0].paragraph+'–'+DATA.sentences[DATA.sentences.length-1].paragraph);
const KEY=CONFIG.storageKey, SETTINGKEY=KEY+'-settings';
const LABELS={new:'未学',1:'不熟悉',2:'有点吃力',3:'基本掌握',4:'熟练掌握'};
const CARD_LABELS={new:'未学',1:'Again · 重来',2:'Hard · 吃力',3:'Good · 记得',4:'Easy · 轻松'};
const FAMILIARITY_OPTIONS=[[1,'不熟悉'],[2,'有点吃力'],[3,'基本掌握'],[4,'熟练掌握']];
const STUDY_STAGE_OPTIONS=[['all','全部状态'],['due','到期复习'],['new','尚未学习'],['learning','正在巩固'],['mature','长间隔复习']];
const SENTENCE_FLAG_PREFIX=CONFIG.flagPrefix;
const SENTENCE_REASON_OPTIONS=listening ? [['sound','没辨认出读音、连读或弱读'],['structure','句子结构没听懂'],['translation','听出了词，没理解整句'],['logic','逻辑、指代或信息变化没听清'],['other','其他']] : [['structure','句子结构看不懂'],['translation','单词认识，但整句翻译困难'],['logic','逻辑关系或指代关系不清楚'],['misread','自己的理解与原文意思不符'],['other','其他']];
const $=id=>document.getElementById(id),escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
const loadedReview=loadReview();
let state=loadedReview.records, settings=loadedReview.settings;
let savedRecords=copyRecords(state), savedSettings={...settings};
let libraryOrder='priority';
let view=initialView(),kind='all',scope='due',studyStage='all',queue=[],current=null,revealed=false,voices=[],sessionCount=0,answerEN='',answerZH='',meaningOK=false,search='',statusFilter='all',starFilter='all',activeLibraryId=null;
const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM16 8q5 4 0 8M19 5q8 7 0 14"/></svg>';

function toast(t){$('toast').textContent=t;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,4500)}
const DAY=86400000, MINUTE=60000, MAX_INTERVAL_DAYS=120;
function rec(x){return state[x.id]||{level:0,due:0,reps:0,intervalDays:0,easeFactor:2.4,lapses:0}}
function eligible(x,now=Date.now()){let r=rec(x);return !r.level||!Number.isFinite(r.due)||r.due<=now}
function dayKey(){return new Date().toLocaleDateString('en-CA')}
function todayNew(){return DATA.items.filter(item=>state[item.id]?.startedDay===dayKey()).length}
function dailyRemaining(limit=settings.daily){return Math.max(0,Math.max(1,Math.min(100,Number(limit)||20))-todayNew())}
function dailyProgressText(limit=settings.daily){
 const used=todayNew(),cap=Math.max(1,Math.min(100,Number(limit)||20));
 if(view==='cards'&&studyStage==='due')return '仅复习已到期词条，不占用每日新词额度。';
 if(view==='cards'&&(studyStage==='learning'||studyStage==='mature'))return '显示该阶段全部匹配词条，可提前复习，不占用每日新词额度。';
 return scope==='all'&&!(view==='cards'&&studyStage==='new')?`提前练习模式：本次包含全部词条，不受每日新词上限限制。今日已接触新词 ${used} 个。`:`今日新词：${used} / ${cap} 个，剩余 ${dailyRemaining(cap)} 个（到期复习不占用新词额度）。`;
}
function matchesStudyFilters(x){return (kind==='all'||x.type===kind)&&(starFilter==='all'||String(x.stars)===starFilter)}
function matchesStudyStage(x,stage=studyStage,now=Date.now()){
 const r=rec(x);
 if(stage==='due')return !!r.level&&eligible(x,now);
 if(stage==='new')return !r.level;
 if(stage==='learning')return !!r.level&&!(r.intervalDays>=21);
 if(stage==='mature')return !!r.level&&r.intervalDays>=21;
 return true;
}
function studyStageCounts(items=DATA.items){
 const now=Date.now(),counts={all:items.length,due:0,new:0,learning:0,mature:0};
 for(const x of items)for(const stage of ['due','new','learning','mature'])if(matchesStudyStage(x,stage,now))counts[stage]++;
 return counts;
}
function studyStageControls(){
 const counts=studyStageCounts(DATA.items.filter(matchesStudyFilters));
 return `<fieldset class="study-stage-filter"><legend>学习状态</legend><div class="study-stage-options">${STUDY_STAGE_OPTIONS.map(([value,label])=>`<button type="button" data-study-stage="${value}" aria-pressed="${studyStage===value}" aria-label="${label}，${counts[value]}条"><span>${label}</span><span class="study-stage-count" data-stage-count="${value}" aria-hidden="true">${counts[value]}</span></button>`).join('')}</div></fieldset>`;
}
function updateStudyStageCounts(){
 const counts=studyStageCounts(DATA.items.filter(matchesStudyFilters));
 document.querySelectorAll('[data-study-stage]').forEach(button=>{
  const value=button.dataset.studyStage,label=STUDY_STAGE_OPTIONS.find(option=>option[0]===value)?.[1];
  const count=button.querySelector('[data-stage-count]');if(count)count.textContent=counts[value];
  if(label)button.setAttribute('aria-label',`${label}，${counts[value]}条`);
 });
}
function studyStageEmpty(){
 const selected=DATA.items.filter(matchesStudyFilters).filter(x=>matchesStudyStage(x));
 const label=STUDY_STAGE_OPTIONS.find(option=>option[0]===studyStage)[1];
 const title=selected.length?`本轮${label}已完成`:`当前筛选下没有${label}词条`;
 const note=studyStage==='new'&&selected.length?'今日新词额度已用完；可在学习设置中调整每日数量，或切换到其他学习状态。':'可以切换学习状态，或调整单词／短语与星级筛选。';
 return `<section class="card empty"><div class="big">${selected.length?'✓':'◌'}</div><h2>${title}</h2><p class="muted">本轮已完成 ${sessionCount} 次。${note}</p><button id="refresh" class="primary">重新检查</button> <button id="reset-study-stage">返回全部状态</button></section>`;
}
function scheduleRecord(old,level,now=Date.now()){
 const previous=Number(old.intervalDays)||0, ease=Math.max(1.6,Math.min(2.85,Number(old.easeFactor)||2.4));
 const wasLearning=previous<1, again=level===1;
 let days=level===1?(old.reps>0?10:1)/1440:level===2?(wasLearning?Math.max(10/1440,previous*1.5):Math.max(1,previous*1.18)):level===3?(wasLearning?1:Math.max(previous+1,previous*ease)):(wasLearning?4:Math.max(previous+2,previous*(ease+0.55)));
 days=Math.min(days,MAX_INTERVAL_DAYS);
 return {...old,level,reps:(old.reps||0)+1,due:now+Math.round(days*DAY),intervalDays:days,easeFactor:Math.max(1.6,Math.min(2.85,ease+(level===1?-.2:level===2?-.08:level===4?.08:0))),lapses:(old.lapses||0)+(again?1:0),streak:again?0:(old.streak||0)+1,startedDay:old.startedDay||dayKey(),updated:now};
}
function formatDelay(days){let minutes=Math.round(days*1440);if(minutes<60)return Math.max(1,minutes)+' 分钟后';if(minutes<1440)return Math.round(minutes/60)+' 小时后';let d=days>=10?Math.round(days):Math.round(days*10)/10;return d+' 天后'}

function candidates(){
 const all=DATA.items.filter(matchesStudyFilters).filter(x=>matchesStudyStage(x));
 const reviewOrder=(a,b)=>Number(eligible(b))-Number(eligible(a))||rec(a).level-rec(b).level||b.stars-a.stars||rec(a).due-rec(b).due;
 if(studyStage==='due'||studyStage==='learning'||studyStage==='mature')return all.slice().sort(reviewOrder);
 if(studyStage==='all'&&scope==='all')return all.slice().sort((a,b)=>(rec(a).level||0)-(rec(b).level||0)||b.stars-a.stars);
 const due=all.filter(x=>rec(x).level&&eligible(x)).sort(reviewOrder);
 const introduced=all.filter(x=>!rec(x).level&&rec(x).startedDay===dayKey());
 const fresh=all.filter(x=>!rec(x).level&&rec(x).startedDay!==dayKey()).sort((a,b)=>b.stars-a.stars||((a.type==='word'?0:1)-(b.type==='word'?0:1))).slice(0,dailyRemaining());
 return [...due,...introduced,...fresh];
}
function buildQueue(){queue=candidates().map(x=>x.id);next()}
function next(){const id=queue.shift();current=DATA.items.find(x=>x.id===id)||null;if(current&&!rec(current).level&&rec(current).startedDay!==dayKey()){state[current.id]={...rec(current),startedDay:dayKey(),introducedAt:Date.now()};save()}revealed=false;answerEN='';answerZH='';meaningOK=false;render()}
function navigate(v){if(!['cards','sentences','library','quiz','settings'].includes(v))v='cards';view=v;location.hash=v;if(v==='cards')buildQueue();else render()}
function renderStats(){const visible=view==='cards';['stats','.progressline','.bar'].forEach(selector=>{const node=$(selector)||document.querySelector(selector);if(node)node.hidden=!visible});if(!visible)return;const counts=studyStageCounts(),due=counts.due,fresh=counts.new,mature=counts.mature,learning=counts.learning;
updateStudyStageCounts();
$('stats').innerHTML=`<div class="stat"><b>${due}</b><span>到期复习</span></div><div class="stat"><b>${fresh}</b><span>尚未学习</span></div><div class="stat"><b>${learning}</b><span>正在巩固</span></div><div class="stat"><b>${mature}</b><span>长间隔复习</span></div>`;
$('progress').style.width=(mature/DATA.items.length*100)+'%';$('progress-label').textContent=`${mature} / ${DATA.items.length}`}
function starSelect(){return `<select id="star-filter" aria-label="按五星重要程度筛选学习"><option value="all">雅思重要程度 · 全部星级</option>${[5,4,3,2,1].map(n=>`<option value="${n}">${'★'.repeat(n)}${'☆'.repeat(5-n)} · 只学 ${n} 星</option>`).join('')}</select>`}
function contextMeaningHtml(x){let selected=x.contextSenses||[0];return x.zh.split('；').map((sense,i)=>selected.includes(i)?`<span class="context-meaning">${escapeHTML(sense)}<span class="context-badge">本文义</span></span>`:escapeHTML(sense)).join('；')}
function filterControls(){
 const range=studyStage==='all'?'<select id="scope" aria-label="练习范围"><option value="due">按计划 · 到期＋新词</option><option value="all">提前练习 · 当前筛选内全部词条</option></select>':`<span class="study-mode-note">${studyStage==='due'?'仅到期词条':studyStage==='new'?'按每日新词额度':'当前阶段 · 可提前复习'}</span>`;
 const count=DATA.items.filter(matchesStudyFilters).filter(x=>matchesStudyStage(x)).length;
 return `${studyStageControls()}<div class="controls"><select id="kind" aria-label="词条类型"><option value="all">全部 · 单词与短语</option><option value="word">只练单词</option><option value="phrase">只练短语</option></select>${starSelect()}${range}</div><p class="study-filter-note">${starFilter==='all'?'全部星级':'仅练 '+starFilter+' 星'} · ${count} 条词汇。可叠加学习状态、单词／短语与星级筛选；红色释义为本文义。</p><p class="study-filter-note daily-quota-note" aria-live="polite">${dailyProgressText()}</p>`;
}
function playButton(text,label='朗读',small=false,shortcut=false){return `<button class="speaker${small?' small':''}" data-say="${escapeHTML(text)}" aria-label="${escapeHTML(label)}${shortcut?'，空格键快捷播放':''}">${icon}<span>${label}${shortcut?' · Space':''}</span></button>`}
function norm(s){return s.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:…“”"()\[\]]/g,'').replace(/\s+/g,' ').trim()}
function spellingCorrect(){return current&&[current.term,...(current.acceptedSpellings||[])].some(t=>norm(answerEN)===norm(t))}
function reveal(){if(view==='dictation')answerEN=$('en-answer').value;if(view!=='cards')answerZH=$('zh-answer').value;revealed=true;render()}
function grade(level){
 if(!current||!revealed||![1,2,3,4].includes(level))return;
 state[current.id]=scheduleRecord(rec(current),level);
 save();
 sessionCount++;
 next();
}
function training(){let intro={cards:'先回忆，再揭晓。每一次主动回忆，都在加深记忆。',dictation:'先听英文，再写拼写和中文意思。答案在核对前保持隐藏。',meaning:'看到英文，主动写出中文意思，再对照自评。'};let html=filterControls();if(!current&&studyStage!=='all')return html+studyStageEmpty();if(!current){let selected=DATA.items.filter(matchesStudyFilters);let future=selected.filter(x=>rec(x).level&&rec(x).due>Date.now()).sort((a,b)=>rec(a).due-rec(b).due)[0];let complete=selected.length>0&&selected.every(x=>rec(x).level&&rec(x).due>Date.now());html+=`<section class="card empty"><div class="big">${complete?'✓':'◌'}</div><h2>${complete?'当前筛选内今天没有到期词':!selected.length?'当前筛选没有词条':'当前筛选的学习计划已完成'}</h2><p class="muted">本轮已完成 ${sessionCount} 次。${future?'下一次复习：'+escapeHTML(new Date(rec(future).due).toLocaleString()):'可以在全部词库查看学习情况。'}</p><p class="small muted">${complete?'已复习词条会根据熟练度再次出现；今天可以结束。':'新词每天默认 20 个；越不熟悉的词，复习越频繁。'}</p><button id="refresh" class="primary">检查到期复习</button> <button id="early">提前练习当前星级</button></section>`;return html}
let x=current,r=rec(x);html+=`<p class="small muted">${intro[view]}</p><section class="card"><div class="cardtop"><span class="tag">${x.type==='word'?'WORD · 单词':'PHRASE · 短语'} / ${CARD_LABELS[r.level]||'未学'}</span><span class="counter">本轮已完成 ${sessionCount} · 待练 ${queue.length+1}</span></div><div class="center">`;
if(view==='dictation'&&!revealed){html+=`<div class="term">Listen & recall</div><p class="muted small">点击小喇叭，听清后填写答案</p><button id="listen" class="speaker">${icon} 播放英文</button> <button id="slow" class="speaker small">慢速再听</button>`}else html+=`<div class="term">${escapeHTML(x.term)}</div>${wordMeta(x)}${playButton(x.audioTerm||x.term,'播放读音')}`;
if(view!=='cards'&&!revealed)html+=`<div class="practice-input">${view==='dictation'?'<label>英文单词或短语<input id="en-answer" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="输入你听到的英文"></label>':''}<label>中文释义<textarea id="zh-answer" placeholder="写出你理解的中文意思"></textarea></label></div>`;
if(!revealed)html+=`<p style="margin-top:25px"><button id="reveal" class="primary">${view==='cards'?'揭晓释义 · Enter ↵':'核对答案'}</button></p>`;
else{html+=`<div class="meaning">${contextMeaningHtml(x)}</div>`;
const photo=CONFIG.cardPhotos?.[x.term];
if(photo)html+=`<figure class="card-photo"><img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.label)}实物图" width="${photo.width}" height="${photo.height}" decoding="async"><figcaption>${escapeHTML(photo.label)} · <a href="${escapeHTML(photo.credit)}" target="_blank" rel="noopener noreferrer">图片来源</a></figcaption></figure>`;
if(x.note&&x.note!==x.term)html+=`<p class="small muted">搭配／同义替换：${escapeHTML(x.note)}</p>`;
if(view!=='cards'){html+=`<div class="answer">${view==='dictation'?`<p class="${spellingCorrect()?'ok':'warning'}">${spellingCorrect()?'✓ 英文拼写正确':'请再记一次：'+escapeHTML(x.term)}</p><p>你的英文：${escapeHTML(answerEN)||'（未填写）'}</p>`:''}<p>你的中文：${escapeHTML(answerZH)||'（未填写）'}</p><label><input id="meaning-ok" type="checkbox" ${meaningOK?'checked':''}> 我已对照，中文意思基本正确</label><p class="small muted">中文接受同义表达，由你自评；英文忽略大小写、标点和多余空格。</p></div>`}
if(x.examples.length){html+=`<div class="example">${x.examples.slice(0,3).map((e,i)=>`<div class="example-item"><div class="example-line"><p class="example-en"><span class="example-source ${e.source==='original'?'example-source-original':'example-source-supplemental'}">${sourceLabel(e)}</span>${escapeHTML(e.en)}</p>${playButton(e.en,e.source==='original'?'原文例句朗读':'补充例句朗读',true,i===0)}</div><p class="example-zh">${escapeHTML(e.zh)}${e.sense?`<span class="example-sense">${escapeHTML(e.sense)}</span>`:''}${e.skill?`<span class="example-sense">${escapeHTML(e.skill)}迁移例句</span>`:''}</p><div class="card-sentence-flag">${exampleFlagControls(e)}</div></div>`).join('')}</div>`}}
if(revealed)html+=memoryHtml(x);html+='</div>';
if(revealed){let gated=view!=='cards'&&(!meaningOK||(view==='dictation'&&!spellingCorrect()));
html+=`<div class="grades">${[[1,'Again','重来'],[2,'Hard','吃力'],[3,'Good','记得'],[4,'Easy','轻松']].map(([n,l,t])=>`<button class="grade-${l.toLowerCase()}" data-grade="${n}" ${gated&&n>=2?'disabled':''}><b>${l}</b><span>${t}</span><small>${formatDelay(scheduleRecord(r,n,Date.now()).intervalDays)}</small></button>`).join('')}</div><p class="hint">Enter 揭晓释义 · Space 发音 · 数字键：1=Again；2 = Hard； 3 = Good；4 = Easy</p>`}
return html+'</section><div class="bottom"><span>间隔复习 · 到期词优先，五星重要词先学</span><button id="skip">暂时跳过</button></div>'}
function formatIPA(s){return s.split('；').map(p=>{let m=p.match(/^([^（]+)(.*)$/);return '/'+escapeHTML(m?m[1]:p)+'/'+escapeHTML(m?m[2]:'')}).join('；')}
function wordMeta(x){return `<div class="word-meta">${x.pos?`<span class="pos">${escapeHTML(x.pos)}</span>`:""}${(x.type==='word'||listening&&x.ipa)?(x.ipa?`<span class="ipa" lang="en-GB">${formatIPA(x.ipa)}</span>`:listening?'':'<span class="small muted">音标待补</span>'):''}<span class="stars" role="img" aria-label="雅思重要程度 ${x.stars} 星，共 5 星">${'★'.repeat(x.stars)}${'☆'.repeat(5-x.stars)} <span class="star-label">重要 ${x.stars}/5</span></span></div>`}
function memoryHtml(x){if(!x.memory)return '';let m=x.memory;return `<section class="memory-panel" aria-label="${escapeHTML(x.term)}的词根记忆法"><h3>词根与构词记忆 <span class="memory-label">${escapeHTML(m.method)}</span></h3><p><b>拆分／来源：</b>${escapeHTML(m.parts)}</p><p><b>这样记：</b>${escapeHTML(m.tip)}</p><p class="memory-family"><b>一起记：</b>${escapeHTML(m.family)}</p>${m.source?`<a href="${escapeHTML(m.source)}" target="_blank" rel="noopener noreferrer">查看词源参考 · Etymonline</a>`:''}</section>`}
function libraryMeanings(x){let senses=x.zh.split('；'),selected=x.contextSenses||[0];return {main:senses.filter((v,i)=>selected.includes(i)).join('；')||senses[0],other:senses.filter((v,i)=>!selected.includes(i)).join('；')}}
function libraryExamplePlay(e){const label='朗读'+sourceLabel(e);return `<button class="speaker small example-speaker" type="button" data-say="${escapeHTML(e.en)}" aria-label="${label}" title="${label}">${icon}<span>朗读</span></button>`}
function levelNextLabel(r){if(![1,2,3,4].includes(r.level))return '未安排复习';if(!Number.isFinite(r.due)||r.due<=Date.now())return '现在可复习';return '下次：'+formatDelay((r.due-Date.now())/DAY)}
function libraryFamiliarity(x){const r=rec(x),level=[1,2,3,4].includes(r.level)?r.level:0;return `<label class="library-familiarity" data-level="${level}" title="熟练度影响翻卡出现时间"><span class="sr">${escapeHTML(x.term)} 的熟练度</span><select data-level-id="${escapeHTML(x.id)}" aria-label="${escapeHTML(x.term)} 的熟练度"><option value="0" ${level===0?'selected':''} disabled>选择熟练度</option>${FAMILIARITY_OPTIONS.map(([n,label])=>`<option value="${n}" ${level===n?'selected':''}>${label}</option>`).join('')}</select><span class="level-next">${levelNextLabel(r)}</span></label>`}
function libraryPronounce(x){return `<button class="speaker library-pronounce" data-say="${escapeHTML(x.audioTerm||x.term)}" type="button" title="朗读 ${escapeHTML(x.term)}" aria-label="朗读 ${escapeHTML(x.term)}">${icon}</button>`}
function library(){let rows=DATA.items.filter(x=>(kind==='all'||kind===x.type)&&(starFilter==='all'||String(x.stars)===starFilter)&&(x.term+' '+x.zh+' '+(x.ipa||'')+' '+(x.pos||'')).toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>libraryOrder==='source'?a.sourceOrder-b.sourceOrder:b.stars-a.stars||((a.type==='word'?0:1)-(b.type==='word'?0:1))||a.sourceOrder-b.sourceOrder);if(!rows.some(x=>x.id===activeLibraryId))activeLibraryId=rows[0]?.id||null;return `<label class="library-search" for="search">搜索全部词库</label><div class="controls"><input id="search" type="search" aria-label="搜索词库" placeholder="输入英文、中文或音标，例如：species / 物种 / 名词" value="${escapeHTML(search)}"><select id="kind"><option value="all">全部类型</option><option value="word">单词</option><option value="phrase">短语</option></select><select id="star-filter" aria-label="按五星重要程度筛选"><option value="all">全部重要程度</option>${[5,4,3,2,1].map(n=>`<option value="${n}">${"★".repeat(n)} · ${n} 星</option>`).join('')}</select></div><p class="search-help">支持英文、中文、音标实时搜索。右侧可设置四档熟练度，自动影响翻卡出现时间。点击词条选中后，按空格键播放读音；在搜索框输入时空格键照常使用。</p><div class="controls"><label>词库顺序 <select id="library-order"><option value="source">${listening?'材料首次出现顺序':PARAGRAPH_RANGE+' 段落与首次出现顺序'}</option><option value="priority">五星重要程度优先</option></select></label></div><p class="small muted">共 ${rows.length} 条；${libraryOrder==='source'?listening?'按材料首次出现顺序排列':'按'+PARAGRAPH_RANGE+'自然段与段内首次出现顺序排列':'按重要程度排列'}。</p><section class="card">${rows.map(x=>`<article class="list-item library-entry${activeLibraryId===x.id?' is-current':''}" data-library-id="${escapeHTML(x.id)}" tabindex="0" aria-label="${escapeHTML(x.term)}：空格键播放读音"><div class="library-word-head"><div class="library-headings"><div class="library-title-line">${libraryPronounce(x)}<span class="library-title-content"><span class="tag">${escapeHTML(x.paragraph)}${listening?'':' 段'}</span><b class="library-term">${escapeHTML(x.term)}</b><span class="library-main-meaning">${escapeHTML(libraryMeanings(x).main)} <span class="context-badge">本文义</span></span></span>${libraryFamiliarity(x)}</div>${wordMeta(x)}</div></div>${libraryMeanings(x).other?`<p class="library-secondary-meaning">其他常见义：${escapeHTML(libraryMeanings(x).other)}</p>`:''}${x.note?`<p class="library-note">${escapeHTML(x.note)}</p>`:""}${memoryHtml(x)}${x.examples.length?`<details class="example library-example"><summary>查看例句 · ${x.examples.length} 条</summary>${x.examples.map(e=>`<div class="example-item"><div class="example-line"><p class="example-en"><span class="example-source ${e.source==='original'?'example-source-original':'example-source-supplemental'}">${sourceLabel(e)}</span>${escapeHTML(e.en)}</p>${libraryExamplePlay(e)}</div><p class="example-zh">${escapeHTML(e.zh)}${e.sense?`<span class="example-sense">${escapeHTML(e.sense)}</span>`:''}${e.skill?`<span class="example-sense">${escapeHTML(e.skill)}迁移例句</span>`:''}</p></div>`).join('')}</details>`:''}</article>`).join('')||'<p>没有匹配的词条。</p>'}</section>`}
function sentences(){
 if(listening)return '<section class="original-player listening-full-player"><div class="original-player-heading"><div><h2>完整原录音</h2><p>Tardigrades · Listening Part 4</p></div><span class="player-headphone" aria-hidden="true">♧</span></div><div class="descript-player-wrap"><iframe title="Tardigrades 完整原录音" src="https://share.descript.com/embed/OcXt4RmwmJH" allow="encrypted-media *; fullscreen *" allowfullscreen loading="lazy"></iframe></div><p class="original-player-note">逐句时间标签对应原录音位置；点击句子下方的时间标签，可打开录音并定位复听。</p></section><div class="transcript-toolbar"><div class="controls"><input id="sentence-search" placeholder="搜索英文或中文" aria-label="搜索句子" value="'+escapeHTML(search)+'"></div></div><section class="card" id="sentence-list"></section><div id="sentence-collection"></div>';
 return '<p class="muted">'+DATA.sentences.length+' 个原文句子。阅读时遇到理解障碍，直接在句子下方标记；读完整篇后，在页面底部集中查看并导出解析清单。</p><div class="controls"><input id="sentence-search" placeholder="搜索原文或例句" aria-label="搜索句子" value="'+escapeHTML(search)+'"></div><section class="card" id="sentence-list"></section><div id="sentence-collection"></div>'}
let sentenceType='original';
function sentenceFlagKey(number){return SENTENCE_FLAG_PREFIX+(DATA.sentences[number-1]?.flagId??number)}
function sentenceFlag(number){const r=state[sentenceFlagKey(number)];return r&&!r.removed?r:null}
function sentenceFlagEntries(){return DATA.sentences.map(function(sentence,index){const number=index+1,record=sentenceFlag(number);return record?{sentence:sentence,index:number,record:record}:null}).filter(Boolean)}
function sentenceReasonNames(reasons){return (reasons||[]).map(function(code){const found=SENTENCE_REASON_OPTIONS.find(function(item){return item[0]===code});return found?found[1]:null}).filter(Boolean)}
function renderSentenceCollection(){
 const target=$('sentence-collection');if(!target)return;
 const entries=sentenceFlagEntries();
 let html='<section class="card sentence-collection"><div class="sentence-collection-head"><h3>我的难点句</h3><span class="sentence-collection-count">已收集 '+entries.length+' 句</span></div><p class="sentence-collection-intro">这里集中保存你亲自标记的句子。'+(listening?'听完后可以集中重听并导出清单。':'读完整篇后，再统一整理和深入解析；AI 不会替你判断哪些句子是难点。')+'</p>';
 if(!entries.length){html+='<p class="sentence-collection-empty">暂时没有标记。'+(listening?'遇到没听清或没听懂的句子时，点击该句下方的「标记为我的难点句」。':'读到看不懂、翻译困难或产生误解的句子时，点击该句下方的「标记为我的难点句」。')+'</p>'}
 else{
  html+='<details><summary>查看已收集的 '+entries.length+' 句</summary>';
  entries.forEach(function(entry){
   const labels=sentenceReasonNames(entry.record.reasons),note=String(entry.record.note||'').trim();
   html+='<article class="sentence-collection-item"><span class="tag">原文句子 '+String(entry.index).padStart(2,'0')+'</span><p>'+escapeHTML(entry.sentence.en)+'</p><p class="sentence-collection-meta">困难类型：'+escapeHTML(labels.join('、')||'尚未选择')+'</p>';
   if(note)html+='<p class="sentence-collection-meta">我的备注：'+escapeHTML(note)+'</p>';
   html+='<div class="sentence-collection-actions"><button type="button" data-sentence-jump="'+entry.index+'">定位原句</button><button type="button" data-sentence-flag-toggle="'+entry.index+'">取消标记</button></div></article>';
  });
  html+='</details><button type="button" class="primary sentence-collection-export" id="export-sentence-difficulties">导出专项解析清单（Markdown）</button>';
 }
 html+='</section>';target.innerHTML=html;
}
function exportSentenceDifficulties(){
 const entries=sentenceFlagEntries();if(!entries.length){toast('还没有标记难点句。');return}
 const lines=['# '+CONFIG.title+'｜我的难点句专项解析清单','','以下句子由我在'+(listening?'听力复盘':'阅读')+'过程中手动标记。请不要重新替我筛选难句，而是围绕我标记的实际理解障碍逐句深入解析。','','解析时请根据每句的困难类型调整重点，必要时包含：句子主干、从句与修饰关系、非谓语结构、意群拆解、重点词义与搭配、逻辑和指代关系、容易误读的原因、准确自然的中文翻译，以及类似结构的迁移练习。不要机械套用所有模块；与该句困难无关的内容可以省略。',''];
 entries.forEach(function(entry){
  const labels=sentenceReasonNames(entry.record.reasons);
  lines.push('## 原文句子 '+String(entry.index).padStart(2,'0'),'','**英文原句：**','> '+entry.sentence.en,'','**现有中文译文：** '+entry.sentence.zh,'','**我标记的困难：** '+(labels.join('；')||'尚未选择'));
  if(entry.record.note)lines.push('','**我的备注／当时理解：** '+entry.record.note);
  lines.push('');
 });
 lines.push('---','','请先逐句解析，并指出真正造成理解障碍的语言点；如果原有中文译文有不准确之处，也请明确修正。');
 const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=CONFIG.id+'-我的难点句-'+new Date().toISOString().slice(0,10)+'.md';a.click();setTimeout(function(){URL.revokeObjectURL(url)},1000);
}
function sentenceFlagControls(number){
 if(!Number.isInteger(number)||!DATA.sentences[number-1])return '';
 let html='',flag=sentenceFlag(number);
   html+='<div class="sentence-actions"><button type="button" class="sentence-flag-toggle'+(flag?' is-flagged':'')+'" data-sentence-flag-toggle="'+number+'">'+(flag?'已标记 · 取消标记':'＋ 标记为我的难点句')+'</button></div>';
   if(flag){
    const reasons=Array.isArray(flag.reasons)?flag.reasons:[];
    html+='<div class="sentence-flag-panel"><p class="sentence-flag-panel-title">这句话对我来说难在哪里？（可多选）</p><div class="sentence-reason-grid">';
    SENTENCE_REASON_OPTIONS.forEach(function(option){html+='<label class="sentence-reason-option"><input type="checkbox" data-sentence-reason="'+number+'" value="'+option[0]+'" '+(reasons.includes(option[0])?'checked':'')+'><span>'+option[1]+'</span></label>'});
    html+='</div><textarea class="sentence-note" data-sentence-note="'+number+'" aria-label="我的难点备注" placeholder="选填：写下你当时的理解、自己的翻译，或具体卡住的地方">'+escapeHTML(flag.note||'')+'</textarea></div>';
   }
 return html;
}
function formatTime(value){const n=Math.max(0,Math.floor(Number(value)||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function sentenceList(){
 if(!$('sentence-list'))return;
 const source=sentenceType==='original'?DATA.sentences:DATA.examples;
 const rows=source.map(function(x,index){return {sentence:x,index:index}}).filter(function(entry){return (entry.sentence.en+entry.sentence.zh).toLowerCase().includes(search.toLowerCase())});
 $('sentence-list').innerHTML=rows.map(function(entry){
  const x=entry.sentence,number=entry.index+1,isOriginal=sentenceType==='original',flag=isOriginal?sentenceFlag(number):null;
  const opening='<article class="list-item sentence-row'+(flag?' is-flagged':'')+'" id="sentence-row-'+number+'" data-sentence-row="'+number+'">';
  const translation='<details><summary>查看中文</summary><p>'+escapeHTML(x.zh)+'</p></details>';
  let content;
  if(listening){
   const audioTime=Number(x.start)||0;
   const timeLabel=x.timestamp||formatTime(audioTime);
   const audioHref='https://share.descript.com/view/OcXt4RmwmJH#t='+Math.floor(audioTime);
   content='<div class="listening-sentence-meta"><span class="tag">原文 '+String(number).padStart(2,'0')+'</span><span class="listening-speaker">'+(x.speaker?escapeHTML(x.speaker):'讲者')+'</span><span class="listening-sentence-index">句子 '+String(number).padStart(2,'0')+'</span></div>'
    +'<div class="listening-sentence-body">'+playButton(x.en,'朗读整句',true)+'<span class="sentence-en" lang="en">'+escapeHTML(x.en)+'</span></div>'
    +'<div class="listening-sentence-tools"><a class="listening-time-chip" href="'+audioHref+'" target="_blank" rel="noopener"><span aria-hidden="true">▹</span> 原录音 · '+escapeHTML(timeLabel)+'</a>'+translation+sentenceFlagControls(number)+'</div>';
  }else{
   content='<span class="tag">'+escapeHTML(x.paragraph)+' 段 · '+String(number).padStart(2,'0')+'</span> <span class="example-source '+(isOriginal?'example-source-original':'example-source-supplemental')+'">'+(isOriginal?'原文句子':'补充例句')+'</span>'
    +'<p class="sentence-text">'+escapeHTML(x.en)+'</p>'+playButton(x.en,'朗读整句',true)+translation+(isOriginal?sentenceFlagControls(number):'');
  }
  const firstInParagraph=entry===rows[0]||rows[rows.indexOf(entry)-1].sentence.paragraph!==x.paragraph;
  const paragraphRows=DATA.sentences.filter(function(sentence){return sentence.paragraph===x.paragraph});
  const paragraphStart=DATA.sentences.findIndex(function(sentence){return sentence.paragraph===x.paragraph})+1;
  const paragraphEnd=paragraphStart+paragraphRows.length-1;
  return (firstInParagraph?'<h2 class="paragraph-heading"><span>'+escapeHTML(x.paragraph)+'</span><small>'+String(paragraphStart).padStart(2,'0')+'–'+String(paragraphEnd).padStart(2,'0')+'</small></h2>':'')+opening+content+sentenceNotes(x)+'</article>';
 }).join('')||'<p>没有匹配的句子。</p>';
 renderSentenceCollection();
}

function settingsPage(){return `<section class="card settings"><h2>让学习适合你</h2><label>英语朗读音色<select id="voice-select"></select></label><p class="small muted">优先推荐 Natural、Neural、Premium 等自然音色。可用音色由浏览器和系统提供；没有自然音色时，请在设备的语音设置中添加英语增强语音。</p><label>语速 <input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="${settings.rate}"><span id="rate-label">${settings.rate} ×</span></label><label>发音来源<select id="engine"><option value="device">设备英语语音 · 单词、短语、句子</option><option value="dictionary">在线词典发音 · 词条优先，失败转设备语音</option></select></label><p class="small muted">在线词典发音需要联网，会把所读词条发送给有道词典。句子始终使用所选设备音色。</p><div>${playButton(DATA.sentences[0]?.en||CONFIG.title,'试听所选音色')}</div><label>每天新词数量<input id="daily" type="number" min="1" max="100" value="${settings.daily}"></label><p id="daily-status" class="small muted" aria-live="polite">${dailyProgressText(settings.daily)} 修改数量后，返回翻卡页面即可按新额度重新安排队列。</p><p class="small muted">翻卡揭晓释义后，用 Again / Hard / Good / Easy 四档判断熟练度，也可以在“全部词库”右侧直接选择对应熟练度。两个界面共用同一套进度记录，并自动安排下一次复习：首次 Again 约 1 分钟（复习后再次忘记则约 10 分钟）、Hard 约 10 分钟、Good 约 1 天、Easy 约 4 天；后续间隔随练习表现动态变化，最长 120 天。Enter 揭晓释义、Space 发音、数字键 1–4 评价。可导出进度备份。</p><div><h2>进度备份</h2><p class="muted small">可导出 JSON 备份词卡与难点句。</p><div class="row"><button id="export">导出进度</button><label><span class="sr">导入进度文件</span><input id="import" type="file" accept="application/json,.json"></label></div></div><p class="small muted">词库：${DATA.items.filter(x=>x.type==='word').length} 个单词与词汇条目、${DATA.items.filter(x=>x.type==='phrase').length} 组短语。模板中的省略号不参与拼写；部分语法模板保留具体表达，可在词库查看。</p>${CONFIG.cloudSync?window.KakapoCloudSync.settingsHTML():''}</section>`}
function render(){renderStats();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('subtitle').textContent={cards:CONFIG.title+' / 翻卡复习',sentences:'在句子里，听懂每一个词。',library:CONFIG.title+' / 全部词库',quiz:'题目依据与错因复盘',settings:'学习偏好与进度管理'}[view];$('app').innerHTML=view==='cards'?training():view==='library'?library():view==='sentences'?sentences():view==='quiz'?analysisPage():settingsPage();
if($('library-order')){$('library-order').value=libraryOrder;$('library-order').onchange=e=>{libraryOrder=e.target.value;render()}}
if($('kind')){$('kind').value=kind;$('kind').onchange=e=>{kind=e.target.value;if(view==='library')render();else buildQueue()}}if($('scope')){$('scope').value=scope;$('scope').onchange=e=>{scope=e.target.value;buildQueue()}}
document.querySelectorAll('[data-study-stage]').forEach(button=>{button.onclick=()=>{studyStage=button.dataset.studyStage;buildQueue();document.querySelector(`[data-study-stage="${studyStage}"]`)?.focus()}});
if($('reset-study-stage'))$('reset-study-stage').onclick=()=>{studyStage='all';buildQueue()};
if($('reveal'))$('reveal').onclick=reveal;if($('listen'))$('listen').onclick=()=>speak(current.audioTerm||current.term,true);if($('slow'))$('slow').onclick=()=>speak(current.audioTerm||current.term,true,0.65);if($('meaning-ok'))$('meaning-ok').onchange=e=>{meaningOK=e.target.checked;render()};if($('skip'))$('skip').onclick=()=>{next()};if($('refresh'))$('refresh').onclick=buildQueue;if($('early'))$('early').onclick=()=>{scope='all';buildQueue()};
if($('star-filter')){$('star-filter').value=starFilter;$('star-filter').onchange=e=>{starFilter=e.target.value;if(view==='cards')buildQueue();else render()}}if($('search'))$('search').oninput=e=>{search=e.target.value;render();$('search').focus()};
if(view==='sentences'){$('sentence-search').oninput=e=>{search=e.target.value;sentenceList()};sentenceList()}
if(view==='settings'){voiceOptions();$('engine').value=settings.engine;$('engine').onchange=e=>{settings.engine=e.target.value;saveSettings()};$('voice-select').onchange=e=>{settings.voice=e.target.value;saveSettings();voiceStatus()};$('rate').oninput=e=>{settings.rate=Number(e.target.value);$('rate-label').textContent=settings.rate+' ×';saveSettings()};$('daily').oninput=e=>{let proposed=Math.max(1,Math.min(100,parseInt(e.target.value)||20));if($('daily-status'))$('daily-status').textContent=`设置为 ${proposed} 个；今日已接触 ${todayNew()} 个新词，剩余额度 ${Math.max(0,proposed-todayNew())} 个。`};$('daily').onchange=e=>{settings.daily=Math.max(1,Math.min(100,parseInt(e.target.value)||20));e.target.value=settings.daily;saveSettings();if($('daily-status'))$('daily-status').textContent=dailyProgressText(settings.daily)+' 返回翻卡页面后会按新额度重新安排队列。';toast(`每日新词上限已保存为 ${settings.daily} 个；到期复习不占用新词额度。`)};$('export').onclick=exportData;$('import').onchange=importData;if(CONFIG.cloudSync)window.KakapoCloudSync.bindSettings();}}
document.addEventListener('click',e=>{
 let v=e.target.closest('[data-view]');if(v){stopSound();search='';navigate(v.dataset.view)}
 let p=e.target.closest('[data-say]');if(p)speak(p.dataset.say,DATA.items.some(x=>x.term===p.dataset.say));
 let g=e.target.closest('[data-grade]');if(g)grade(Number(g.dataset.grade));
 let toggle=e.target.closest('[data-sentence-flag-toggle]');
 if(toggle){
  const number=Number(toggle.dataset.sentenceFlagToggle);if(!DATA.sentences[number-1])return;const key=sentenceFlagKey(number),old=state[key]||{},now=Date.now();
  state[key]={updated:now,createdAt:Number.isFinite(old.createdAt)?old.createdAt:now,removed:!old.removed&&!!sentenceFlag(number),reasons:Array.isArray(old.reasons)?old.reasons:[],note:typeof old.note==='string'?old.note:''};
  save();
  if(view==='cards'){
   const controls=toggle.closest('.card-sentence-flag');
   if(controls){
    controls.innerHTML=sentenceFlagControls(number);
    controls.querySelector('button')?.focus();
   }
   return;
  }
  sentenceList();
  const row=document.getElementById('sentence-row-'+number);if(row)row.scrollIntoView({block:'nearest'});
  return;
 }
 let jump=e.target.closest('[data-sentence-jump]');
 if(jump){const number=Number(jump.dataset.sentenceJump);sentenceType='original';search='';render();const row=document.getElementById('sentence-row-'+number);if(row)row.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(e.target.closest('#export-sentence-difficulties')){exportSentenceDifficulties();return}
});
document.addEventListener('input',e=>{
 const note=e.target.closest('textarea[data-sentence-note]');
 if(!note)return;
 const key=sentenceFlagKey(Number(note.dataset.sentenceNote));
 const flag=state[key];
 if(!flag||flag.removed)return;
 state[key]={...flag,note:note.value.slice(0,2000),updated:Date.now()};
 save();
 renderSentenceCollection();
});
document.addEventListener('change',e=>{
 const reasonInput=e.target.closest('input[data-sentence-reason]');
 if(reasonInput){
  const number=Number(reasonInput.dataset.sentenceReason),key=sentenceFlagKey(number),old=state[key];
  if(!old||old.removed)return;
  const reasons=new Set(Array.isArray(old.reasons)?old.reasons:[]);
  if(reasonInput.checked)reasons.add(reasonInput.value);else reasons.delete(reasonInput.value);
  state[key]={...old,reasons:Array.from(reasons),updated:Date.now()};save();renderSentenceCollection();return;
 }
 const noteInput=e.target.closest('textarea[data-sentence-note]');
 if(noteInput){
  const number=Number(noteInput.dataset.sentenceNote),key=sentenceFlagKey(number),old=state[key];
  if(!old||old.removed)return;
  state[key]={...old,note:noteInput.value.slice(0,2000),updated:Date.now()};save();renderSentenceCollection();return;
 }
 const sel=e.target.closest('select[data-level-id]');if(!sel)return;
 const id=sel.dataset.levelId,level=Number(sel.value);
 if(![1,2,3,4].includes(level)||!DATA.items.some(x=>x.id===id))return;
 const old=state[id]||{};if(old.level===level)return;
 const now=Date.now();state[id]=scheduleRecord(old,level,now);
 // An unfamiliar word should enter the card queue immediately, not only after the one-minute initial interval.
 if(level===1)state[id].due=now;
 save();renderStats();
 const wrapper=sel.closest('.library-familiarity');
 if(wrapper){wrapper.dataset.level=String(level);const note=wrapper.querySelector('.level-next');if(note)note.textContent=levelNextLabel(state[id])}
 toast('已标记'+LABELS[level]+'；'+levelNextLabel(state[id])+'，翻卡计划已更新。');
});
let audio=null,soundToken=0;
function stopSound(){soundToken++;if(audio){audio.pause();audio=null}if('speechSynthesis'in window)speechSynthesis.cancel()}
function voiceScore(v){return (/natural|neural|premium|enhanced/i.test(v.name)?100:0)+(!v.localService?30:0)+(/^en-GB/i.test(v.lang)?10:0)+(/Google|Microsoft|Samantha|Daniel|Serena/i.test(v.name)?5:0)}
function selectedVoice(){return voices.find(v=>v.voiceURI===settings.voice)||voices[0]}
function loadVoices(){voices=('speechSynthesis'in window?speechSynthesis.getVoices():[]).filter(v=>/^en(?:-|_)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a));voiceStatus();if(view==='settings')voiceOptions()}
function voiceStatus(){let v=selectedVoice();$('voice-status').textContent=v?'英语音色 · '+v.name:('speechSynthesis'in window?'未检测到英语音色，请查看学习设置':'此浏览器不支持设备朗读，请尝试在线词典发音或其他浏览器')}
function voiceOptions(){if(!$('voice-select'))return;$('voice-select').innerHTML='<option value="">自动选择 · 优先自然英语音色</option>'+voices.map(v=>`<option value="${escapeHTML(v.voiceURI)}">${escapeHTML(v.name)} · ${escapeHTML(v.lang)}</option>`).join('');$('voice-select').value=settings.voice}
function deviceSpeech(text,rate,token){if(token!==soundToken)return;if(!('speechSynthesis'in window)){toast('此浏览器不支持语音朗读，请换用支持语音的浏览器。');return}loadVoices();let v=selectedVoice();if(!v){toast('未检测到英语音色，请在系统中添加英语语音后重试。');return}let u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=rate;u.pitch=1;u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))toast('朗读未成功，请换一个英语音色。')};speechSynthesis.speak(u)}
function speak(text,isTerm=false,rate=settings.rate){stopSound();const token=soundToken;let spoken=text.replace(/\bA\b/g,'A').replace(/…/g,' ').replace(/[＋+]/g,' ');if(settings.engine==='dictionary'&&isTerm){audio=new Audio('https://dict.youdao.com/dictvoice?audio='+encodeURIComponent(spoken)+'&type=1');audio.playbackRate=rate;let finished=false;const fallback=()=>{if(finished||token!==soundToken)return;finished=true;if(audio)audio.pause();toast('在线发音不可用，已切换设备音色。');deviceSpeech(spoken,rate,token)};const timer=setTimeout(fallback,7000);audio.onplaying=()=>{finished=true;clearTimeout(timer)};audio.onerror=fallback;audio.play().catch(fallback);return}deviceSpeech(spoken,rate,token)}
function exportData(){let blob=new Blob([JSON.stringify({app:KEY,version:2,exportedAt:new Date().toISOString(),state,settings},null,2)],{type:'application/json'});let a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=CONFIG.id+'-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

function activateLibraryEntry(el){if(!el||view!=='library')return;activeLibraryId=el.dataset.libraryId;document.querySelectorAll('.library-entry').forEach(node=>node.classList.toggle('is-current',node===el))}
document.addEventListener('pointerdown',e=>activateLibraryEntry(e.target.closest('.library-entry')));
document.addEventListener('focusin',e=>activateLibraryEntry(e.target.closest('.library-entry')));
document.addEventListener('keydown',e=>{
  if(e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;
  const tag=document.activeElement?.tagName||'';
  if((e.code==='Space'||e.key===' ')&&view==='library'){
    if(/^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(tag)||document.activeElement?.isContentEditable)return;
    const el=document.querySelector('.library-entry.is-current')||document.querySelector('.library-entry');
    if(!el)return;
    const item=DATA.items.find(x=>x.id===el.dataset.libraryId);
    if(!item)return;
    e.preventDefault();
    speak(item.audioTerm||item.term,true);
    return;
  }
  if(!current)return;
  if((e.code==='Space'||e.key===' ')&&view==='cards'){
    if(/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)||document.activeElement?.isContentEditable)return;
    e.preventDefault();
    const sentence=revealed?current.examples?.[0]?.en:null;
    if(sentence)speak(sentence,false);
    else speak(current.audioTerm||current.term,true);
    return;
  }
  if(e.key==='Enter'&&view==='cards'&&!revealed){
    if(/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)||document.activeElement?.isContentEditable)return;
    e.preventDefault();
    reveal();
    return;
  }
  if(e.key>='1'&&e.key<='4'&&view==='cards'&&revealed){
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)||document.activeElement?.isContentEditable)return;
    e.preventDefault();
    grade(Number(e.key));
  }
});
window.addEventListener('hashchange',()=>{const requested=initialView();if(requested!==view)navigate(requested)});
if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=loadVoices;loadVoices();setTimeout(loadVoices,1200)}else voiceStatus();
setInterval(()=>{renderStats();if(view==='cards'&&!current){let ids=candidates().map(x=>x.id);if(ids.length){queue=ids;next()}}},15000);
migrateProgress();

window.addEventListener('storage', event => {
  if(event.key!==KEY && event.key!==SETTINGKEY)return;
  const fresh=loadReview();
  state=mergeRecordChanges(fresh.records,savedRecords,state);
  savedRecords=copyRecords(state);
  settings=fresh.settings;
  savedSettings={...settings};
  renderStats();
  if(view==='sentences')sentenceList();
});
if(CONFIG.cloudSync)window.KakapoCloudSync.init({
  appKey:KEY,
  ids:DATA.items.map(item=>item.id),
  getState:()=>state,
  setState:nextState=>{state=nextState;save();renderStats();if(view==='cards'&&!revealed)buildQueue();else if(view==='library')render();else if(view==='sentences')sentenceList();}
});

if(view==='cards')buildQueue();else render();

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function copyRecords(value) {
  return JSON.parse(JSON.stringify(objectValue(value)));
}

function decodeStoredReview(raw) {
  raw = objectValue(raw);
  let records = {};
  if (CONFIG.storageFormat === 'flat') records = {...raw};
  if (CONFIG.storageFormat === 'deck') records = {...objectValue(raw.records)};
  if (CONFIG.storageFormat === 'listening-progress') {
    const grades = {unknown:1, vague:2, known:3, mastered:4};
    for (const [key, value] of Object.entries(objectValue(raw.progress))) {
      const id = /^\d+$/.test(key) ? DATA.items[Number(key)]?.id : key;
      const level = typeof value === 'string' ? grades[value] : Number(value?.level);
      if (id && [1,2,3,4].includes(level)) {
        records[id] = {...(typeof value === 'object' ? value : {}), level, due:value?.due || 0, reps:value?.reps || 1};
      }
    }
  }
  if (CONFIG.storageFormat === 'dream') {
    for (const [id, record] of Object.entries(objectValue(raw.v))) {
      const level = record.s === 'master' ? 4 : record.s === 'weak' ? 1 : 0;
      if (level || record.fav) records[id] = {...record, level, due:0, reps:level ? 1 : 0, updated:record.t || 0, favourite:record.fav === true};
    }
  }
  if (CONFIG.storageFormat === 'hurricane') {
    for (const [id, record] of Object.entries(objectValue(raw.cards))) {
      const level = record.status === 2 ? 4 : record.status === 1 ? 3 : record.status === 0 ? 1 : 0;
      records[id] = {...record, level, due:record.due || 0, reps:level ? 1 : 0, updated:record.last || 0, favourite:record.fav === true};
    }
  }
  for (const [id, record] of Object.entries(objectValue(raw.readingRecords))) {
    if (!records[id] || (record.updated || 0) >= (records[id].updated || 0)) records[id] = record;
  }
  return records;
}

function loadReview() {
  const raw = readLocal(KEY, {});
  let records = decodeStoredReview(raw);
  const legacy = CONFIG.legacyBrassica ? readLocal('ielts-review-brassica-1123-v1', {}) : {};
  if (!Object.keys(records).length && legacy.cards) {
    for (const [id, record] of Object.entries(legacy.cards)) {
      records[id] = {level:['Again','Hard','Good','Easy'].indexOf(record.grade)+1, due:record.due, reps:1, intervalDays:record.days, startedDay:record.first, updated:0};
    }
  }
  if (CONFIG.legacyQuizSlug) {
    const old = readLocal('ielts-review-v1-'+CONFIG.legacyQuizSlug+'-quiz', {});
    for (const item of DATA.items) {
      if (records[item.id] || !item.legacyId) continue;
      const level = (old.good || []).includes(item.legacyId) ? 4 : (old.weak || []).includes(item.legacyId) ? 1 : 0;
      if (level) records[item.id] = {level, due:0, reps:1, updated:0};
    }
  }
  return {
    records,
    settings:{voice:'', rate:.9, daily:legacy.limit || 20, engine:'device', ...objectValue(raw.settings), ...readLocal(SETTINGKEY,{})}
  };
}

function mergeRecordChanges(latest, before, after) {
  const merged = {...latest};
  for (const id of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (JSON.stringify(before[id]) === JSON.stringify(after[id])) continue;
    if (!Object.hasOwn(after,id)) delete merged[id];
    else if (!merged[id] || (after[id].updated || 0) >= (merged[id].updated || 0)) merged[id] = after[id];
  }
  return merged;
}

function writeReviewRecords(records, latestRaw) {
  if (CONFIG.storageFormat === 'flat') return records;
  const raw = {...latestRaw, readingRecords:records};
  if (CONFIG.storageFormat === 'deck') raw.records = {...objectValue(raw.records)};
  if (CONFIG.storageFormat === 'dream') raw.v = {...objectValue(raw.v)};
  if (CONFIG.storageFormat === 'hurricane') raw.cards = {...objectValue(raw.cards)};
  for (const item of DATA.items) {
    const record = records[item.id];
    if (!record) continue;
    if (CONFIG.storageFormat === 'deck') raw.records[item.id] = {...record,lastSeen:record.updated || 0};
    if (CONFIG.storageFormat === 'dream') raw.v[item.id] = {...raw.v[item.id],s:record.level===4?'master':record.level?'weak':'new',fav:!!record.favourite,t:record.updated || 0};
    if (CONFIG.storageFormat === 'hurricane') raw.cards[item.id] = {...raw.cards[item.id],status:record.level===4?2:record.level===3?1:0,fav:!!record.favourite,last:record.updated || 0,due:record.due};
  }
  return raw;
}

function save() {
  try {
    const latestRaw = readLocal(KEY, {});
    state = mergeRecordChanges(decodeStoredReview(latestRaw), savedRecords, state);
    localStorage.setItem(KEY, JSON.stringify(writeReviewRecords(state,latestRaw)));
    savedRecords = copyRecords(state);
    window.KakapoCloudSync?.localChanged();
    return true;
  } catch {
    toast('保存失败：浏览器存储不可用，请导出备份。');
    return false;
  }
}

function saveSettings() {
  try {
    const next = {...readLocal(SETTINGKEY,{})};
    for (const [key,value] of Object.entries(settings)) {
      if (JSON.stringify(value) !== JSON.stringify(savedSettings[key])) next[key] = value;
    }
    localStorage.setItem(SETTINGKEY,JSON.stringify(next));
    if (CONFIG.storageFormat !== 'flat') {
      const raw = readLocal(KEY,{});
      raw.settings = {...objectValue(raw.settings),...next};
      localStorage.setItem(KEY,JSON.stringify(raw));
    }
    settings = {...settings,...next};
    savedSettings = {...settings};
  } catch {
    toast('设置未保存：浏览器存储不可用。');
  }
}

function migrateProgress() {
  let changed = false;
  const now = Date.now();
  for (const item of DATA.items) {
    const record = state[item.id];
    if (!record || ![1,2,3,4].includes(record.level)) continue;
    if (!Number.isFinite(record.intervalDays)) {
      const inferred = Number.isFinite(record.due) && Number.isFinite(record.updated)
        ? Math.max(1/1440,(record.due-record.updated)/DAY) : 0;
      record.intervalDays = record.level===4 ? 30 : Math.min(30,inferred);
      record.easeFactor = 2.4;
      record.lapses = record.level===1 ? 1 : 0;
      if (record.level===4 && !Number.isFinite(record.due)) record.due = now+7*DAY;
      changed = true;
    }
  }
  if (changed) save();
}

function initialView() {
  const fragment = location.hash.slice(1);
  const hash = fragment.split('/').at(-1);
  if (fragment.startsWith('paragraph-')) return 'sentences';
  const aliases = {flash:'cards',wrong:'quiz',transcript:'sentences',original:'sentences',vocab:'cards',vocabulary:'library',reading:'sentences',passage:'sentences',questions:'quiz',review:'quiz',pairs:'quiz',mini:'quiz',dictation:'cards',meaning:'cards',overview:'cards',collocations:'library'};
  return ['cards','sentences','library','quiz','settings'].includes(hash) ? hash : (aliases[hash] || 'cards');
}

function sourceLabel(example) {
  return example.source==='original' ? '原文例句' : example.source==='question' ? '题干 / 选项' : '补充例句';
}

function exampleFlagControls(example) {
  return example.source==='original' && Number.isInteger(example.number)
    ? sentenceFlagControls(example.number) : '';
}

function referenceValue(value) {
  if (value == null) return '';
  if (typeof value !== 'object') return escapeHTML(value);
  if (Array.isArray(value)) return value.map(referenceValue).filter(Boolean).join(' · ');
  return Object.entries(value).map(([key,item]) => '<p><b>'+escapeHTML(key)+'</b> '+referenceValue(item)+'</p>').join('');
}

function analysisPage() {
  if (listening) return listening.questions({questions:DATA.questions, recording:CONFIG.recording, notice:CONFIG.questionNotice});
  if (DATA.analysisHtml) return DATA.analysisHtml;
  const questions = DATA.questions || [];
  const wrong = questions.filter(question => question.wrong);
  function questionHTML(question) {
    const number = question.number;
    const choices = question.choices || question.options || question.opts || [];
    const answer = Array.isArray(question.answer) ? question.answer.join(' / ') : question.answer;
    return '<article class="list-item"><h2>第 '+escapeHTML(number)+' 题</h2>'
      +'<p lang="en">'+escapeHTML(question.question)+'</p>'
      +(question.zh?'<p>'+escapeHTML(question.zh)+'</p>':'')
      +(choices.length?'<details><summary>查看题目选项</summary>'+choices.map(option => '<p>'+referenceValue(option)+'</p>').join('')+'</details>':'')
      +'<p><b>参考答案 '+escapeHTML(answer || '原资料未提供')+'</b>'+(question.chosen?' · 原作答 '+escapeHTML(question.chosen):'')+'</p>'
      +(question.explanation?'<p>'+escapeHTML(question.explanation)+'</p>':'')
      +(question.note?'<p>'+escapeHTML(question.note)+'</p>':'')
      +(question.evidence?.length?'<h3>原文依据</h3>'+question.evidence.map(evidence => '<blockquote lang="en">'+escapeHTML(evidence.en)+'</blockquote><p>'+escapeHTML(evidence.zh || '')+'</p>'+playButton(evidence.en,'朗读依据',true)).join(''):'')
      +(question.mapping?'<p><b>同义替换</b> '+escapeHTML(question.mapping)+'</p>':'')+'</article>';
  }
  let html = '<section class="card" aria-label="错题解析">';
  if (wrong.length) html += '<p class="muted">原资料标记的错题 '+wrong.map(q=>'Q'+q.number).join('、')+'</p>'+wrong.map(questionHTML).join('');
  else if (questions.length) html += '<p class="muted">题目答案、原文依据与复盘笔记</p>';
  if (questions.length) html += '<details '+(!wrong.length?'open':'')+'><summary>全部 '+questions.length+' 题参考解析</summary>'+questions.map(questionHTML).join('')+'</details>';
  if (!questions.length) html += '<p>本篇现有资料包含词库与原文，逐题答案和错因资料待补。</p>';

  return html+'</section>';
}

function sentenceNotes(sentence) {
  let html = '';
  if (sentence.core) html += '<p><b>句子主干</b> '+escapeHTML(sentence.core)+'</p>';
  if (sentence.note) html += '<p>'+escapeHTML(sentence.note)+'</p>';
  if (sentence.grammar?.length) html += '<div class="syntax-table"><table><thead><tr><th>原文片段</th><th>中文理解</th><th>语法作用</th></tr></thead><tbody>'+sentence.grammar.map(row=>'<tr>'+row.map(value=>'<td>'+escapeHTML(value)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  return html ? '<details><summary>原有句子解析'+(sentence.level?' · L'+sentence.level:'')+'</summary>'+html+'</details>' : '';
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size>20e6) throw Error('文件过大');
    const data = JSON.parse(await file.text());
    const legacy = (CONFIG.storageFormat==='dream' && data.kind==='iris-dreams-review')
      || (CONFIG.storageFormat==='hurricane' && data.type==='iris-hurricanes-progress');
    if (data.app!==KEY && data.format!==KEY && !legacy) throw Error('请使用本专题的复习记录');
    const input = data.state || (data.records?decodeStoredReview(data):legacy?decodeStoredReview(data.data):null);
    if (!input || typeof input!=='object' || Array.isArray(input)) throw Error('记录格式不正确');
    const valid = new Set(CONFIG.sharedItemIds || DATA.items.map(item=>item.id));
    const incoming = {};
    for (const [id,record] of Object.entries(input)) {
      if (!record || typeof record!=='object' || Array.isArray(record)) throw Error('记录内容不正确');
      if (id.startsWith(SENTENCE_FLAG_PREFIX)) {
        const number = Number(id.slice(SENTENCE_FLAG_PREFIX.length));
        if (!Number.isInteger(number) || number<1 || number>DATA.sentences.length || !Number.isFinite(record.updated)) throw Error('难点句记录不正确');
        incoming[id] = {...record,reasons:(record.reasons || []).filter(reason=>SENTENCE_REASON_OPTIONS.some(option=>option[0]===reason)),note:String(record.note || '').slice(0,2000)};
      } else if (valid.has(id)) {
        if (![0,1,2,3,4].includes(record.level)) throw Error('熟练度不正确');
        incoming[id] = {...record,reps:Math.max(0,Number(record.reps)||0),updated:Math.max(0,Number(record.updated)||0)};
      } else if (CONFIG.sharedItemIds && id.startsWith('__sentenceDifficulty__:')) {
        incoming[id] = record;
      }
    }
    for (const [id,record] of Object.entries(incoming)) {
      if (!state[id] || (record.updated || 0)>=(state[id].updated || 0)) state[id] = record;
    }
    if (!save()) return;
    migrateProgress();
    render();
    toast('词卡记录与难点句标记已合并。');
  } catch(error) {
    toast('导入失败：'+error.message);
  } finally {
    if ($('import')) $('import').value='';
  }
}
