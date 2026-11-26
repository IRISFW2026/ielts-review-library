'use strict';

window.ListeningStudy = {
  player(recording, description = '') {
    if (!recording) return '';
    return `<section class="original-player" aria-labelledby="original-player-title">
      <div class="original-player-copy"><span class="original-player-kicker">LISTENING AUDIO</span><h2 id="original-player-title">听力原录音</h2><p>打开原始录音，可完整播放本篇听力材料。</p></div>
      <a class="original-player-link" href="${escapeHTML(recording)}" target="_blank" rel="noopener noreferrer"><span class="original-player-icon" aria-hidden="true">▶</span><span><strong>播放完整录音</strong><small>Descript · 原始音频</small></span><span class="original-player-arrow" aria-hidden="true">↗</span></a>
      ${description ? '<p class="original-player-note">' + escapeHTML(description) + '</p>' : ''}
    </section>`;
  },


  evidenceText(line) {
    const text = String(line.en ?? '');
    const target = String(line.highlight ?? '');
    const at = target ? text.toLowerCase().indexOf(target.toLowerCase()) : -1;
    if (at === -1) return escapeHTML(text);
    return escapeHTML(text.slice(0, at))
      + '<mark>' + escapeHTML(text.slice(at, at + target.length)) + '</mark>'
      + escapeHTML(text.slice(at + target.length));
  },

  questions({questions, recording, notice}) {
    const wrong = questions.filter(question => question.wrong);
    const questionCard = question => {
      const answer = question.chosen || '未作答';
      const evidence = question.evidence || [];
      const evidenceHtml = evidence.map((line,index) => `<div class="listening-evidence-item">
        <div class="listening-evidence-meta"><span>原文依据 ${index+1} · ${escapeHTML(line.paragraph || '')}</span></div>
        <p lang="en">${this.evidenceText(line)}</p><p class="listening-evidence-zh">${escapeHTML(line.zh)}</p>
        ${playButton(line.en,'设备朗读',true)}
      </div>`).join('');
      return `<article class="listening-wrong-card">
        <div class="listening-wrong-head"><span class="listening-question-number">Q${question.number}</span><span class="listening-question-type">${escapeHTML(question.type || '听力题')}</span></div>
        <section class="listening-question-prompt"><h3>01 · 原题</h3><p lang="en">${escapeHTML(question.question)}</p>${question.instruction ? '<p>'+escapeHTML(question.instruction)+'</p>' : ''}</section>
        <div class="listening-answer-grid">
          <section class="listening-answer-correct"><span>正确答案</span><strong>${escapeHTML(question.answer)}</strong></section>
          <section class="listening-answer-mine"><span>我的答案</span><strong>${escapeHTML(answer)}</strong></section>
        </div>
        <section class="listening-evidence"><h3>02 · 对应听力原文</h3>${evidenceHtml || '<p>未提供原文依据。</p>'}</section>
        <section class="listening-analysis"><h3>03 · 错误原因</h3><p>${escapeHTML(question.mistake || '')}</p></section>
        <section class="listening-method"><h3>04 · 听力逻辑与复盘方法</h3><p><b>考查重点</b>　${escapeHTML(question.focus || '')}</p><p><b>听题方法</b>　${escapeHTML(question.method || '')}</p></section>
        ${question.choices?.length ? '<details class="listening-options"><summary>查看完整选项</summary><ul>'+question.choices.map(x=>'<li>'+escapeHTML(x)+'</li>').join('')+'</ul></details>' : ''}
      </article>`;
    };
    return `<section class="card wrong-review listening-wrong-review"><header class="listening-review-heading"><h2>错题解析</h2><p>原题 · 答案对比 · 听力原文 · 错因诊断 · 复盘方法</p></header>
      ${this.player(recording)}
      ${wrong.map(questionCard).join('') || (notice ? '<p class="muted">'+escapeHTML(notice)+'</p>' : '')}
    </section>`;
  }
};

