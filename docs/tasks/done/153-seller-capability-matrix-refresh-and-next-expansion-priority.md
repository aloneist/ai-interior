# Goal
Refresh the seller capability matrix using the latest Hanssem and Livart outcomes, then lock the next expansion priority and clearly separate deterministic parser support from future image-derived dimension extraction work.

# Scope
This task is limited to:
- updating the current seller/source capability matrix with the latest validated status
- documenting each seller’s current operational support level
- distinguishing deterministic parser-based support from future image-derived dimension opportunities
- recommending the next source-expansion priority and the next research/implementation track

This is not a UX task and not a new parser implementation task.

# Primary Objective
Create an accurate operational source-support snapshot so the team can decide the next seller expansion step without mixing:
- current production-usable parser support
- limited/partial seller support
- blocked sources
- future image-based dimension-extraction opportunities

# Allowed Changes
- Read all relevant current ops docs, source-validation docs, and parser capability docs
- Update or add a focused operational matrix / runbook-style document
- Add very small clarifying notes/comments only if truly helpful
- No code changes are required unless a tiny documentation-support helper is genuinely necessary

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not implement new seller parsers in this step
- Do not implement image OCR / image-derived dimension extraction in this step
- Do not broaden into generic platform redesign
- Do not loosen current quality-gate or geometry-contract rules

# Critical Safety Rule
Do not present experimental future possibilities as current operational support. Keep current parser-backed support, limited support, blocked support, and future image-derived opportunities clearly separated.

# Working Principles
- Operational truth first
- Current validated support must be evidence-based
- Deterministic parser support and image-derived dimension extraction are different tracks
- Limited support must remain clearly labeled as limited
- Next priority should reflect business value and technical feasibility
- Keep the result actionable for operator/developer planning

# Required Behavior / Structure

## 1. Refresh seller capability states
Update the capability matrix for at least:
- IKEA
- Livart
- Hanssem
- Todayhouse
- any other currently relevant source already discussed or represented

Each source should include:
- current support status
- evidence basis
- blocker stage if not fully supported
- whether geometry is operational, limited, or absent
- whether future image-derived dimension extraction could matter for that source

## 2. Separate current support from future image-derived opportunity
For each source, distinguish:
- current deterministic parser-backed support
- current limited/blocked areas
- whether image-only spec/dimension content appears to exist
- whether future image-derived dimension extraction is likely valuable

Do not claim this as implemented support.

## 3. Recommend next expansion priority
Choose the practical next priority order for:
- next seller/parser work
- next geometry/spec work
- next experimental/research track

This should explicitly state whether:
- more Livart coverage is next
- more Hanssem coverage is next
- Todayhouse should remain deprioritized until fetch is solved
- image-derived dimension extraction should begin as an experiment track or stay deferred

## 4. Produce an operator/developer-facing decision artifact
Add or update a focused doc that a developer/operator can use to decide:
- what is currently supported
- what is only partially supported
- what is blocked
- what should be worked on next
- where image-derived dimension extraction fits in the roadmap

# Completion Criteria
- Seller capability matrix is updated with current validated evidence
- Deterministic support vs future image-derived opportunity is clearly separated
- Next expansion priority is explicit and practical
- No code or contract drift occurs
- Validation is appropriate for doc-only changes

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed

Also report:
- which sources were updated
- what support states were assigned
- what next priorities were chosen
- where image-derived dimension extraction was placed in the plan

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Updated seller capability matrix
3. Deterministic support vs image-derived opportunity split
4. Next expansion priority recommendation
5. Docs / tooling changes
6. Deferred items and why
7. Validation results
8. Final approval recommendation