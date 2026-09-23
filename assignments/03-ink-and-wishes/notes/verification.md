# Verification record

September 22, 2026. Local build in the Codex in-app browser. Desktop viewport approximately 1265 pixels wide; phone-layout check at 390 × 844. Phone width was simulated on a desktop browser, not tested on a physical phone.

## Automated checks

`node --test assignments/03-ink-and-wishes/tests/core.test.mjs`: **10 passed, 0 failed**.

Coverage includes normalized coordinate alignment after resizing, clamping and invalid coordinates, bounded brush-width behavior, Unicode work names and point-data round trips, malformed metadata/settings, oversized drawings, three-slot save decisions, consistent quiz choices, and iteration-prompt validation.

## Observed browser checks

| Check | Actual observation |
| --- | --- |
| Initial load | Local character data loaded; all 13 reference controls appeared. |
| Drawing | Three separate mouse-drawn strokes appeared. Undo reduced the count to two; redo restored three. |
| Brush controls | Changed size by keyboard and switched from Steady to Flow; subsequent drawing worked at phone width. |
| Guide | Toggle changed its pressed state while retaining the drawing. |
| Sequence | Playback reached 13/13 and stopped; selecting stroke 1 reset the reference. |
| Quiz | A wrong first answer displayed a correction; retries worked; final first-try count was 2/3. |
| Save validation | Empty name produced “Give your work a name first.” |
| Persistence | Named envelope remained in the collection after reload; Open & edit restored its three strokes. |
| Full collection | A fourth drawing offered explicit selection of one of the three saved works. Replacing the selected work kept the count at three and changed the expected title. |
| Cancel/remove | Canceling removal kept all three works. Confirmed removal deleted only the selected test work. |
| Export | Downloaded PNG was 1200 × 2000 and 84,032 bytes. Visual inspection showed a red envelope and the test strokes, with no tracing guide or UI. |
| Mobile | Culture lesson, brush controls, drawing, saving, and collection worked at 390 pixels. No horizontal overflow was observed. |
| Homework prompt | Empty goal produced guidance; a supplied goal generated a useful brief; copying succeeded. |
| Glass alternative | Solid-controls toggle changed state and could be switched back. |
| Console | No error entries were reported during the checked flow. |

All agent-created test works were removed through the collection UI. The handoff preview starts with a blank desk and an empty collection. No trial participant data was created.

## Checks still needed

- Real touch/pen input, rotation during a stroke, cancellation, and multi-touch on physical devices.
- Safari/Firefox coverage and assistive-technology testing. Freehand drawing currently requires a pointing input device.
- Forced storage-denial/quota failure and concurrent-tab race testing. Error handling exists, but those browser conditions were not deliberately reproduced in this session.
- A knowledgeable human's review of the selected stroke model and cultural wording.
- The planned three-person learner trial and A/B brush comparison.
- Loading and the complete journey on the eventual public GitHub Pages URL.

These are software checks and agent observations, not evidence of educational effectiveness, calligraphy mastery, or participant preference. The earlier 94/100 was a proposal assessment; it should not be presented as a verified implementation grade.

## Follow-up: brush rendering and landscape

The brush revision adds six focused checks; the full suite now reports **16 passed, 0 failed**. Browser checks exercised wet/dry ink, undo/redo (three → two → three strokes), save/reload/reopen, and a 1200 × 2000 PNG export (117,642 bytes). The exported file was visually inspected: dry texture and solid ink appeared on the red background without the guide or landscape. The saved brush size 60 and ink load 15% reappeared on reopening. The settings dialog fit a 390 × 844 viewport, and the browser reported no console errors. Test artwork was removed afterward.

Pressure response is covered by width-function tests, not a physical-pen trial. The new texture is deterministic and old Steady/Flow work remains readable. The [iteration record](brush-iteration.md) includes the generated background's prompt and the visual correction made during this pass.

## Follow-up: six-character library

The full suite now reports **20 passed, 0 failed**. Added checks cover all six character assets and caption counts, dynamic quiz choices, malformed glyph rejection, and both current and older saved-work metadata.

Browser checks confirmed correct guide/reference counts for 山 (3), 水 (4), 永 (5), 安 (6), 春 (9), and 福 (13). 山 playback reached 3/3 and stopped. Its two-question quiz accepted a corrected answer without inflating the first-attempt result (1/2). Switching characters preserved strokes and undo/redo history. A named 山 practice survived reload, displayed 山 in its collection card, and reopened the correct lesson with its stroke intact. Its culture story showed the matching meaning and source links. The six choices fit a 390 × 844 viewport without horizontal overflow. No console errors were reported during this flow.

See the [character-library iteration](character-library.md) for the scope assumption and remaining review needs.
