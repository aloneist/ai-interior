# Fit-Confidence Product / UX / Data Contract - 2026-04-12

## Scope

Realign the current product definition around actionable recommendation, fit-confidence guidance, and geometry overlay.

This step is intentionally narrow:

- no OCR or vision extraction work
- no room-insertion implementation
- no ranking or scoring redesign
- no broad schema migration
- no parser-lane reopening

## Current Product Promise

The current product is:

- recommendable furniture on canonical product identity
- fit-confidence guidance for real buyer decisions
- geometry overlay when placement meaning is trustworthy
- save / compare / outbound purchase flow

The product does not currently promise:

- photoreal room insertion
- camera-accurate furniture placement
- collision-proof automatic layout
- room understanding from image input alone

Real-image insertion remains a deferred, higher-trust lane. It must not be described as the present core product.

## Primary UX Flow

The current primary UX flow is:

1. room photo upload
2. user-provided room-context inputs
3. recommendation results
4. fit judgement guidance
5. geometry overlay when eligible
6. save / compare / outbound purchase

Operational meaning:

- the room photo provides useful context, but it is not enough on its own to claim exact placement
- user-confirmed room inputs provide the minimum honesty layer for fit-confidence guidance
- recommendation remains the core business action
- geometry overlay is a bounded explanatory aid, not fake realism

## Placement Eligibility Vocabulary

Use this vocabulary consistently across product, ops, and future implementation work.

| State | Meaning | Default use |
| --- | --- | --- |
| `recommendable` | Canonical product is valid for recommendation, save/compare/click, and purchase handoff. | Recommendation/runtime |
| `overlay-ready` | `recommendable` plus trustworthy outer-envelope geometry and footprint meaning sufficient for honest occupied-area guidance. | Fit-confidence overlay |
| `insertion-ready` | `overlay-ready` plus stricter asset cleanliness and interpretation quality for real-image placement. | Deferred insertion lane |
| `insertion-ineligible` | Product must not be used for real-image insertion because insertion trust conditions are not met. | Default exclusion from insertion |
| `bundle-only` | Product may still be commercially recommendable, but placement use is excluded by default unless a strict exception is proven. | Recommendation-only by default |

State relationship rules:

- `recommendable` is broader than placement-ready states
- `overlay-ready` does not imply `insertion-ready`
- `insertion-ineligible` does not remove recommendation eligibility
- `bundle-only` may still be `recommendable`
- the correct fallback when insertion is unsafe is geometry overlay, not forced realism

## Canonical And Staging Ownership

Placement-related meaning must stay aligned with canonical product ownership.

### `furniture_products`

`furniture_products` remains:

- the canonical active product catalog
- the runtime source of active recommendation identity
- the canonical owner of placement-related meaning used by runtime

This means:

- recommendation/save/click/compare identity stays tied to canonical product IDs
- placement readiness must be described as product-level canonical meaning
- future placement metadata belongs to the canonical product contract, not to staging as runtime truth

### `import_jobs`

`import_jobs` remains:

- staging and review only
- the place where provisional evidence may be inspected before publish
- not a runtime placement contract surface

Operational rule:

- any placement-related evidence on an import row is provisional until publish
- staged evidence may inform review, but it must not redefine runtime truth before canonical publish
- `published_product_id` remains the only approved staged-to-canonical identity link

## Room-Side Input Contract

Fit-confidence guidance currently depends on user-confirmed room context.

Minimum current input contract:

- target wall or placement zone
- known reference measurement for scale
- usable width
- usable depth
- keep-out or clearance constraints
- anchor preference or placement side

Optional but valuable inputs:

- circulation sensitivity
- must-keep-clear areas such as doors, swings, vents, or walk paths
- preferred front clearance or side clearance expectations

Contract rule:

- camera-only inference is not the current product contract
- if the user-confirmed room context is weak, the guidance must stay correspondingly bounded
- room photo context may improve comprehension, but it does not replace explicit room constraints

## Bundle And Weak-Asset Handling

Bundle and weak-asset rules stay explicit.

### Bundle furniture

- bundle furniture may be `recommendable`
- bundle furniture is placement-excluded by default
- bundle furniture is not `insertion-ready` by default
- only a strict proven exception may move a bundled row beyond `bundle-only`

### Weak or noisy assets

- weak, noisy, lifestyle-heavy, cluttered, or ambiguous assets may still be `recommendable`
- those assets are not `insertion-ready` by default
- if the geometry is trustworthy, the product may still be `overlay-ready`

### Geometry-first fallback

When asset quality is too weak for insertion but geometry is trustworthy:

- preserve recommendation eligibility if the product is commercially valid
- keep the row `insertion-ineligible`
- allow geometry overlay only when the occupied-area meaning remains honest

## Current Guardrails

- do not collapse recommendation readiness into insertion readiness
- do not let insertion ambition redefine the present product promise
- do not turn this doc into a schema redesign
- do not reopen OCR, parser, or image-derived implementation work from this step
- do not change ranking, scoring, or canonical identity ownership here
