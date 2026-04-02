# Codex Workflow

## Purpose
This document defines the standard operating workflow for using Codex in this repository.

The purpose is to keep work:
- fast
- safe
- reviewable
- repeatable

This workflow is designed to reduce developer fatigue without increasing product risk.

## Core Workflow
Every Codex task should follow this sequence:

1. classify the task
2. define the scope
3. write the task document
4. run Codex
5. review the result
6. approve, revise, or reject
7. merge only after human approval

Do not skip steps for behavior-sensitive work.

---

## Step 1 — Classify the Task
Before writing a task file, classify the task using `docs/ops/codex-task-catalog.md`.

Ask:
- Is this Category A, B, C, or D?
- Is this safe to delegate?
- Does it require stricter human review?
- Should a human define behavior first?

If the category is unclear, do not start execution yet.

## Step 2 — Define the Scope
Define the task as narrowly as possible.

Every task must specify:
- exact files allowed to change
- exact goal
- explicit allowed changes
- explicit disallowed changes
- critical safety rule
- validation steps
- required result format

If the scope is broad or vague, narrow it before execution.

## Step 3 — Write the Task Document
Create a task file using `docs/ops/task-template.md`.

Recommended principles:
- one clear objective per task
- small file scope
- minimal ambiguity
- operational wording
- no unnecessary explanation
- no broad design discussion unless the task specifically requires it

Task files should be optimized for execution, not for teaching.

## Step 4 — Run Codex
Run Codex only after the task document is ready.

Execution rules:
- use the task file as the source of truth
- keep the task scoped
- do not allow silent expansion
- do not accept broad cleanup outside scope
- prefer smaller safe progress over larger risky changes

Codex should act as an implementation engine, not a product decision-maker.

## Step 5 — Require a Structured Result
Codex must report results in a standard structure.

Required result format:
- changed files
- per-file summary
- unresolved issues left intentionally
- lint result
- build result
- risk notes

For build-unblock tasks, a simplified structure is also acceptable:
- changed files
- implementation summary
- build result
- remaining issue, if any
- risk notes

If the report is incomplete, request a clearer report before approval.

## Step 6 — Review the Result
Review using `docs/ops/review-checklist.md`.

Review order:
1. scope control
2. behavior safety
3. validation result
4. unresolved issues
5. merge readiness

The reviewer should not start from style preference.
The reviewer should start from product safety.

## Step 7 — Decide
After review, choose one of three outcomes:

### Approve
Use when:
- scope was respected
- behavior appears preserved
- validation is acceptable
- risk is low and understood

### Request Revision
Use when:
- the task is mostly correct but needs one or two targeted fixes
- scope is slightly messy but recoverable
- one risky area needs tightening
- reporting is incomplete but the work is usable

### Reject
Use when:
- scope was broken
- behavior risk is too high
- disallowed changes were made
- validation suggests a likely functional issue
- the report is misleading or dangerously incomplete

## Step 8 — Merge
Only merge after explicit human approval.

Do not treat successful Codex execution as merge approval.
Do not treat passing lint or build alone as approval.
Approval requires human judgment.

---

## Standard Fast Path
Use this fast path for low-risk tasks such as:
- safe lint cleanup
- safe local type fixes
- narrow build-unblock fixes
- tightly scoped UI polish

Fast path:
1. classify as Category A
2. create narrow task file
3. run Codex
4. review with checklist
5. approve or revise
6. merge

This is the default productivity loop.

## Standard Cautious Path
Use this path for behavior-adjacent work such as:
- UI state-flow-adjacent changes
- parser-adjacent cleanup
- explanation parsing cleanup
- build fixes with visual tradeoffs

Cautious path:
1. classify as Category B
2. define tighter safety rule
3. create task file
4. run Codex
5. review more carefully
6. inspect risky diff areas directly
7. approve, revise, or reject
8. merge only after explicit confidence

## Human-Led Design Path
Use this path for Category C work.

Flow:
1. human defines the intended behavior first
2. human defines constraints and QA expectations
3. task file is created after behavior is fixed
4. Codex implements only the defined plan
5. review checks fidelity to the intended design

Codex should not invent product behavior in this path.

## No-Delegate Path
Use this path for Category D work.

Flow:
1. do not send as a normal Codex task
2. human investigates or designs first
3. if needed later, split into smaller safe tasks
4. delegate only the safe subparts

---

## Scope Escalation Rule
If a task appears to require more files than planned, do not silently expand scope.

Instead:
1. stop the current task
2. report what broader change seems necessary
3. create a new scoped task if needed

Silent scope expansion is one of the main failure modes in automation.

## Safety Escalation Rule
If a fix becomes behavior-risky during execution or review:

1. stop treating it as a routine cleanup
2. reclassify the task if needed
3. tighten the task definition
4. require stricter review

Do not force completion just because the task already started.

## Validation Escalation Rule
If validation fails:

1. identify whether the failure is task-related or unrelated
2. report the exact failed command
3. report the exact cause
4. report affected files only
5. do not mix unrelated failures into the task summary

This keeps debugging clean and prevents false blame.

---

## Recommended Default for This Repository
For this repository, the default use of Codex should emphasize:

- safe lint cleanup
- safe type cleanup
- small build-unblock fixes
- narrow UI fixes
- tightly scoped API cleanup
- parser-safe local cleanup only

Do not default to large refactors or behavior redesign.

## Reviewer Expectation
The reviewer should act like a product safety gate, not a style critic.

Review priority:
1. scope
2. behavior
3. validation
4. risk
5. cleanliness

A clean patch with behavior risk is worse than a slightly messy patch that is safe.

## Communication Standard
Task instructions should be:
- direct
- operational
- narrow
- concrete

Review responses should be:
- short
- honest
- decision-oriented

Avoid vague language like:
- “looks fine”
- “probably okay”
- “should work”

Instead say:
- approve
- revise
- reject

with a short reason.

---

## Example Operating Loop
A normal task loop should look like this:

1. identify the problem
2. classify the task
3. define the exact file scope
4. create the task document
5. run Codex
6. collect the structured result
7. review with the checklist
8. decide approve/revise/reject
9. merge only after approval

This is the standard loop to repeat.

## Final Rule
Codex is most valuable when the task is narrow, the scope is explicit, and the review is disciplined.

Use Codex to reduce repetitive implementation work.
Do not use Codex to outsource product judgment.