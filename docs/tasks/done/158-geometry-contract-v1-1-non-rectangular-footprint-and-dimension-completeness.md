# Goal
Extend geometry contract v1 into v1.1 so canonical product geometry can safely represent non-rectangular footprints, especially diameter-based products, while keeping current canonical core fields and seller-specific parsing intact.

# Scope
This task is limited to:
- reading the current geometry-related parser, shared-helper, import, publish, and quality-review paths
- defining geometry contract v1.1 for non-rectangular / diameter-based products
- deciding how canonical core fields and metadata/debug fields should represent diameter cases
- defining dimension completeness as a critical product-completeness concern
- documenting the practical implementation implications for future seller parsers

This is not a UX task and not a new seller-parser implementation task.

# Primary Objective
Lock a safe and seller-invariant canonical geometry meaning for products whose trustworthy overall size is not a simple rectangular width/depth pair, so future geometry extraction does not drift across sellers.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, publish, and quality-review layers
- Add or update one focused contract/spec doc
- Add tiny clarifying comments only if truly helpful and tightly scoped
- Add a small implementation note or parser responsibility note if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not implement OCR/image-derived dimension extraction in this step
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema broadly in this step
- Do not implement multi-seller parser patches in this step
- Do not loosen geometry quality rules

# Critical Safety Rule
Canonical geometry must remain safe for downstream room-fit and future image-placement use. If trustworthy overall dimensions are uncertain, ambiguous, or sub-component-only, they must not be written into canonical core fields.

# Working Principles
- Read broadly, write narrowly
- Canonical core fields remain:
  - `width_cm`
  - `depth_cm`
  - `height_cm`
- Core fields represent overall outer envelope, not arbitrary source dimensions
- Canonical unit remains `cm`
- Source `mm` and `m` normalize into `cm`
- Overall range dimensions use the maximum value
- Sub-dimensions do not populate core fields
- Non-rectangular footprint semantics must be explicit, not implied
- Seller DOM/block selection stays seller-specific

# Required Behavior / Structure

## 1. Re-read the current geometry path broadly
Inspect relevant layers affecting geometry meaning and propagation, including as needed:
- site parsers
- category parsers
- shared geometry/dimension helpers
- parser debug metadata structures
- import-product mapping into staged geometry fields
- publish mapping into canonical product rows
- current quality-review rules involving dimensions

Do not limit analysis to one seller file or one helper file.

## 2. Define geometry contract v1.1 for non-rectangular products
At minimum, define:
- what canonical core fields still mean
- how diameter-only trustworthy overall dimensions should be represented
- how round/circular footprint products should be encoded
- how to distinguish overall diameter from sub-component diameter
- how range-based diameter should be handled
- how ambiguity should remain null

## 3. Choose the canonical representation for diameter cases
Make an explicit decision for products where trustworthy overall diameter is known.

The recommended target should be:
- `width_cm = diameter_cm`
- `depth_cm = diameter_cm`
- preserve explicit metadata/debug semantics such as:
  - `footprint_shape = round`
  - `diameter_cm`
  - `width_is_diameter = true`
  - `depth_is_diameter = true`

If a different bounded transitional rule is chosen, it must be justified against downstream collision/placement safety.

## 4. Define dimension completeness importance
Document that dimensions are not optional “nice-to-have” metadata.
They are critical completeness fields for:
- room-fit logic
- geometry-safe recommendation interpretation
- future image-placement work
- collision-safe outer-envelope reasoning

At the same time, do not instantly convert missing dimensions into a universal publish blocker for every seller in this step.

## 5. Define implementation implications
State clearly:
- what remains seller-specific
- what shared helpers should normalize
- how metadata/debug should preserve source-grounded dimension meaning
- what future parser work must do for round/diameter products
- what image-derived dimension extraction may later add, but does not replace now

## 6. End with the practical next execution order
After this contract is locked, recommend:
- the next scoring coverage/backfill step
- the next geometry completeness audit step
- where image-derived dimensions fit in the roadmap

# Completion Criteria
- Geometry-related layers were reviewed broadly enough
- Geometry contract v1.1 is explicit and operationally usable
- Diameter / non-rectangular semantics are clearly defined
- Core-field meaning stays safe for downstream use
- Dimension completeness is elevated appropriately without impulsive gate loosening/tightening
- No broad code or schema drift occurs

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code/comments changed
- `npm run lint` only if code/comments changed
- `npm run build` only if code/comments changed

Also report:
- which geometry-related layers/files were reviewed
- the final v1.1 rules
- the chosen diameter representation
- the implementation implications
- the next execution order after the contract update

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Geometry layers reviewed
3. Geometry contract v1.1
4. Implementation implications
5. What changed
6. Deferred items and why
7. Validation results
8. Final approval recommendation