'use strict';

window.ListeningStudy = {
  player(recording, description = '') {
    return `<section class="original-player" aria-labelledby="original-player-title">
      <h2 id="original-player-title">听力原录音</h2>
      <audio controls preload="metadata" aria-label="播放完整原录音" src="${escapeHTML(recording)}"></audio>
      ${description ? '<p class="muted">' + escapeHTML(description) + '</p>' : ''}
    </section>`;
  },

  questions({questions, recording}) {
    const wrong = questions.filter(question => question.wrong);
    const questionCard = question => `<article class="list-item question-priority">
      <h3>Q${question.number} · <span lang="en">${escapeHTML(question.question)}</span></h3>
      ${question.choices?.length ? `<details class="question-options">
        <summary>查看选项</summary>
        <ul lang="en">${question.choices.map(choice => '<li>' + escapeHTML(choice) + '</li>').join('')}</ul>
      </details>` : ''}
      <p class="question-answer">你的作答 <del>${escapeHTML(question.chosen)}</del> · 正确答案 <strong>${escapeHTML(question.answer)}</strong></p>
      <p><b>考查重点</b>　${escapeHTML(question.focus)}</p>
      <p><b>错因</b>　${escapeHTML(question.mistake)}</p>
      <p><b>做题方法</b>　${escapeHTML(question.method)}</p>
      <details class="question-details" open>
        <summary>对应听力原文</summary>
        ${question.evidence.map(line => `<div class="question-evidence">
          <p lang="en">${escapeHTML(line.en)}</p>
          <p class="muted">${escapeHTML(line.zh)}</p>
          ${playButton(line.en, '设备朗读', true)}
        </div>`).join('')}
      </details>
    </article>`;
    return `<section class="card wrong-review">
      <h2>错题解析</h2>
      ${this.player(recording)}
      ${wrong.map(questionCard).join('')}
    </section>`;
  }
};
