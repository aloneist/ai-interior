# Goal
Implement the first real inbound approval-response webhook intake path for the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/n8n/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume yet.
This is not persistence or UI integration yet.

# Primary Objective
Add the first real inbound boundary that can receive an approval response payload and normalize/validate it using the existing approval response intake contract, without resuming blocked execution.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The inbound path must reuse the existing approval response intake, review summary, application, eligibility, manual request, gate, and manual resume contract flow where applicable.
4. Keep the inbound boundary narrow, explicit, and replaceable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions under automation/orchestration/n8n/*
- Narrow demo/smoke updates required to prove inbound intake works
- Small documentation updates directly related to the inbound approval-response path
- Small helper additions if strictly required for parsing and validation

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad inbound API framework
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn inbound approval responses into automatic risky execution.
This task is only about receiving and normalizing approval responses safely.

# Working Principles
- Prefer the smallest real inbound webhook path
- Reuse existing intake/application/eligibility contracts
- Keep the response path explicit and reviewable
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Inbound Direction
A good v1 implementation should:
- accept one narrow JSON payload shape for approval response input
- call the existing approval response intake normalizer
- surface a structured inbound result with:
  - accepted / rejected_invalid / ignored_not_applicable
  - derived review summary
  - derived application result
  - derived eligibility
  - derived manual resume request
  - derived manual resume gate
  - derived manual resume contract
- return structured metadata without resuming execution

Use the current fixed env-variable policy only if absolutely needed.
Prefer no new env variables in this task.

# Required Behavior / Structure
The result should make it clear:
1. where the inbound webhook intake lives
2. what raw payload it accepts
3. what structured result it returns
4. how it reuses the current receive-side contracts
5. how smoke/demo proves the inbound path works

# Completion Criteria
Complete only when:
- the automation system has a real inbound approval-response webhook intake path
- inbound payloads can be normalized and classified through the existing receive-side contract chain
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the inbound path
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What inbound approval-response webhook intake changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary