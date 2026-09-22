# Mindplay: an actual agent-workflow record

## Brief and human direction

The user chose a psychology-learning website with games, pastel gradients, and textured glass. They also asked for the site to demonstrate agentic workflow and support learning its vocabulary. Earlier instructions requested a private GitHub homework repository and GitHub Pages publication.

The user stopped an earlier generic workflow-lab idea, then supplied the psychology direction. That stop was respected; the new design follows the later brief.

## Participants and handoffs

| Participant | Bounded responsibility | Output used |
| --- | --- | --- |
| Human | Goal, aesthetic, stopping/restarting, publishing decisions | Psychology theme and pastel glass direction |
| Lead agent | Design, implementation, integration, browser testing | Website source and working preview |
| Research agent | Verify psychology, write original lesson/scenario copy | `learning.mjs`, sources and interpretation limits |
| Review agent | Review proposed games and then inspect code | Two review notes with actionable findings |
| Research agent, second assignment | Write independent tests for game logic | 14 Node tests |

The research and review tasks ran alongside the lead agent's implementation. Roles were bounded to specific files so independent work did not overwrite the same implementation.

## Iterations that changed the result

1. **Scientific framing:** the prebuild review emphasized that six-word selection is recognition, not recall or a measure of capacity. The game uses self-paced study, specific result labels, and a lesson explaining the distinction.
2. **Access to the lesson:** the color task is inherently visual. The review requested a lesson-only path; the implementation gives that path the same participation reward.
3. **Condition design:** the code reviewer found that the first color generator used different ink distributions between matching and conflicting trials. The generator now repeats the same six-color distribution in each condition before shuffling.
4. **Timing:** the code reviewer found that the word was visible before timing began. The stimulus is now hidden until the animation-frame callback that starts timing and enables responses. Timing remains approximate.
5. **Quiz feedback:** the reviewer found that correct-answer symbols were hidden from assistive technology. Explanations now explicitly state the correct answer in text.
6. **Input validation:** the independent tests found that the scoring function accepted a string as if it were six selected words. The function now rejects malformed selections.
7. **Test refinement:** an original test expected exactly three occurrences of every ink overall. That conflicts mathematically with matched six-trial distributions across two conditions and four colors. The test was corrected to assert the relevant property: identical per-condition color histograms with all colors represented, across 100 seeded rounds.

## Verification evidence

See `mindplay-verification.md` for commands and observed browser checks. Proposed checks in the reviewers' notes are not claims that they executed tests.

## Vocabulary in practice

- **Prompt:** each task assignment defined an output, constraints, and allowed files.
- **Context:** the user brief, AGENTS.md, source files, and research sources.
- **Tool:** file edits, research search, a test runner, and browser interaction.
- **Handoff:** researched lesson content passed to the lead agent for integration.
- **Evaluation:** an independent reviewer and executable assertions checked results.
- **Iteration:** the lead agent fixed findings and reran relevant checks.
- **Human in the loop:** the user chose the direction and retains control over new GitHub access and public publishing.

Further reading: [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents). The roles above describe this project's real development; the website does not run a live agent backend.

## Reflection for the student to complete

- What was the clearest example of an agent helping beyond writing code?
- Which output did you inspect rather than simply accept?
- What assumption did the review reveal?
- What one change would you request next, and what evidence would show it worked?

These reflection prompts are intentionally unanswered; an agent should not invent the student's personal experience.
