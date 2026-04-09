# Goal
Create a reliable manual smoke checklist for later real-browser validation, and strengthen environment-independent operational/API validation that can run in the current constrained environment.

# Scope
This task combines two tightly related outcomes:

1. A manual MVP smoke checklist that can be executed later in a real browser-capable environment
2. Stronger environment-independent operational validation for the current MVP flow, using API/script/fixture-based checks where browser automation is unavailable

This is not a redesign task and not a browser automation setup task.

# Primary Objective
Ensure the MVP flow remains operationally verifiable even without browser tooling, while preparing a clear and repeatable manual smoke standard for when a browser-capable environment becomes available.

# Allowed Changes
- Add a manual smoke checklist document
- Add or update small operational validation scripts
- Add or update small fixture-based or API-based smoke checks
- Add or update tiny helper scripts/logging only if clearly useful for validation
- Add or update minimal docs/comments explaining validation usage and expectations
- Add small validation-focused improvements that do not change product behavior materially

# Disallowed Changes
- Do not redesign UX
- Do not redesign ranking/scoring
- Do not add browser tooling infrastructure just for this step
- Do not add broad new product features
- Do not build a full E2E framework
- Do not expand persistence/account architecture
- Do not change canonical product/backend contracts unless a validation gap exposes a tiny necessary fix

# Critical Safety Rule
Do not pretend environment-independent checks are equivalent to real browser validation. Manual browser smoke and API/operational smoke must be clearly separated and documented as different validation layers.

# Working Principles
- Respect the current environment constraint
- Preserve the canonical product/backend contract
- Prefer practical verification over speculative tooling work
- Keep manual smoke explicit and repeatable
- Keep operational checks small, honest, and directly relevant to the MVP flow
- Do not overbuild QA infrastructure

# Required Behavior / Structure

## 1. Manual smoke checklist document
Create or update a document that defines the real-browser manual smoke procedure for the current MVP flow.

It must include:
- required environment assumptions
- exact step-by-step flow
- expected result for each step
- failure examples / what counts as a failed smoke
- notes on what is intentionally out of scope
- clear separation between browser-only verification and API-only verification

Minimum manual smoke path:
- open app
- upload image or provide image URL
- review/set conditions
- generate recommendations
- save a recommendation
- compare recommendations
- open product detail
- trigger outbound purchase action

## 2. Environment-independent operational validation
Strengthen the validation that can run in the current environment without a browser.

Target checks should cover as much of the current MVP contract as reasonably possible, for example:
- `/api/mvp` success path
- recommendation payload shape
- canonical product id presence
- `/api/log-save`
- `/api/log-click`
- weak-result / retry related behavior where testable
- publish-path support checks if a safe path exists
- explicit logging/exit behavior for failure

Do not fabricate browser-only coverage.

## 3. Validation usability
The resulting validation flow should be easy for the operator to run later.

Expected behavior:
- manual checklist is readable and actionable
- operational validation can be run without guessing
- outputs/failures are understandable
- contract assumptions are explicit

## 4. Preserve the current product/backend contract
Do not regress:
- canonical product identity semantics
- save/click behavior
- compare max-selection contract
- outbound resolver behavior
- current detail payload contract

## 5. Honest limitations
Document clearly:
- what is covered now
- what still requires a browser-capable environment
- what remains deferred because of current environment constraints

# Completion Criteria
- A real manual browser smoke checklist exists and is usable
- Operational/API smoke is stronger and easier to run in the current environment
- Browser-only and API-only validation are clearly separated
- No scope creep into redesign/tooling expansion
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also show:
- the new/updated manual smoke checklist
- the new/updated operational validation path
- what scenarios are now covered without a browser
- what still remains browser-only

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Manual smoke checklist decisions applied
4. Environment-independent validation decisions applied
5. Deferred items and why
6. Validation results
7. Final approval recommendation