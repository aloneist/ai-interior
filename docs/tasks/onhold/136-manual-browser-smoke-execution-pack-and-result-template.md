# Goal
Prepare a complete manual browser smoke execution pack so that, once a browser-capable environment is available, the MVP flow can be validated and recorded consistently without ambiguity.

# Scope
This task is limited to preparing the execution and reporting framework around the already-created manual smoke checklist.

It should cover:
- a structured smoke result template
- pass/fail decision rules
- issue severity / categorization guidance
- an execution procedure for later real-browser validation
- minimal support updates only if they directly improve manual smoke execution clarity

This is not a browser automation task and not a feature expansion task.

# Primary Objective
Turn the existing manual smoke checklist into an execution-ready operational pack that someone can run in a browser-capable environment and report back in a structured, repeatable way.

# Allowed Changes
- Add or update documentation for manual smoke execution
- Add a manual smoke result template
- Add issue categorization / pass-fail guidance
- Add minimal validation notes or tiny support docs if they directly improve execution clarity
- Add minimal helper documentation linking the browser checklist and operational smoke script

# Disallowed Changes
- Do not redesign UX
- Do not redesign ranking/scoring
- Do not add browser automation tooling
- Do not add broad new product features
- Do not build a QA platform
- Do not change backend/product contracts unless a tiny doc/support clarification is absolutely necessary
- Do not claim browser validation has been completed in this step

# Critical Safety Rule
Do not blur preparation with execution. This task prepares manual browser validation; it does not count as actually completing browser smoke.

# Working Principles
- Make execution easy for a human operator
- Keep pass/fail criteria explicit
- Keep issue reporting structured and reusable
- Separate browser-only validation from API/operational validation
- Preserve the current canonical product/backend contract
- Avoid overbuilding process

# Required Behavior / Structure

## 1. Manual smoke execution procedure
Create or refine a document that tells an operator exactly how to run the browser smoke later.

It must include:
- prerequisite environment assumptions
- app/environment setup notes
- step-by-step execution order
- what to capture during each step
- where to stop and report instead of improvising
- how to distinguish blocker vs minor issue

## 2. Smoke result template
Provide a structured template for recording a real manual smoke run.

It should support:
- environment used
- build/commit reference if available
- scenario-by-scenario pass/fail
- observed issue list
- reproduction steps
- impact
- severity
- fix/defer recommendation
- overall approval recommendation

## 3. Pass / fail decision rules
Define clear decision criteria for the manual smoke.

Examples:
- blocker: recommendation cannot be generated
- blocker: save/click/detail/outbound path is broken
- major: compare behaves inconsistently or state resets incorrectly
- medium: copy or disabled-state confusion without core breakage
- minor: small polish issues that do not block MVP flow

## 4. Link with current operational smoke
Make the relationship explicit between:
- browser-only manual smoke
- current environment-independent operational smoke

The execution pack should explain:
- what operational smoke already covers
- what still requires real browser validation
- how the two complement each other

## 5. Keep scope tight
Do not build process theater.
The deliverable should be practical, short, and directly usable by the operator.

# Completion Criteria
- A manual browser smoke execution procedure exists and is actionable
- A reusable smoke result template exists
- Pass/fail/severity criteria are explicit
- Browser-only validation and operational smoke are clearly separated
- No scope creep into automation/platform work
- Build/lint/type checks pass if any code/docs-linked changes require them

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

If only docs/scripts references changed and some validation is unnecessary, say so explicitly rather than pretending otherwise.

Also show:
- the new execution procedure document
- the result template
- the pass/fail decision rules
- how this connects to the existing operational smoke script and checklist

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Manual smoke execution-pack decisions applied
4. Pass/fail and issue-classification decisions applied
5. Deferred items and why
6. Validation results
7. Final approval recommendation