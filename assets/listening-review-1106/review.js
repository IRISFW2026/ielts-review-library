(() => {
  'use strict';
  const D=window.LISTENING_REVIEW_1106, m=document.body.dataset.material;
  const sentences=D.sentences[m], qs=D.questions[m], key='iris-listening-review-1106-'+m+'-v1';
  const $=id=>document.getElementById(id), E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved={seen:[],history:[],draft:{},scope:'wrong'};
  try { const x=JSON.parse(localStorage.getItem(key)||'null'); if(x&&Array.isArray(x.seen)&&Array.isArray(x.history)&&x.draft&&typeof x.draft==='object') saved={...saved,...x}; } catch {}
  saved.seen=saved.seen.filter(id=>sentences.some(s=>s.id===id));
  let submitted=false, current=qs.filter(q=>q.wrong), tab='quiz';
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(saved));}catch{$('review-status').textContent='本次进度无法保存；可用下方导出按钮备份。';}};
  const say=(en,label='朗读')=>`<button type="button" class="pronounce" data-say="${E(en)}">▷ ${E(label)}</button>`;
  function stats(){
    $('sentence-progress').textContent=saved.seen.length+' / '+sentences.length;
    const last=saved.history.at(-1); $('latest-score').textContent=last?last.score+' / '+last.total:'待重练';
    $('review-history').innerHTML=saved.history.slice(-5).reverse().map(h=>`<li>${E(new Date(h.at).toLocaleString('zh-CN'))} · ${E(h.scope)} · ${h.score}/${h.total}</li>`).join('')||'<li>还没有重练记录；首次作答 3/10 单独保留。</li>';
  }
  function selectTab(next){
    tab=next;
    for(const name of ['quiz','sentences','cards']) { $(name+'-panel').hidden=name!==next; const b=document.querySelector(`[data-study-tab="${name}"]`); b.classList.toggle('active',name===next);b.setAttribute('aria-pressed',String(name===next)); }
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    history.replaceState(null,'','#'+next);
  }
  function drawSentences(){
    let section='';
    $('sentence-list').innerHTML=sentences.map((s,i)=>{
      const heading=s.section!==section?`<h2 class="chapter">${E(s.section)}</h2>`:'';section=s.section;
      return heading+`<details class="sentence" id="${s.id}" data-section="${E(s.section)}"><summary><span class="sentence-num">${String(i+1).padStart(2,'0')}</span><span lang="en">${E(s.en)}</span><span class="q-badges">${s.questions.map(n=>`<b>Q${n}</b>`).join('')}</span></summary><div class="sentence-body"><p class="sentence-zh">${E(s.zh)}</p><div class="analysis-label">结构与表达</div><p>${E(s.note)}</p><div class="analysis-label">精听与定位</div><p>${E(s.listen)}</p>${say(s.en,'本句朗读')}${say(s.en,'慢速').replace('data-say=','data-slow="1" data-say=')}<label class="seen"><input type="checkbox" data-seen="${s.id}" ${saved.seen.includes(s.id)?'checked':''}> 本句已复习</label></div></details>`;
    }).join('');
  }
  function evidence(q){
    const indexes=m==='organic'&&q.n===36?[23,24]:m==='organic'&&q.n===38?[28,30,31,32]:m==='organic'&&q.n===40?[39,40,41]:[q.sentence];
    return indexes.map(n=>{const s=sentences[n-1];return `<div class="evidence"><p lang="en">${E(s.en)}</p><p>${E(s.zh)}</p>${say(s.en,'依据朗读')}<button type="button" data-jump="${s.id}">查看第 ${n} 句解析 ↗</button></div>`;}).join('');
  }
  function drawQuiz(){
    $('quiz-count').textContent=current.length+' 道题';
    $('quiz-rows').innerHTML=current.map(q=>`<article class="question" id="question-${q.n}"><div class="q-heading"><b>Q${q.n}</b><span>${q.wrong?'首次错题':'首次答对'}</span></div><p class="q-prompt" lang="en">${E(q.prompt)}</p>${q.options?`<div class="choices">${q.options.map((o,i)=>{const letter='ABC'[i];return `<label><input type="radio" name="q${q.n}" value="${letter}" ${saved.draft[q.n]===letter?'checked':''}><span><b>${letter}</b> ${E(o)}</span></label>`;}).join('')}</div>`:`<label class="answer-label">你的答案<input type="text" name="q${q.n}" value="${E(saved.draft[q.n]||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入英文${q.n===36?'或数字':''}"></label>`}<div class="feedback" id="feedback-${q.n}" hidden></div></article>`).join('');
    $('quiz-score').textContent='';$('retry-missed').hidden=true;submitted=false;
  }
  const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/\s*%/g,'%');
  function isCorrect(q){return [q.answer,...(q.accepted||[])].some(a=>norm(a)===norm(saved.draft[q.n]));}
  function submit(){
    if(submitted)return;
    let score=0; for(const q of current){const ok=isCorrect(q);if(ok)score++;const box=$('feedback-'+q.n);box.hidden=false;box.className='feedback '+(ok?'correct':'incorrect');box.innerHTML=`<h3>${ok?'✓ 正确':'继续巩固'} · 答案 ${E(q.answer)}</h3><p>本次：${E(saved.draft[q.n]||'未填')}　首次：${E(q.original)}</p><p><b>答案逻辑：</b>${E(q.why)}</p><p><b>易错点：</b>${E(q.trap)}</p>${evidence(q)}`;}
    const scope=current.length===10?'全部10题':saved.scope==='missed'?'本轮未掌握':'首次7道错题';
    saved.history.push({score,total:current.length,scope,at:new Date().toISOString()});saved.history=saved.history.slice(-30);save();stats();submitted=true;
    $('quiz-score').textContent=`本轮 ${score}/${current.length} · 首次 3/10 保留在首页，复习成绩单独记录。`;
    $('retry-missed').hidden=score===current.length;
    $('quiz-score').scrollIntoView({block:'center',behavior:'smooth'});
  }
  $('quiz-form').addEventListener('submit',e=>{e.preventDefault();submit();});
  $('quiz-form').addEventListener('input',e=>{const n=e.target.name?.match(/^q(\d+)$/)?.[1];if(!n)return;saved.draft[n]=e.target.value;save();if(submitted){submitted=false;$('quiz-score').textContent='答案已修改，请重新核对。';$('retry-missed').hidden=true;for(const q of current)$('feedback-'+q.n).hidden=true;}});
  $('quiz-scope').addEventListener('change',e=>{saved.scope=e.target.value;current=e.target.value==='all'?[...qs]:qs.filter(q=>q.wrong);save();drawQuiz();});
  $('retry-missed').addEventListener('click',()=>{current=current.filter(q=>!isCorrect(q));for(const q of current)delete saved.draft[q.n];saved.scope='missed';save();drawQuiz();$('quiz-form').scrollIntoView({block:'start',behavior:'smooth'});});
  $('new-round').addEventListener('click',()=>{for(const q of current)delete saved.draft[q.n];save();drawQuiz();});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.studyTab)selectTab(b.dataset.studyTab);if(b.dataset.jump){selectTab('sentences');const el=$(b.dataset.jump);el.open=true;el.scrollIntoView({block:'center',behavior:'smooth'});}if(b.id==='expand-sentences')document.querySelectorAll('.sentence').forEach(x=>x.open=true);if(b.id==='collapse-sentences')document.querySelectorAll('.sentence').forEach(x=>x.open=false);});
  $('sentence-list').addEventListener('change',e=>{if(!e.target.dataset.seen)return;const id=e.target.dataset.seen;saved.seen=saved.seen.filter(x=>x!==id);if(e.target.checked)saved.seen.push(id);save();stats();});
  $('sentence-search').addEventListener('input',e=>{const t=e.target.value.trim().toLowerCase();document.querySelectorAll('.sentence').forEach((el,i)=>{el.hidden=![sentences[i].en,sentences[i].zh,sentences[i].note,sentences[i].section,...sentences[i].questions.map(n=>'Q'+n)].join(' ').toLowerCase().includes(t);});document.querySelectorAll('.chapter').forEach(el=>el.hidden=!!t);});
  $('review-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:key,version:1,saved},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='1106-'+m+'-重练与解析进度.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);});
  $('review-import-button').addEventListener('click',()=>$('review-import').click());
  $('review-import').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2e6)throw Error('文件过大');const x=JSON.parse(await file.text());if(x.format!==key||x.version!==1||!x.saved||!Array.isArray(x.saved.seen)||!Array.isArray(x.saved.history)||!x.saved.draft||typeof x.saved.draft!=='object')throw Error('不是本篇重练与解析记录');saved.seen=[...new Set([...saved.seen,...x.saved.seen.filter(id=>sentences.some(s=>s.id===id))])];const valid=x.saved.history.filter(h=>Number.isInteger(h.score)&&Number.isInteger(h.total)&&h.score>=0&&h.score<=h.total&&h.total<=10&&typeof h.scope==='string'&&Number.isFinite(Date.parse(h.at)));saved.history=[...new Map([...saved.history,...valid].map(h=>[h.at,h])).values()].sort((a,b)=>a.at.localeCompare(b.at)).slice(-30);save();drawSentences();stats();$('review-status').textContent='已合并本篇重练和逐句复习记录；当前草稿保留。';}catch(err){$('review-status').textContent='导入失败：'+err.message;}finally{e.target.value='';}});
  $('quiz-scope').value=saved.scope==='all'?'all':'wrong';if(saved.scope==='all')current=[...qs];
  drawSentences();drawQuiz();stats();selectTab(['quiz','sentences','cards'].includes(location.hash.slice(1))?location.hash.slice(1):'quiz');
})();
