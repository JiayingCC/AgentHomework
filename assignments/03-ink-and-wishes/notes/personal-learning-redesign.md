# Ink & Wishes: a more personal first lesson

Research and design proposal · September 23, 2026

Branch: `design/personal-learning-experience`

Status: proposed direction, not an implemented redesign or a completed learner study. The public site remains on the existing release. This branch records the student's feedback, the research, and a bounded next experiment.

## The feedback that starts this iteration

The student said that the website is confusing for people who do not speak Chinese, that the red-envelope interaction is uninteresting, and that the experience should feel more personal and intimate. They requested a new branch and ideas informed by established learning products.

Keep the existing visual direction: minimal paper and ink, restrained fluid-glass controls, a subtle ink-wash background, and red used for the gift. Keep calligraphy, cultural learning, saved work, and couplets as the subject.

## What the current experience asks of a beginner

These observations come from the live studio's visible interface and the current source, not from interviews with learners.

- The opening character selector visibly shows Chinese characters, Pinyin, and stroke counts. English meanings are in the buttons' accessible names, but the visible meaning is shown only for the selected character. A sighted newcomer cannot easily compare the choices.
- The initial character is **福 · fú**, with 13 strokes. The library already contains simpler options, including **山 · shān**, with three strokes.
- Choosing a character, reading a cultural story, taking a quiz, watching a reference, drawing, adjusting a brush, and making a gift compete for attention. There is no single recommended first action.
- At the inspected 1280 × 720 viewport, the drawing surface extends below the first screen and the main gift action is below the fold. Several secondary labels are small and faint.
- Pronunciation is written in Pinyin, but there is no audio playback. A beginner may not know how to say what they are writing.
- The envelope is currently a tilted canvas preview with save/download actions. It has no recipient, personal message, folding, sealing, or opening sequence. Its printed message is the same for everyone.
- The couplet workshop offers several parts and Chinese terms before a newcomer understands the finished arrangement.

Design hypothesis: a clear sequence and a personally meaningful outcome could make the existing features easier to approach. This still needs testing with people who do not read Chinese.

## Research: patterns worth adapting

The review covers official product explanations and public websites, not a full signed-in test of each product. Their features are precedents, not evidence that the proposed changes will improve this project.

| Reference | Observed pattern | Adaptation for Ink & Wishes |
| --- | --- | --- |
| [Duolingo: home-screen design](https://blog.duolingo.com/new-duolingo-home-screen-design/) | A guided path, smaller lesson units, and practice integrated into the sequence. | Recommend one next action. Put meaning, demonstration, practice, and a small check in the same short journey. Keep free practice available. |
| [HelloChinese](https://www.hellochinese.cc/) | Short game-based lessons, handwriting, speaking support, and native-speaker videos. | Pair the written character with its meaning, Pinyin, and a reviewed voice recording; let learners hear, watch, and then write. |
| [Brilliant: how learning works](https://brilliant.org/faq/) | Interactive problems and visual models with explanations and immediate feedback. | Teach one brush or stroke-order idea through a small action, with a useful explanation after a mistake. |
| [Slowly](https://slowly.app/) | Letter writing, sealing/stamping, and a deliberate delivery ritual. This is a correspondence product, not a learning platform. | Make preparing and opening a personal gift the completion ritual. A prototype can offer an immediate recipient preview. |

## Recommended concept: a small wish for someone on your mind

**Learn one Chinese character by making something personal with it.**

The opening screen could say:

> Write a little wish for someone on your mind.
>
> Learn a Chinese character, make it your own, and tuck it into a red envelope.
>
> **Make my first wish** · Just practise

The primary path should contain one decision or action per screen:

```mermaid
flowchart LR
  A[Choose a person or yourself] --> B[Understand a wish]
  B --> C[Watch and try the brush]
  C --> D[Write your character]
  D --> E[Add a note and seal]
  E --> F[Open a preview and keep it]
```

Names and personal notes are optional. A learner can choose “For myself” or continue without naming anyone. The proposed first session targets about five minutes; this is a design target to measure, not a verified completion time.

### 1. Choose by meaning, with English visible

Offer a few understandable wish cards, such as **Peace · 安 · ān** and **Good fortune · 福 · fú**, with their stroke counts and a recommended option. Recommend 安 for the first gifting prototype because it is already in the library and has six strokes. Begin with a short brush warm-up before the character. Keep 山 as the simplest three-stroke exercise under “Just practise.”

Explain the literal meaning separately from the visitor's personal dedication. For example, “安 can mean peace or safety” is lesson content; “A little peace for your new beginning” is an example message, not a literal translation of a traditional saying.

Use larger English labels first, Chinese and Pinyin together underneath, and a clear “Hear it” button. Any pronunciation recording needs a fluent speaker's review and permission to use it. A short recording by the student or a consenting speaker could give the site a warmer voice.

### 2. Teach beside the hand

Put the current reference directly beside or on the writing paper. Show one stroke at a time, its direction, and one short instruction. Offer **Watch → Trace → Try on my own**. Keep brush tuning under a secondary settings control.

A useful instruction describes an action: “Start at the dot. Move down, then lift.” Have the wording checked against the selected stroke model. Reveal the next instruction when the learner is ready. The existing renderer can continue to make expressive ink marks.

For the first prototype, completion means the learner has tried the steps; it does not mean their writing was recognized as correct. Accurate shape assessment would be a separate feature requiring its own evaluation.

### 3. Turn the red envelope into a personal ritual

The emotional reward should be discovering the learner's own work and message. Proposed sequence:

| Moment | Interaction | What makes it personal |
| --- | --- | --- |
| Compose | Keep the handwritten character on the red front; add an optional recipient and a short note on an inner card. | “For Maya” and the learner's own words replace the generic message. |
| Fold | Close the flap with a drag or a **Fold envelope** button. | The flap follows the action, with a small paper shadow. |
| Seal | Tap to place a small personal mark or initial. | A visible action finishes this specific gift. This is a contemporary interface treatment, not a claim about a universal tradition. |
| Open | Preview the receiver's view and open the flap. | The inner card slides out, revealing the note and the actual handwritten character. |
| Remember | Save the editable work and download an image of the finished gift. | The collection shows the recipient, date, and original handwriting. |

Keep motion brief and responsive. Every drag needs a click/keyboard alternative. Reduced-motion mode should show the same stages without movement; sound, if added later, should be optional and off by default.

The first version should label this as **Preview opening**, with a separate **Download image** action. A PNG cannot preserve the opening interaction. A recipient link that works on another device is a later sharing feature; it must actually carry or store the artwork and note, rather than depend on the sender's browser collection. The interface must not say a gift was sent when only a local preview was created.

Explain the cultural source of the red-envelope design with a short, sourced note and distinguish this digital keepsake from a money gift. Keep fuller cultural references one tap away.

### 4. Use small games that support the next stroke

- **Ink warm-up:** make one slow and one quick stroke, then compare their width. This teaches the behavior of this digital brush.
- **Stroke detective:** predict the next stroke from two alternatives, then see the sequence and a short explanation. Reuse the existing licensed data and quiz logic.
- **Meaning match:** after making a gift, match the character to its English meaning. On a return visit, offer this again before new material.

Use gentle, specific feedback and allow a retry. Test whether the activities help learners remember the meaning and know what to do next. Avoid displaying an artistic-ability score that the system cannot substantiate.

### 5. Give the collection a memory

Present saved works as small dated keepsakes, such as “Peace for Maya · September 23,” with an optional line about why the visitor chose the wish. Let learners compare an earlier attempt with a later one and write their own observation.

This personalization can begin with local data and explicit choices; it does not require a live AI service. Preserve existing saved drawings when adding optional fields. Make storage location and the current three-work limit clear, and never replace a saved work automatically.

### 6. Introduce couplets through a doorway

Use an English entry point such as **Make a New Year doorway greeting**, followed by “Spring couplets · 春联 · chūnlián.” Begin with a full doorway illustration and an English explanation of the selected pair.

Label the editable pieces by where they go in the shown arrangement: **Right strip**, **Left strip**, and **Top banner**; add the Chinese terms as secondary learning labels. Highlight each piece as it is selected. Offer a sourced example first, with custom composition as an optional next step. Keep the workshop accessible without requiring a learner to earn an unlock.

## Visual and navigation changes

- Keep the paper, ink wash, and glass. Put readable text on a stable light surface and reserve translucency for a compact tool tray.
- Shorten the opening hero so the primary action is visible on desktop and phone. Use a clear English sentence and one strong button.
- Use a small progress label, such as “2 of 5 · Meet your character,” rather than displaying the whole tool set at once.
- Group navigation around **Learn**, **Create**, and **My keepsakes**. Keep the agent-workflow explanation reachable from **How this was made** in the footer and the homework documentation.
- Keep the free studio as a secondary entry for people who already understand the tools.

## First branch prototype: a deliberately small slice

Build one complete **安 → personal note → fold/seal/open preview → save/download** journey. Preserve the other lessons and couplet workshop through the existing studio route. Add one brush warm-up and a brief meaning check, rather than introducing every game at once.

Acceptance checks for that implementation:

1. A first-time visitor can find the start action, see the English meaning, and reach the first brush instruction without interpreting an unexplained Chinese label.
2. Going backward in the journey preserves the draft and optional note. Reopening an older saved work still works.
3. The gift uses the visitor's actual strokes; recipient and note text survive save/reload and appear in the exported composition. User-entered text is rendered as text, not HTML.
4. The fold/seal/open sequence works with pointer, touch, and keyboard controls. Reduced-motion mode offers the same content and actions.
5. Downloaded images clearly differ from the interactive preview; no cross-device sharing is promised before it exists.
6. Test the journey at a narrow phone viewport and a desktop viewport; inspect the actual downloaded image and check that longer names/notes fit.
7. Run the existing automated suite and add focused tests for any new saved-data migration and envelope state transitions. Record failures and fixes.

Then ask three people who do not read Chinese to try the prototype. Observe their first action, requests for help, completion of the intended gift, and whether they can explain the character's meaning afterward. Ask which moment felt personal and which step felt confusing. Record what they actually do; do not fill in results in advance. This is a small usability check, not a claim about long-term learning effectiveness.

## How this supports the homework

This iteration documents a real agentic loop: **student feedback → inspect current behavior → research precedents → propose a bounded change → implement on a branch → test → student review**. Research and the proposal are complete at this point; implementation and learner observations are still future work.

Useful vocabulary in this specific task:

- **Branch:** an independent line of work where the redesign can be reviewed before updating the published version.
- **Context:** the student's feedback, the current code and interface, existing saved-work constraints, and the research sources.
- **Constraint:** preserve the ink/glass direction, keep existing work compatible, and use clear English guidance.
- **Prototype:** one working lesson-to-gift journey that tests the proposed experience.
- **Evaluation:** browser checks, appropriate automated tests, and observed learner attempts.
- **Iteration:** the next change chosen from the results of those checks.

The student remains the decision-maker. This proposal was researched and written by one coding agent; it does not claim that a multi-agent team or a learner study was run.
