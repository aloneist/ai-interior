# Goal
Create the first explicit automation contract map inside the AI-INTERIOR main repository.

# Scope
This task is automation documentation and review infrastructure only.

Primary target area:
- automation/README.md
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only documentation files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow runtime integration.

# Primary Objective
Produce a clear contract map that explains the current automation contract stack, what each contract is for, how they relate, and which ones are currently reachable in the placeholder-only system.

# Required Design Direction
The design must follow these rules:

1. Do not change execution behavior in this task unless absolutely required for documentation alignment.
2. Prefer documentation and light indexing over more contract proliferation.
3. The map must reflect current repository reality only.
4. Keep the diff narrow and reviewable.
5. Keep the result useful for future operator review, Codex usage, and system extension.

# Allowed Changes
- Narrow updates to automation/README.md
- Narrow additions to one automation contract map document if needed
- Small naming/alignment comments in existing automation docs if directly helpful
- Small demo README clarifications if directly helpful

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No real network delivery
- No broad refactor
- No unrelated cleanup
- No new contract layer unless absolutely needed for consistency

# Critical Safety Rule
Do not create more automation complexity just to document automation complexity.
This task is about making the current contract stack understandable.

# Working Principles
- Prefer one concise map over scattered explanations
- Reflect current actual contracts only
- Distinguish current reachable states from future placeholder-only states
- Make the execution-to-handoff chain easy to follow
- Keep the documentation readable and operator-friendly

# Suggested V1 Map Coverage
At minimum, document:
- read-only execution path
- approval boundary
- approval lifecycle
- audit entry
- run report
- review summary
- decision envelope
- state snapshot
- contract bundle
- export envelope
- export serializer
- transport receipt
- handoff summary
- delivery readiness
- transport adapter

For each item, state briefly:
- what it represents
- where it is created
- whether it is currently always present, optional, or only present on approval-related flows

# Required Behavior / Structure
The result should make it clear:
1. what the current automation contract stack is
2. how the contracts flow from execution to external handoff preparation
3. which parts are current/reachable versus future placeholders
4. where operators and Codex should look first when reviewing automation behavior

# Completion Criteria
Complete only when:
- the repo has a readable automation contract map
- the map reflects current repository reality
- the diff remains narrow and mostly documentation-focused
- no safe execution behavior was broadened

# Validation
Use repository reality. Prefer:
- npm run lint if code comments changed
- npx tsc --noEmit if code types changed
- otherwise doc review only

# Required Result Format
Return:
1. Files changed
2. What contract-map documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary