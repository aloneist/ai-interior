# Goal
Define a practical seller/source intake capability matrix and an execution priority for expanding beyond the current IKEA-heavy operating dataset.

# Scope
This task is limited to:
- identifying current seller/source intake support levels
- separating data-coverage problems from fetch/parser capability problems
- defining a practical intake support matrix
- proposing a small prioritized expansion plan for new seller sources
- adding the minimum docs/runbook support for this operator/development decision

This is not a recommendation redesign task and not a UX task.

# Primary Objective
Make the next intake-expansion step explicit and operationally grounded by answering:
- which seller sources are currently production-usable
- which fail at fetch/access
- which stage rows but fail publish-quality gates
- which should be prioritized next for support work

# Allowed Changes
- Add or update small audit scripts, source classification helpers, or reporting support
- Add or update docs/runbooks/checklists describing seller/source capability status
- Add or update a small operator/developer matrix artifact
- Make tiny contract-preserving adjustments only if required to surface capability status clearly

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not build a large admin system
- Do not attempt broad parser architecture redesign in this step
- Do not add speculative seller support without evidence
- Do not loosen publish-quality gates just to increase throughput

# Critical Safety Rule
Do not confuse "no data yet" with "supported source." A seller/source is only operationally supported if intake, audit, publish, and verification can all complete to the current standard.

# Working Principles
- Separate coverage from capability
- Preserve current quality gates
- Use observed evidence, not guesses
- Prefer a small explicit support matrix over vague optimism
- Prioritize sources with the best operator value and technical feasibility
- Keep the result actionable for the next execution step

# Required Behavior / Structure

## 1. Define seller/source capability states
Create explicit states such as:
- supported_operational
- fetch_blocked
- parse_blocked
- quality_blocked
- untested
- experimental

Use naming that is clear and operationally useful.

## 2. Audit currently observed sources
Use currently observed evidence from the repo/workflow to classify at least:
- IKEA
- Todayhouse
- Livart
- any other seller/source currently represented in code, data, or known intake attempts

For each source, state:
- current observed behavior
- failure stage (if any)
- whether the blocker is coverage-only or capability-related
- whether current publish-quality gates are the blocker or working correctly

## 3. Build a seller intake capability matrix
Produce a compact matrix that answers:
- source name
- fetch capability
- parse/extraction capability
- quality-gate behavior
- publish viability
- current status
- next required work

## 4. Recommend expansion priority
Choose a small, realistic next-source priority order.

The recommendation should consider:
- technical feasibility
- operator value
- likelihood of usable product pages
- difficulty of fetch/access
- parser complexity
- business usefulness

## 5. Add operator/developer guidance
Document how to interpret the matrix and when to:
- attempt new intake
- treat a source as blocked
- escalate to parser/fetch work
- avoid wasting time on a source for now

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- publish helper semantics
- current quality-gate logic
- outbound URL review policy

# Completion Criteria
- Seller/source capability states are explicit
- Current observed sources are classified with evidence
- Coverage-vs-capability distinction is clear
- A practical expansion priority exists
- A usable matrix/runbook artifact exists
- No quality-gate loosening or product/runtime drift
- Build/lint/type checks pass if code changes were made

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- the capability states defined
- the matrix produced
- the expansion priority chosen
- what was intentionally deferred

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Capability states defined
3. Source capability matrix
4. Expansion priority recommendation
5. Docs / tooling changes
6. Deferred items and why
7. Validation results
8. Final approval recommendation