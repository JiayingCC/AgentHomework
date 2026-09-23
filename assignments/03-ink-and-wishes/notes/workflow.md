# Actual workflow record

September 22, 2026. This records implementation work, not a completed learner study.

## The student's latest direction

> i do not need pastel color any more, make it minimalistic but with fluid glass effect and help me to do the homework. first make that website

The earlier idea included calligraphy learning, games, brush writing, saved artwork, couplets or red envelopes, and Chinese culture. The revised proposal selected one 福 lesson and one red-envelope creation journey as the first release. The latest message superseded its pastel styling.

The student's documented decisions were the subject, the change of visual direction, and the instruction to build the website first. The implementation choices below were made by the coding agent within that scope; they have not been separately approved by a human reviewer.

## Roles, tools, and artifacts

One coding agent performed the research, implementation, and checks in this build. These were successive roles, not a newly launched multi-agent team.

| Stage | Context and action | Reviewable output |
| --- | --- | --- |
| Scope | Read the brief and preserve the existing psychology project. | A separate `03-ink-and-wishes` assignment. |
| Research | Check primary cultural sources and the character-data reuse terms. | A source record and bundled licensed glyph. |
| Design | Compare a landing-page approach with a writing desk. | Paper-centered layout, neutral palette, floating glass controls. |
| Build | Implement learning → game → drawing → envelope → collection → export. | Static website with no external runtime dependency. |
| Evaluate | Run core tests and interact with the site in a real browser. | Validation results, an actual downloaded PNG, and saved/reopened test drawings. |
| Iterate | Correct quiz ambiguity and a mobile lesson-access issue. | Concrete changes described below. |
| Handoff | Package the source and leave a local preview. | Website, test record, and a blank learner worksheet. |

The tools included filesystem/code editing, source browsing, Node.js tests, and the in-app browser. Web references informed the content; no private user data or credentials are needed by the website.

## A real review/fix example: quiz ambiguity

An initial final checkpoint asked for the last stroke but used some already-written strokes as distractors. That made the options less useful as a “which comes next?” exercise.

The fix moved this checkpoint to the ninth stroke. Its three options now come from the remaining strokes in the same bundled model. The automated check verifies that each question has exactly one correct choice and that its options are not already written.

Browser verification deliberately answered the first question incorrectly, then selected the revealed answer. Answering the next two questions correctly produced **2 of 3 on the first try**. Retrying did not inflate the count.

## A real review/fix example: mobile lesson access

The first mobile stylesheet hid the culture-story button along with secondary lesson text. The phone-width inspection caught this loss of access. The fix keeps the story link visible beneath the character name while placing the game alongside it. The lesson was opened successfully at a 390-pixel viewport, and the final layout was visually checked without horizontal overflow.

## Research changed the implementation

The proposal referenced an education-ministry character model but had not resolved asset reuse. The implementation uses the reusable 13-stroke 福 data from Hanzi Writer Data consistently for the guide, reference, and quiz. The dictionary remains a meaning/pronunciation source. This source substitution is explicit; it is not a claim that different sources use identical stroke-count conventions.

## A bounded prompt for the next iteration

> Inspect Ink & Wishes and its verification notes. Observe three classmates using the existing journey before adding features; do not invent observations. Based on the recorded difficulty, propose one small change and a check that would detect the original problem. Preserve saved-drawing compatibility and the separate Mindplay project. Show the result and report what remains uncertain.

The website's prompt builder helps the student write a task with a goal, context, constraints, and checks. It generates text to copy into an agent; it does not execute that task itself.

## Reflection prompts for the student

- Which result did you personally try, and what happened?
- Which agent choice would you keep or change, and why?
- How did a specific test improve the result?
- What remained outside this release, and why was that tradeoff useful?

Leave these answers in the student's own voice. Do not turn the agent's test activity into a claimed personal experience or a classmate study.
