# Goal
Audit dimension completeness across the active canonical catalog under geometry contract v1.1, so the team can see where operational geometry is truly usable, where it is partial, and where seller-specific hardening is still required.

# Scope
This task is limited to:
- measuring canonical dimension completeness across active `furniture_products`
- classifying completeness by seller, category, and page-pattern where useful
- distinguishing geometry present/partial/absent states under geometry contract v1.1
- identifying where diameter / non-rectangular semantics are already representable versus still missing
- producing a focused decision artifact that sets the next geometry-hardening priority

This is not a UX task.
This is not a new seller-parser implementation task.
This is not an image-derived dimension extraction task.

# Primary Objective
Create an evidence-based geometry completeness snapshot for the active canonical catalog so future geometry hardening is driven by real coverage gaps, not guesses.

# Allowed Changes
- Read broadly across relevant parser outputs, canonical catalog fields, import/publish mapping, runtime quality reporting, and geometry-contract docs
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
Use geometry contract v1.1 as the truth standard. Do not count ambiguous, sub-dimension, packaging, component, or image-only guesses as valid canonical outer-envelope geometry.

# Working Principles
- Read broadly, write narrowly
- Canonical geometry meaning is seller-invariant
- Dimension completeness is a critical product-completeness axis
- Missing geometry must be surfaced, not hand-waved
- Diameter / round semantics must be counted explicitly where represented
- This step is about measurement and prioritization, not broad implementation

# Required Behavior / Structure

## 1. Re-read the current geometry path and contract
Inspect the relevant layers that affect canonical dimensions, including as needed:
- site parsers
- shared geometry/dimension helpers
- parser debug metadata structures
- import-product mapping into staged geometry fields
- publish mapping into canonical product rows
- current geometry contract v1.1 doc
- any runtime/report surfaces already exposing geometry quality

Do not limit analysis to one seller file.

## 2. Audit active canonical dimension completeness
Measure active `furniture_products` under the current canonical geometry fields.

At minimum report:
- total active canonical products
- how many have all three of `width_cm`, `depth_cm`, `height_cm`
- how many have partial dimensions
- how many have no canonical dimensions
- completeness by source site
- completeness by category if useful
- any concentration of missing dimensions in newly published seller lanes

## 3. Classify the geometry state more precisely
Use geometry contract v1.1 to distinguish at least:
- fully usable outer-envelope geometry
- partial but operationally usable geometry
- diameter/round-compatible geometry
- identity-only rows with no trustworthy canonical geometry
- rows where the source likely lacks trustworthy text-based geometry entirely

Do not collapse all missing cases into one bucket.

## 4. Surface metadata/shape semantics where present
If the current data already preserves any round/diameter semantics, report:
- how many rows appear round/diameter-based
- whether diameter metadata exists or is still absent
- whether current rows already fit the v1.1 representation safely

If the data does not yet preserve that semantics, state it clearly.

## 5. Recommend the next geometry-hardening order
Based on real audit findings, recommend the practical next order for:
- seller-specific geometry hardening
- diameter metadata normalization
- category-specific geometry work
- later image-derived geometry experimentation

Be explicit about which seller/category should go next and why.

## 6. Produce a focused decision artifact
Add or update one doc that clearly states:
- the active canonical geometry completeness state
- the biggest missing segments
- what is already operationally usable
- what remains partial
- what the next geometry-hardening priority is

# Completion Criteria
- Active canonical geometry completeness is explicitly measured
- The audit distinguishes full / partial / absent / diameter-compatible states
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
- next geometry-hardening priority chosen

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Dimension completeness audit findings
3. What changed
4. Geometry support classification
5. Next geometry-hardening priority
6. Deferred items and why
7. Validation results
8. Final approval recommendation