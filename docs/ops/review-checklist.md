# Review Checklist

## Purpose
Use this checklist to review Codex output before approving a change.

The goal is not to judge whether the code looks cleaner.
The goal is to verify that the task stayed within scope, preserved behavior, and produced a safe result.

## Review Order
Always review in this order:

1. scope control
2. behavior safety
3. validation result
4. unresolved issues
5. merge readiness

Do not start from style preference.

## 1) Scope Control
Check all of the following:

- Only the approved files were changed
- No unrelated files were touched
- No silent file moves or renames happened
- No broad cleanup was mixed into a narrow task
- The diff size is consistent with the requested task

If scope was exceeded, do not approve immediately.
Request a narrowed revision or reject.

## 2) Behavior Safety
Check whether the change preserved the intended behavior.

### General
- Core behavior appears unchanged
- No silent business logic changes
- No hidden fallback changes
- No hidden initialization timing changes
- No hidden rendering flow changes
- No hidden user-flow changes

### API Tasks
- Request semantics are unchanged
- Response shape is unchanged
- Filtering/ranking/scoring behavior is unchanged
- Database query meaning is unchanged

### UI Tasks
- Rendering flow is unchanged
- State timing is unchanged
- Modal behavior is unchanged
- Saved-item behavior is unchanged
- User interaction flow is unchanged

### Parser Tasks
- Extraction logic is unchanged
- Normalization behavior is unchanged
- Category resolution is unchanged
- Returned object meaning is unchanged
- Downstream import assumptions are unchanged

If any behavior-sensitive area seems altered, pause approval and inspect the diff closely.

## 3) Risky Fix Patterns
Look carefully if the task included any of these:

- effect removal
- moving values into lazy initializers
- moving values into memoization
- changing request parsing flow
- changing fallback handling
- converting `<img>` to `next/image`
- changing parser guards
- changing explanation/result parsing
- removing helpers that may still affect flow

These changes are not automatically wrong, but they require extra caution.

## 4) Type Cleanup Safety
When a task is mainly about lint or type cleanup, verify:

- `any` was replaced safely
- `unknown` was narrowed safely
- local types are narrow but not over-restrictive
- runtime assumptions were not silently tightened
- optional fields still behave the same
- error handling still preserves intended fallback behavior

A type cleanup is not “safe” if it changes runtime assumptions.

## 5) Validation Result
Check the reported validation in order:

- targeted lint result
- repo-wide lint result
- build result

Review questions:
- Did targeted lint pass?
- If repo-wide lint failed, was the failure outside task scope?
- If build failed, was it a real code issue or an environment issue?
- Did the report clearly separate task-related failures from unrelated failures?

Do not misclassify an external environment issue as a task failure.

## 6) Unresolved Issues
Check whether unresolved items were reported honestly.

- Risky fixes were skipped instead of forced
- Remaining issues were listed clearly
- The reason for skipping was understandable
- “Unresolved intentionally” was used only when justified

This is important.
A safe skip is often better than an aggressive cleanup.

## 7) Diff Quality
Check the quality of the actual change:

- The diff is small and targeted
- The change is understandable
- The change follows the task goal
- There is no unnecessary abstraction
- There is no opportunistic cleanup outside the task
- There is no suspicious “while I was here” change

A narrow task should produce a narrow diff.

## 8) Report Quality
Check whether the Codex report is usable.

It should include:
- changed files
- per-file summary
- unresolved issues left intentionally
- lint result
- build result
- risk notes

A good report is:
- concrete
- scoped
- honest
- short enough to review quickly

## 9) Approval Decision
Use this standard:

### Approve
Approve when:
- scope was respected
- behavior appears preserved
- validation is acceptable
- unresolved issues were reported honestly
- risk is low and understood

### Request Revision
Request revision when:
- the task is mostly correct but has one or two fixable concerns
- scope is slightly messy but recoverable
- a specific risky diff needs tightening
- reporting is incomplete but the work is still usable

### Reject
Reject when:
- scope was broken badly
- behavior risk is too high
- the task changed things it was not allowed to change
- validation suggests a likely functional problem
- the report is misleading or incomplete in a dangerous way

## 10) Reviewer Notes Template
Use this format when responding after review:

- decision: approve / revise / reject
- summary: one short sentence
- strengths:
  - [item]
  - [item]
- concerns:
  - [item]
  - [item]
- next action:
  - [item]

Keep the review short and operational.

## Final Rule
A smaller safe patch is better than a larger risky patch.

Protect product behavior first.
Approve cleanliness second.