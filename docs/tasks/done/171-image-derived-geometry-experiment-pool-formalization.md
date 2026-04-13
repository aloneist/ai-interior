# Goal
Formally separate the remaining image-heavy/source-absence rows from the deterministic parser backlog and define them as the official image-derived geometry experiment pool.

# Scope
This task is limited to:
- reading the current active canonical classification and execution-queue state
- deriving the current image-heavy/source-absence pool from approved canonical evidence
- documenting that pool as a separate experiment lane
- ensuring deterministic parser KPI tracking no longer includes this pool
- updating `docs/plan.md` because this changes the active execution order and lane structure
- defining the bounded success criteria for future image-derived geometry experiments

This is not a UX task.
This is not a new parser implementation task.
This is not an OCR or computer-vision implementation task.
This is not a schema redesign task.

# Primary Objective
Stop treating the remaining 8 image-heavy/source-absence rows as parser backlog and convert them into a formally recognized future experiment pool.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - source-shape classification docs
  - geometry queue split docs
  - deterministic follow-up closure doc
  - active canonical row evidence if needed
- Add or update focused ops docs
- Update `docs/plan.md`
- Add a tiny bounded helper/report script only if clearly necessary
- Preserve current queue derivation without adding redundant metadata if derivation is already safe

# Disallowed Changes
- Do not implement OCR or image-derived geometry extraction yet
- Do not reopen deterministic Hanssem rows
- Do not broaden into seller parser hardening
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not change canonical identity semantics

# Critical Safety Rule
Only rows already evidenced as `ineligible` + `image_heavy_or_absent` should enter this pool. Do not move rows into the experiment lane just because they are inconvenient.

# Working Principles
- Read broadly, write narrowly
- Use existing canonical classification as the control surface
- Keep deterministic parser lane closed unless new trustworthy text evidence appears
- Keep the experiment pool explicit, bounded, and operational
- Update `docs/plan.md` because active lane truth changes here
- Do not add redundant metadata if the pool is already safely derivable

# Required Behavior / Structure

## 1. Re-read the current queue and classification truth
Inspect:
- active canonical queue split
- current classification fields
- deterministic follow-up closure result
- current plan state

## 2. Define the formal experiment-pool assignment rule
Use a bounded rule such as:
- active canonical row
- real seller row, not QA fixture
- `parser_lane_eligibility = ineligible`
- `geometry_source_shape = image_heavy_or_absent`

Also state whether geometry must be absent or may include unusable/insufficient partial states.

## 3. Produce the live experiment pool
Report:
- total pool count
- seller breakdown
- category breakdown
- representative rows
- why these rows are excluded from deterministic parser KPI tracking

## 4. Define the future experiment contract
Document the minimum future success criteria for image-derived geometry experiments, such as:
- distinguish outer-envelope geometry from component/package dimensions
- reject ambiguous image text
- preserve confidence/provenance
- not overwrite trustworthy text-derived geometry
- remain separate from deterministic parser metrics

## 5. Decide whether extra metadata is necessary
Default:
- no new canonical field if the pool is safely derivable from current metadata

Only add a new field if derivation is not operationally stable enough.
If no new field is added, say so explicitly.

## 6. Update `docs/plan.md`
Reflect that:
- deterministic parser lane is closed
- image-heavy/source-absence rows are now the formal image-derived geometry experiment pool
- next lane priority is image-derived experiment design, not more deterministic parser hardening

## 7. End with the next execution order
After this step, recommend the next order for:
- image-derived experiment design/spec
- candidate evaluation order inside the pool
- any later deterministic revisit only if new text evidence appears

# Completion Criteria
- The 8-row image-heavy/source-absence set is formally separated from parser backlog
- Deterministic parser KPI tracking no longer includes this pool
- `docs/plan.md` is updated
- The future image-derived experiment contract is documented
- No OCR/vision implementation is attempted
- No ranking/UX/schema sprawl occurs

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed
- any focused report/read command actually used

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Formal experiment-pool rule
3. What changed
4. Focused validation results
5. Pool breakdown and examples
6. Deferred items and why
7. Validation results
8. Final approval recommendation