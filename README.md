# AgentHomework

A workspace for homework, small experiments, and notes while learning agentic workflows.

## Current project: Mindplay

[Mindplay](assignments/02-mindplay/README.md) is a psychology-learning playground with three mini-games, a knowledge garden, and an interactive guide to agent workflows. It uses pastel gradients, textured glass, and an original illustrated mind mascot.

- [Website source](assignments/02-mindplay/site/)
- [Actual agent-workflow record](notes/mindplay-workflow.md)
- [Research and sources](notes/psychology-research.md)
- [Tests](assignments/02-mindplay/tests/core.test.mjs)
- [A prompt for your next iteration](prompts/mindplay-next-iteration.md)

Preview from the repository root with `python3 -m http.server 4187 --bind 127.0.0.1 --directory assignments/02-mindplay/site`, then open http://127.0.0.1:4187.

The homework repository is private. Public Pages publishing is a separate step; see the assignment README for the deployment options.

## Where things go

| Folder | Contents |
| --- | --- |
| `assignments/` | One folder per assignment, such as `01-first-workflow/` |
| `experiments/` | Small prototypes and comparisons |
| `notes/` | Reading notes, decisions, and lessons learned |
| `prompts/` | Reusable prompts with their purpose and expected output |
| `templates/` | Starting points for assignments and experiment logs |

`AGENTS.md` gives coding agents guidance for this repository. No programming language or agent framework is required yet; add dependencies inside the assignment or experiment that needs them.

## Start an assignment

From the repository root:

```sh
mkdir -p assignments/01-first-workflow
cp templates/assignment.md assignments/01-first-workflow/README.md
git switch -c homework/01-first-workflow
```

Fill in the assignment brief and success criteria before implementing. Keep its code, small sample inputs, and final write-up in the same assignment folder.

## A workflow to practice

1. Write the goal, constraints, and a concrete way to check the result.
2. Ask an agent to propose a short plan and identify missing information.
3. Implement one small step at a time and inspect the changes.
4. Run the relevant checks and record the actual results.
5. Note what worked, what failed, and what you would change next time.

Use `templates/experiment.md` to compare prompts, tools, or approaches. Keep API keys in a local `.env` file; `.gitignore` excludes it. Commit only non-secret placeholder values in `.env.example` if needed.

## Save progress

```sh
git status
git diff
git add assignments/01-first-workflow
git commit -m "Add first workflow assignment"
```

Once GitHub is connected and Git authentication is configured, publish the branch with:

```sh
git push -u origin homework/01-first-workflow
```

Review the diff before merging. Follow each course's rules for AI assistance and record assistance when required.
