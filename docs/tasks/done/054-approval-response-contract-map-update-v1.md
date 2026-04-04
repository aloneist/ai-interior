# Goal
Update the automation contract map and review docs so they explicitly include the approval response intake and review summary layers.

# Scope
This task is automation documentation and review infrastructure only.

Primary target area:
- automation/contract-map.md
- automation/review-checklist.md
- automation/change-log-template.md
- automation/README.md
- related automation-only documentation files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Bring the documentation layer back in sync with the current automation system now that approval response intake and approval response review summary contracts exist.

# Required Design Direction
The design must follow these rules:

1. Do not change execution behavior in this task.
2. Prefer concise documentation alignment over broad prose.
3. Reflect current repository reality only.
4. Make the receive-side flow as clear as the send-side flow.
5. Keep the diff narrow and documentation-focused.

# Allowed Changes
- Narrow updates to automation/contract-map.md
- Narrow updates to automation/review-checklist.md
- Narrow updates to automation/change-log-template.md
- Narrow updates to automation/README.md
- Small cross-links if clearly helpful

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No real network delivery changes
- No broad refactor
- No unrelated cleanup
- No new contract layer
- No execution-path changes

# Critical Safety Rule
Do not add new automation behavior in this task.
This task is only about documentation alignment.

# Working Principles
- Prefer one-pass alignment of the current docs
- Reflect current actual send-side and receive-side automation contracts
- Distinguish current reachable behavior from future-only behavior
- Keep the docs readable for operators and future Codex use

# Suggested V1 Coverage
At minimum, update docs to include:
- approval response intake
- approval response review summary
- the fact that accepted responses still remain blocked
- the fact that no resume path exists yet
- where operators should look when reviewing inbound approval responses

Also ensure the review checklist and change log template mention:
- receive-side validation
- smoke coverage for accepted / invalid / not-applicable approval responses

# Required Behavior / Structure
The result should make it clear:
1. where approval responses enter the automation system
2. how they are normalized
3. how they are summarized for reviewers
4. that no risky execution resume exists yet
5. what docs/operators should check after related changes

# Completion Criteria
Complete only when:
- current docs reflect the approval response intake layer
- current docs reflect the approval response review summary layer
- the diff remains narrow and documentation-focused
- no safe execution behavior was broadened

# Validation
Use repository reality. Prefer:
- git diff -- automation/README.md automation/contract-map.md automation/review-checklist.md automation/change-log-template.md
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What documentation alignment changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary