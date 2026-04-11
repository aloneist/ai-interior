# AGENTS.md

## Project Identity
This repository is not a general demo app.
It is an AI interior curation product focused on one business-critical flow:

room input -> staged product intake/review -> canonical catalog publish -> recommendation/runtime use -> operator-safe verification

## Role Split
- ChatGPT: direction, architecture, task design, review, approval judgment
- Codex: code reading, implementation, narrow refactoring, validation execution
- CI: automated verification
- Final approval: human

## Repository Truth Rules
- Never assume the repository is current.
- Before any repository analysis or new task planning, verify the latest allowed repo state against the user-provided commit message or explicit freshness check.
- If repo freshness does not match the user’s condition, stop and report that the repository is not current.
- After the human runs Codex and returns results, treat prior repo reads as stale unless the user explicitly allows a fresh repo read again.

## Operating Mode Rules
### Mode A: Repo-read mode
Use when planning work from repository state.
Required order:
1. verify repo freshness
2. read target files first
3. read one small additional repo-internal doc only if needed to remove ambiguity
4. propose one bundled task
5. produce task doc draft + Codex prompt
6. stop

### Mode B: Codex-review mode
Use when reviewing Codex output supplied by the user.
- Do not re-read the repository by default.
- Judge only from the returned diff, changed files, command results, and stated validations.
- Re-open repo-read mode only if the user explicitly asks for a fresh repo read.

## Reading Discipline
- Start with the files named by the user or task.
- Do not broadly scan the repository unless the task explicitly requires it.
- Do not read product or runtime code unless a contract statement directly depends on it.
- Prefer narrow context over broad exploration.

## Execution Discipline
- Prefer diff-first modification and review.
- Read the minimum context needed, then edit narrowly.
- Preserve current contracts unless the task explicitly changes them.
- Do not add runtime behavior, schema, or feature changes during contract-only work.

## Output Discipline
- Keep wording short and direct.
- Return the minimum reviewable result.
- Do not restate the prompt.
- Do not include long logs.
- Do not summarize unchanged context.
- Report only commands actually run.

## Current Product / Data Contract
- `furniture_products` is the only canonical active product catalog.
- `import_jobs` is staging/review only.
- `published_product_id` is the official audited link from staging to canonical product.
- Publish is a controlled promotion, not a blind copy.
- Recommendation/save/click/compare identity must stay tied to canonical product identity.
- Do not create ambiguous ownership of product identity.

## Current Operational Truth
Follow the current repo runbooks and contracts before inventing new structure.
Primary references include:
- publish flow / canonical interaction contract
- import-jobs review and publish runbook
- current active task under `docs/tasks/`

## Current Active Lane
Default to the currently active repository lane, not generic product ideation.
As of the validated repo state, the active lane is:
- seller parser breadth / deterministic support expansion
- not broad UX redesign
- not recommendation ranking redesign
- not speculative schema redesign

## Task Design Rules
- Bundle work when parallel or tightly related; do not over-split tiny tasks.
- Task docs must be written in English.
- Codex execution prompts must be written in English.
- Prefer narrow, deterministic changes.
- Read broadly, write narrowly.
- Preserve current contracts unless the task explicitly changes them.
- Prefer impact-based validation. Run the smallest required validation set for the files actually touched.

## Task File Numbering Rule
- Task filenames must use `docs/tasks/<sequence>-<slug>.md`
- The sequence number must be verified from the repository.
- Never invent the next sequence number without checking the current latest task in the repo.

## Disallowed Behavior
- Do not redesign UX unless the task explicitly calls for it.
- Do not redesign recommendation ranking/scoring unless explicitly requested.
- Do not perform broad schema rewrites for convenience.
- Do not loosen quality gates to increase throughput.
- Do not guess-clean operational data.
- Do not treat future ideas as current support.

## Required Validation
When code changes:
- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

When doc-only changes:
- `git diff --check`
- run code validations only if touched files require it

## Required Codex Result Format
Codex must report in this structure:
1. changed files
2. one-line reason per file
3. commands run
4. pass/fail
5. deferred issues if any

## Review Standard
ChatGPT review must judge:
- scope compliance
- contract preservation
- validation quality
- whether the change fits the current stage
- whether any temporary structure is clearly marked
