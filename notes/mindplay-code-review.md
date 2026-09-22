# Mindplay code review

Reviewed the implementation by reading `core.mjs`, `app.mjs`, `index.html`, `style.css`, and the associated lesson copy. Findings below apply to the version read during this review. No browser interactions or executable tests were run. Severity P2 means a concrete issue to fix before treating the affected behavior as verified; no P0 or P1 issue was identified.

## Findings

### P2 — Match the ink-color distribution across Stroop conditions

**Location:** `assignments/02-mindplay/site/core.mjs:18–20`

`ink = i % COLORS.length` and `congruent = i < 6` create matching trials with Red/Blue twice and Green/Purple once, then conflicting trials with Green/Purple twice and Red/Blue once. The result compares conditions with different response-color distributions. Differences associated with a particular color or response key can therefore contribute to the displayed matching/conflicting median difference, even though trial order is shuffled.

**Fix:** Generate one six-item ink sequence and use that same multiset in both conditions before shuffling. This keeps the existing 12-trial scope and guarantees comparable response-color counts.

**Check:** For generated rounds, count each ink color separately in matching and conflicting conditions; the counts must be equal for every color. Also retain exactly six trials in each condition and a true word/ink mismatch for every conflicting trial.

### P2 — Do not show the stimulus before the response clock starts

**Location:** `assignments/02-mindplay/site/app.mjs:118–119`

`setContent` makes the word visible immediately. A nested `requestAnimationFrame` starts the clock and enables input later, allowing a rendering opportunity with the word visible while the clock is stopped. On a slower or busy display this creates a larger unmeasured preview. Responses during that preview are also discarded because `ready` remains false. The result is labeled response timing to the word, but part of the visible processing interval is omitted.

**Fix:** Render the trial shell with its stimulus hidden, then reveal the stimulus, enable response input, and set the start time together in the scheduled presentation step. Keep the existing approximate-browser-timing disclosure.

**Check:** Inspect the trial across presentation callbacks with a delayed callback or slowed rendering: there must be no displayed word while response readiness is false and no timestamp is active. Confirm an input immediately after readiness records exactly one response.

### P2 — Expose the correct bias answer in text after a wrong response

**Location:** `assignments/02-mindplay/site/app.mjs:176,181–182`

The answer-option marker is rendered with `aria-hidden="true"`. Feedback later replaces this marker with ✓ or × and applies CSS classes, while disabling every answer. A sighted user can identify the marked correct option; a screen-reader user receives an explanation but no explicit identification of which choice was correct. The information conveyed by the checkmark and color is absent from the accessible answer labels.

**Fix:** Include the correct choice's text in the feedback region, for example “A useful next step: [choice].” Alternatively, append an accessible textual status to the relevant button labels. Keep the explanation so the correct next step remains connected to its rationale.

**Check:** Choose a wrong answer in each scenario and inspect the accessible text or read it with a screen reader. Both the correct next step and explanation should be available without interpreting button colors or hidden symbols.

## Other inspected behavior

The code requires exactly six recognition selections, allows deselection, derives points from unique activity IDs, rejects repeated color answers, ignores repeated keydown events, and invalidates pending presentation callbacks when closing or pausing a game. Those observations come from code inspection, not executed verification. Keyboard focus and rendered contrast still need the lead agent's browser checks.
