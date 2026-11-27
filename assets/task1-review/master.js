'use strict';

const {slug, essay, translations, cards, patterns, paragraphs, rank, ipa, sourceIndex, supplementalSources, recordKey, draftsKey, cardIds, sentenceIds} =
  JSON.parse(document.getElementById('task1-master-data').textContent);
const storageKey = 'task1-'+slug;
const previousSettings = readState(recordKey+'-settings');
let voices = [];
let audioSession = 0;
const audioStatus = document.getElementById('audio-status');
function loadVoices() {
  voices = speechSynthesis.getVoices();
  const select = document.getElementById('voice');
  select.replaceChildren(new Option('自动选择英语音色', ''));
  voices.forEach((voice, index) => {
    if (/^en(-|_)/i.test(voice.lang)) select.add(new Option(voice.name + ' · ' + voice.lang, index));
  });
}
function stopAudio() {
  audioSession++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  audioStatus.textContent = '已停止';
}
function speak(text) {
  if (!('speechSynthesis' in window)) {
    audioStatus.textContent = '当前浏览器不支持语音合成';
    return;
  }
  const session = ++audioSession;
  speechSynthesis.cancel();
  const sentences = Array.isArray(text) ? text : [text];
  const selectedVoice = voice.value === ''
    ? voices.find(option => /^en-GB/i.test(option.lang)) || voices.find(option => /^en/i.test(option.lang))
    : voices[Number(voice.value)];
  function play(index) {
    if (session !== audioSession) return;
    if (index === sentences.length) {
      audioStatus.textContent = '朗读完成';
      return;
    }
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.lang = selectedVoice?.lang || 'en-GB';
    utterance.rate = Number(rate.value);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => { audioStatus.textContent = '正在朗读…'; };
    utterance.onend = () => play(index + 1);
    utterance.onerror = () => {
      if (session === audioSession) audioStatus.textContent = '当前音色无法播放，请在学习设置切换音色';
    };
    speechSynthesis.speak(utterance);
  }
  play(0);
}
document.getElementById('stop-audio').onclick = stopAudio;

const dictState = readState(storageKey+'-dict');
const previousDrafts = readState(draftsKey);
sentenceIds.forEach((id,index)=>{
  if (typeof previousDrafts[id] === 'string') {
    dictState[index] = {...dictState[index], draft: previousDrafts[id]};
  }
});
function saveDictation() {
  const value = dictState[di]?.draft;
  if (typeof value === 'string') {
    localStorage.setItem(draftsKey, JSON.stringify({...readState(draftsKey), [sentenceIds[di]]:value}));
  }
  localStorage.setItem(storageKey+'-dict',JSON.stringify(dictState));
}
let di=0;function renderDict(){document.getElementById('dict-cn').textContent=translations[di];document.getElementById('dict-input').value=dictState[di]?.draft||'';document.getElementById('dict-index').textContent=(di+1)+' / '+translations.length;document.getElementById('dict-feedback').textContent='';document.getElementById('dict-comparison').classList.add('hidden');document.getElementById('dict-answer').textContent=essay[di];document.getElementById('dict-progress').textContent='掌握状态：'+(dictState[di]?.status||'尚未标记');document.getElementById('dict-done').textContent=Object.values(dictState).filter(x=>x.status==='掌握').length}
document.getElementById('dict-prev').onclick=()=>{di=(di+translations.length-1)%translations.length;renderDict()};document.getElementById('dict-next').onclick=()=>{di=(di+1)%translations.length;renderDict()};document.getElementById('dict-input').oninput=e=>{dictState[di]={...(dictState[di]||{}),draft:e.target.value};saveDictation()};function updateOwnAnswer() {
  document.getElementById('dict-own').textContent = document.getElementById('dict-input').value.trim() || '尚未输入';
}
document.getElementById('dict-input').addEventListener('input', updateOwnAnswer);
document.getElementById('dict-check').onclick=()=>{updateOwnAnswer();document.getElementById('dict-comparison').classList.remove('hidden');document.getElementById('dict-feedback').textContent='已显示参考答案。对照检查表达是否准确，以及数据或流程顺序是否与原题一致。'};document.getElementById('dict-show').onclick=()=>{updateOwnAnswer();document.getElementById('dict-comparison').classList.toggle('hidden')};document.getElementById('dict-clear').onclick=()=>{document.getElementById('dict-input').value='';dictState[di]={...(dictState[di]||{}),draft:''};updateOwnAnswer();saveDictation()};function mark(s){dictState[di]={...(dictState[di]||{}),status:s};saveDictation();renderDict()}document.getElementById('dict-master').onclick=()=>mark('掌握');document.getElementById('dict-review').onclick=()=>mark('需复习');renderDict();
const essayContent = document.getElementById('essay-content');
essayContent.innerHTML = paragraphs.map(([title, start, end]) =>
  '<section class="essay-paragraph"><h3>' + title + '</h3><p class="essay-en" lang="en">' +
  essay.slice(start, end).map((sentence, offset) =>
    sentence + ' <button class="speaker sentence-audio" data-sentence="' + (start + offset) +
    '" aria-label="朗读第 ' + (start + offset + 1) + ' 句"><svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4m12-1a5 5 0 0 1 0 8m2-10a8 8 0 0 1 0 12"/></svg></button>'
  ).join(' ') + '</p><p class="note translation">' + translations.slice(start, end).join('') + '</p></section>'
).join('');
document.querySelectorAll('[data-sentence]').forEach(button => {
  button.onclick = () => speak(essay[Number(button.dataset.sentence)]);
});
document.getElementById('show-translations').onchange = event => {
  essayContent.classList.toggle('english-only', !event.target.checked);
};
document.getElementById('essay-play').onclick = () => {
  speak(essay);
};
document.getElementById('essay-stop').onclick = () => {
  document.getElementById('stop-audio').click();
};
document.getElementById('essay-copy').onclick = async () => {
  const status = document.getElementById('essay-copy-status');
  try {
    await navigator.clipboard.writeText(paragraphs.map(([, start, end]) => essay.slice(start, end).join(' ')).join('\n\n'));
    status.textContent = '已复制';
  } catch {
    status.textContent = '无法自动复制，请选中正文复制。';
  }
};
const patternContent = document.getElementById('pattern-content');
patternContent.innerHTML = patterns.map(([title, formula, examples, chinese], group) =>
  '<article class="pattern"><h3>' + title + '</h3><div class="transfer-card"><span class="transfer-number">' +
  (group + 1) + '</span><p class="transfer-en" lang="en">' + formula + '</p></div>' +
  examples.map((sentence, index) =>
    '<div class="example"><button class="speaker" data-pattern="' + group + '-' + index +
    '" aria-label="朗读例句 ' + (index + 1) + '"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4m12-1a5 5 0 0 1 0 8m2-10a8 8 0 0 1 0 12"/></svg></button><p lang="en">' + sentence +
    '</p><p class="note">' + chinese[index] + '</p></div>'
  ).join('') + '</article>'
).join('');
patternContent.addEventListener('click', event => {
  const button = event.target.closest('[data-pattern]');
  if (!button) return;
  const [group, index] = button.dataset.pattern.split('-').map(Number);
  speak(patterns[group][2][index]);
});

function readState(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; }
  catch { return {}; }
}
const navigation = Array.from(document.querySelectorAll('[data-tab]'));
function syncTab() {
  const requested = location.hash.slice(1).split('/').at(-1);
  const aliases = {points:'focus', overview:'focus', arguments:'focus', meaning:'cards',
    full:'essay', sentences:'essay', model:'essay', recite:'dictation', practice:'dictation'};
  const selected = navigation.find(link => link.dataset.tab === (aliases[requested] || requested)) || navigation[0];
  navigation.forEach(link => {
    const active = link === selected;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    document.getElementById(link.dataset.tab).classList.toggle('hidden', !active);
  });
  const layout = document.querySelector('.study-layout');
  layout.classList.toggle('show-question', ['focus','essay','dictation','patterns'].includes(selected.dataset.tab));
}
navigation.forEach(button => {
  button.onclick = () => {
    location.hash = button.dataset.tab;
    if (button.dataset.tab === 'cards') {
      queueMicrotask(() => {
        syncTab();
        document.querySelector('#cards .card')?.focus({preventScroll: true});
      });
    }
  };
});
window.addEventListener('hashchange', () => {
  syncTab();
  window.scrollTo(0, 0);
});
syncTab();

const rate = document.getElementById('rate');
const voice = document.getElementById('voice');
const previousRate = Number(previousSettings.rate);
const audioPreferences = {
  rate: Array.from(rate.options).find(option => Number(option.value) === previousRate)?.value,
  voice: previousSettings.voice,
  ...readState(storageKey+'-audio')
};
if (Array.from(rate.options).some(option => option.value === audioPreferences.rate)) rate.value = audioPreferences.rate;
function saveAudioPreferences() {
  audioPreferences.rate = rate.value;
  audioPreferences.voice = voice.value === '' ? '' : voices[Number(voice.value)].voiceURI;
  localStorage.setItem(storageKey+'-audio', JSON.stringify(audioPreferences));
}
function restoreVoice() {
  loadVoices();
  const saved = audioPreferences.voice;
  const preferred = voices.findIndex(option => option.name === 'Google UK English Female');
  const selected = saved ? voices.findIndex(option => option.voiceURI === saved || option.name === saved) : -1;
  voice.value = selected >= 0 ? String(selected) : preferred >= 0 ? String(preferred) : '';
  updateVoiceSummary();
}
if ('speechSynthesis' in window) {
  restoreVoice();
  speechSynthesis.onvoiceschanged = restoreVoice;
}
function updateVoiceSummary() {
  const selected = voice.value !== '' ? voices[Number(voice.value)] : voices.find(option => /^en-GB/i.test(option.lang)) || voices.find(option => /^en/i.test(option.lang));
  document.getElementById('voice-summary').textContent = selected ? '英语音色 · ' + selected.name : '英语音色 · 由浏览器提供';
}
rate.onchange = saveAudioPreferences;
voice.onchange = () => { saveAudioPreferences(); updateVoiceSummary(); };
updateVoiceSummary();
const studyDay = 86400000;
const DAY = studyDay;
const MAX_INTERVAL_DAYS = 365;
function dayKey() {
  const today = new Date();
  return [today.getFullYear(), ...[today.getMonth()+1,today.getDate()].map(n=>String(n).padStart(2,'0'))].join('-');
}
function scheduleRecord(old,level,now=Date.now()){
 const previous=Number(old.intervalDays)||0, ease=Math.max(1.6,Math.min(2.85,Number(old.easeFactor)||2.4));
 const wasLearning=previous<1, again=level===1;
 let days=level===1?(old.reps>0?10:1)/1440:level===2?(wasLearning?Math.max(10/1440,previous*1.5):Math.max(1,previous*1.18)):level===3?(wasLearning?1:Math.max(previous+1,previous*ease)):(wasLearning?4:Math.max(previous+2,previous*(ease+0.55)));
 days=Math.min(days,MAX_INTERVAL_DAYS);
 return {...old,level,reps:(old.reps||0)+1,due:now+Math.round(days*DAY),intervalDays:days,easeFactor:Math.max(1.6,Math.min(2.85,ease+(level===1?-.2:level===2?-.08:level===4?.08:0))),lapses:(old.lapses||0)+(again?1:0),streak:again?0:(old.streak||0)+1,startedDay:old.startedDay||dayKey(),updated:now};
}
function formatDelay(days){let minutes=Math.round(days*1440);if(minutes<60)return Math.max(1,minutes)+' 分钟后';if(minutes<1440)return Math.round(minutes/60)+' 小时后';let d=days>=10?Math.round(days):Math.round(days*10)/10;return d+' 天后'}

const wordTypes = ['v','n','adj','adv','n/adv','n/v'];
const grades = [['Again','重来'],['Hard','吃力'],['Good','记得'],['Easy','轻松']];
const stages = [['all','全部状态'],['due','到期复习'],['new','尚未学习'],['learning','正在巩固'],['mature','长间隔复习']];
const oldRecords = readState(recordKey);
const studyState = {};
cardIds.forEach((id,index)=>{
  const previous = oldRecords[id];
  if (!previous) return;
  const intervalDays = previous.intervalDays ?? (Math.max(0,(Number(previous.due)-Number(previous.updated))/DAY) || 0);
  studyState[index] = {...previous, intervalDays};
});
const studyPane = document.getElementById('cards');
const libraryPane = document.getElementById('library');
const dailyInput = document.getElementById('daily-limit');
dailyInput.value = Math.min(cards.length, Number(readState(storageKey+'-plan').limit ?? previousSettings.daily) || 20);
const audioIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4m12-1a5 5 0 0 1 0 8m2-10a8 8 0 0 1 0 12"/></svg>';
let studyStage = 'all', kind = 'all', star = 'all', scope = 'due';
let current = null, queue = [], revealed = false, completed = 0;
const rec = i => studyState[i] || {};
const isWord = i => wordTypes.includes(cards[i][1]);
const indices = cards.map((_,i) => i);
const todayCount = () => indices.filter(i => rec(i).startedDay === dayKey()).length;
function saveStudy(index){
  const records = readState(recordKey);
  records[cardIds[index]] = studyState[index];
  localStorage.setItem(recordKey,JSON.stringify(records));
}
const limit = () => Math.max(1,Math.min(cards.length,Number(dailyInput.value)||20));
const stageMatch = (i,stage) => {
  const record = rec(i);
  return ({all:true,due:!!record.level && record.due<=Date.now(),new:!record.level,learning:!!record.level && record.intervalDays<21,mature:record.intervalDays>=21})[stage];
};
const filterMatch = (i,k,s) => (k==='all'||isWord(i)===(k==='word')) && (s==='all'||rank[i]===Number(s));
const stars = i => '<span class="stars" aria-label="重要程度 '+rank[i]+' 星">'+'★'.repeat(rank[i])+'</span><span class="star-label">重要 '+rank[i]+'/5</span>';
const option = (value,label,selected) => '<option value="'+value+'" '+(value===selected?'selected':'')+'>'+label+'</option>';
const kindOptions = k => [['all','全部 · 单词与短语'],['word','只看单词'],['phrase','只看短语']].map(([v,n])=>option(v,n,k)).join('');
const starOptions = s => option('all','雅思重要程度 · 全部星级',s)+[5,4,3,2,1].map(n=>option(String(n),'★'.repeat(n)+' · '+n+' 星',s)).join('');
const speaker = (type,i,label,small=false) => '<button class="speaker'+(small?' small':'')+'" data-'+type+'="'+i+'" aria-label="'+label+'">'+audioIcon+'<span>'+label+'</span></button>';
const escapeText = value => String(value).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
function wordMetadata(i) {
  return '<span class="pos">'+(isWord(i)?cards[i][1].split('/').map(part => part+'.').join('/'):'语块')+'</span>'+(ipa[cards[i][0]]?'<span class="ipa">/'+ipa[cards[i][0]]+'/</span>':'')+stars(i);
}
function sourceSentence(i) {
  const index = sourceIndex[i];
  return index === null ? supplementalSources[i] : [essay[index], translations[index]];
}
function sourceHtml(i) {
  const supplemental = sourceIndex[i] === null;
  const label = supplemental ? '补充例句' : '范文例句';
  const [sentence, translation] = sourceSentence(i);
  return '<div class="example-line"><p class="example-en"><span class="example-source '+
    (supplemental ? 'example-source-supplemental' : 'example-source-original')+'">'+label+
    '</span><span lang="en">'+escapeText(sentence)+'</span></p>'+speaker('say-source',i,label+'朗读')+
    '</div><p class="example-zh">'+escapeText(translation)+'</p>';
}
function nextCard() {
  current = queue.shift() ?? null;
  revealed = false;
  if(current!==null&&!rec(current).level&&!rec(current).startedDay){
    studyState[current]={...rec(current),startedDay:dayKey()};
    saveStudy(current);
  } else if(current!==null&&!rec(current).level&&rec(current).startedDay!==dayKey()){
    studyState[current].startedDay=dayKey();
    saveStudy(current);
  }
  renderStudy();
}
function buildStudy() {
  const eligible = indices.filter(i=>filterMatch(i,kind,star)&&stageMatch(i,studyStage));
  const sorted = eligible.sort((a,b)=>Number(stageMatch(b,'due'))-Number(stageMatch(a,'due'))||rank[b]-rank[a]);
  if((studyStage==='all'&&scope==='due')||studyStage==='new'){
    const available = Math.max(0,limit()-todayCount());
    const fresh = sorted.filter(i=>!rec(i).level&&rec(i).startedDay!==dayKey()).slice(0,available);
    queue=sorted.filter(i=>stageMatch(i,'due')||(!rec(i).level&&rec(i).startedDay===dayKey())||fresh.includes(i));
  } else queue=sorted;
  nextCard();
  if (!studyPane.classList.contains('hidden')) studyPane.querySelector('.study-card')?.focus({preventScroll:true});
}
function renderStudy() {
  const countBase = indices.filter(i=>filterMatch(i,kind,star));
  const daily = '今日新词：'+todayCount()+' / '+limit()+' 个，剩余 '+Math.max(0,limit()-todayCount())+' 个';
  document.getElementById('quota-settings').textContent=daily;
  document.getElementById('card-done').textContent=indices.filter(i=>rec(i).level>=3).length;
  studyPane.innerHTML = '<fieldset class="study-stage-filter"><legend>学习状态</legend><div class="study-stage-options">'+stages.map(([value,label])=>'<button type="button" data-stage="'+value+'" aria-pressed="'+(value===studyStage)+'">'+label+' <span class="study-stage-count">'+countBase.filter(i=>stageMatch(i,value)).length+'</span></button>').join('')+'</div></fieldset>'+
    '<div class="controls"><select data-study-filter="kind" aria-label="词汇类型">'+kindOptions(kind)+'</select><select data-study-filter="star" aria-label="重要程度">'+starOptions(star)+'</select>'+ (studyStage==='all'?'<select data-study-filter="scope" aria-label="练习范围">'+option('due','按计划 · 到期＋新词',scope)+option('all','提前练习 · 当前筛选全部',scope)+'</select>':'')+'</div>'+
    '<p class="study-filter-note">'+daily+'（到期复习不占新词额度）。</p>';
  if(current===null){
    studyPane.insertAdjacentHTML('beforeend','<section class="card empty"><h2>当前筛选没有待练词条</h2><p>本轮已完成 '+completed+' 次。</p><button data-study-action="reset" class="primary">查看全部状态</button></section>');
    return;
  }
  const i=current, card=cards[i];
  const label=rec(i).level?grades[rec(i).level-1].join(' · '):'未学';
  const shown = revealed
    ? '<div class="meaning context-meaning">'+escapeText(card[2])+' <span class="context-badge">本题义</span></div>'+(card[3]?'<p class="small muted">搭配／同义替换：'+escapeText(card[3])+'</p>':'')
    : '<p class="reveal-row"><button data-study-action="reveal" class="primary">揭晓释义 · Enter ↵</button></p>';
  const answer = revealed ? '<div class="example">'+sourceHtml(i)+'</div><div class="grades">'+grades.map(([en,zh],g)=>'<button class="grade-'+en.toLowerCase()+'" data-grade="'+(g+1)+'"><b>'+en+'</b><span>'+zh+'</span><small>'+formatDelay(scheduleRecord(rec(i),g+1).intervalDays)+'</small></button>').join('')+'</div>':'';
  studyPane.insertAdjacentHTML('beforeend','<section class="card study-card'+(revealed?' is-revealed':'')+'" tabindex="-1"><div class="cardtop"><span class="tag">'+(isWord(i)?'WORD · 单词':'PHRASE · 语块')+' / '+label+'</span><span class="counter">本轮已完成 '+completed+' · 待练 '+(queue.length+1)+'</span></div><div class="center"><div class="term" lang="en">'+escapeText(card[0])+'</div><div class="word-meta">'+wordMetadata(i)+'</div><div class="study-pronunciation">'+speaker('say-term',i,'播放读音')+'</div>'+shown+'</div>'+answer+'</section><div class="bottom"><span>Enter 揭晓释义 · Space 正面读词／背面读例句 · 1–4 评估熟练度</span><button data-study-action="skip">暂时跳过</button></div>');
}
function speakEntry(button) {
  if(button.dataset.sayTerm!==undefined) speak(cards[Number(button.dataset.sayTerm)][0]);
  if(button.dataset.saySource!==undefined) speak(sourceSentence(Number(button.dataset.saySource))[0]);
}
function revealStudy() {
  if(current===null || revealed)return;
  revealed=true;
  renderStudy();
  studyPane.querySelector('.card')?.focus({preventScroll:true});
}
function gradeStudy(level) {
  if(current===null||!revealed)return;
  studyState[current]=scheduleRecord(rec(current),level);
  saveStudy(current);
  completed++;
  nextCard();
  studyPane.querySelector('.card')?.focus({preventScroll:true});
}
studyPane.onclick=event=>{
  const button=event.target.closest('button');
  if(!button)return;
  speakEntry(button);
  if(button.dataset.stage){studyStage=button.dataset.stage;buildStudy();}
  if(button.dataset.grade)gradeStudy(Number(button.dataset.grade));
  if(button.dataset.studyAction==='reveal')revealStudy();
  if(button.dataset.studyAction==='skip'){
    nextCard();
    studyPane.querySelector('.study-card')?.focus({preventScroll:true});
  }
  if(button.dataset.studyAction==='reset'){studyStage=kind=star='all';scope='all';buildStudy();}
};
studyPane.onchange=event=>{
  const filter=event.target.dataset.studyFilter;
  if(!filter)return;
  if(filter==='kind')kind=event.target.value;
  if(filter==='star')star=event.target.value;
  if(filter==='scope')scope=event.target.value;
  buildStudy();
};
dailyInput.onchange=()=>{
  dailyInput.value=limit();
  localStorage.setItem(storageKey+'-plan',JSON.stringify({limit:limit()}));
  if(studyPane.classList.contains('hidden')) {
    libraryNeedsQueue = true;
    document.getElementById('quota-settings').textContent='每日新词上限：'+limit()+' 个';
  } else buildStudy();
};
document.addEventListener('keydown',event=>{
  if(studyPane.classList.contains('hidden')||current===null||event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target.closest('select,input,textarea,button,a,[contenteditable]'))return;
  if(event.key==='Enter')revealStudy();
  else if(event.code==='Space') revealed?speak(sourceSentence(current)[0]):speak(cards[current][0]);
  else if(/^[1-4]$/.test(event.key))gradeStudy(Number(event.key));
  else return;
  event.preventDefault();
});
libraryPane.innerHTML=`<div class="stats library-stats" id="library-stats"></div>
<div class="progressline"><span>长期记忆进度</span><span id="library-progress-label"></span></div>
<div class="bar" id="library-progress" role="progressbar" aria-label="长期记忆进度" aria-valuemin="0" aria-valuemax="${cards.length}"><i></i></div>
<label for="vocab-search" class="library-search">搜索全部词库</label>
<div class="controls library-controls">
<input type="search" id="vocab-search" placeholder="输入英文、中文、音标或搭配">
<select id="vocab-kind" aria-label="词汇类型">${kindOptions('all').replace('全部 · 单词与短语','全部类型')}</select>
<select id="vocab-star" aria-label="重要程度">${starOptions('all').replace('雅思重要程度 · 全部星级','全部重要程度')}</select>
</div>
<div class="controls library-order"><label for="vocab-order">词库顺序</label><select id="vocab-order"><option value="importance">重要性 · 高到低</option><option value="alphabetical">首字母 · A–Z</option></select></div>
<p id="vocab-count" class="study-filter-note" role="status"></p>
<div id="vocab-list" class="card library-entries"></div>`;
const libraryOrder=document.getElementById('vocab-order');
const collation=new Intl.Collator('en',{sensitivity:'base'});
function updateLibraryStats() {
  const counts=stages.slice(1).map(([stage,label])=>[indices.filter(i=>stageMatch(i,stage)).length,label]);
  document.getElementById('library-stats').innerHTML=counts.map(([count,label])=>`<div class="stat"><b>${count}</b><span>${label}</span></div>`).join('');
  const mature=counts[3][0];
  document.getElementById('library-progress-label').textContent=mature+' / '+cards.length;
  const progress=document.getElementById('library-progress');
  progress.setAttribute('aria-valuenow',mature);
  const fill=progress.querySelector('i');
  if(fill)fill.style.width=(mature/cards.length*100)+'%';
}
function librarySchedule(i) {
  if(!rec(i).due)return '未安排复习';
  if(rec(i).due<=Date.now())return '已到期';
  return '下次：'+new Date(rec(i).due).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
function renderLibrary() {
  updateLibraryStats();
  const q=document.getElementById('vocab-search').value.toLowerCase().trim();
  const k=document.getElementById('vocab-kind').value;
  const s=document.getElementById('vocab-star').value;
  const byName=(a,b)=>collation.compare(cards[a][0],cards[b][0]);
  const alphabetical=libraryOrder.value==='alphabetical';
  const found=indices.filter(i=>filterMatch(i,k,s)&&[cards[i][0],cards[i][1],cards[i][2],cards[i][3],ipa[cards[i][0]]].join(' ').toLowerCase().includes(q))
    .sort((a,b)=>alphabetical?byName(a,b):rank[b]-rank[a]||byName(a,b));
  document.getElementById('vocab-count').textContent=found.length+' / '+cards.length+' 条词汇 · '+(alphabetical?'按首字母 A–Z':'按重要性由高到低');
  document.getElementById('vocab-list').innerHTML=found.map(i=>{
    const [term,,meaning,collocations]=cards[i];
    const index = sourceIndex[i];
    const heading = index === null ? '补充词汇' : paragraphs.find(([,start,end]) => index >= start && index < end)[0].split(' · ')[0];
    const level=String(rec(i).level||'');
    return `<article class="library-entry" data-library-entry="${i}" tabindex="0">
      <div class="library-title-line">
        <button class="speaker library-pronounce" data-say-term="${i}" aria-label="朗读 ${escapeText(term)}">${audioIcon}</button>
        <div class="library-title-content"><span class="tag">${heading||'范文'}</span><span class="library-term" lang="en">${escapeText(term)}</span><span class="library-main-meaning">${escapeText(meaning)} <span class="context-badge">本题义</span></span></div>
        <div class="library-rating"><select aria-label="${escapeText(term)} 的熟练度" data-library-grade="${i}">${option('','选择熟练度',level).replace('value=""','value="" disabled')}${grades.map(([en,zh],g)=>option(String(g+1),en+' · '+zh,level)).join('')}</select><small data-library-due>${librarySchedule(i)}</small></div>
      </div>
      <div class="word-meta">${wordMetadata(i)}</div>${collocations?`<p class="library-note">搭配／同义替换：${escapeText(collocations)}</p>`:''}
      <details class="library-example example"><summary>查看例句</summary>${sourceHtml(i)}<button class="library-jump" data-vocab-card="${i}">去翻卡 →</button></details>
    </article>`;
  }).join('')||'<p class="muted">没有匹配的词汇。</p>';
}
libraryPane.oninput=event=>{if(event.target.id==='vocab-search')renderLibrary();};
libraryPane.onchange=event=>{
  const select=event.target;
  if (select.matches('#vocab-kind, #vocab-star, #vocab-order')) {
    renderLibrary();
    return;
  }
  if (select.dataset.libraryGrade === undefined) return;
  const index=Number(select.dataset.libraryGrade);
  const level=Number(select.value);
  if(![1,2,3,4].includes(level))return;
  studyState[index]=scheduleRecord(rec(index),level);
  saveStudy(index);
  libraryNeedsQueue=true;
  select.closest('.library-rating').querySelector('[data-library-due]').textContent=librarySchedule(index);
  updateLibraryStats();
  document.getElementById('card-done').textContent=indices.filter(i=>rec(i).level>=3).length;
};
let libraryNeedsQueue=false;
window.addEventListener('hashchange',()=>{
  if(!libraryPane.classList.contains('hidden'))renderLibrary();
  if(!studyPane.classList.contains('hidden')&&libraryNeedsQueue){libraryNeedsQueue=false;buildStudy();}
});
libraryPane.addEventListener('focusin',event=>{
  const row=event.target.closest('[data-library-entry]');
  if(!row)return;
  libraryPane.querySelector('.is-current')?.classList.remove('is-current');
  row.classList.add('is-current');
});
libraryPane.addEventListener('keydown',event=>{
  if(event.code!=='Space'||!event.target.matches('[data-library-entry]'))return;
  event.preventDefault();
  speak(cards[Number(event.target.dataset.libraryEntry)][0]);
});
libraryPane.onclick=event=>{
  const button=event.target.closest('button');
  if(!button)return;
  speakEntry(button);
  if(button.dataset.vocabCard===undefined)return;
  libraryNeedsQueue=false;
  queue=[Number(button.dataset.vocabCard)];
  nextCard();
  location.hash='cards';
  syncTab();
  studyPane.querySelector('.card')?.focus({preventScroll:true});
};
renderLibrary();
if(document.querySelector('[data-tab=cards]').classList.contains('active'))buildStudy();
else {
  renderStudy();
  const cardsTab=navigation.find(button=>button.dataset.tab==='cards');
  cardsTab.addEventListener('click',()=>{if(current===null&&!completed)buildStudy();});
  window.addEventListener('hashchange',()=>{if(!studyPane.classList.contains('hidden')&&!studyPane.querySelector('.term')&&!completed)buildStudy();});
}

const backupStatus = document.getElementById('backup-status');
document.getElementById('export').onclick = () => {
  const records = readState(recordKey);
  const topicRecords = Object.fromEntries(cardIds.filter(id=>id in records).map(id=>[id,records[id]]));
  const settings = {daily:limit(), rate:Number(rate.value), voice:audioPreferences.voice || ''};
  const backup = {format:recordKey, records:topicRecords, drafts:readState(draftsKey), settings, dictation:dictState};
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
  const download = document.createElement('a');
  download.href = url;
  download.download = slug+'-review-progress.json';
  download.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.getElementById('import').onchange = async event => {
  const input = event.target;
  if (!input.files[0]) return;
  try {
    const backup = JSON.parse(await input.files[0].text());
    const imported = backup.records || backup.state;
    if (![backup.format,backup.key,backup.app].includes(recordKey) || !imported || typeof imported !== 'object') throw Error();
    const records = readState(recordKey);
    for (const id of cardIds) {
      const value = imported[id];
      if (!Number.isInteger(value?.level) || value.level < 0 || value.level > 4) continue;
      if (!records[id] || Number(value.updated||value.ts||0) >= Number(records[id].updated||records[id].ts||0)) records[id] = value;
    }
    const drafts = readState(draftsKey);
    sentenceIds.forEach((id,index)=>{
      if (!(id in drafts) && typeof backup.drafts?.[id] === 'string') drafts[id] = backup.drafts[id];
      if (!dictState[index]?.status && ['掌握','需复习'].includes(backup.dictation?.[index]?.status)) {
        dictState[index] = {...dictState[index],status:backup.dictation[index].status};
      }
    });
    localStorage.setItem(recordKey,JSON.stringify(records));
    localStorage.setItem(draftsKey,JSON.stringify(drafts));
    localStorage.setItem(storageKey+'-dict',JSON.stringify(dictState));
    const preferences = backup.settings || {};
    const daily = Number(preferences.daily);
    if (daily >= 1) localStorage.setItem(storageKey+'-plan',JSON.stringify({limit:Math.min(cards.length,daily)}));
    const option = Array.from(rate.options).find(item=>Number(item.value)===Number(preferences.rate));
    if (option || typeof preferences.voice === 'string') {
      localStorage.setItem(storageKey+'-audio',JSON.stringify({...audioPreferences,
        rate:option?.value ?? rate.value,
        voice:typeof preferences.voice === 'string' ? preferences.voice : audioPreferences.voice}));
    }
    location.reload();
  } catch {
    backupStatus.textContent = '此文件无法作为本词库的进度备份读取。';
  } finally {
    input.value = '';
  }
};
