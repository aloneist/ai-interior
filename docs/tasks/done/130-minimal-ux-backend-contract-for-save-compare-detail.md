# Goal
Close the minimum backend contract required for the MVP user flow after recommendation generation: save, compare, product detail state, and outbound purchase handling based on canonical product identity.

# Scope
This task is limited to the backend/server-side contract and minimal client wiring strictly required to support the next UX step safely.

# Primary Objective
Make the post-recommendation user flow operational and unambiguous by standardizing canonical product identity and adding the minimum save/compare/detail/outbound support required for MVP UX.

# Allowed Changes
- Add or update small API routes, server helpers, shared types, and minimal client wiring
- Add or update tightly scoped DB writes for save / compare / click / outbound-related state if needed
- Reuse existing recommendation and canonical product structures
- Add minimal comments/docs clarifying identity and contract behavior
- Add minimal tests or validation support if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not expand the recommendation model
- Do not add broad UI redesign
- Do not build a full admin panel
- Do not introduce broad auth/user account architecture unless already required by current MVP structure
- Do not attempt full legacy retirement of `furniture_vectors`
- Do not create a large generalized event system in this step

# Critical Safety Rule
All post-recommendation actions must use canonical `furniture_products.id` as the product identity source of truth, even if legacy naming remains in some APIs or DB columns.

# Working Principles
- Canonical product identity first
- Minimum UX flow support only
- Smallest safe backend surface
- Preserve current recommendation runtime behavior
- Prefer explicit contracts over implicit client assumptions
- Avoid speculative abstractions

# Required Behavior / Structure

## 1. Save contract
Provide or finalize a real save path for recommended products.

Expected behavior:
- Accept canonical product identity
- Preserve backward compatibility with any legacy request field only if still needed
- Record save state in a deterministic way tied to the current MVP flow
- Avoid ambiguous product identity or duplicate semantic writes

If an existing save path already exists, harden and align it rather than replacing it.

## 2. Compare contract
Provide the minimum backend/state contract needed for compare behavior.

Expected behavior:
- Define compare item identity explicitly as canonical product id
- If compare is currently client-only, add the minimum shared/server-facing type or helper contract needed so upcoming UX work cannot attach to the wrong identity model
- If a lightweight API/path already exists or is clearly needed, keep it minimal and scoped

This step is about contract closure, not full compare UX richness.

## 3. Product detail contract
Standardize the product detail payload/source assumptions used after recommendation.

Expected behavior:
- Product detail reads must come from canonical `furniture_products`
- Outbound purchase URL behavior must remain:
  - prefer `affiliate_url`
  - fallback to source/product URL logic only when needed
- Shared types/helpers should make this behavior explicit

## 4. Outbound / click contract
Keep click/outbound behavior consistent with canonical product identity.

Expected behavior:
- Click/outbound logging must continue to resolve to canonical product ids
- Any new helper/type should make the canonical identity explicit
- Do not break existing click logging flow

## 5. Minimal UX readiness support
Prepare the next UI step without overbuilding.

Expected behavior:
- Shared types/contracts for recommendation item identity, save identity, compare identity, and detail source should be explicit
- The next frontend step should be able to use these contracts without guessing which id or URL to use

# Completion Criteria
- Save contract is canonicalized and usable
- Compare contract is explicitly defined for the next UX step
- Product detail/outbound source behavior is explicit and stable
- No ranking redesign or architecture sprawl
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also show:
- save path(s) updated or added
- compare contract decision taken
- product detail / outbound source decision in code
- whether any schema change was necessary, and why

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Save / compare / detail contract decisions applied
4. Deferred items and why
5. Validation results
6. Risk notes
7. Final approval recommendation