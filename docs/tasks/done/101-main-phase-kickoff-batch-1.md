# Goal
Create the first main-phase kickoff bundle after the closed automation baseline so the AI-INTERIOR repository can move cleanly into the next implementation phase.

# Scope
This task is for project planning/documentation only.

Primary target area:
- docs/tasks/*
- automation/next-phase-handoff.md only if a tiny pointer is clearly useful
- project-level docs only if strictly required

This is not automation-baseline expansion work.
This is not runtime behavior change yet.
This is not UI work yet.

# Primary Objective
Bundle the next practical project step into one narrow batch:
1. define the first main-phase kickoff surface after the automation baseline
2. state clearly what the next phase starts with
3. lock the initial next-phase priorities in repository reality
4. keep the automation baseline closed and out of scope except as a reference

# Required Design Direction
The design must follow these rules:

1. Do not reopen the closed automation baseline in this task.
2. Treat the current automation baseline as the handoff/reference point only.
3. Prefer one concise kickoff bundle over scattered notes.
4. Reflect current repository reality only.
5. Keep the diff narrow and documentation-focused.

# Allowed Changes
- Add one concise kickoff doc, for example:
  - docs/main-phase-kickoff.md
- Add very small pointers from existing handoff docs only if clearly useful
- Add one next-phase task seed list if clearly helpful and still narrow

# Disallowed Changes
- No automation route/report/verifier expansion
- No runtime changes
- No DB writes
- No UI changes
- No broad planning rewrite
- No unrelated cleanup

# Critical Safety Rule
Do not reopen or extend the closed automation baseline.
This task is only about defining the next implementation phase starting point.

# Working Principles
- Prefer one short kickoff bundle over broad planning prose
- Use the automation baseline as a fixed reference
- Make next-phase priorities explicit
- Keep the starting scope realistic and executable

# Batch Contents

## A. Main-phase kickoff surface
Create one concise kickoff-oriented surface that clearly states:
- the automation baseline is closed and accepted as the current handoff point
- the next phase starts from the current repository state
- the first priorities for the next phase
- what is intentionally not part of the immediate next step

## B. Initial next-phase priorities
Make the initial next-phase priorities explicit.

They should align with current project rules:
- recommendation quality
- operational data structure
- QA
- MVP purchaseable furniture flow

Do not make this broad.
Pick the first 2-4 concrete priorities only.

## C. Minimal handoff alignment
If useful, add only a tiny pointer from the automation handoff doc to the new kickoff surface.

# Required Behavior / Structure
The result should make it clear:
1. that the automation baseline is now the fixed reference point
2. what the next phase starts with
3. what should not be reopened immediately
4. how the first main-phase tasks should be chosen

# Completion Criteria
Complete only when:
- the repo has one explicit main-phase kickoff bundle
- the next-phase priorities are clear and narrow
- the automation baseline remains closed
- diff remains narrow and documentation-focused

# Validation
Use repository reality. Prefer:
- git diff -- docs/main-phase-kickoff.md automation/next-phase-handoff.md
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What main-phase kickoff bundle changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary