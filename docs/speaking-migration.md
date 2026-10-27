# Speaking 2026 migration

Migration date: 2026-10-27.

Source repository: `IRISFW2026/speaking2026`.

Source commit: `28d3499482c3a54b1c4436d3aea8b3816d99e5e9`.

## Page mapping

| Source | Canonical target |
|---|---|
| index.html | reviews/2026-10-23/speaking/mock/speaking-studio/index.html |
| singing.html | reviews/2026-10-06/speaking/part-1/singing/index.html |

Both source pages are self-contained with no external repository assets. Source application scripts are preserved byte for byte; only document titles, main headings, navigation and scoped responsive styles are added or changed. All nine Singing answer cards are retained.

Studio keeps `ielts-speaking-studio-v1` and `ielts-speaking-studio-audio-first-v4`. Both old and new GitHub Pages URLs have origin `https://irisfw2026.github.io`, so saved browser-local questions and settings remain available in the same browser profile. No stored user answers or recordings are read during migration. Recordings are held in page memory and still require explicit export before reload or close.

Studio is dated by its first publication on 2026-10-23, not by migration date. Singing uses the explicit 2026-10-06 material date.

Publish and verify destination pages before changing source URLs into redirects. Retain source Git history and query strings and fragments in redirects. No repository deletion is required.
