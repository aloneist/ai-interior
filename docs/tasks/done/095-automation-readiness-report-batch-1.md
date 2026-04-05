# Goal
Add the first combined automation readiness report flow for the AI-INTERIOR automation system so operators and CI can review one consolidated automation result across smoke and runtime loops.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- automation/demo/*
- .github/workflows/ci.yml
- automation/demo/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. build one combined automation readiness report from existing smoke and runtime artifacts
2. keep smoke and runtime roles distinct while making their top-level results easier to review together
3. preserve that readiness report as one CI artifact
4. keep current route behavior and current verification scope unchanged

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not change what runtime inspect verifies.
3. Do not change what runtime verify asserts.
4. Do not change runtime route behavior.
5. Reuse existing artifact/report outputs instead of duplicating route logic.
6. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow additions under automation/demo/*
- Narrow updates to .github/workflows/ci.yml
- Small automation docs updates directly related to the automation readiness report flow
- Small shared helper extraction only if strictly required for report composition

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No route behavior changes
- No broad tooling/workflow redesign
- No unrelated refactor
- No secret value exposure

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about composing existing smoke/runtime outputs into one readiness report for easier operator/CI review.

# Working Principles
- Prefer reuse over reimplementation
- Keep smoke and runtime responsibilities distinct
- Build the readiness report from existing outputs only
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Combined automation readiness report builder
Add one narrow helper/command that builds one combined readiness report from existing outputs such as:
- smoke JSON report
- smoke artifact manifest or report if already present
- runtime inspect report
- runtime verify report
- runtime check report
- runtime artifact manifest

At minimum the readiness report should contain:
- generatedAt
- overallStatus
- smoke:
  - overallStatus
  - summary
  - scenarioCount if available
- runtime:
  - inspect:
    - overallStatus
    - reportKind
  - verify:
    - overallStatus
    - reportKind
  - check:
    - overallStatus
    - reportKind
  - manifest:
    - overallStatus if inferable
- readinessSummary:
  - smokeOk
  - runtimeInspectOk
  - runtimeVerifyOk
  - runtimeCheckOk
  - runtimeArtifactsAligned
  - automationReadinessOk
  - safetyBoundariesHeld

Do not turn this into a generic artifact inventory system.
Keep it specific to the current automation readiness surface.

## B. Optional local output
Allow the readiness report to be produced locally in a narrow way, either:
- through one small command such as `npm run automation:readiness:report`
- or as part of the existing combined runtime flow only if clearly safer and smaller

If a new command is added, it must stay thin and report-only.

## C. CI artifact flow
Add one narrow CI flow so CI preserves the readiness report as one artifact, for example:
- `automation-readiness-report`

Preferred direction:
- build the readiness report from already-generated smoke/runtime report files
- do not rerun route checks
- keep existing smoke/runtime artifacts intact

## D. Minimal doc alignment
Update only the minimum docs needed so operators know:
- what the automation readiness report is
- how it relates to smoke and runtime artifacts
- where to find it in CI
- that route behavior itself is unchanged

# Required Behavior / Structure
The result should make it clear:
1. that smoke and runtime keep distinct responsibilities
2. that one readiness report now composes their outputs
3. that CI preserves the readiness report as an additional artifact
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the repo has one automation readiness report flow
- the report is built from existing smoke/runtime outputs
- CI preserves the readiness report as an artifact
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
- npm run automation:runtime:check
- run the readiness report flow if added

# Required Result Format
Return:
1. Files changed
2. What automation readiness report changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary