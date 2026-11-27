'use strict';

window.ListeningStudy = {



  evidenceText(line) {
    const text = String(line.en ?? '');
    const target = String(line.highlight ?? '');
    const at = target ? text.toLowerCase().indexOf(target.toLowerCase()) : -1;
    if (at === -1) return escapeHTML(text);
    return escapeHTML(text.slice(0, at))
      + '<mark>' + escapeHTML(text.slice(at, at + target.length)) + '</mark>'
      + escapeHTML(text.slice(at + target.length));
  },

  optionList(question) {
    return (question.choices || []).map(option => {
      const value = String(option).trim();
      const match = value.match(/^([A-Z])(?:[.．)）:：、]|\s+(?:[—–-]\s*)?)\s*(.+)$/u);
      return match ? {letter: match[1], text: match[2]} : {letter: '', text: value};
    });
  },

  optionRow({letter, text}, state = '') {
    const status = state === 'is-correct' ? '正确' : state === 'is-wrong' ? '错误' : '';
    return `<li class="listening-option-row ${state}">${letter ? `<strong class="listening-option-letter">${escapeHTML(letter)}</strong>` : ''}${text ? `<span class="listening-option-text" lang="en">${escapeHTML(text)}</span>` : ''}${status ? `<span class="sr">${status}</span>` : ''}</li>`;
  },

  answerPanel(label, answer, options, accepted) {
    const value = String(answer ?? '').trim() || '未作答';
    const letterAnswer = /^[A-Z](?:\s*[+＋]\s*[A-Z])*$/i.test(value);
    const letters = letterAnswer ? value.toUpperCase().split(/\s*[+＋]\s*/) : [];
    const rows = letters.length ? letters.map(letter => options.find(option => option.letter === letter) || {letter, text: ''}) : [{letter: '', text: value}];
    return `<section class="listening-answer-panel"><h4>${label}</h4><ul class="listening-option-list">${rows.map(row => this.optionRow(row, accepted ? (accepted(row.letter) ? 'is-correct' : 'is-wrong') : 'is-key')).join('')}</ul></section>`;
  },

  questions({questions, notice, showAll = false, showNotice = false}) {
    const visible = showAll ? questions : questions.filter(question => question.wrong);
    const questionCard = question => {
      const status = question.status === '✓' ? ' · 正确' : question.wrong ? ' · 有误' : '';
      const analysisLabel = !showAll || question.wrong ? '错误原因' : '答案解析';
      const options = this.optionList(question);
      const correct = new Set(String(question.answer ?? '').toUpperCase().trim().split(/\s*[+＋]\s*/));
      const matches = letter => letter && (options.length || correct.size > 1) ? correct.has(letter) : !question.wrong;
      const evidence = question.evidence || [];
      const evidenceHtml = evidence.map((line,index) => `<div class="listening-evidence-item">
        <div class="listening-evidence-meta"><span>原文依据 ${index+1} · ${escapeHTML(line.paragraph || '')}</span></div>
        <p lang="en">${this.evidenceText(line)}</p><p class="listening-evidence-zh">${escapeHTML(line.zh)}</p>
        ${originalClipButton(line,'设备朗读')}
      </div>`).join('');
      return `<article class="listening-wrong-card">
        <div class="listening-wrong-head"><span class="listening-question-number">Q${escapeHTML(question.number)}</span><span class="listening-question-type">${escapeHTML(question.type || '听力题')}${showAll ? status : ''}</span></div>
        <section class="listening-question-prompt">
          <h3>01 · 原题</h3>
          <p class="listening-question-stem" lang="en">${escapeHTML(question.question)}</p>
          ${question.instruction ? `<p class="listening-question-instruction" lang="en">${escapeHTML(question.instruction)}</p>` : ''}
          ${question.image ? `<img class="listening-question-map" src="${escapeHTML(question.image)}" alt="${escapeHTML(question.imageAlt || '原题地图')}" loading="lazy">` : ''}
          ${options.length ? `<ul aria-label="原题选项" class="listening-option-list listening-original-options">${options.map(option => this.optionRow(option)).join('')}</ul>` : ''}
          ${question.optionsNotice ? `<p class="listening-question-instruction">${escapeHTML(question.optionsNotice)}</p>` : ''}
        </section>
        <div class="listening-answer-grid">
          ${this.answerPanel('正确答案', question.answer, options)}
          ${this.answerPanel('我的答案', question.chosen, options, matches)}
        </div>
        <section class="listening-evidence"><h3>02 · 对应听力原文</h3>${evidenceHtml || '<p>未提供原文依据。</p>'}</section>
        <section class="listening-analysis"><h3>03 · ${analysisLabel}</h3><p>${escapeHTML(question.mistake || '')}</p></section>
        <section class="listening-method"><h3>04 · 听力逻辑与复盘方法</h3><p><b>考查重点</b>　${escapeHTML(question.focus || '')}</p><p><b>听题方法</b>　${escapeHTML(question.method || '')}</p></section>
      </article>`;
    };
    return `<section class="card wrong-review listening-wrong-review"><header class="listening-review-heading"><h2>错题解析</h2><p>原题 · 答案对比 · 听力原文 · 错因诊断 · 复盘方法</p></header>
      ${notice && (showNotice || showAll || !visible.length) ? '<p class="muted">'+escapeHTML(notice)+'</p>' : ''}
      ${visible.map(questionCard).join('')}
    </section>`;
  }
};

