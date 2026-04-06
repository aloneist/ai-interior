# Goal
Harden MVP explanation generation by adding deterministic post-generation validation and fallback behavior, so runtime explanation text remains truthful and sufficiently specific even when model output is weak, generic, or structurally inconsistent.

# Scope
This batch is limited to:
- Adding deterministic validation for generated explanation output
- Adding runtime fallback behavior when explanation output is missing, malformed, key-mismatched, too generic, or contradicts ranking context
- Tightening explanation specificity rules in a narrow, measurable way
- Re-running controlled explanation QA and, if feasible, one controlled full `/api/mvp` fixture pass
- Documenting the resulting runtime explanation contract

# Primary Objective
Move explanation quality from prompt-only guidance to runtime-safe validation and fallback.

# Allowed Changes
- Update `/api/mvp` explanation handling
- Add explanation validation helpers
- Add deterministic fallback generation logic
- Add or refine controlled QA scripts and fixtures
- Add docs/ops artifacts for explanation runtime contract
- Make narrow prompt/payload changes only if directly justified

# Disallowed Changes
- Do not redesign recommendation ranking
- Do not add unrelated UI features
- Do not introduce heavy metadata systems
- Do not add broad architecture changes outside explanation handling
- Do not hide genuine weak-result cases just to improve apparent output quality

# Critical Safety Rule
Runtime explanation must not trust model output blindly. If generated text is missing, structurally broken, contradicts ranking context, or is too generic to be useful, the system must degrade safely with deterministic fallback.

# Working Principles
- Truthfulness before fluency
- Deterministic fallback before prompt complexity
- Keep explanation aligned with ranking context, weak reasons, and quality summary
- Generic explanation should be treated as weak output, not acceptable output
- Preserve runtime stability and keep changes narrow

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what explanation quality is already stable
- why runtime validation/fallback is the next correct step
- what risk this batch reduces

## 2. Explanation Validation Rules
Define and implement checks for at least:
- exact `product_key` match
- missing or empty `reason_short`
- contradiction with `style_fit`, `room_fit`, or `budget_fit`
- explanation too generic or missing item evidence
- structurally invalid explanation response

## 3. Runtime Fallback
Add deterministic fallback behavior for invalid/weak explanation output.
Fallback must:
- keep correct `product_key`
- avoid false-fit claims
- include item/category evidence where possible
- remain concise and MVP-safe

## 4. Specificity Hardening
Improve explanation quality so that valid explanations contain stronger item evidence, especially category/type noun inclusion where appropriate.

## 5. QA / Review Evidence
Re-run controlled explanation review and record:
- before vs after contradiction count
- before vs after weak/generic explanation count
- whether fallback was triggered and why
- if feasible, one controlled full `/api/mvp` fixture pass after validation/fallback hardening

## 6. Decision Output
Classify the explanation layer after this batch:
- EXPLANATION BASELINE STABLE
- IMPROVED BUT NEEDS ONE MORE REVIEW BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Validation rule findings
4. Fallback implementation summary
5. QA/review findings
6. Stability judgment
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- runtime no longer blindly trusts generated explanation output
- deterministic fallback exists
- explanation specificity is improved in measurable ways
- controlled QA is executed again
- the next explanation decision is supported by real evidence

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:mvp-explanation-review
- any new explanation fallback QA
- if feasible, one controlled `/api/mvp` fixture validation pass

# Required Result Format
Your final response must include:
- what runtime explanation validation now does
- when fallback triggers
- whether explanation output is now safe enough for MVP runtime use
- what should be fixed next, if anything