'use strict';

window.ListeningStudy = {
  player(recording, description = '') {
    return `<section class="card original-player" aria-label="听力原录音">
      <h2>听力原录音</h2>
      ${description ? '<p class="muted">' + description + '</p>' : ''}
      <audio controls preload="metadata" src="${escapeHTML(recording)}"></audio>
    </section>`;
  },

  questions({questions, recording}) {
    const wrong = questions.filter(question => question.wrong);
    const questionCard = question => `<article id="question-${question.number}" class="list-item${question.wrong ? ' question-priority' : ''}">
      <h3>第 ${question.number} 题${question.wrong ? ' · 首次错题' : ''}</h3>
      <p lang="en">${escapeHTML(question.question)}</p>
      <p class="question-answer">答案 ${escapeHTML(question.answer)}${question.wrong ? ' · 你的作答 ' + escapeHTML(question.chosen) : ''}</p>
      <p><b>考查重点</b>　${escapeHTML(question.focus)}</p>
      <p><b>做题方法</b>　${escapeHTML(question.method)}</p>
      <details class="question-details" open>
        <summary>对应听力原文</summary>
        ${question.evidence.map(line => `<div class="question-evidence">
          <p lang="en">${escapeHTML(line.en)}</p>
          <p class="muted">${escapeHTML(line.zh)}</p>
          ${playButton(line.en, '朗读原句', true)}
        </div>`).join('')}
      </details>
    </article>`;
    return `<section class="card">
      <h2>错题解析</h2>
      ${wrong.length ? `<p>首次错题 ${wrong.map(question => `<a href="#question-${question.number}" data-question-jump="${question.number}">Q${question.number}</a>`).join(' · ')}</p>` : ''}
      <p class="muted">逐句按钮使用设备朗读。完整原录音在逐题解析下方。</p>
      <h3>Questions 1–6</h3>
      <p lang="en">Complete the form below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.</p>
      ${questions.slice(0, 6).map(questionCard).join('')}
      <h3>Questions 7–10 · A typical 45-minute guitar lesson</h3>
      <p lang="en">Complete the table below. Write <strong>ONE WORD ONLY</strong> for each answer.</p>
      ${questions.slice(6).map(questionCard).join('')}
    </section>${this.player(recording)}`;
  }
};

document.addEventListener('click', event => {
  const link = event.target.closest('[data-question-jump]');
  if (!link) return;
  event.preventDefault();
  document.getElementById('question-' + link.dataset.questionJump)?.scrollIntoView({block: 'start'});
});
