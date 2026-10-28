# Speaking Studio

Reusable tool display name: **口语模考，Speaking Studio**. Keep the existing canonical URL and browser storage key `ielts-speaking-studio-v1` for compatibility. The catalog `displayTitle` overrides the ordinary dated material title for this tool only.

## Practice and review workflow

1. Paste questions with or without numbering. Retain Part headings for a full paper; choose a fallback Part for a single section. A live numbered preview lets the user check recognition before loading the paper. Short headings in a section are topic names; Part 2 cues remain attached to their card.
2. Start a recording. Each Part transition speaks a short English introduction, waits three seconds after it finishes, then reads the first question. Later questions in that Part do not repeat the introduction. Answer timing begins after question speech; optional Part 2 preparation remains available. Speech failures offer manual continuation.
3. Review with the audio player or the per-question answer replay controls. Save two files separately: the original recording and the AI review text. ZIP is a collapsed fallback containing only those same two files.
4. Upload both files to an AI that can actually read audio. The review text asks for transcription, evidence-based unofficial band estimates, corrections, natural Band 7 model answers, useful language, a practice plan, and a Word document. It explicitly forbids invented transcripts, personal facts, or pronunciation ratings without audio access. The web page itself does not call an AI service or issue scores.

## Dates, audio and privacy

- A new practice records its actual start timestamp. Both file names begin `MMDD-YYYY-HHmmss-口语模考` in the device timezone. Later downloads and reloads retain that session identifier. The catalog publication date is not used as the practice date.
- Questions, notes, optional transcripts and session metadata remain in the existing localStorage record. Audio remains in page memory until explicitly downloaded; refreshing cannot restore it. The page warns before leaving with an unsaved recording or replacing it with another paper.
- MediaRecorder's final data chunk is handled before download controls become ready. Pending finalization blocks destructive replacement; rapid start clicks are guarded.
- Browser speech recognition remains optional and off by default. If enabled by the user it may use the browser vendor's online recognition service; the setting and privacy note say so. No API key or server was added to the public page.
- Recording and synthesized speech behavior still depend on the user's browser, device, microphone permission and installed voices. Automated tests mock those interfaces; they do not certify a physical microphone or AI transcription quality.

## Validation

Run `node scripts/test-speaking-studio.mjs` for parser, numbering/cue-card grouping, stable timestamps and restore, introductory speech ordering and the three-second delay, cancellation/fallback, Part 2 preparation, recording finalization, two-file ZIP, draft loading, and recording loss protection. Run `node scripts/build-catalog.mjs --check` for synchronized catalog outputs. Also verify the public editor, review screen and homepage entry after deployment.
