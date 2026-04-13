# Bounded Geometry Overlay Prototype - 2026-04-12

## Scope

Implement a very small geometry overlay prototype using only the vetted IKEA clean-control set.

This step is intentionally narrow:

- no real-image insertion
- no OCR or vision extraction
- no parser work
- no schema redesign
- no production UX polish

## Exact Prototype Rows Used

The prototype uses `2` already-vetted IKEA control rows:

- `LANDSKRONA` 3-seat sofa `s99415821`
- `MITTZON` conference table `s29533451`

Why these two:

- both already have trusted full `3d` geometry
- both have clear rectangular footprint meaning
- both are non-bundle products
- together they cover two placement-relevant categories with different occupied-area shapes

The second `LANDSKRONA` variant from the control baseline was not used in the UI to keep the prototype minimal.

## Prototype Contract

The prototype explicitly shows:

- one simplified room board
- a stated anchor origin
- occupied width/depth area
- simple footprint rectangle or rounded rectangle
- category-aware labeling
- dimension annotation

The prototype explicitly does not claim:

- realistic insertion
- true perspective matching
- exact final placement correctness
- collision-proof automation

## Implementation Path

Prototype route:

- `app/admin/overlay-prototype/page.tsx`

Static sample data:

- `lib/overlay/prototype-data.ts`

Why this path:

- keeps the work isolated from the main MVP flow
- avoids accidental product-contract overclaim
- is sufficient to judge whether honest occupied-area guidance is understandable

## Prototype Assumptions

### Scale

Scale is approximate.

The room board uses a simple linear plan-view mapping from room centimeters to board dimensions.
This is a geometry-guidance approximation, not a calibrated camera-space scale.

### Anchor placement

Anchor placement is manually chosen per sample.

Current prototype anchors are:

- sofa: left-wall biased placement with front clearance preserved
- table: center-weighted placement with balanced side clearance

This is a demonstrative placement assumption, not automated layout intelligence.

### Overlay meaning

The overlay means:

- occupied floor area
- rough width/depth usage
- simple placement footprint guidance

It does not mean:

- true inserted furniture
- exact visual fit from the viewer camera
- guaranteed clearance correctness

## Usefulness Judgment

### What worked

- occupied-area guidance is easy to read
- the difference between sofa span and table span is immediately visible
- the output is more honest than fake insertion because it shows what the system actually knows: footprint and placement assumption
- the route is small enough to support quick review without changing the main app flow

### What remains missing

- camera-aware room scale
- better anchor selection logic
- richer footprint types beyond simple rectangular envelopes
- explicit clearance or circulation measurements
- user testing on whether the overlay actually reduces fit anxiety

## Continue Or Stop

Current judgment:

- continue, but continue narrowly

Why:

- the prototype successfully demonstrates an honest overlay mode on trusted geometry
- it is more truthful than pretending broad insertion readiness
- the next decision should depend on whether reviewers find the occupied-area guidance useful, not whether the output looks flashy

## Next Order

1. Review whether the current overlay is understandable enough to improve room-fit reasoning.
2. If yes, add only the next-smallest overlay improvements:
   - clearer clearance labels
   - one more vetted footprint type if needed
   - tighter anchor/placement explanation
3. Keep real-image insertion and noisy OCR work out of the immediate lane.
