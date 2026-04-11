# Goal
Align repository-level operating contracts with the updated ChatGPT-Codex working standard so Codex can execute with lower token usage, narrower context scope, and reviewable minimal output.

# Scope
This task is limited to repository-internal contract documents and developer/operator guidance that control how work is proposed, executed, and reviewed.

Primary targets:
- `AGENTS.md`
- `README.md`
- any small repo-internal contract/reference doc that should reflect the new execution standard
- minimal wording updates only where necessary to keep repository guidance consistent

This is not a product feature task and not a runtime behavior change task.

# Primary Objective
Update repository contracts so they explicitly enforce:
- repo-read mode vs codex-review mode separation
- narrow file-reading discipline
- diff-first modification style
- minimal reviewable output format
- token-aware prompt and validation discipline
- no unnecessary prompt restatement or long result logs

# Allowed Changes
- Update `AGENTS.md`
- Update `README.md`
- Add or update a small internal reference doc only if necessary to avoid ambiguity
- Tighten wording around scope control, validation expectations, and reporting format
- Clarify token-usage optimization rules for Codex execution

# Disallowed Changes
- Do not change product/runtime behavior
- Do not change database schema
- Do not change recommendation logic
- Do not redesign UX
- Do not add large process documents beyond what is needed
- Do not broaden this into a workflow redesign beyond repository contracts

# Critical Safety Rule
Do not weaken reviewability in the name of token savings.
Output may be shorter, but it must still preserve enough evidence for ChatGPT review and final human approval.

# Working Principles
- same-purpose / same-contract work may stay bundled
- unrelated work must stay separated
- read only what is needed
- write narrowly
- prefer diffs over full rewrites
- avoid repeating unchanged context
- preserve canonical product / publish contract wording
- keep human and agent entry points clear

# Required Behavior / Structure

## 1. Align `AGENTS.md`
Ensure `AGENTS.md` explicitly states:
- role split
- repo freshness rule
- repo-read mode vs codex-review mode
- target-files-first reading rule
- diff-first editing preference
- minimal result format
- impact-based validation
- no unnecessary long logs or prompt restatement

## 2. Align `README.md`
Ensure `README.md` remains human-facing and concise:
- repository purpose
- current operating priorities
- canonical data contract summary
- links to primary repo contracts / runbooks / active task path
- validation baseline

## 3. Add token-efficiency contract language
Repository contracts should clearly instruct Codex to:
- avoid broad file scanning unless necessary
- avoid full file rewrites when a narrow patch is enough
- avoid long explanations and unchanged context summaries
- report only changed files, one-line reasons, commands run, pass/fail, deferred items if any

## 4. Preserve review quality
Do not reduce output so far that ChatGPT review becomes unreliable.
The repository contract must still allow:
- scope judgment
- contract preservation judgment
- validation judgment
- approval / reject decision

## 5. Keep it small
Do not create multiple overlapping governance files unless a small additional file is clearly required.
Prefer updating existing top-level contract documents first.

# Completion Criteria
- `AGENTS.md` reflects the updated ChatGPT-Codex operating standard
- `README.md` remains concise and consistent with the same standard
- token-efficiency rules are explicitly represented in repo contracts
- no product/runtime behavior changed
- docs are short, direct, and non-overlapping

# Validation
Run and report:
- `git diff --check`

Run additional validation only if touched files require it.

# Required Result Format
1. Current position summary
2. Changed files
3. One-line reason per file
4. Commands run
5. Pass/fail
6. Deferred issues if any
7. Final approval recommendation