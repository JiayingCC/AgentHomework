# Mindplay verification

## Automated checks actually run

Command: `node --test assignments/02-mindplay/tests/core.test.mjs`

Result: **14 passed, 0 failed** after review fixes. Tests cover 100 seeded color rounds, matched per-condition ink counts, correct-only medians and unavailable timing groups, 100 seeded recognition rounds, six-selection scoring, malformed input, replay-safe rewards, corrupt progress normalization, and prompt validation.

JavaScript syntax checks and `git diff --check` also passed.

## Browser checks actually observed

- Desktop preview at 1280px; phone preview at 390px. The phone layout and knowledge view had no horizontal overflow.
- Recognition game: six displayed words, disabled submission after five selections, enabled submission after six, seventh selection rejected. Correct selection produced 6/6 and zero false alarms.
- Completed activity persisted after a reload. Repeating the lesson-only route did not award more completion points; all three activities remain capped at 150 XP.
- Bias game: deliberately incorrect first answer revealed a text-labeled correct answer and explanation. Completing the other two correctly produced 2/3.
- Color game: practice plus all 12 trials completed through visible UI controls. Twelve correct selections produced 12/12 and six usable observations per condition. These automated response timings are software-test output, not human psychology data.
- Agent studio: role selection changed the displayed handoff; the brief generator incorporated the edited goal and focus; clearing the goal produced “Add a goal first”; copying displayed a success message.
- Solid-background preference toggled its pressed state and returned to glass mode.

## Limits of verification

These checks do not constitute a clinical validation or a full accessibility audit. No screen reader, real-device touchscreen, cross-browser matrix, or simulated storage-quota failure was tested. Background-tab pause handling and reduced-motion support were inspected in code but were not independently exercised in the browser checks above.

GitHub Pages is not yet live. The private repository's Pages settings require an upgrade or a public repository. Public website-only deployment is waiting for the user's choice.
