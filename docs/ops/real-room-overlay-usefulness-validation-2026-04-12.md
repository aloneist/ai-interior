# Real-Room Overlay Usefulness Validation - 2026-04-12

## Scope

Validate the existing bounded geometry overlay prototype against a very small set of real room-image contexts.

This step is intentionally narrow:

- no photoreal insertion
- no OCR or vision extraction
- no parser work
- no schema redesign
- no production UX rollout

## Exact Room-Image Contexts Reviewed

Validation used `2` real room-image contexts from persisted `spaces` rows:

1. `5fc530bc-dc40-40ec-a649-fa86bb6c1382`
   - image: `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85`
   - used with `LANDSKRONA` 3-seat sofa `s99415821`

2. `010a62d2-aef3-41c1-8b04-ac6fe78b6920`
   - image: `https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80`
   - used with `MITTZON` conference table `s29533451`

Why this set is acceptable:

- both are real room-image contexts from the current workflow persistence layer
- both keep the sample size very small
- both let the current prototype be judged in an actual visual room context rather than only on the abstract room board

## Usefulness-Evaluation Contract

The validation judged the prototype on these concrete questions:

- Is occupied-area guidance understandable?
- Is anchor placement meaning understandable?
- Does the room image improve comprehension versus the abstract room board alone?
- Does the overlay create false confidence about exact final placement?
- Is the current output still honest enough to continue?

## What Was Shown

The prototype route now shows:

- the original shared room board
- two real room-image cards
- one bounded floor-band footprint overlay per room image
- explicit text stating:
  - occupied floor area only
  - manually chosen floor-band anchor
  - not perspective-correct placement

This was a tiny refinement, not a redesign.

## What Users Would Likely Understand Correctly

### Sofa context

Likely correct understanding:

- the sofa would consume a large left-wall span
- front circulation would tighten
- the overlay is mainly about footprint and space loss, not appearance realism

Why this worked:

- the room image makes the footprint less abstract than the original board-only view
- the large sofa footprint reads clearly even without perspective realism

### Table context

Likely correct understanding:

- the table creates a centered occupied zone
- side and front clearance become the practical concern
- the overlay helps estimate whether the room still feels passable

Why this worked:

- table footprint is easy to interpret when shown against a visible real room floor area

## What Users Could Misunderstand

The misleading risk is real and should stay explicit.

Main risks:

- a user may overread the footprint rectangle as exact camera-space placement
- a user may assume the overlay proves collision safety
- a user may infer correct perspective and depth alignment even though the overlay is only a floor-band hint

The room image improves comprehension, but it also increases false-confidence risk if the prototype meaning is not labeled aggressively.

## Scaling And Anchor Judgment

Current judgment:

- acceptable for bounded validation
- too weak for broader rollout without tighter contract language

Why:

- the manual floor-band anchor is understandable enough for prototype review
- but the current scaling/anchor method is still heuristic, not scene-derived
- the room-image context makes this weakness more visible than the abstract room board did

This means the prototype is useful, but only if the contract stays honest:

- approximate occupied-area guidance
- not actual placed-furniture proof

## Tiny Refinements Made

Only small clarifications were added:

- real-room validation cards inside `/admin/overlay-prototype`
- stronger overlay-meaning label
- explicit anchor wording
- explicit misleading-risk copy per context

No larger UI or rendering redesign was introduced.

## Real-Room Usefulness Result

### Does the room image improve comprehension?

Yes.

The real room image makes the occupied-area guidance easier to understand than the abstract board alone.

### Does it also increase misleading risk?

Yes.

The same realism context that helps comprehension also makes it easier for users to overtrust the placement if the labeling is weak.

### Is the current output honest enough to continue?

Yes, but only with a narrow next step.

The current output is honest enough to continue because:

- the overlay meaning is now stated clearly
- the route does not pretend to be insertion
- the footprint guidance appears practically interpretable

But continuation should focus on contract tightening, not visual polish.

## Lane Decision

Decision:

- refine room-plane / anchor / scaling contract first

Why this is the right next order:

- the real-room context proved the overlay can be useful
- the main remaining weakness is not visual style
- it is the precision and explainability of room-plane, anchor, and scale assumptions

Do not do next:

- no photoreal insertion push
- no noisy OCR expansion
- no broad rollout based on visual impressiveness alone
