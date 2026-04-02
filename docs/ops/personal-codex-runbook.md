# Personal Codex Runbook

## Purpose
This is a personal re-entry guide for running Codex safely and efficiently in this repository.

It is not a team onboarding document.
It exists to help future sessions restart quickly with the same operating standards.

## What This System Is For
This Codex workflow exists to make `ai-interior` development:

- faster
- less tiring
- more consistent
- safer to review

The goal is not maximum automation.
The goal is to reduce repetitive implementation work **without harming core product behavior**.

## Default Rule
If a change helps lint, types, or cleanup but risks product behavior, do not push it as a routine Codex task.

Behavior safety comes first.

## What Codex Is Best For
Use Codex by default for:

- safe lint cleanup
- safe local type cleanup
- narrow build-unblock fixes
- tightly scoped UI fixes
- small API cleanup without behavior change
- parser-safe local cleanup only

## What Not to Delegate Blindly
Do not treat these as normal Codex tasks:

- recommendation logic changes
- parser behavior changes
- API contract changes
- state architecture redesign
- broad refactors
- destructive or production-risk operations

If needed, define the design first and split the work into smaller safe tasks.

## Fast Restart Flow
When restarting work, follow this order:

1. identify the current blocker or target
2. classify the task type
3. define the exact file scope
4. write a narrow task file
5. run Codex
6. collect the structured result
7. review for scope, behavior, validation, and risk
8. approve, revise, or reject
9. merge only after explicit human approval

## Task Writing Rules
Every task should include:

- goal
- exact file scope
- allowed changes
- disallowed changes
- critical safety rule
- validation steps
- required result format

Task files should stay short and operational.

## Review Priorities
Always review in this order:

1. scope control
2. behavior safety
3. validation result
4. unresolved issues
5. merge readiness

Do not start from style preference.

## Merge Rule
Do not merge just because:
- lint passed
- build passed
- the patch is small
- the report sounds confident

Merge only when:
- scope stayed controlled
- behavior appears preserved
- required validation ran
- residual risk is acceptable
- a human explicitly approves it

## Current Practical Bias
Default to:
- small diffs
- narrow scope
- local fixes
- conservative decisions
- explicit reporting

If uncertain, make the task smaller.

## Current Strategic Priority
The main product priority remains:

1. recommendation quality
2. operational data structure
3. QA and regression safety

Automation should support those priorities, not distract from them.

## When to Stop and Re-scope
Stop and re-scope if:

- the fix needs more files than expected
- behavior risk starts increasing
- the type cannot be corrected safely
- validation suggests a hidden issue
- unrelated repository changes are interfering

Do not force completion.

## Working Standard
Codex is the implementation engine.
Human judgment still owns:
- direction
- scope
- behavior decisions
- approval
- merge judgment

## Minimal Session Prompt
When restarting in a new session, the practical instruction is:

“Continue using the current Codex operating rules for this repository.
Preserve product behavior.
Prefer narrow, reviewable tasks.
Write task files and Codex prompts in English.
Keep our conversation in Korean.”

## Final Reminder
A smaller safe improvement is better than a larger risky cleanup.

Protect product behavior first.
Use Codex to reduce fatigue, not to outsource judgment.