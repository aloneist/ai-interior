# Placement Eligibility And Geometry Overlay Contract - 2026-04-12

## Scope

Define the operational placement-eligibility contract for canonical catalog products.

This step is intentionally narrow:

- no OCR or vision implementation
- no parser implementation
- no room-insertion implementation
- no geometry-overlay rendering implementation
- no UX redesign
- no schema redesign

## Why This Contract Exists

The product goal is actionable, purchasable recommendation plus execution-safe placement guidance.

That means:

- recommendation eligibility is not the same as placement eligibility
- geometry-overlay guidance is a valid service direction even when real-image insertion is not trustworthy
- fake visual realism is lower priority than honest room-fit and occupied-area guidance

The current image-derived lane also showed that usable image surfaces are narrow and uneven. Future OCR or vision work must therefore stay subordinate to placement eligibility rules instead of redefining them.

## Core Separation

The canonical catalog may contain products that are:

- recommendable for purchase intent
- usable for geometry overlay guidance
- usable for real-image room insertion

These are not the same population.

Recommendation answers "should this product be shown and purchased."
Placement answers "how safely can this product be represented inside the user's room."

## Eligibility Model

Use this compact operational model.

| State | Meaning | Default use |
| --- | --- | --- |
| `recommendable` | Canonical product is valid for recommendation, save/compare/click, and purchase handoff. | Recommendation/runtime |
| `overlay-ready` | Product has trustworthy geometry and footprint meaning sufficient for honest occupied-area or room-fit guidance. | Geometry overlay fallback |
| `insertion-ready` | Product satisfies the stricter geometry plus asset-quality rules for real-image room insertion. | Real-image placement |
| `insertion-ineligible` | Product must not be used for real-image insertion because insertion trust conditions are not met. | Default exclusion for insertion |
| `bundle-only` | Product is a multi-item or bundled composition whose recommendation use may remain valid, but placement use is excluded by default. | Recommendation-only by default |

## State Relationship Rules

- `recommendable` is the broadest state.
- `overlay-ready` requires `recommendable`, but does not require clean cutout-ready imagery.
- `insertion-ready` requires `overlay-ready` plus stricter asset and interpretation quality.
- `insertion-ineligible` may still be `recommendable`.
- `bundle-only` products may still be `recommendable`, but are excluded from placement-ready inventory by default.

Operationally:

- do not treat "recommendable" as implied placement readiness
- do not treat "overlay-ready" as implied insertion readiness
- when insertion is not trustworthy, prefer honest geometry overlay rather than fake compositing

## `overlay-ready` Contract

`overlay-ready` is the minimum placement-safe fallback class.

A product is `overlay-ready` only when all of the following are true:

- canonical product is active and `recommendable`
- trustworthy overall outer-envelope geometry is available under geometry contract `v1.1`
- footprint meaning is known well enough to interpret occupied area safely
- geometry is product-level, not component-level, package-level, or internal-compartment geometry
- the product can be represented honestly as footprint/occupied volume guidance without pretending visual realism

Minimum geometry requirements:

- trustworthy `width_cm` and `depth_cm`
- trustworthy footprint interpretation:
  - rectangular envelope, or
  - round/diameter semantics, or
  - another trustworthy outer-envelope interpretation preserved by metadata

Height:

- `height_cm` is strongly preferred
- missing `height_cm` may still allow limited overlay use when `width_cm` and `depth_cm` are trustworthy and the guidance is explicitly footprint-first

`overlay-ready` does not require:

- transparent cutout assets
- perfect silhouette extraction
- multi-angle imagery
- clean product/background separation

The overlay contract is geometry-first, not image-cleanliness-first.

## `insertion-ready` Contract

`insertion-ready` is the stricter class for real-image room insertion.

A product is `insertion-ready` only when all of the following are true:

- already satisfies `overlay-ready`
- product image assets are clean enough to separate the product from the background with low ambiguity
- the visible outer silhouette is stable enough for believable and safe placement interpretation
- viewpoint/shape understanding is sufficient to avoid obvious geometry or perspective mismatch
- the product asset quality is strong enough that insertion will not fabricate misleading realism

Minimum insertion asset requirements:

- product is visually dominant in the source asset
- product/background boundary is stable and separable
- product is not materially occluded by props, room staging, text blocks, or overlapping objects
- asset resolution is sufficient to preserve edges and major shape features after placement
- image content supports product-level interpretation rather than only mood/lifestyle presentation
- asset viewpoint is usable for the intended insertion mode and does not create obvious geometry ambiguity

Insertion interpretation requirements:

- asset meaning must stay aligned with the trustworthy outer-envelope geometry
- image must not force guessing about missing sides, footprint, or assembled shape
- if the product has complex or asymmetric form, the available asset set must still support a stable placement interpretation

If these conditions are not met, the correct outcome is `insertion-ineligible`, not forced insertion.

## Default Insertion Exclusion Rules

Exclude a product from real-image insertion by default when any of the following is true:

- bundle furniture or multi-item set is the canonical sold object
- product image is cluttered, noisy, or heavily decorated
- product image is lifestyle-heavy rather than product-isolated
- the product is partially occluded
- asset resolution is too low for stable boundary or silhouette interpretation
- product/background separation is unstable
- only a single weak angle exists and it does not support safe insertion interpretation
- the visible image surface mixes multiple objects or modules without proving the exact inserted object
- the asset implies multiple valid silhouettes, extension states, or assembled forms
- the trustworthy geometry is missing, partial, or ambiguous for the intended placement use

Default rule:

- when exclusion is triggered, the product becomes `insertion-ineligible`
- if geometry remains trustworthy, it may still be `overlay-ready`
- if the catalog row remains commercially valid, it may still be `recommendable`

## Bundle Furniture Rule

Bundle furniture is a special high-risk case.

Default contract:

- bundle furniture may remain `recommendable`
- bundle furniture is excluded from room insertion by default
- bundle furniture is excluded from placement-ready inventory by default unless a strict exception is proven

Why:

- bundle PDPs often mix multiple inserted objects under one purchase identity
- bundle imagery often shows staged compositions rather than one stable inserted item
- bundle geometry often combines table/chair, bed/mattress, or sectional/module semantics that are unsafe to collapse into one inserted silhouette

Strict exception rule:

Only consider a bundled product for placement readiness when all of the following are clearly true:

- one dominant placed object is operationally the real placement target
- trustworthy overall geometry exists for that exact placed object
- the imagery and naming make the inserted object unambiguous
- the remaining bundled components do not materially distort footprint or silhouette interpretation

If any of these fail, keep the row `bundle-only` and `insertion-ineligible`.

## Geometry Overlay Fallback Value

Geometry overlay is an explicit valid service direction, not a degraded mistake.

It remains useful because it can honestly provide:

- room-fit guidance
- occupied-area visualization
- collision risk communication
- circulation or movement-path risk communication
- placement-safe guidance without pretending photorealistic insertion

This matters because many recommendable products will never satisfy high-trust insertion conditions, especially when:

- seller imagery is noisy or lifestyle-heavy
- product/background separation is weak
- image-derived geometry surfaces are absent
- the sold object is a bundle or ambiguous set

In those cases, geometry overlay is the safer service:

- it preserves truthful footprint guidance
- it reduces fake certainty
- it still helps the user understand fit and placement consequences

## Relationship To The Image-Derived Lane

Future OCR or vision work must remain subordinate to this contract.

That means:

- image-derived geometry can only help a product become `overlay-ready` if it proves trustworthy outer-envelope geometry under geometry contract `v1.1`
- image-derived geometry alone does not make a product `insertion-ready`
- readable size text in an image does not override bundle ambiguity or weak insertion assets
- narrow OCR upside on a few rows does not justify treating recommendable inventory as insertion-ready inventory

## Operational Decision Order

Evaluate placement in this order:

1. Is the canonical row still `recommendable`?
2. Is trustworthy outer-envelope geometry sufficient for `overlay-ready`?
3. If yes, do the assets also satisfy the stricter `insertion-ready` rules?
4. If not, keep the row `insertion-ineligible` and use geometry overlay as the fallback placement direction.

## Current Product Direction Locked

Current approved direction after this contract:

- recommendation inventory and placement inventory are different sets
- geometry overlay is a first-class fallback direction
- bundle furniture is excluded from insertion by default
- weak/noisy product assets are excluded from insertion by default
- future OCR or vision work is bounded by these placement rules, not the reverse
