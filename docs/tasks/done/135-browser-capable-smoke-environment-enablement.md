# Goal
Enable a browser-capable environment that can actually run the previously prepared manual browser smoke workflow, without expanding product scope or faking UI validation.

# Scope
This task is limited to enabling or proving a workable browser-capable execution path for manual MVP smoke.

This includes things like:
- checking/installing browser runtime dependencies
- checking whether an existing browser automation path can be enabled
- checking whether local/manual browser launch is possible
- checking whether a lightweight browser harness can be added safely
- documenting the exact usable execution path if successful

This task does NOT include actually performing the full manual smoke workflow unless the environment becomes usable during this task and doing so is trivially adjacent.

# Primary Objective
Create a real, usable browser-capable execution path for the already-prepared manual smoke pack, or conclude with a precise failure reason and a justified pivot to the operational data/publish track.

# Allowed Changes
- Add small environment/bootstrap documentation or scripts
- Add a minimal local browser test harness only if required and tightly scoped
- Install or wire a browser runtime/tool only if it is practical and low-risk in the current repo/workspace
- Add small README/setup notes if they directly support browser smoke execution
- Add small helper commands/scripts for launching the app and browser smoke environment

# Disallowed Changes
- Do not redesign the product
- Do not redesign ranking/scoring
- Do not build large end-to-end test infrastructure
- Do not add broad QA systems unrelated to the immediate browser capability goal
- Do not change recommendation/backend contracts in this step
- Do not use API smoke as a substitute for browser capability
- Do not perform speculative cleanup unrelated to browser environment enablement

# Critical Safety Rule
Do not claim browser capability unless an actual browser-capable execution path is confirmed and reproducible in the current environment.

# Working Principles
- Capability first, smoke second
- Reuse the existing manual smoke execution pack rather than recreating it
- Keep scope tight
- Be explicit about what was enabled versus what remains blocked
- Prefer the smallest workable browser path
- If capability cannot be enabled cleanly, stop and pivot rather than forcing it

# Required Behavior / Structure

## 1. Inspect current browser capability options
Check realistic browser-capable paths available in the current environment, including:
- preinstalled browser binaries
- existing automation tools
- installable lightweight browser tooling if appropriate
- repo-level support files or scripts
- whether local manual browser launch is feasible even without full automation

## 2. Attempt the smallest safe enablement
Try to establish the smallest workable path for actual browser-based smoke.

Examples:
- usable local Chrome/Chromium path
- lightweight Playwright setup if appropriate and low-risk
- a documented manual browser launch path tied to the local/staging app
- minimal helper scripts for starting the app and browser smoke workflow

## 3. Reuse the prepared manual smoke contract
Do not rebuild the execution logic if the branch/earlier work already defined:
- scenario order
- evidence rules
- stop rules
- severity rules
- approval rules

Instead, make that pack executable in practice.

## 4. Decide clearly: enabled or blocked
At the end of this task, the result must be one of:
- browser-capable smoke environment enabled
- browser-capable smoke still blocked, with exact blocker(s) stated

If blocked, the result must clearly recommend pivoting to the operational data review/publish operating track.

# Completion Criteria
- A real browser-capable execution path is confirmed and documented, OR
- a precise blocker report is produced with no fake completion
- no product/backend contract drift
- no broad QA infrastructure sprawl
- build/lint/type checks pass if code/config changed

# Validation
Run and report if changes were made:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also report:
- exact browser-capable path attempted
- what succeeded
- what failed
- whether the prepared manual smoke pack can now be executed
- if not, why not
- whether pivot to operational data/publish work is now recommended

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Browser capability paths checked
3. What changed
4. Final capability outcome
5. Deferred items and why
6. Validation results
7. Final approval recommendation