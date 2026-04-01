# Codex Operating Rules

## Purpose
This document defines how Codex should be used in this repository.

The goal is not “maximum automation.”
The goal is to make development work faster, safer, less tiring, and more consistent **without harming core product behavior**.

Codex is an execution tool.
Humans remain responsible for:
- task selection
- scope definition
- risk judgment
- final review
- approval or rejection

## Core Principle
**Behavior safety is more important than cleanup quality or automation speed.**

If a change improves lint, types, or formatting but risks changing core behavior, do not apply that change automatically.
Leave it unresolved and report it.

## Product Priority
When making tradeoffs, prioritize in this order:

1. recommendation quality
2. operational data structure
3. QA and regression safety
4. speed of implementation
5. cosmetic cleanup

Do not sacrifice the top three to improve the bottom two.

## What Codex Is For
Codex is primarily used for:
- tightly scoped lint cleanup
- safe type cleanup
- small UI fixes with clear boundaries
- local refactors with low behavioral risk
- repetitive code cleanup
- targeted test-related fixes when behavior expectations are already clear
- draft implementation under explicit task constraints

## What Codex Is Not For
Codex should not make uncontrolled or wide-scope changes.

Do not use Codex for:
- vague “improve this file” requests
- broad refactors without strict boundaries
- logic rewrites in recommendation or ranking flows
- unreviewed parser behavior changes
- silent API contract changes
- state timing or initialization timing changes unless explicitly approved
- replacing working UI behavior just to satisfy lint rules
- touching unrelated files during a scoped task

## Human Approval Model
Every Codex task follows this model:

1. Human defines the task
2. Human defines strict file scope
3. Human defines what is allowed and disallowed
4. Codex performs the change
5. Codex reports what changed, what was skipped, and why
6. Human reviews diff and validation result
7. Human approves, requests revision, or rejects

Codex does not decide final merge readiness on its own.

## Scope Control Rules
Every task must specify:
- exact files allowed to change
- exact goal
- explicit non-goals
- risk boundaries
- required validation steps
- required output format

If a file is not explicitly in scope, Codex must not change it.

If a fix appears to require broader changes, Codex must stop and report that instead of expanding scope on its own.

## Safety Rules
Codex must preserve the following unless the task explicitly allows change:

- business logic
- recommendation logic
- scoring logic
- ranking logic
- filtering logic
- parser extraction behavior
- parser normalization behavior
- response schema
- database query meaning
- state timing
- initialization timing
- rendering flow
- modal behavior
- saved item behavior
- user interaction flow

If fixing lint or types could change any of the above, skip that fix and report it.

## Preferred Change Types
These are usually safe:

- `any` to specific type
- `any` to `unknown` with narrowing
- `catch (err: any)` to `catch (err: unknown)` with safe error narrowing
- safe `prefer-const`
- truly unused variable removal
- truly dead local helper removal
- local type/interface additions
- narrow lint suppressions when the safer structural fix would change behavior

## High-Risk Change Types
These require extra human review and should usually be avoided in routine cleanup tasks:

- effect removal
- moving values from effects to initializers or memoization
- changing request parsing flow
- changing fallback behavior
- changing prompt construction
- changing recommendation explanation parsing
- converting `<img>` to `next/image`
- parser logic rewrites
- schema restructuring
- shared abstraction redesign
- multi-file behavioral refactors

If such a change seems necessary, Codex must call it out clearly instead of quietly doing it.

## Task Document Standard
Task documents should be concise and operational.

Each task document should include:

- Goal
- Scope
- Primary Objective
- Allowed Changes
- Disallowed Changes
- Critical Safety Rule
- Working Principles
- Completion Criteria
- Validation
- Required Result Format

Do not include unnecessary tutorial content.
Do not include broad design discussion.
Do not include example before/after blocks unless explicitly needed.

## Result Reporting Standard
Codex must report results using this structure:

- changed files
- per-file summary
- unresolved issues left intentionally
- lint result
- build result
- risk notes

If validation fails, report:
- exact failed command
- exact failure cause
- affected files only

Do not pad the report with unrelated commentary.

## Lint Cleanup Policy
Lint cleanup is allowed only when it is behavior-safe.

Rules:
- never force a risky fix just to get a clean lint result
- if the safe solution is suppression, use narrow local suppression
- if a lint rule conflicts with stable product behavior, preserve behavior first
- if a safe fix is unclear, skip and report

## Parser Safety Policy
Parser code is behavior-sensitive because it affects downstream product data.

For parser tasks:
- do not change extraction logic
- do not change normalization logic
- do not change category resolution
- do not change fallback behavior
- do not change returned object meaning

Safe parser work is mostly limited to:
- type cleanup
- `prefer-const`
- unused variable cleanup
- local helper typing
- safe error typing

## UI Safety Policy
UI cleanup must preserve user-visible behavior.

For UI tasks:
- do not change rendering flow
- do not change state timing
- do not change modal behavior
- do not change saved-products behavior
- do not change recommendation card behavior
- do not change page initialization behavior

If replacing a lint issue with a structural UI change would risk behavior, prefer a narrow suppression and report why.

## API Safety Policy
API cleanup must preserve:
- request semantics
- response shape
- scoring behavior
- filtering behavior
- fallback behavior
- database meaning

Safe API work is mostly limited to:
- local type cleanup
- request/body typing without semantic change
- safe error typing
- local alias types for parsed responses
- callback parameter typing

## Build and Environment Policy
Build failures caused by environment limitations should be reported separately from code quality work.

Example:
- remote font fetch failure
- external network dependency failure
- temporary environment service issue

Do not misclassify environment failures as task failure if the code change itself is safe and scoped.

## When to Stop
Codex should stop and report instead of continuing when:

- the fix requires touching files outside scope
- behavior risk becomes non-trivial
- the exact type cannot be inferred safely
- validation failure suggests hidden behavioral impact
- the repository state contains unrelated conflicting edits
- the requested task is too broad to perform safely

## Default Operating Style
Codex should default to:
- small diffs
- local changes
- explicit reporting
- conservative decisions
- no hidden behavior changes

When uncertain, be more conservative, not more aggressive.

## Final Rule
A smaller safe improvement is better than a larger risky cleanup.

Preserve product stability first.
Improve speed second.
Improve neatness third.