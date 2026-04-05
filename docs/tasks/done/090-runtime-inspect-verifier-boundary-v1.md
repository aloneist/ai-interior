# Goal
Clarify and tighten the boundary between the local runtime inspection flow and the runtime HTTP verifier so their responsibilities are less overlapping, without reducing current safety coverage.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/inspect-runtime-bridges.mjs
- automation/demo/verify-runtime-bridges-http.mjs
- automation/demo/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Reduce avoidable overlap between:
- the local runtime inspection command
- the runtime HTTP verifier

while preserving:
- current runtime route coverage where it matters
- current no-secret / no-persistence / no-resume safety posture
- current operator usefulness

# Required Design Direction
The design must follow these rules:

1. Do not change runtime route behavior.
2. Do not reduce meaningful safety verification coverage.
3. Keep the verifier focused on correctness/boundary assertions.
4. Keep the inspection command focused on operator-readable current-state summary/reporting.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/inspect-runtime-bridges.mjs
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
- Small shared helper extraction only if strictly required
- Small documentation updates directly related to the clarified boundary

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No route behavior changes
- No broad tool/test redesign
- No unrelated refactor
- No secret value exposure

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about clarifying responsibility boundaries between two existing local/CI runtime tools.

# Working Principles
- Prefer the smallest practical clarification
- Preserve current safety checks
- Reduce duplicate work where possible
- Make the purpose of each command obvious
- Keep CI/operator usage easier, not harder

# Suggested V1 Direction
A good outcome should make this distinction explicit:

1. `npm run automation:runtime:http:verify`
- primary purpose: assert runtime bridge correctness and safety boundaries
- stronger pass/fail checks
- trusted/untrusted approval-response checks
- approval-boundary simulation checks
- route-level correctness focus

2. `npm run automation:runtime:inspect`
- primary purpose: operator-readable current-state/runtime-surface inspection
- concise summary
- JSON report
- optional file/artifact output
- less assertion-heavy and less duplicate verification where safe to reduce overlap

Important:
- Do not remove checks carelessly.
- If a route is checked by both tools today, keep overlap only when it has clear value.
- Prefer narrowing `inspect` before weakening `verify`.

# Required Behavior / Structure
The result should make it clear:
1. what `inspect` is for
2. what `verify` is for
3. what each command covers after clarification
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- inspect and verify have clearer non-identical purposes
- current safety verification remains sufficient
- current safe behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- npm run automation:runtime:inspect

# Required Result Format
Return:
1. Files changed
2. What inspect/verifier boundary changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary