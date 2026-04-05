# Goal
Add the first runtime artifact manifest flow for the AI-INTERIOR automation system so operators and CI can review the current runtime report artifacts through one concise index.

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
1. add one manifest/index report that summarizes the current runtime report artifacts
2. build that manifest from the existing inspect / verify / check report outputs
3. preserve the manifest as one additional CI artifact
4. keep inspect / verify / check roles unchanged

# Required Design Direction
The design must follow these rules:

1. Do not change what inspect checks.
2. Do not change what verify checks.
3. Do not change what check combines.
4. Do not change runtime route behavior.
5. Reuse the existing report outputs instead of duplicating route logic.
6. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow additions under automation/demo/*
- Narrow updates to .github/workflows/ci.yml
- Small automation docs updates directly related to the runtime artifact manifest flow
- Small shared helper extraction only if strictly required for manifest generation

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
This task is only about indexing existing runtime report outputs for easier operator/CI review.

# Working Principles
- Prefer reuse over reimplementation
- Keep inspect, verify, and check roles distinct
- Build the manifest from their existing report outputs
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Runtime artifact manifest generator
Add one narrow helper/command that reads the existing runtime report outputs and builds one manifest object.

At minimum the manifest should contain:
- generatedAt
- overallStatus
- reports:
  - inspect:
    - artifactKind
    - overallStatus
    - reportKind
    - command
  - verify:
    - artifactKind
    - overallStatus
    - reportKind
    - command
  - check:
    - artifactKind
    - overallStatus
    - reportKind
    - command
- combinedSummary:
  - inspectOk
  - verifyOk
  - checkOk
  - runtimeArtifactsAligned
  - safetyBoundariesHeld

Do not broaden into a general inventory system.
Keep it specific to the current runtime artifacts.

## B. Optional local output
Allow the manifest to be emitted locally in a narrow way, either:
- as part of an existing combined runtime flow, or
- through one tiny helper command if clearly justified.

Do not add unnecessary extra commands unless they clearly improve operator use.

## C. CI artifact flow
Add one narrow CI flow so CI preserves the manifest as one artifact, for example:
- `automation-runtime-artifact-manifest`

Preferred direction:
- build the manifest from the already-generated inspect / verify / check report files
- do not rerun route checks
- keep existing artifacts intact

## D. Minimal doc alignment
Update only the minimum docs needed so operators know:
- what the runtime artifact manifest is
- how it relates to inspect / verify / check artifacts
- where to find it in CI
- that route behavior itself is unchanged

# Required Behavior / Structure
The result should make it clear:
1. that inspect, verify, and check still keep distinct roles
2. that one manifest now indexes their current runtime artifacts
3. that CI preserves the manifest as an additional artifact
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the repo has one runtime artifact manifest flow
- the manifest is built from the existing inspect / verify / check report outputs
- CI preserves the manifest as an artifact
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

# Required Result Format
Return:
1. Files changed
2. What runtime artifact manifest changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary