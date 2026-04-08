# Goal
Close the minimum MVP user flow on top of the already-hardened canonical product/backend contract, using the previously validated UX direction as the baseline.

# Scope
This task covers only the minimum user-facing flow needed to make the MVP feel continuous and understandable:

- upload
- condition input
- recommendation results
- save / compare
- product detail
- outbound purchase transition

The work should stay tightly scoped to flow clarity, state continuity, and explicit use of the existing canonical product contract.

# Primary Objective
Make the existing MVP flow usable end-to-end without confusion, using the already-established backend contract and canonical product identity model.

# Allowed Changes
- Update or refine current MVP UI flow components, hooks, local state, and lightweight shared UI helpers
- Add minimal screens/sections/cards/modals/drawers if needed for flow continuity
- Wire existing save / compare / detail / outbound contracts into the current UX
- Improve empty/error/loading states where they directly affect the minimum flow
- Add minimal copy/labels/status indicators that clarify the flow
- Add small shared types/helpers for view-state consistency

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not add broad new product features
- Do not build a large design system refactor
- Do not create a broad account/user system
- Do not add heavy animation/polish work
- Do not redesign the overall product concept
- Do not attempt full compare persistence infrastructure
- Do not expand beyond the minimum MVP flow

# Critical Safety Rule
Do not introduce any UI flow that hides or breaks the canonical product identity model. Save, compare, detail, and outbound actions must all continue to resolve from canonical `furniture_products.id`-based recommendation items.

# Working Principles
- Flow clarity over visual novelty
- Minimum complete experience over feature breadth
- Reuse the already-locked backend contracts
- Keep failure states explicit
- Keep compare/save/detail behavior small but coherent
- Prefer continuity and predictability over clever UI

# Required Behavior / Structure

## 1. Upload -> condition input continuity
The user should move from image upload to condition input without ambiguity.

Expected behavior:
- Uploaded image context remains visible or clearly remembered
- Condition input state is explicit and easy to review
- The user can understand what will affect recommendations

## 2. Recommendation result readability
The recommendation screen must be easy to scan and act on.

Expected behavior:
- Recommended products are visually distinguishable and actionable
- Save / compare / detail / outbound entry points are obvious
- The user can tell which actions are available without hunting
- Product identity should not depend on fragile implicit client assumptions

## 3. Save / compare UX closure
Use the already-defined backend/shared contract to make save and compare understandable.

Expected behavior:
- Save action visibly reflects state
- Compare selection uses the shared max-selection rule
- Compare behavior should feel deliberate, not accidental
- If compare is still client-only, the UI must still clearly operate on canonical recommendation items

## 4. Product detail / outbound continuity
The user must be able to inspect and then leave to purchase without confusion.

Expected behavior:
- Detail view uses the existing recommendation payload / canonical product contract
- Outbound action uses the centralized outbound resolver behavior
- Affiliate URL preference remains intact
- The transition from result -> detail -> purchase should feel continuous

## 5. Explicit failure / empty states
Do not leave users guessing why something failed or why nothing appeared.

Expected behavior:
- Show clear empty/failure states when recommendation generation fails or returns weak/no results
- Keep failure categories understandable at the product level:
  - analysis failure
  - insufficient candidates
  - budget mismatch
  - missing product information
- Do not overengineer; just make the current MVP understandable

## 6. State continuity
The minimum flow must preserve enough state so the user experience feels connected.

Expected behavior:
- Selected save/compare state remains coherent within the current session flow
- Detail view can be opened from recommendation items without identity drift
- Navigation/back behavior should not feel like starting over unless intentionally reset

# Completion Criteria
- The minimum MVP flow feels continuous from upload to outbound purchase
- Save / compare / detail / outbound actions are visible and coherent
- Canonical product identity is preserved throughout the flow
- No broad redesign or unnecessary subsystem expansion
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also show:
- which UI components/screens/hooks were updated
- how save / compare / detail / outbound continuity was improved
- what empty/error/loading states were added or clarified
- any intentionally deferred UX gaps

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Flow decisions applied
4. Deferred items and why
5. Validation results
6. Risk notes
7. Final approval recommendation