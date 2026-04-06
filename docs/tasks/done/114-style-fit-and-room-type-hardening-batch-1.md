# Goal
Harden recommendation quality for style fit and room-type intent so that the MVP produces recommendations that better reflect user-requested aesthetic direction and space usage, not only vector proximity and budget/category constraints.

# Scope
This batch is limited to:
- Auditing current style-fit and room-type handling in recommendation ranking
- Defining an MVP style/room-type quality baseline
- Adding explicit style semantics and room-type alignment rules where current behavior is too proxy-driven
- Improving QA visibility for style-fit and room-type-fit cases
- Keeping runtime stability and the existing category/budget baseline intact

# Primary Objective
Reduce the gap between user-requested style/room intent and top-ranked recommendation output.

# Allowed Changes
- Update recommendation ranking/filter helpers
- Add or refine style mapping logic
- Add or refine room-type affinity/penalty logic
- Add explicit quality signals for style/room mismatch
- Add or refine recommendation QA scripts and artifacts
- Add docs/ops artifacts defining the style-fit baseline

# Disallowed Changes
- Do not redesign the full recommendation architecture
- Do not introduce unrelated UI features
- Do not expand into checkout/order features
- Do not reintroduce legacy paths
- Do not add speculative complexity that is not measurable in QA

# Critical Safety Rule
Any style or room-type ranking change must remain explainable and measurable. Do not introduce opaque scoring behavior that QA cannot verify.

# Working Principles
- MVP recommendation quality should reflect user intent, not only generic similarity
- Style handling must become more explicit than current proxy-only scoring
- Room type must influence candidate preference in direct, reviewable ways
- Weak style-fit or room-fit should be surfaced, not hidden
- Preserve the current category/budget/dedupe baseline

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what recommendation quality is already stable
- why style/room-type is the next bottleneck
- what risk this batch reduces

## 2. Current Style / Room-Type Audit
Audit and document:
- how style is currently handled
- how room type is currently handled
- where current ranking can still violate obvious style intent
- where room-type mismatch is still possible

## 3. MVP Style / Room-Type Baseline
Define a practical baseline covering:
- requested style relevance in top recommendations
- room-type appropriateness
- mismatch surfacing for weak candidate sets
- explainability fields for style/room alignment

## 4. Ranking Hardening
Implement direct improvements where justified, such as:
- explicit style keyword/tag mapping
- room-type affinity boosts/penalties
- clearer requestText/style parsing behavior
- stronger mismatch penalties for obviously wrong room usage
- ranking/explainability fields that help QA understand style/room alignment

## 5. Quality QA
Add or update QA so the system can verify:
- style-constrained cases
- room-type-constrained cases
- mixed style + budget + category cases
- weak-result style/room mismatch visibility
- no regression in runtime stability

## 6. Stability Judgment
Classify result after this batch:
- STABLE BASELINE
- NEEDS ONE MORE HARDENING BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Style/room audit findings
4. Style/room baseline definition
5. Implemented improvements
6. QA findings
7. Stability judgment
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- style and room-type weaknesses are explicitly documented
- ranking is hardened in measurable ways
- QA can now evaluate style/room fit more concretely
- runtime remains stable
- the project is closer to a recommendation-quality baseline suitable for real MVP iteration

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- targeted recommendation-quality QA for style/room cases

# Required Result Format
Your final response must include:
- what style/room weakness was fixed
- what baseline now exists
- whether recommendation quality is now stable enough for MVP iteration
- what the next quality batch should be after this one