# IELTS Review Library maintenance standard

The user has adopted the current date, skill and topic structure as the standard for all future review links. Catalog maintenance is part of creating a review page, not an optional follow-up.

## Required workflow for every new review link

1. Read the current `catalog.json` and relevant existing page before editing. Reuse the review modules and preserve progress keys when updating a topic.
2. Display names use `MMDD-科目-题型-English topic 中文主题`, for example `1027-写作-大作文-Work-life balance 工作与生活平衡`.
3. Use the study material date. If missing, use the first publication date and record the basis in `dateBasis`. Do not infer a study date from a later technical update or replace every date with today's date.
4. Pages belong at `reviews/YYYY-MM-DD/skill/type/topic-slug/index.html`. Skills use `reading`, `listening`, `writing`, `speaking`; existing types include `task-1`, `task-2`, `part-1`, `part-3`, `collection`, `practice`, `exam` and `close-reading`.
5. Include a return link to `/ielts-review-library/index.html`. Resolve assets correctly from nested paths. Preserve browser-local progress keys and item IDs.
6. Add or update a `catalog.json` entry with a stable ID, date, skill, kind, English and Chinese titles, primary topic, tags, description, canonical path and date basis. Keep one entry per independent topic; record aliases instead of duplicating topics.
7. Update the catalog's `updated` date, run `node scripts/build-catalog.mjs`, then run `node scripts/build-catalog.mjs --check`. The script synchronizes standard names, homepage data, counts, the most recent entry and the README directory.
8. When moving a page, preserve old URLs as redirects with query strings and section hashes. Do not remove old URLs merely to tidy the repository.
9. Publish the page and catalog changes together. Verify deployment, homepage entry, relevant filters and return navigation before delivering the link.

## Presentation conventions

- Retain time view, topic view and table view, date ordering, skill filters, topic filters and bilingual search.
- New links must be discoverable through the homepage immediately when delivered.
- Preserve responsive layout and existing practice features. Keep personal progress separate from static catalog data.
- Present links with standardized display names. Prefer tables when presenting several links.
- This is an update-on-creation workflow; do not claim that an unattended service monitors other conversations or creates future content by itself.
