# Goal
Harden the operational data review and publish workflow so the team can reliably inspect staged product data, resolve status ambiguity, and publish canonical products with an auditable operating routine.

# Scope
This task is limited to operational data review / publish workflow hardening around:
- `import_jobs`
- `furniture_products`
- the existing publish path
- minimal review/audit tooling, scripts, docs, and contract-preserving fixes

It is not a recommendation redesign task and not a UX expansion task.

# Primary Objective
Make the review/publish workflow operationally clear and repeatable by:
- defining exact status semantics
- detecting and fixing current review/publish inconsistencies
- making the publish routine auditable
- adding the minimum tooling/docs needed to run this safely

# Allowed Changes
- Add or update operational scripts, admin-safe helpers, audit SQL, or small API/server utilities
- Add or update docs/runbooks/checklists for review/publish operations
- Add or update small code paths needed to enforce the intended review/publish contract
- Add small data cleanup/backfill logic if deterministic and safe
- Add small validation/reporting support for URL/catalog review quality

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not build a large admin system
- Do not attempt full legacy `furniture_vectors` retirement in this step
- Do not introduce broad schema redesign unless a tiny contract-preserving fix is necessary
- Do not make speculative data rewrites without deterministic mapping rules

# Critical Safety Rule
Do not "clean" operational data by guessing. Any backfill or status correction must be deterministic, explainable, and auditable.

# Working Principles
- `furniture_products` remains the canonical product source
- `import_jobs` remains staging/review only
- publish is a controlled promotion, not an implicit side effect
- status values must match real operational meaning
- auditability matters more than convenience
- prefer small, repeatable operational tooling over ad hoc manual interpretation

# Required Behavior / Structure

## 1. Lock the operational status semantics
Define and document exact meanings for:
- `pending_review`
- `published`
- `rejected`

At minimum:
- `pending_review` must mean "not yet approved/published"
- `published` must mean "canonical product link exists and publish routine completed"
- `rejected` must mean "explicitly not publishable without further rework"

Do not introduce extra statuses unless absolutely necessary.

## 2. Audit current inconsistencies
Inspect current live/repo-known inconsistency cases such as:
- `pending_review` rows already linked to active canonical products
- rows with ambiguous mapping between staged import and canonical product
- rows missing required extracted fields for safe publish
- URL quality issues where outbound destination may not land on the intended PDP

Produce a small, explicit audit output or scriptable report.

## 3. Add deterministic remediation rules
Implement or document deterministic rules for fixing current inconsistent rows.

Examples:
- if `published_product_id` is present and valid, status should not remain `pending_review`
- if canonical linkage can be proven by current official contract, backfill may be allowed
- if linkage is ambiguous, keep the row in review and do not guess
- if extracted data is incomplete, do not auto-publish

## 4. Operationalize the publish routine
Harden the publish operation so it can be run and reviewed operationally.

Expected behavior:
- operator can identify publish-ready rows
- operator can see why a row is blocked
- publish writes or preserves the canonical link
- publish outcome is auditable
- repeated publish attempts are deterministic

## 5. Add review/publish runbook support
Add the minimum docs/checklists needed for actual operations.

Should include:
- how to inspect pending rows
- how to determine publish readiness
- how to run publish safely
- how to verify canonical product output
- how to handle blocked/rejected rows
- how to review outbound URL quality (including redirect-to-category style issues)

## 6. Preserve existing product/runtime contracts
Do not regress:
- canonical product identity
- current publish helper contract
- save/click/recommendation identity semantics
- outbound URL preference contract

# Completion Criteria
- Status semantics are explicit and operationally usable
- Current review/publish inconsistencies can be surfaced and handled deterministically
- The publish routine is operationally documented and auditable
- Small required scripts/helpers/docs exist for repeatable use
- No speculative data cleanup
- Build/lint/type checks pass when code changes are made

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact audit findings
- exact remediation rules introduced
- what was backfilled/fixed vs intentionally left for manual review
- what operational docs/runbooks were added or updated

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Audit findings
3. What changed
4. Remediation rules applied
5. Docs / runbook changes
6. Deferred items and why
7. Validation results
8. Final approval recommendation