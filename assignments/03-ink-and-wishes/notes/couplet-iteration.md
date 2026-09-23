# Iteration: the couplet workshop

September 22, 2026. Student feedback: “对联呢” (What about couplets?).

The first build deferred couplets. This follow-up adds them as a separate, working path while retaining the six-character studio.

## The experience

Open **Couplets · 春联**. Choose a five- or seven-character example, or enter custom lines. The two vertical lines accept 2–9 Chinese characters each and must have equal lengths; the heading accepts 2–6. The app checks lengths and character input, not literary quality or tone patterns.

Select 上联, 下联, or 横批 and write one character at a time. Each position has independent strokes and undo/redo history, including repeated characters. The same textured ink renderer and pressure/speed width function used in the original studio render the couplet handwriting. Brush size, ink load, a printed guide, and per-character clearing are available. The printed guide is a system font, not a sourced brushwork exemplar or stroke-order animation.

The live composition uses red paper against a neutral background. Facing the doorway, the upper line is on the right, the lower on the left, and the heading reads right to left. These positions are explicit on screen. The cultural explanation acknowledges modern alternatives and links its sources.

Save the entire piece, including an unfinished draft, in the existing three-slot IndexedDB collection. Reopening restores the text and each character's strokes. Export produces a single **1800 × 1700 PNG composition**. It is not a set of full-size printable strips. Empty spaces remain blank; printed guides, selection borders, UI, and decorative preview text are excluded. Downloading an unfinished piece from the workshop asks the user to acknowledge its blank spaces.

## Decisions useful for the assignment

- **Scope:** build one complete couplet editing/saving/export flow without adding accounts, a character dictionary, or AI-generated poetry.
- **Reuse:** share ink geometry, storage validation, the save dialog, and collection slots with the existing studio.
- **State:** keep one couplet draft separate from the single-character drafts. Switching routes preserves it for the page session; a reload requires a saved copy. Replacing a nonempty couplet asks for confirmation.
- **Evaluation:** validate layout coordinates and total drawing size, then actually draw, save, reload, reopen, and download in the browser.

One coding agent performed these stages. No live AI runs inside the website, no multi-agent team was launched for this iteration, and no learner results were invented.

## Observed results

The full test suite reports **26 passed, 0 failed**. Six new checks cover custom text and presets, independent repeated characters, saved-work round trips, damaged or oversized payloads, the placement of all three parts, and guide-free export rendering.

In the browser, the agent wrote test marks in one character of each part. Progress moved to 3/14. Switching characters retained ink; undo changed the first occupied-space count from 1 to 0, and redo restored it. Saving, reloading, and reopening retained the 3/14 draft. A mismatched custom line showed a length error. Canceling a new-couplet confirmation preserved the draft; confirming custom four-character lines created 12 empty spaces. The seven-character example created 18 spaces.

An actual PNG download measured **1800 × 1700, 68,493 bytes**. Visual inspection confirmed all three test marks appeared in their corresponding red strips, with no guides or UI. At a simulated 390 × 844 viewport, the selector, culture dialog, and writing layout were usable without horizontal overflow. A separate single-character work still saved alongside the couplet. The browser reported no console errors during these checks. Agent-created test works were removed through the UI afterward.

Physical pen/touch hardware, assistive technology, broader browser coverage, expert calligraphy review, literary correctness of user-entered text, and the planned classmate trial remain unverified. Software checks do not establish learning outcomes.
