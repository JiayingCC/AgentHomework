# Mindplay content research

Research checked on 2026-09-21 for an introductory learning website. The copy and scenarios in `assignments/02-mindplay/site/learning.mjs` are original educational summaries, not excerpts from a standardized assessment. Source links should remain visible with the lessons and glossary.

## Sources and scope

- [J. R. Stroop (1935), Studies of Interference in Serial Verbal Reactions](https://www.yorku.ca/pclassic/Stroop/), original research reproduced by York University. Supports interference between word reading and color naming. The app uses a short modern matching/mismatching variation, not a replication of the original materials or timing procedure.
- [APA classroom activity: The Stroop Effect](https://www.apa.org/ed/precollege/topss/lessons/sensation.pdf), activity 4.1. Supports the introductory explanation about competing word meaning and ink color. The page’s historical first name appears inconsistent with the original paper; our credit uses the original author’s initials, J. R. Stroop.
- [OpenStax, Psychology 2e, 8.1 How Memory Functions](https://openstax.org/books/psychology-2e/pages/8-1-how-memory-functions). Supports encoding, meaningful processing, retrieval, and the difference between recognition and recall.
- [OpenStax, Psychology 2e, 2.3 Analyzing Findings](https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings). Supports confirmation bias and the value of considering evidence that challenges an expectation.
- [OpenStax, Introduction to Philosophy, 2.2 Overcoming Cognitive Biases and Engaging in Critical Reflection](https://openstax.org/books/introduction-philosophy/pages/2-2-overcoming-cognitive-biases-and-engaging-in-critical-reflection). Supports the overview of biases and the distinction between unrecoverable past costs and prospective decisions.
- [APA Dictionary: selective attention](https://dictionary.apa.org/selective-attention), [automaticity](https://dictionary.apa.org/automaticity), and [availability heuristic](https://dictionary.apa.org/availability-heuristic). Support concise glossary definitions. The availability entry distinguishes a shortcut from the errors it can produce.

## Implementation guidance

Stroop: use 12 shuffled trials with six congruent and six incongruent trials. Within conditions, distribute colors as evenly as the chosen palette allows. Make the instruction to choose the ink explicit. Record response time only after the stimulus appears. Compare correct responses by condition and report errors separately; an empty set of correct responses needs an unavailable result rather than a numerical average. Do not infer an attention trait or diagnose anything. A small uncontrolled result may differ from the usual group pattern. Color perception, fluency, input method, screen rendering, and practice limit interpretation. This activity inherently requires color discrimination; an accessible explanation should remain available without playing.

Memory: display six words, then mix them with six new words. Have the learner choose six and submit, with a way to change selections. The result is a description of this round: studied words selected, studied words missed, and new words selected. It is recognition, not free recall, an IQ score, or a measure of working-memory capacity. Do not claim that this brief activity proves a specific improvement or impairment.

Bias: each fictional question asks for a useful next step. Correct choice indices are 1, 0, and 2. Provide explanations after answering. An incorrect answer indicates an opportunity to revisit the concept; it does not establish that the learner has a particular bias or personality. Sunk-cost guidance allows continuing when future benefits justify it.

## Content boundary

The three activities illustrate concepts. The website should avoid percentile rankings, normal/abnormal labels, brain-age claims, diagnostic language, and claims that playing produces lasting cognitive improvement. The teaching takeaway is to notice competing information, distinguish recognition from recall, and ask better evidence questions.

## Interface

`learning.mjs` exports three arrays: `lessons` (three entries with IDs `stroop`, `memory`, `bias`), `biasQuestions` (three multiple-choice entries), and `psychTerms` (eight entries). Every lesson and term includes a source label and URL. Question source grounding is described above and in the linked lesson and glossary.
