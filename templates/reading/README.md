# IELTS Reading Review Template · v1

This is the reusable implementation standard extracted from the approved **The Brassica Family** reference page.

## Source of truth

- Page shell: `templates/reading/page-shell.html`
- Data contract: `templates/reading/data-schema.example.json`
- Shared visual system: `assets/reading-brassica/style.css` (the section marked “IELTS Reading template”)
- Shared interaction runtime: `assets/reading-brassica/app.js`
- Reference page: `reviews/2026-11-23/reading/practice/the-brassica-family/`

Do not rebuild the layout or invent new variants for each article. Copy the shell, supply the topic-specific data and assets, and reuse the shared runtime and CSS.

## Fixed modules

1. 翻卡复习
2. 原文与难点句
3. 全部词库
4. 错题解析
5. 学习设置

Keep the module order, navigation labels, IDs, shared runtime, responsive behavior, keyboard controls, four-level review ratings, five-star importance rating, and progress-storage behavior stable. Each topic must have its own unique `storageKey` and stable vocabulary IDs.

## Visual rules

- Reading theme: restrained pale green, white cards, dark green text.
- Original sentence audio: outline speaker icon only, left of the first line; no large button, label, or filled background. The audio remains bound to the complete English sentence.
- Wrong-answer review: each question is an independent card. Keep these fields visible and in this order:
  1. 原题
  2. 正确答案
  3. 我的答案
  4. 对应原文依据
  5. 我的判断过程
  6. 复盘要点
- Use distinct semantic color blocks: neutral grey for question, soft green for correct answer, soft red for user's answer, pale blue for source evidence, pale warm neutral for reasoning. Highlight only decisive evidence in the source sentence.
- If the answer key is ambiguous or disputed, disclose it explicitly; never silently replace the user's answer or the official answer.
- Important vocabulary (normally 4–5 stars) may include a `memory` object on the card back. It should explain authentic prefix/root/suffix or etymological elements, the word-building logic, and useful word-family members. Do not force false segmentations or attach memory notes to every item.
- Six-column vocabulary content and the user's preferred priority ordering remain data/content requirements, not a reason to change the fixed layout.

## Data contract

Each vocabulary item has a stable string `id`, `term`, `zh`, and `stars` (1–5). Optional `memory` shape:
- `method`: e.g. 构词／词源
- `parts`: morpheme or etymology breakdown
- `tip`: accurate semantic connection
- `family`: useful related forms
- `source`: optional source note

Each sentence uses `en`, `zh`, and `paragraph`. The shared runtime renders the audio control; do not manually add a second speaker button.

The `analysisHtml` property is topic-specific HTML but must use the shared semantic class names documented in the schema. Do not write per-page scripts that parse, rearrange, or hard-code question numbers in the HTML.

## Production workflow

1. Duplicate `page-shell.html` and replace every `{{...}}` token.
2. Create a topic data JS file that defines `window.READING_REVIEW_CONFIG` and `window.READING_REVIEW_DATA`; validate it against the schema.
3. Supply topic image and source credit.
4. Add topic-specific wrong-answer cards using the shared semantic classes.
5. Use shared `style.css` and `app.js`; do not inline page-specific CSS or DOM-rewriting scripts for standard modules.
6. Check desktop and mobile, every module, all audio controls, Chinese reveal, hard-sentence flags and sync, memory notes, wrong-answer evidence, keyboard shortcuts, and progress persistence before publishing.
