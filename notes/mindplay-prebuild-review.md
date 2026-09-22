# Mindplay: prebuild review

Scope: three small psychology learning activities, local completion points, and a development-workflow walkthrough. This is a design review with proposed checks. No implementation tests or browser checks were executed for this review.

## P1 — Protect the meaning of the results

- **Stroop:** Prepare six congruent and six incongruent trials, then shuffle them. Independent random condition choices can leave too few trials in a condition. Keep response-button positions and keyboard mappings fixed during a run. Explain “choose the ink color, not the word” and provide unscored practice. The original work concerns interference between conflicting word and color stimuli; this brief browser game is an adaptation, not a replication. [Stroop (1935)](https://psychclassics.yorku.ca/Stroop/?c=012)
- Show accuracy for all answered trials and median response time for **correct, uninterrupted** trials in each condition, alongside the usable count. Show “No correct responses” when a condition has none; do not render zero, `NaN`, or an invented comparison. Define the displayed difference as incongruent median minus congruent median. With only 12 trials, describe this run rather than claiming to measure attention, intelligence, health, or a stable personal trait. Do not guarantee that the expected difference will appear.
- **Recognition:** Six studied words among 12 choices is a recognition activity. Require exactly six selections before submission, allow deselection, and explain the selection count. Otherwise selecting every word can produce a misleading perfect score. Report matches out of six, show missed targets and incorrect selections with text labels, and avoid calling this free recall, working-memory capacity, or a diagnostic result. Use unique words and randomized positions; do not leave the study list visibly available during selection.
- **Bias scenarios:** Ask which concept the scenario illustrates, not whether the user “is biased.” Make the decisive detail explicit in each explanation and link the source relevant to that particular bias. Do not treat shortcuts as invariably irrational: representativeness, availability, and anchoring were described as useful heuristics that can also produce systematic errors. [Tversky and Kahneman (1974)](https://pubmed.ncbi.nlm.nih.gov/17835457/)

## P1 — Make timing and state transitions dependable

- Use `performance.now()` for elapsed time; it is monotonic and avoids system-clock adjustments. Start timing when a trial becomes ready for interaction, never before a countdown or transition. Browser timing is approximate; avoid lab-grade precision claims. [MDN: performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
- Accept only the first response in an active trial, ignore held-key repeats, and reject input during transitions. Keep a run identifier so a delayed callback from a prior run cannot alter a restarted game. Stop timers and listeners on completion, restart, and leaving the activity.
- If the tab becomes hidden during a timed trial, invalidate that trial and offer an explicit retry or restart. Do not count time spent in another tab as a cognitive response. Background tabs may suspend animation frames or throttle timers. [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- Keep trial data, current selections, progress, completion, and result views in the same reset path. A reset of one game must not erase the other games' completion points. Distinguish “Play again” from “Reset saved progress.”
- Store completion by stable activity IDs and derive points from completed activities. Make the completion operation idempotent: a replay, double click, reload, or repeated completion callback must not add points again. Validate stored data and catch storage read/write failures. If saving fails, the game should work for the current session and accurately say that progress is not saved. Do not persist response times unless the product actually needs them.

## P1 — Preserve access to the learning content

- Keep pastel noise and glass in decorative surfaces. Text and colored stimuli need predictable solid backing and sufficient contrast; translucent panels must be checked against their rendered background, not just their CSS foreground/background values. W3C requires 4.5:1 for ordinary text and 3:1 for qualifying large text. [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
- Use native buttons and checkboxes, visible focus, text labels for selected/correct/incorrect states, and appropriately scoped status announcements. Mark decorative noise as noninteractive. Make all result and explanation content available without animation.
- Color naming is intrinsically visual. Label the Stroop requirement clearly and offer an explanation/skip route with the same access to the lesson. Screen-reader text that reveals the ink color would turn it into a different task; do not present such results as equivalent. Named response buttons and keyboard shortcuts still help sighted keyboard users.
- Prefer user-controlled study duration and an “I'm ready” button for recognition. If a timed variant is added, allow a longer or untimed study option and disclose the variant in the result. Do not make a tiny disappearing instruction or countdown the only way to learn what to do. [W3C: Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

## P2 — Keep the site responsive and the agent story accurate

- Use a small static noise texture and restrained blur. Avoid full-screen animated grain, repeated expensive filters, and re-rendering the entire page during a timed task. Honor reduced motion. Lock in fonts before beginning timed interaction so layout shifts do not move controls.
- Label the workflow as a **walkthrough of the development process**. A prepared research/design/build/review trace is not a live agent session. Attribute only contributions that actually occurred, and attach review recommendations to the concrete changes made in response.
- The copied task prompt should include a bounded goal, relevant files, constraints, success criteria, and a request to report actual verification. Copying must not be described as launching an agent. Announce successful copying only after the clipboard call succeeds; provide selectable text if clipboard access fails.

## Meaningful proposed QA checks

| Check | Expected result |
| --- | --- |
| Inspect generated Stroop sets across multiple seeded runs | Every run has 12 trials, exactly six per condition, valid mismatched words in incongruent trials, and a stable response mapping. |
| Verify result calculations with known arrays | Correct-only medians handle odd/even counts; incorrect answers still affect accuracy; empty groups yield explanatory text; the difference has the intended sign. |
| Hold a response key, double click, restart during a transition, and leave/reopen an activity | At most one response per trial; no skipped trials, stale timers, or cross-run data. |
| Hide the tab during an active Stroop trial | The interrupted trial is excluded or the run explicitly restarts; no inflated response time is silently accepted. |
| Select zero, five, six, and seven recognition options; deselect; submit twice | Submission requires six choices; selection is reversible; results are correct; points are awarded once. |
| Complete each game, replay it, reload, then reset one game | Completion points remain bounded and persistent; a replay does not add points; other activities remain intact. |
| Load corrupt storage and simulate unavailable storage | Site renders, games remain playable, and save-state messaging is truthful. |
| Complete each activity with keyboard only; inspect focus and announcements | Controls are reachable, state changes are understandable, focus is visible, and result content can be read at the user's pace. |
| Inspect 320px width, 200% zoom, reduced motion, and rendered contrast | Essential content stays visible; no horizontal page overflow; noise/glass does not undermine readability or interaction. |
| Follow the workflow trace and try copy with success/failure conditions | Every stated agent contribution has a real basis; clipboard feedback matches the actual result. |

## Suggested first iteration in class

> I completed Mindplay's [activity] and got confused by [instruction/result]. Please explain the current behavior, propose one small improvement, implement it, and run a check that would catch the original problem. Keep the game educational and record how the review changed the project.
