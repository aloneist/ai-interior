# Goal
Execute the already-prepared operational remediation and publish workflow against live data, using only deterministic rules, and leave the staging/canonical state clean and auditable.

# Scope
This task is limited to operational execution of the workflow prepared in the prior step:

- live remediation of deterministically reconcilable `import_jobs`
- live publish of truly publish-ready rows
- explicit carry-forward of blocked/manual-review rows
- post-execution audit snapshot and reporting

This is not a redesign task and not a new tooling-design task.

# Primary Objective
Apply the review/publish operating rules to real data so that:
- rows that are already effectively published are no longer left in `pending_review`
- truly publish-ready rows are actually published
- blocked rows remain clearly blocked
- the resulting state is auditable and operationally cleaner than before

# Allowed Changes
- Run the existing operational script(s) in live/apply mode
- Make small, tightly scoped fixes only if a real execution blocker appears
- Update runbook/output docs with actual execution results
- Add a post-run audit snapshot/report artifact
- Make tiny contract-preserving corrections only if required to complete the execution safely

# Disallowed Changes
- Do not redesign the workflow again
- Do not add new statuses unless absolutely unavoidable
- Do not introduce heuristic matching
- Do not guess at ambiguous staged-to-canonical mappings
- Do not redesign recommendation/runtime behavior
- Do not add broad schema changes
- Do not expand into a large admin system

# Critical Safety Rule
Only mutate live data when the mapping is deterministic and already defined by the prior rule set. If a row is ambiguous or incomplete, leave it in manual review.

# Working Principles
- Deterministic execution only
- Live mutation must be auditable
- Preserve canonical product identity
- Preserve existing publish helper semantics
- Prefer explicit manual hold over risky auto-correction
- End with a clean auditable state, not a partially explained one

# Required Behavior / Structure

## 1. Run live audit first
Run the current audit on live data before mutation and record:
- total `import_jobs`
- how many are `pending_review`
- how many are `published`
- how many are deterministically reconcilable
- how many are truly publish-ready
- how many require manual review
- any outbound URL quality notes if applicable

## 2. Execute deterministic remediation live
Apply live remediation only for rows that already satisfy the approved deterministic reconciliation rule.

Expected behavior:
- rows that are effectively already published get linked correctly if needed
- their status is updated out of `pending_review`
- results are recorded clearly
- no ambiguous rows are touched

## 3. Execute real publish for truly ready rows
Run the existing publish flow for rows that are actually publish-ready and not already canonically represented.

Expected behavior:
- canonical product row exists after publish
- `published_product_id` is written correctly
- status reflects real publish state
- repeated execution remains deterministic

## 4. Carry forward blocked/manual rows explicitly
Do not force blocked rows through publish.

Expected behavior:
- rows missing required fields remain in manual review
- blocked reason is explicit in the resulting report
- ambiguous rows remain untouched

## 5. Produce post-execution audit output
After live execution, run audit again and record the final state.

The result should make it easy to answer:
- how many rows were remediated
- how many rows were newly published
- how many remain pending and why
- whether any unexpected drift appeared

## 6. Update operational record
Add or update a small execution artifact/run note documenting:
- commands run
- live mutation counts
- remaining manual-review rows
- any issues encountered
- operator-facing next action

# Completion Criteria
- Live remediation has been applied only to deterministic cases
- Truly publish-ready rows have been published
- Manual-review rows remain untouched and clearly identified
- Post-run audit snapshot exists
- The state is cleaner and operationally understandable
- Build/lint/type checks pass if code changes were needed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed

Also report:
- exact counts before execution
- exact counts after execution
- exact rows/categories changed
- exact rows intentionally left for manual review
- whether any blocker required code adjustment

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Pre-execution audit snapshot
3. Live remediation / publish actions executed
4. Post-execution audit snapshot
5. Manual-review rows intentionally left untouched
6. Docs / runbook execution record
7. Validation results
8. Final approval recommendation