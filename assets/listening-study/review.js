'use strict';

window.ListeningStudy = {
  player(recording, description = '') {
    if (!recording) return '<p class="muted">本篇未附原录音。可用逐句按钮朗读原文。</p>';
    return `<section class="original-player" aria-labelledby="original-player-title">
      <h2 id="original-player-title">听力原录音</h2>
      <audio controls preload="metadata" aria-label="播放完整原录音" src="${escapeHTML(recording)}"></audio>
      ${description ? '<p class="muted">' + escapeHTML(description) + '</p>' : ''}
    </section>`;
  },

  seekButton(second) {
    if (!Number.isFinite(second) || second < 0) return '';
    const total = Math.floor(second);
    const timestamp = Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
    return '<button type="button" class="speaker small" data-original-second="' + second
      + '">原录音 · ' + timestamp + '</button>';
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
    const chosenAnswer = question => question.chosenParts?.length
      ? question.chosenParts.map(part => part.correct
        ? '<strong aria-label="' + escapeHTML(part.text + '，已选对') + '">' + escapeHTML(part.text) + '</strong>'
        : '<del>' + escapeHTML(part.text) + '</del>').join(' + ')
      : '<del>' + escapeHTML(question.chosen || '未作答') + '</del>';
    const questionTable = table => table
      ? '<div class="syntax-table"><table lang="en"><thead><tr>'
        + table.headers.map(label => '<th scope="col">' + escapeHTML(label) + '</th>').join('')
        + '</tr></thead><tbody>'
        + table.rows.map(row => '<tr>' + row.map(cell => '<td>' + escapeHTML(cell) + '</td>').join('') + '</tr>').join('')
        + '</tbody></table></div>'
      : '';
    const questionCard = question => `<article class="list-item question-priority">
      <h3>Q${question.number}${question.type ? ' · ' + escapeHTML(question.type) : ''} · <span lang="en">${escapeHTML(question.question)}</span></h3>
      ${question.questionNote ? '<p class="muted">' + escapeHTML(question.questionNote) + '</p>' : ''}
      ${question.image ? '<img class="question-map" src="' + escapeHTML(question.image) + '" alt="' + escapeHTML(question.imageAlt) + '" loading="lazy">' : ''}
      ${question.instruction ? '<p lang="en">' + escapeHTML(question.instruction) + '</p>' : ''}
      ${questionTable(question.table)}
      ${question.choices?.length ? `<details class="question-options">
        <summary>查看选项</summary>
        <ul lang="en">${question.choices.map(choice => '<li>' + escapeHTML(choice) + '</li>').join('')}</ul>
      </details>` : ''}
      <p class="question-answer">你的作答 ${chosenAnswer(question)} · 正确答案 <strong>${escapeHTML(question.answer)}</strong></p>
      <p><b>考查重点</b>　${escapeHTML(question.focus)}</p>
      <p><b>错因</b>　${escapeHTML(question.mistake)}</p>
      <p><b>重听方法</b>　${escapeHTML(question.method)}</p>
      ${question.evidence.length ? `<details class="question-details" open>
        <summary>对应听力原文</summary>
        ${question.evidence.map(line => `<div class="question-evidence">
          <p lang="en">${this.evidenceText(line)}</p>
          <p class="muted">${escapeHTML(line.zh)}</p>
          ${playButton(line.en, '设备朗读', true)}
          ${recording ? this.seekButton(line.start) : ''}
        </div>`).join('')}
      </details>` : ''}
    </article>`;
    return `<section class="card wrong-review">
      <h2>错题解析</h2>
      ${this.player(recording)}
      ${wrong.map(questionCard).join('') || (notice ? '<p class="muted">' + escapeHTML(notice) + '</p>' : '')}
    </section>`;
  }
};

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-original-second]');
  if (!button) return;
  const player = document.querySelector('.original-player audio');
  if (!player) return;
  const play = () => {
    player.currentTime = Number(button.dataset.originalSecond);
    player.play().catch(() => {
      player.scrollIntoView({block:'nearest'});
      player.focus();
    });
  };
  if (player.readyState >= 1) play();
  else player.addEventListener('loadedmetadata', play, {once:true});
});
