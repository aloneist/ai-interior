# Goal
Refresh the canonical dimension completeness audit after the recent Hanssem/Livart geometry hardening and canonical geometry metadata propagation work, so the next geometry-hardening priority is based on current facts rather than stale counts.

# Scope
This task is limited to:
- re-measuring active canonical geometry completeness in `furniture_products`
- incorporating the recent Hanssem geometry improvements
- incorporating the recent Livart geometry improvements
- incorporating the recent canonical geometry metadata propagation/backfill results
- classifying full / partial / absent / diameter-compatible geometry states under geometry contract v1.1
- producing an updated geometry-priority decision artifact

This is not a UX task.
This is not a new seller-parser implementation task.
This is not an image-derived dimension extraction task.

# Primary Objective
Replace the now-stale geometry completeness snapshot with a refreshed, evidence-based canonical geometry audit that reflects the latest operational state.

# Allowed Changes
- Read broadly across relevant parser outputs, canonical catalog fields, import/publish mapping, geometry metadata propagation, runtime report surfaces, and geometry-contract docs
- Add or update a focused audit/report path if needed
- Add or update one focused ops/dev decision doc
- Add tiny validation helpers/logging if useful
- Make tiny report-only code changes if truly necessary

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not implement new seller geometry parsers in this step
- Do not implement OCR or image-derived dimension extraction in this step
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema in this step
- Do not loosen geometry quality rules
- Do not change canonical identity semantics

# Critical Safety Rule
Use geometry contract v1.1 as the truth standard. Do not count ambiguous, package-only, component-only, installation-only, or image-only hints as valid canonical outer-envelope geometry.

# Working Principles
- Read broadly, write narrowly
- Canonical geometry meaning is seller-invariant
- Dimension completeness is a critical product-completeness axis
- Geometry provenance and geometry completeness must be reported separately
- Diameter / round semantics must be counted explicitly where canonically preserved
- This step is about measurement and prioritization, not broad implementation

# Required Behavior / Structure

## 1. Re-read the current geometry state broadly
Inspect the relevant layers affecting canonical geometry state, including as needed:
- active canonical `furniture_products`
- linked published `import_jobs`
- parser/debug geometry provenance now preserved canonically
- current geometry contract v1.1 doc
- recent Hanssem geometry hardening outcome
- recent Livart geometry breadth completion outcome
- recent canonical geometry metadata propagation/backfill outcome

Do not limit analysis to one seller or one file.

## 2. Refresh active canonical dimension completeness
Measure active canonical rows and report at minimum:
- total active canonical products
- full `3d` geometry (`width_cm`, `depth_cm`, `height_cm`)
- `2d` envelope-only rows (`width_cm` + `depth_cm`, missing `height_cm`)
- one-axis partial rows
- fully absent geometry rows
- completeness by source site
- completeness by category if useful

## 3. Separate completeness from provenance
Report separately:
- how many rows now have canonically preserved geometry provenance metadata
- how many rows have usable geometry without rich provenance
- how many rows have neither geometry nor provenance
- whether provenance coverage now materially exceeds geometry completeness coverage

Do not collapse provenance and geometry into one number.

## 4. Classify geometry support more precisely
Use geometry contract v1.1 to distinguish at least:
- fully usable outer-envelope geometry
- partial but operationally usable geometry
- diameter/round-compatible geometry with canonical provenance preserved
- identity-only rows with no trustworthy canonical geometry
- rows where source likely lacks trustworthy text-based geometry entirely

## 5. Update the next geometry-hardening priority
Based on the refreshed audit, recommend the practical next order for:
- next seller-specific geometry hardening
- non-round shape semantics work if justified
- future image-derived geometry experimentation
- any further canonical metadata normalization if still needed

Be explicit about which seller/category should go next and why.

## 6. Produce a focused decision artifact
Add or update one doc that clearly states:
- the refreshed active canonical geometry completeness state
- the refreshed geometry provenance state
- the biggest remaining missing segments
- what is already operationally usable
- what remains partial
- what the next geometry-hardening priority is

# Completion Criteria
- Active canonical geometry completeness is re-measured
- The audit reflects recent Hanssem/Livart/provenance changes
- Geometry completeness and geometry provenance are reported separately
- Seller and category gaps are visible
- The next geometry-hardening priority is evidence-based
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed
- any focused audit/report command actually used

Also report:
- total active canonical count
- full/partial/absent geometry counts
- source-site breakdown
- category breakdown if used
- provenance coverage counts
- next geometry-hardening priority chosen

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Refreshed dimension completeness audit findings
3. What changed
4. Geometry support and provenance classification
5. Next geometry-hardening priority
6. Deferred items and why
7. Validation results
8. Final approval recommendation