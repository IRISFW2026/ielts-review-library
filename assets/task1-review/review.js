(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('review-data').textContent);
  const get = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[char]);
  const speakButton = text => `<button type="button" class="speech" data-say="${escape(text)}" aria-label="朗读">🔊</button>`;
  const read = key => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  };
  const settingsKey = data.key + '-settings';
  const getRecords = () => data.university ? (read(data.key).records || {}) : read(data.key);
  const modelSentences = new Set(data.models.flatMap(group => group.sentences.map(sentence => sentence.en)));
  const getSettings = () => data.university
    ? {...read(data.key).settings, ...read(settingsKey)}
    : read(settingsKey);
  let settings = {daily:20, rate:0.9, voice:'', ...getSettings()};
  const saveSettings = () => localStorage.setItem(settingsKey, JSON.stringify({
    ...read(settingsKey), ...settings
  }));
  function saveRecords(updates) {
    const records = {...getRecords(), ...updates};
    const result = data.university ? {...read(data.key), records} : records;
    localStorage.setItem(data.key, JSON.stringify(result));
  }
  const grades = ['Again','Hard','Good','Easy'];
  const day = () => new Date().toLocaleDateString('en-CA');
  const record = id => getRecords()[id] || {};
  function grade(id, level) {
    const now = Date.now();
    const prev = record(id);
    const streak = level >= 3 ? (prev.streak || 0) + 1 : 0;
    const interval = [60000, 600000, 86400000 * Math.min(30, 2 ** (streak - 1)), 86400000 * Math.min(365, 4 ** streak)][level - 1];
    saveRecords({[id]:{...prev, level, streak, due:now + interval, updated:now,
      reps:(prev.reps || 0) + 1, startedDay:prev.startedDay || day()}});
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) {
      get('status').textContent = '当前浏览器不支持朗读。';
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.voiceURI === settings.voice || v.name === settings.voice)
      || voices.find(v => /^en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    utterance.lang = utterance.voice?.lang || 'en-GB';
    utterance.rate = Number(settings.rate) || 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
  const sections = ['points','cards','library','essay','dictation','patterns','settings'];
  const oldSections = {recite:'dictation',full:'essay',sentences:'essay',meaning:'cards',
    overview:'points',model:'essay',practice:'dictation',arguments:'points'};
  function navigate() {
    const requested = location.hash.slice(1).split('/').at(-1);
    const section = sections.includes(requested) ? requested : oldSections[requested] || 'points';
    for (const name of sections) {
      get(name).hidden = section !== name;
      const link = document.querySelector(`nav a[href="#${name}"]`);
      if (section === name) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    }
    get('source').hidden = !['points','essay','patterns'].includes(section);
    get('workspace').classList.toggle('split', !get('source').hidden);
    if (section === 'cards') renderCard();
    if (section === 'library') renderLibrary();
  }
  let current;
  let revealed = false;
  function eligibleCards() {
    const records = getRecords();
    const now = Date.now();
    const remaining = Math.max(0, settings.daily - data.items.filter(item => records[item.id]?.startedDay === day()).length);
    const filtered = data.items.filter(item => get('card-kind').value === 'all' || item.type === get('card-kind').value);
    const due = filtered.filter(item => records[item.id]?.level && Number(records[item.id].due) <= now)
      .sort((a,b) => records[a.id].due - records[b.id].due);
    const fresh = filtered.filter(item => !records[item.id]?.level).sort((a,b) => b.stars - a.stars);
    return get('card-scope').value === 'all' ? [...due,...fresh,...filtered.filter(item => records[item.id]?.due > now)] : [...due,...fresh.slice(0, remaining)];
  }
  function examples(item) {
    const source = item.examples?.find(example => modelSentences.has(example.en));
    const example = source || item.examples?.[0];
    const sample = example
      ? `<div class="example"><div class="muted">${source ? '范文原句' : '补充例句'}</div><p lang="en">${escape(example.en)}${speakButton(example.en)}</p><p>${escape(example.zh)}</p></div>` : '';
    return sample + (item.note ? `<p class="muted">${escape(item.note)}</p>` : '');
  }
  function renderCard() {
    const queue = eligibleCards();
    if (!current || !queue.some(item => item.id === current.id)) {
      current = queue[0];
      revealed = false;
    }
    get('card-count').textContent = `当前可练 ${queue.length} 个词条`;
    const target = get('card-body');
    if (!current) {
      target.innerHTML = '<p>本轮已完成。可切换到「全部词条」继续练习。</p>';
      return;
    }
    target.innerHTML = `<h3 class="term" lang="en">${escape(current.term)}${speakButton(current.term)}</h3>
      ${revealed ? `<p>${escape(current.zh)} <small>${escape(current.pos)}</small></p>${examples(current)}
      <div class="row">${grades.map((name,index) => `<button class="grade" data-grade="${index+1}">${index+1} ${name}</button>`).join('')}</div>`
      : '<button id="reveal">揭晓释义</button>'}`;
  }
  function gradeCurrent(level) {
    if (!current || !revealed) return;
    const old = current.id;
    grade(old, level);
    const queue = eligibleCards();
    const index = queue.findIndex(item => item.id === old);
    current = index < 0 ? queue[0] : queue[(index + 1) % queue.length];
    revealed = false;
    renderCard();
    renderLibrary();
  }
  function renderLibrary() {
    const query = get('search').value.trim().toLowerCase();
    const kind = get('library-kind').value;
    const stars = get('stars').value;
    const records = getRecords();
    const found = data.items.filter(item => (kind === 'all' || item.type === kind)
      && (stars === 'all' || Number(stars) === item.stars)
      && [item.term,item.zh,item.pos].join(' ').toLowerCase().includes(query));
    const open = new Set([...get('entries').querySelectorAll('details[open]')].map(el => el.dataset.id));
    get('library-count').textContent = `${found.length} 个词条`;
    get('entries').innerHTML = [...found].sort((a,b) => b.stars-a.stars || a.term.localeCompare(b.term)).map(item => `
      <details data-id="${escape(item.id)}" ${open.has(item.id) ? 'open' : ''}><summary>
      <span lang="en">${escape(item.term)}</span> · ${escape(item.zh)}
      <span class="stars" aria-label="${item.stars} 星">${'★'.repeat(item.stars)}</span></summary>
      <p>${escape(item.pos)}${item.ipa ? ` · /${escape(item.ipa)}/` : ''}${speakButton(item.term)}</p>
      ${examples(item)}<label class="rating">熟练度 <select data-library-grade="${escape(item.id)}">
      <option value="" disabled ${records[item.id]?.level ? '' : 'selected'}>未学</option>
      ${grades.map((name,i) => `<option value="${i+1}" ${records[item.id]?.level === i+1 ? 'selected' : ''}>${name}</option>`).join('')}
      </select></label></details>`).join('');
  }
  let groupIndex = 0;
  let sentenceIndex = 0;
  let bilingual = true;
  function renderEssay() {
    const group = data.models[groupIndex];
    const words = group.sentences.map(sentence => sentence.en).join(' ').trim().split(/\s+/).length;
    get('word-count').textContent = `${words} 词`;
    get('essay-text').innerHTML = group.paragraphs.map(([title, from, to]) => `<section class="card"><h3>${escape(title)}</h3>${
      group.sentences.slice(from,to).map(sentence => `<p lang="en">${escape(sentence.en)}${speakButton(sentence.en)}</p>
      ${bilingual ? `<p class="muted">${escape(sentence.zh)}</p>` : ''}`).join('')}</section>`).join('');
  }
  function renderDictation() {
    const group = data.models[groupIndex];
    const sentence = group.sentences[sentenceIndex];
    const saved = data.university ? read(data.practiceKey).items?.[sentence.id]?.text : undefined;
    get('dict-prompt').textContent = sentence.zh;
    get('dict-count').textContent = `${sentenceIndex + 1} / ${group.sentences.length}`;
    get('answer').value = read(data.draftsKey)[sentence.id] ?? saved ?? '';
    get('dict-result').hidden = true;
  }
  function saveDraft(value) {
    const sentence = data.models[groupIndex].sentences[sentenceIndex];
    localStorage.setItem(data.draftsKey, JSON.stringify({...read(data.draftsKey), [sentence.id]:value}));
  }
  function showAnswer() {
    const sentence = data.models[groupIndex].sentences[sentenceIndex];
    saveDraft(get('answer').value);
    get('own-answer').textContent = get('answer').value.trim() || '（未输入）';
    get('reference').innerHTML = escape(sentence.en) + speakButton(sentence.en);
    get('dict-result').hidden = false;
  }
  const chart = get('chart');
  if (chart) {
    const dialog = get('zoom');
    const selectImage = button => {
      chart.src = button.dataset.image;
      for (const tab of document.querySelectorAll('[data-image]')) tab.setAttribute('aria-pressed', tab === button);
    };
    for (const tab of document.querySelectorAll('[data-image]')) tab.addEventListener('click', () => selectImage(tab));
    get('zoom-open').onclick = () => {
      get('zoom-image').src = chart.src;
      dialog.showModal();
    };
  }
  get('card-kind').onchange = get('card-scope').onchange = () => { current = undefined; renderCard(); };
  get('search').oninput = get('library-kind').onchange = get('stars').onchange = renderLibrary;
  get('entries').onchange = event => {
    if (!event.target.dataset.libraryGrade) return;
    grade(event.target.dataset.libraryGrade, Number(event.target.value));
    renderCard();
  };
  get('answer').oninput = () => saveDraft(get('answer').value);
  get('submit').onclick = showAnswer;
  get('show-reference').onclick = showAnswer;
  get('rewrite').onclick = () => {
    get('answer').value = '';
    saveDraft('');
    get('dict-result').hidden = true;
    get('answer').focus();
  };
  function turnSentence(delta) {
    const count = data.models[groupIndex].sentences.length;
    sentenceIndex = (sentenceIndex + delta + count) % count;
    renderDictation();
  }
  get('next').onclick = () => turnSentence(1);
  get('previous').onclick = () => turnSentence(-1);
  for (const picker of document.querySelectorAll('[data-model]')) picker.onchange = () => {
    groupIndex = Number(picker.value);
    for (const other of document.querySelectorAll('[data-model]')) other.value = picker.value;
    sentenceIndex = 0; renderEssay(); renderDictation();
  };
  get('language').onclick = () => {
    bilingual = !bilingual;
    get('language').textContent = bilingual ? '切换为纯英文' : '切换为中英对照';
    renderEssay();
  };
  get('copy').onclick = async () => {
    const {sentences, paragraphs} = data.models[groupIndex];
    const content = paragraphs.map(([,from,to]) => sentences.slice(from,to).map(sentence => sentence.en).join(' ')).join('\n\n');
    try {
      await navigator.clipboard.writeText(content);
      get('copy-message').textContent = '已复制英文全文';
    } catch {
      get('copy-message').textContent = '浏览器未允许复制，可选中英文文本复制。';
    }
  };
  function syncSettings() {
    get('daily').value = settings.daily;
    get('rate').value = settings.rate;
    const voices = globalThis.speechSynthesis?.getVoices().filter(voice => /^en/i.test(voice.lang)) || [];
    get('voice').innerHTML = '<option value="">自动选择</option>' + voices.map(voice =>
      `<option value="${escape(voice.voiceURI)}">${escape(voice.name)}</option>`).join('');
    get('voice').value = voices.find(voice => voice.voiceURI === settings.voice || voice.name === settings.voice)?.voiceURI || '';
  }
  get('daily').onchange = () => {
    settings.daily = Math.max(1, Math.min(200, Math.round(Number(get('daily').value) || 20)));
    saveSettings(); syncSettings();
  };
  get('rate').onchange = () => { settings.rate = Number(get('rate').value); saveSettings(); };
  get('voice').onchange = () => { settings.voice = get('voice').value; saveSettings(); };
  globalThis.speechSynthesis?.addEventListener('voiceschanged', syncSettings);
  get('export').onclick = () => {
    const blob = new Blob([JSON.stringify({format:data.key, records:getRecords(), settings, drafts:read(data.draftsKey)},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = data.slug + '-review-progress.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  get('import').onchange = async event => {
    const input = event.target;
    if (!input.files[0]) return;
    try {
      const backup = JSON.parse(await input.files[0].text());
      if (![backup.format, backup.key, backup.app].includes(data.key) || typeof (backup.records || backup.state) !== 'object') throw Error();
      const merged = {};
      const prior = getRecords();
      const allowed = new Set([...data.items,...data.models.flatMap(group => group.sentences)].map(item => item.id));
      for (const [id,value] of Object.entries(backup.records || backup.state)) {
        if (!allowed.has(id) || !Number.isInteger(value?.level) || value.level < 0 || value.level > 4) continue;
        if (!prior[id] || Number(value.updated || value.ts || 0) >= Number(prior[id].updated || prior[id].ts || 0)) merged[id] = value;
      }
      saveRecords(merged);
      if (backup.settings) {
        const {daily, rate, voice} = backup.settings;
        if (Number(daily) >= 1 && Number(daily) <= 200) settings.daily = Number(daily);
        if (Number(rate) >= .6 && Number(rate) <= 1.2) settings.rate = Number(rate);
        if (typeof voice === 'string') settings.voice = voice;
        saveSettings(); syncSettings();
      }
      const drafts = read(data.draftsKey);
      for (const [id, value] of Object.entries(backup.drafts || {})) {
        if (allowed.has(id) && typeof value === 'string' && !(id in drafts)) drafts[id] = value;
      }
      localStorage.setItem(data.draftsKey, JSON.stringify(drafts));
      renderCard(); renderLibrary(); renderDictation();
      get('status').textContent = '已合并复习进度。';
    } catch {
      get('status').textContent = '此文件无法作为本词库的进度备份读取。';
    } finally { input.value = ''; }
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.say) speak(button.dataset.say);
    if (button.id === 'reveal') { revealed = true; renderCard(); }
    if (button.dataset.grade) gradeCurrent(Number(button.dataset.grade));
  });
  document.addEventListener('keydown', event => {
    if (get('cards').hidden || !current || event.altKey || event.ctrlKey || event.metaKey || event.repeat
      || event.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
    if (event.key === 'Enter') { event.preventDefault(); revealed = true; renderCard(); }
    if (event.code === 'Space') { event.preventDefault(); speak(current.term); }
    if (/^[1-4]$/.test(event.key) && revealed) { event.preventDefault(); gradeCurrent(Number(event.key)); }
  });
  addEventListener('hashchange', navigate);
  syncSettings(); renderEssay(); renderDictation(); renderLibrary(); navigate();
})();
