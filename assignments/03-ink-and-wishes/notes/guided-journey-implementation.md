# Guided keepsake journey — implementation and publication

September 23, 2026. The redesign was first implemented and reviewed locally on `design/personal-learning-experience`, respecting the student’s request for no GitHub changes during that phase. After receiving the local preview, the student asked for a public link and authorized publication through the existing GitHub Pages workflow.

## Direction and scope

Audience: English-reading beginners who do not read Chinese. The first job is to try the brush, learn one character, and keep a personal piece of handwriting.

Keep the original paper/ink/glass direction. Tokens: paper `#fdfcf9`, ink `#242929`, secondary text `#626c6a`, red envelope `#962d32`, edge `#d6ddda`, atmosphere `#f1f2f3`. Display: restrained Georgia; body: Avenir Next / Helvetica Neue / system sans; Chinese: the licensed glyph paths and available Songti / STSong. The ink-wash image remains subdued outside the paper.

Two arrangements considered: a separate screen for every small task, or a consistent desk with changing instructions. The desk was chosen so the paper is stable and drawing stays central. The signature interaction carries the visitor's actual strokes into a personalized card and folding envelope.

The implementation covers the first keepsake milestone, plus optional playback of the stored handwriting sequence. Remote gift links, pronunciation recordings, an expanded course, and accounts remain later work.

## What changed

- The default `#learn` route starts with usable scratch paper. Its marks are separate from character practice.
- A guided 安 lesson shows English meaning, Pinyin, directional stroke reveals from licensed medians, Trace / Watch / Try myself, and optional cultural context. Manual progression does not claim handwriting recognition.
- One two-question recall activity checks meaning and next-stroke recognition. Explanations and retries do not inflate first-attempt results. It can be skipped. Once marks exist, learners can go directly to personalization.
- Optional recipient, message, and sender fields update a preview of the actual drawing. User text is rendered as text or Canvas text, never interpolated into HTML.
- A seal/open interaction reveals the original handwriting and note. A separate replay shows stored strokes in sequence at an even pace, not original timing.
- The `keepsake` saved-work kind uses the existing version-1 store and three-slot collection. Optional metadata is validated. Older practice, envelope, and couplet formats remain supported.
- Keepsake export is 1200 × 1800 pixels; static PNGs preserve the drawing and dedication, not the opening animation or editable strokes.
- A small optional recall suggestion appears on a later page visit after a keepsake has been saved locally.
- The main navigation separates Start here, Free practice, Couplets, and My keepsakes. Process documentation is linked in the footer.
- Free-practice choices now visibly show English meanings. Free-studio references also animate stroke direction. Couplet controls use Right strip / Left strip / Top banner consistently.
- A user-facing reduced-motion setting works alongside the system preference. Small-screen primary actions remain reachable at the bottom of the viewport.

## Actual verification

- All 32 Node tests passed: the 26 existing checks plus six targeted checks for metadata compatibility and validation, envelope state transitions, first-answer scoring, export text/wrapping/dimensions, and independent SVG masks based on bundled medians.
- In the browser, drew a scratch stroke, entered the lesson, and confirmed that the practice sheet started empty. Drew six test strokes with real pointer drags.
- Deliberately answered the meaning question incorrectly, then corrected it; answered the next-stroke question and continued to personalization.
- Added a sample recipient, note, and sender; sealed and opened the preview; saved it through the existing collection.
- Reloaded the page and reopened the saved work. Its text fields and original handwriting remained present.
- Downloaded and visually inspected the actual PNG: the handwritten character, meaning, Pinyin, note, recipient, and sender were present and readable.
- Switched on reduced motion through its visible control. The rendered gift-card transition duration was `0s`; sealing and opening remained available.
- Checked responsive rendering in a temporary same-origin viewport harness. At 390 pixels, content width was 390 and the primary action was within a 660-pixel viewport. At 768 pixels, content width was 768 and the primary action also remained within the viewport. This is a layout check, not physical phone/pen testing.
- Inspected the free studio after the new integration; existing character choices and controls remained available.

Browser review caught excessive vertical movement between steps. Follow-up changes shortened the desktop layout, moved the next action beside the relevant instruction, kept the paper sticky on desktop, and added a persistent primary action on phones. A changing textarea accessible name was also fixed by separating its character counter from the label.

## Remaining verification and limits

Physical touch/pen testing, a full assistive-technology review, independent cultural/calligraphy review, and the three-person learner trial remain pending. No educational efficacy or emotional-response results are claimed. The local preview uses `127.0.0.1`; publication uses the existing public address at https://jiayingcc.github.io/AgentHomework/. Local saved drawings do not transfer to the public origin.

The next useful evidence is an observed learner attempt, including whether the writing, pacing, and envelope reveal feel right. No higher website grade is claimed without that evidence. Publication uses the automated tests and a check of the deployed source commit and public interface.
