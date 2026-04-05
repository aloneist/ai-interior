# Goal
Add the first narrow HTTP verification batch for the current automation runtime bridges in the AI-INTERIOR main repository.

# Scope
This task is for automation/runtime verification only.

Primary target area:
- app/api/automation/*
- automation/demo/*
- automation/operator-runbook.md only if a tiny note is clearly helpful
- related helper files only if strictly required for route verification

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration.

# Primary Objective
Verify the currently added runtime bridges through real local HTTP requests in a narrow, reviewable way.

This batch should cover:
1. GET /api/automation/readiness
2. POST /api/automation/webhook-test
3. POST /api/automation/approval-response

# Required Design Direction
The design must follow these rules:

1. Do not broaden runtime bridge behavior.
2. Do not add risky execution resume.
3. Verification should use real HTTP requests against the existing routes.
4. Keep the verification narrow and practical.
5. Keep the diff reviewable and avoid broad test-framework expansion.

# Allowed Changes
- Narrow additions to automation/demo/ or small verification helpers/scripts
- Very small docs updates if directly useful for operators
- Small route-response shaping tweaks only if required to make route verification stable and explicit

# Disallowed Changes
- No product runtime changes unrelated to verification
- No DB writes
- No UI changes
- No broad e2e framework introduction
- No unrelated refactor
- No broad API redesign

# Critical Safety Rule
Do not turn runtime verification into execution of risky work.
Verification must stay on the current safe boundaries only.

# Working Principles
- Prefer the smallest real HTTP verification
- Reuse current routes as-is
- Keep verification results explicit and easy to inspect
- Preserve current safe behavior

# Batch Contents

## A. Readiness route verification
Verify via real HTTP that:
- route responds successfully
- safe summary fields exist
- no secret values are exposed

## B. Webhook-test route verification
Verify via real HTTP that:
- route responds successfully
- sender path is exercised safely
- result reports configured / not_configured / failed honestly
- no risky execution happens

## C. Approval-response route verification
Verify via real HTTP that:
- trusted request reaches normalization chain
- untrusted request is blocked before normalization
- structured receive-side output is returned
- no blocked execution resumes

# Required Behavior / Structure
The result should make it clear:
1. how the HTTP verification is run
2. which routes are covered
3. what success criteria are checked
4. that no-resume behavior is preserved

# Completion Criteria
Complete only when:
- the three current runtime bridges are verified through real local HTTP requests
- current safe behavior remains unchanged
- verification output is narrow and reviewable
- diff remains practical and contained

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- narrow local HTTP verification for the three routes

# Required Result Format
Return:
1. Files changed
2. What HTTP verification changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary