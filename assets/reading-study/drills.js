'use strict';

window.IrisReadingDrills = {
  mount({cards, sentences, speak, stop}) {
    const panel = document.getElementById('reading-drills');
    const nav = document.querySelector('.reading-nav');
    const tabs = Array.from(nav.querySelectorAll('[data-drill]'));
    if (!panel || !tabs.length) return;

    const labels = {
      dictation: ['听写训练', '先听单词或语块，写下英文拼写和中文意思，再核对。'],
      meaning: ['看词写义', '先看英文，写出它在本文中的意思，再自行核对。'],
      sentences: ['句子精听', '听设备朗读本文原句，写下你听到的英文，再看原句和中文。']
    };
    panel.innerHTML = `
      <h2 tabindex="-1" data-field="title"></h2>
      <p class="drill-help" data-field="help"></p>
      <div class="drill-filters">
        <label>来源<select data-field="group"></select></label>
        <label data-field="star-label">重要等级
          <select data-field="star">
            <option value="0">全部星级</option>
            <option value="5">五星</option>
            <option value="4">四星及以上</option>
            <option value="3">三星及以上</option>
          </select>
        </label>
      </div>
      <p class="drill-position" aria-live="polite" data-field="position"></p>
      <div class="drill-prompt" data-field="prompt"></div>
      <div data-field="exercise">
        <div class="drill-actions"><button type="button" data-field="play">▷ 朗读英文</button></div>
        <div class="drill-inputs">
          <label data-field="english-label">听到的英文
            <textarea data-field="english" rows="2" lang="en" autocomplete="off" spellcheck="false"></textarea>
          </label>
          <label data-field="chinese-label">我的中文理解
            <textarea data-field="chinese" rows="2"></textarea>
          </label>
        </div>
        <div class="drill-actions">
          <button type="button" data-field="prev">← 上一条</button>
          <button type="button" class="primary" data-field="check">核对答案</button>
          <button type="button" data-field="next">下一条 →</button>
        </div>
        <div class="drill-solution" data-field="solution" aria-live="polite" hidden>
          <strong data-field="feedback"></strong>
          <p lang="en" data-field="answer-en"></p>
          <p data-field="answer-zh"></p>
          <p class="drill-help">中文意思请按语境自行核对。掌握等级可在翻卡复习中记录。</p>
        </div>
      </div>`;

    const field = name => panel.querySelector(`[data-field="${name}"]`);
    const group = field('group');
    const star = field('star');
    let mode = 'dictation';
    let queue = [];
    let position = 0;

    function render() {
      const item = queue[position];
      field('exercise').hidden = !item;
      field('english-label').hidden = mode === 'meaning';
      field('chinese-label').hidden = mode === 'sentences';
      field('solution').hidden = true;
      field('english').value = '';
      field('chinese').value = '';
      field('prev').disabled = position === 0;
      field('next').disabled = position >= queue.length - 1;
      field('prompt').textContent = mode === 'meaning' && item ? item.en : '';
      field('position').textContent = item
        ? `${position + 1} / ${queue.length} · ${item.group || '本文'}`
        : '没有符合条件的内容，请调整筛选。';
    }

    function filter() {
      const bank = mode === 'sentences' ? sentences : cards;
      queue = bank.filter(item => item.en && item.zh
        && (!group.value || item.group === group.value)
        && (mode === 'sentences' || item.stars >= Number(star.value)));
      position = 0;
      render();
    }

    function setMode(nextMode) {
      stop();
      mode = nextMode;
      panel.hidden = false;
      document.body.classList.add('drill-open');
      for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.drill === mode));
      field('title').textContent = labels[mode][0];
      field('help').textContent = labels[mode][1];
      field('star-label').hidden = mode === 'sentences';
      const bank = mode === 'sentences' ? sentences : cards;
      const groups = [...new Set(bank.map(item => item.group).filter(Boolean))].sort();
      group.replaceChildren(new Option('全部来源', ''), ...groups.map(name => new Option(name, name)));
      filter();
      field('title').focus({preventScroll: true});
      window.scrollTo(0, 0);
    }

    function leave() {
      if (panel.hidden) return;
      stop();
      panel.hidden = true;
      document.body.classList.remove('drill-open');
      for (const tab of tabs) tab.setAttribute('aria-pressed', 'false');
    }

    function normalize(text) {
      return text.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
        .replace(/[^\p{L}\p{N}']+/gu, ' ').trim();
    }

    for (const tab of tabs) tab.addEventListener('click', () => setMode(tab.dataset.drill));
    nav.addEventListener('click', event => {
      if (event.target.closest('button:not([data-drill]),a')) leave();
    }, true);
    const settingsLink = document.querySelector('.reading-sidebar a[href="#reading-settings"]');
    settingsLink?.addEventListener('click', () => {
      leave();
      const settings = document.getElementById('reading-settings');
      if (settings?.tagName === 'DETAILS') settings.open = true;
    });
    window.addEventListener('hashchange', leave);
    // Keep the original card shortcuts out of the added practice panel.
    document.addEventListener('keydown', event => {
      if (!panel.hidden && [' ', 'ArrowLeft', 'ArrowRight', 'p', 'P'].includes(event.key)) {
        event.stopPropagation();
      }
    }, true);
    group.addEventListener('change', filter);
    star.addEventListener('change', filter);
    field('play').addEventListener('click', () => {
      if (queue[position]) speak(queue[position].en);
    });
    field('prev').addEventListener('click', () => { if (position > 0) { stop(); position--; render(); } });
    field('next').addEventListener('click', () => { if (position < queue.length - 1) { stop(); position++; render(); } });
    field('check').addEventListener('click', () => {
      const item = queue[position];
      if (!item) return;
      const answer = normalize(field('english').value);
      field('feedback').textContent = mode === 'meaning' || !answer
        ? '参考答案'
        : answer === normalize(item.en) ? '英文核对一致' : '请对照原文检查拼写或漏词';
      field('answer-en').textContent = item.en;
      field('answer-zh').textContent = item.zh;
      field('solution').hidden = false;
    });
  }
};
