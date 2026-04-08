# Goal
Harden the newly-closed MVP user flow through a practical smoke-driven pass and fix only the small, high-value friction points discovered in the real flow.

# Scope
This task is limited to smoke-driven UX hardening for the existing minimum MVP flow:

- upload
- condition input
- recommendation results
- save / compare
- product detail
- outbound purchase transition

The work should focus on small fixes that improve continuity, clarity, and recoverability without redesigning the product or expanding the architecture.

# Primary Objective
Make the current MVP flow feel stable and usable under real interaction by resolving small but meaningful friction points found during smoke validation.

# Allowed Changes
- Update current MVP UI components, hooks, local state, lightweight helpers, and small copy/messages
- Improve loading / empty / weak-result / failure / retry states
- Fix state continuity issues across the current flow
- Improve button labeling, disabled states, helper text, and action visibility
- Add minimal client-side safeguards for compare/save/detail/outbound behavior
- Add minimal smoke-support utilities or tiny test scaffolding if clearly useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app structure
- Do not add major new product features
- Do not build broad analytics or persistence systems
- Do not build a full compare workspace
- Do not add a full product-detail route/API in this step
- Do not expand backend architecture unless a very small fix is absolutely necessary

# Critical Safety Rule
Do not “fix” UX confusion by bypassing or hiding the existing canonical product/backend contract. All actions must still resolve through the current canonical product model and existing backend contracts.

# Working Principles
- Smoke-driven fixes only
- Small scope, high impact
- Flow clarity over visual flourish
- Preserve the current canonical product contract
- Prefer explicit states over hidden assumptions
- Fix friction, not everything

# Required Behavior / Structure

## 1. Real-flow smoke pass
Use the current MVP flow as a user would and identify concrete friction points.

Minimum smoke path:
- upload image
- set or review conditions
- generate recommendations
- save a product
- select products for compare
- open product detail
- go to outbound purchase

## 2. Fix small friction points only
Resolve only meaningful issues discovered during the smoke pass.

Examples of acceptable fixes:
- confusing labels
- weak loading states
- unclear disabled states
- compare limit confusion
- detail open/close friction
- retry path confusion
- state reset surprises
- weak empty/weak-result messaging
- visually hidden primary actions

## 3. Preserve flow continuity
The user should not feel like they are starting over unexpectedly.

Expected behavior:
- context remains understandable after recommendation generation
- save / compare state remains coherent within the current session
- detail open/close behavior feels natural
- retry paths do not create unnecessary confusion

## 4. Failure / retry clarity
If the flow weakens or fails, the user should understand what to do next.

Expected behavior:
- recommendation failure messaging is understandable
- retry action is visible and makes sense
- weak-result paths still provide a next step
- copy remains simple and grounded

## 5. Keep the contract stable
Do not drift away from the existing backend/product identity contract.

Expected behavior:
- canonical product identity remains intact
- outbound behavior still uses the centralized resolver
- compare still uses the shared max-selection rule
- save/click/detail flows do not regress

# Completion Criteria
- The current MVP flow survives a realistic smoke pass without obvious confusion or breakage
- Small friction points found during smoke are fixed
- No broad redesign or subsystem expansion was introduced
- Canonical contract remains intact
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also report:
- the concrete smoke scenarios exercised
- the friction points found
- the fixes applied
- anything intentionally deferred because it would exceed the intended scope

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Smoke scenarios exercised
3. Friction points found
4. What changed
5. Deferred items and why
6. Validation results
7. Final approval recommendation