# Goal
Execute the remaining deterministic geometry follow-up queue for Hanssem, so the current text-based parser lane is either improved on the last real target rows or cleanly closed where no trustworthy text-based geometry remains.

# Scope
This task is limited to:
- re-reading the 3 current Hanssem deterministic follow-up rows
- inspecting their linked staged/source evidence narrowly
- determining whether any additional trustworthy text-based geometry can still be extracted
- implementing only the smallest Hanssem-specific parser change if a real narrow deterministic opportunity exists
- rerunning intake -> audit -> publish -> verify only for the affected Hanssem rows
- reclassifying any row to the image-heavy/source-absence lane if deterministic follow-up is no longer justified

This is not a UX task.
This is not a recommendation-redesign task.
This is not a new seller-expansion task.
This is not an image-derived geometry extraction task.

# Primary Objective
Close as much of the remaining deterministic Hanssem geometry lane as reality allows, without continuing to treat non-textual or source-absent pages as parser failures.

# Allowed Changes
- Read broadly across the relevant Hanssem parser, shared geometry helpers, linked published `import_jobs`, canonical `furniture_products`, and current classification metadata
- Add or update only the minimum Hanssem-specific parser logic if a real narrow deterministic opportunity exists
- Reuse shared helpers where appropriate
- Update classification/backfill results if the row should move out of the deterministic lane
- Add or update one focused ops/dev run artifact
- Add tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not implement OCR or image-derived geometry extraction in this step
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not change canonical identity semantics
- Do not turn this into broader Hanssem seller work beyond the 3 current deterministic follow-up rows

# Critical Safety Rule
If a row does not have trustworthy text-based outer-envelope geometry, do not keep forcing it through the deterministic parser lane. Reclassify it out of the queue instead of inventing geometry.

# Working Principles
- Read broadly, write narrowly
- Operate only on the 3 current deterministic follow-up rows
- Use current classification and staged/source evidence as the control surface
- Geometry contract v1.1 remains the truth standard
- Deterministic parser lane must stay clean and honest
- If no trustworthy text-based geometry exists, close the lane rather than stretching the parser

# Required Behavior / Structure

## 1. Re-read the current deterministic follow-up set
Inspect the exact 3 Hanssem rows currently in the deterministic follow-up queue.
At minimum include:
- the current canonical geometry state
- current canonical classification metadata
- linked published `import_jobs`
- staged parser/debug evidence
- product title and any trustworthy text-based geometry evidence still available

Do not expand beyond this queue unless strictly required for context.

## 2. Re-evaluate deterministic opportunity row by row
For each of the 3 rows, decide which of these is true:
- real deterministic geometry improvement is still possible
- only bounded partial improvement is possible
- no further trustworthy text-based geometry exists
- the row should be removed from deterministic follow-up and isolated into the image-heavy/source-absence lane

Do not guess from seller or category alone.

## 3. Implement the smallest safe parser improvement if justified
Only if one or more rows still have real trustworthy text-based geometry opportunity:
- make the smallest Hanssem-specific parser adjustment needed
- preserve debug/source metadata
- keep geometry contract v1.1 intact
- do not infer from images, marketing text, package text, or weak/unitless numbers

If no safe improvement exists, do not add code just to appear active.

## 4. Re-run operational validation
For affected rows only:
- rerun intake
- inspect staged geometry/spec output
- run quality audit
- publish or repeated-publish only where appropriate
- verify representative improved rows
- update canonical classification if queue status changed

## 5. Close or narrow the deterministic lane explicitly
End with one of these outcomes:
- deterministic follow-up queue shrinks because one or more rows are now resolved
- deterministic follow-up queue stays open but is narrower and better justified
- deterministic follow-up queue closes because the remaining rows are really source-absence/image-heavy and should not stay in deterministic KPI tracking

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1.1
- source-shape classification model

# Completion Criteria
- The 3 current deterministic follow-up rows were re-evaluated directly
- Any parser change remains narrow and Hanssem-specific
- Rows that no longer belong in deterministic follow-up are explicitly moved out of that lane
- Intake -> audit -> publish -> verify was rerun only where needed
- Final deterministic-lane status is stated honestly
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused intake/audit/publish/verify commands actually used

Also report:
- the exact 3 rows reviewed
- which rows improved, if any
- which rows were reclassified, if any
- the updated deterministic follow-up queue size
- the next execution order after this step

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact deterministic follow-up rows reviewed
3. What changed
4. Post-validation results
5. Queue outcome and reclassification result
6. Deferred items and why
7. Validation results
8. Final approval recommendation