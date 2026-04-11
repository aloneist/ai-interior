# Goal
Turn the newly classified active canonical catalog into explicit execution queues, so deterministic parser follow-up work and future image-heavy/source-absence work stop being mixed together.

# Scope
This task is limited to:
- reading the current active canonical classification state
- separating the remaining geometry work into bounded execution queues
- defining which rows belong to the deterministic parser follow-up lane
- defining which rows belong to the image-heavy/source-absence lane
- documenting the queue split and next action order
- optionally preserving a bounded queue label in canonical metadata if clearly useful

This is not a UX task.
This is not a recommendation-redesign task.
This is not a new seller-parser implementation task.
This is not an image-derived geometry extraction implementation task.

# Primary Objective
Make the current geometry backlog operationally actionable by splitting it into the right lanes instead of continuing to treat all geometry-missing rows as the same kind of problem.

# Allowed Changes
- Read broadly across active canonical `furniture_products`, linked published `import_jobs`, current geometry provenance metadata, the refreshed completeness audit, and the recent source-shape classification work
- Add or update a focused ops/dev decision doc
- Add or update a tiny audit/report helper if useful
- Add a small bounded metadata label only if clearly justified and safe
- Add tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not implement new seller parser logic in this step
- Do not implement OCR/image-derived geometry extraction in this step
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not change canonical identity semantics
- Do not turn this into a broad seller-hardening task

# Critical Safety Rule
Queue assignment must follow the existing evidence-based classification and canonical geometry state. Do not send image-heavy/source-absent rows back into normal deterministic parser-gap counting.

# Working Principles
- Read broadly, write narrowly
- Existing classification is the control surface
- Geometry completeness and geometry provenance must still be interpreted correctly
- Deterministic parser lane and image-heavy/source-absence lane must remain separate
- Queue design should be small, explicit, and operational
- Do not create a sprawling new taxonomy or a new schema contract

# Required Behavior / Structure

## 1. Re-read the current classified canonical state
Inspect all relevant layers, including as needed:
- active canonical `furniture_products`
- current canonical classification fields:
  - `parser_lane_eligibility`
  - `geometry_source_shape`
  - `geometry_source_reason`
- linked published `import_jobs`
- current geometry completeness/provenance audit docs
- recent Hanssem and Livart geometry outcomes

Do not limit analysis to one seller.

## 2. Define the execution queue model
At minimum define these operational lanes:

### A. Deterministic parser follow-up queue
Rows that are still worth text-based deterministic parser hardening.

This should generally include:
- `eligible`
- `conditional`

Only where geometry is still partial or absent and real seller/category follow-up still makes sense.

### B. Image-heavy / source-absence queue
Rows that should stop being counted as normal deterministic parser failures.

This should generally include:
- `ineligible`
- `image_heavy_or_absent`

These rows are not necessarily bad data; they are the future experiment/backlog lane.

### C. Optional resolved / no-action-needed bucket
If useful, explicitly exclude rows that already have fully usable geometry and do not need queueing.

Keep the model small and operational.

## 3. Define assignment rules
State clearly how rows enter each queue.

Examples:
- fully usable geometry + `eligible` -> resolved, no immediate action
- partial geometry + `eligible` or `conditional` -> deterministic follow-up queue
- absent geometry + `eligible` or `conditional` -> deterministic follow-up queue only if trustworthy text-grounded follow-up still makes sense
- `ineligible` + `image_heavy_or_absent` -> image-heavy/source-absence queue
- QA fixture rows should be explicitly separated from real operational backlog if they appear

Do not guess from seller name alone.

## 4. Produce the current queue split from active canonical rows
Using the current active canonical catalog, report:
- total rows in deterministic follow-up queue
- total rows in image-heavy/source-absence queue
- total resolved/no-action-needed rows
- source breakdown
- category breakdown if useful
- representative examples from Hanssem, Livart, and IKEA if relevant

The result should be operationally actionable, not abstract.

## 5. Optionally preserve queue metadata
Only if clearly useful and still bounded, preserve a small queue indicator in canonical `metadata_json`, such as:
- `geometry_execution_lane`
- `geometry_followup_priority`

Do not add this unless it helps future operations materially.

## 6. End with the next action order
After the queue split, recommend the next order for:
- deterministic parser follow-up
- image-heavy/source-absence isolation
- later image-derived geometry experiment lane

Be explicit about which seller/category should be worked next and which bucket should not be mixed into deterministic parser KPI tracking.

# Completion Criteria
- The full active canonical catalog is interpreted through the current classification
- Deterministic follow-up and image-heavy/source-absence rows are clearly separated
- Current backlog is converted into an execution-ready queue split
- Queue assignment is evidence-based, not guessed
- Canonical geometry meaning remains unchanged
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed
- any focused audit/backfill/report commands actually used

Also report:
- total rows in each queue
- seller/category breakdown
- representative examples
- whether any bounded queue metadata was added
- next execution order after the split

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Execution queue model and assignment rules
3. What changed
4. Focused validation results
5. Queue breakdown and examples
6. Deferred items and why
7. Validation results
8. Final approval recommendation