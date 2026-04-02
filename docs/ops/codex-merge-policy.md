# Codex Merge Policy

## Purpose
This document defines when Codex-generated changes are safe to merge, when they require stricter review, and when they should not be merged without additional validation.

Approval and merge are not the same thing.

A task may be:
- approved as a good implementation attempt
- but still not ready to merge

The goal of this policy is to protect product behavior, recommendation quality, QA reliability, and operational safety.

## Core Rule
**No Codex-generated change should be merged just because it looks clean or passes one command.**

Merge readiness depends on:
1. scope control
2. behavior safety
3. validation quality
4. task category
5. residual risk

If these are not acceptable, do not merge.

---

## Merge Levels
Codex-generated changes should be evaluated under one of these merge levels:

### Level 1 — Safe Direct Merge
Eligible for merge after standard human review.

Typical examples:
- safe lint cleanup
- safe local type cleanup
- narrow build-unblock fix
- low-risk UI text/style fix
- local suppression with explicit reason
- safe unused variable removal
- safe `prefer-const`

Requirements:
- task scope was respected
- behavior appears unchanged
- validation passed
- risk is low and understood
- no unresolved issue blocks the target purpose

### Level 2 — Merge After Extra Human Review
Not blocked, but requires more careful inspection before merge.

Typical examples:
- UI state-flow-adjacent cleanup
- parser-adjacent cleanup
- explanation parsing safety guards
- build stability changes with visible tradeoffs
- local dead-code removal in behavior-sensitive files

Requirements:
- standard review completed
- risky areas inspected directly in diff
- human explicitly accepts the tradeoff
- validation is acceptable
- residual risk is documented

### Level 3 — Merge Only After Additional Validation
Implementation may be reasonable, but merge requires more than code review.

Typical examples:
- parser behavior updates
- API contract-adjacent changes
- recommendation-adjacent implementation
- state architecture changes
- changes touching behavior-sensitive flows in multiple places

Possible additional validation:
- manual product check
- regression checklist
- request/response comparison
- parser output comparison
- targeted QA scenario replay

Requirements:
- human-reviewed design intent exists
- implementation matches the design
- additional validation is completed
- merge decision is explicitly recorded

### Level 4 — Do Not Merge as a Normal Codex Change
Not eligible for routine merge under this workflow.

Typical examples:
- broad refactors with unclear boundaries
- production-risk operations
- destructive data behavior
- unverified behavior rewrites
- changes based on stale repository assumptions
- multi-area cleanup with unclear product effect

Action:
- reject as a normal Codex merge path
- redesign the work as smaller, safer tasks
- use human-led planning first

---

## Merge Decision Questions
Before merging any Codex-generated change, ask:

### Scope
- Did the change stay within the approved files?
- Did the task avoid unrelated cleanup?
- Is the diff size appropriate for the task?

### Behavior
- Does the product still behave the same where required?
- Were any fallback semantics changed?
- Were any parser, ranking, filtering, or state-flow behaviors altered?
- Was any visible UI behavior changed unintentionally?

### Validation
- Did the required validation actually run?
- Did targeted lint/build pass?
- If validation failed, was the failure unrelated?
- Is the report specific enough to trust?

### Risk
- Are risky parts clearly called out?
- Were any unresolved items skipped safely instead of forced?
- Is there any hidden behavior-adjacent change?

If the answer is unclear, do not merge yet.

---

## Merge Policy by Task Category

### Category A Tasks
Typical merge level:
- usually Level 1

Examples:
- safe lint cleanup
- safe type cleanup
- narrow build-unblock fix
- small low-risk UI polish

Merge rule:
- merge after standard review if validation is acceptable

### Category B Tasks
Typical merge level:
- usually Level 2

Examples:
- UI state-flow-adjacent cleanup
- explanation parsing cleanup
- build stability changes with visible tradeoffs
- local dead-code removal in sensitive files

Merge rule:
- do not merge on “looks okay”
- merge only after direct inspection of risky areas

### Category C Tasks
Typical merge level:
- usually Level 3

Examples:
- recommendation logic changes
- parser behavior changes
- API contract changes
- state architecture work
- DB-meaning-adjacent implementation

Merge rule:
- merge only after design intent is fixed and additional validation is done

### Category D Tasks
Typical merge level:
- Level 4

Examples:
- unclear broad refactors
- dangerous operational changes
- stale-assumption work
- silent behavior rewrites

Merge rule:
- do not merge through the normal Codex workflow

---

## Minimum Merge Requirements
A Codex-generated patch should not be merged unless all of the following are true:

- the task category is understood
- the scope stayed controlled
- the result report is complete enough to review
- required validation was run
- behavior risk is acceptable
- a human explicitly approves it

If one of these is missing, merge should wait.

## When Passing Build Is Not Enough
A passing build does not automatically mean merge-ready.

Do not merge just because:
- TypeScript passed
- lint passed
- build passed
- the diff looks small

These are useful signals, but not the final decision.
Behavior safety still comes first.

## When Approval Is Not Enough
A review comment like “approve” does not automatically mean “merge now” if:

- additional validation was expected but not done
- the task belongs to a higher merge level
- a visible tradeoff was accepted in principle but not checked in practice
- unresolved issues affect the release goal

Approval quality matters more than approval wording.

---

## Merge Blockers
Do not merge if any of these are true:

- scope was exceeded
- disallowed changes were made
- behavior risk is unclear
- validation is missing
- task report is incomplete or misleading
- repository state is clearly inconsistent
- the change depends on assumptions that were not verified
- the patch solves one issue by quietly introducing another

These are merge blockers, even if the patch is otherwise clever.

## Soft Blockers
These do not always prevent merge, but they require explicit judgment:

- visible typography tradeoff
- local defensive filtering that may exclude malformed data
- parser-safe cleanup in shared utilities
- UI cleanup that touches initialization timing
- dead-code removal in sensitive logic

If one of these exists, record the tradeoff clearly before merging.

---

## Merge Notes Standard
When recording a merge decision, use this format:

- merge level: [1 / 2 / 3 / 4]
- decision: merge / revise / reject / hold
- reason: [one short sentence]
- validation status: [passed / partial / blocked]
- residual risk: [low / medium / high]
- follow-up needed: [yes / no]
- note: [short operational note]

Example:
- merge level: 2
- decision: merge
- reason: build reliability improved with acceptable typography tradeoff
- validation status: passed
- residual risk: low
- follow-up needed: yes
- note: restore brand font later with a build-stable approach

This keeps decisions reviewable later.

---

## Repository Default
For this repository, the default bias should be:

- merge Level 1 tasks readily after standard review
- merge Level 2 tasks only after explicit human confidence
- hold Level 3 tasks until extra validation is done
- do not merge Level 4 tasks in the standard flow

This keeps Codex useful without turning it into an unsafe auto-merge system.

## Practical Recommendation
If uncertain:
- downgrade merge readiness
- ask for a revision
- split the work into smaller tasks
- require additional validation

Conservative merge judgment is preferred.

## Final Rule
A patch is merge-ready only when it is:
- scoped
- understandable
- validated
- behavior-safe
- explicitly approved by a human

Clean code is not enough.
Passing commands is not enough.
Safe merge is the standard.