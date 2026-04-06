# Goal
Fix the remaining sofa-related style-fit weakness found after sofa-anchor coverage was resolved, and align recommendation explanations with the actual ranking context so that the MVP no longer shows mechanically weak sofa cases when the underlying recommendation is otherwise correct.

# Scope
This batch is limited to:
- Auditing why sofa-intent cases still surface `weak_style_match`
- Improving sofa-related style-fit handling in a narrow, evidence-based way
- Reviewing and hardening explanation alignment between ranking context, weak reasons, and generated explanation text
- Re-running targeted QA for sofa style-fit and explanation consistency
- Documenting the outcome clearly for the next recommendation-quality iteration

# Primary Objective
Remove the remaining mismatch between correct sofa ranking and weak style-fit signaling, without broad ranking redesign.

# Allowed Changes
- Update style-fit logic or style keyword mapping where justified
- Add or refine sofa-related style proxy handling if grounded
- Add or refine explanation validation/review logic
- Add or update targeted QA scripts and review reports
- Add docs/ops artifacts summarizing root cause and the applied fix

# Disallowed Changes
- Do not redesign the full recommendation architecture
- Do not introduce a large metadata labeling system in this batch
- Do not add unrelated UI features
- Do not make broad ranking changes not supported by the review findings
- Do not hide genuine weak-result cases just to improve pass counts

# Critical Safety Rule
Do not turn weak sofa-style cases into false positives by masking weak signals. The fix must improve real style-fit logic or explanation consistency, not merely suppress weak-result reporting.

# Working Principles
- Review-driven fixes only
- Keep the change narrow and explainable
- Preserve current category/budget/style/room baseline unless the sofa-style issue explicitly requires adjustment
- Explanation text must not contradict ranking context or weak reasons
- Honest weak-result signaling is more important than superficially higher pass counts

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why sofa style-fit / explanation alignment is the next correct step
- what quality risk this batch reduces

## 2. Sofa Style-Fit Root Cause Audit
Audit and document:
- why the living-room sofa case still receives `weak_style_match`
- whether the issue is style keyword mapping, proxy scoring limits, missing metadata, or explanation mismatch
- whether the ranking result is correct but the style-fit classification is too harsh

## 3. Sofa Style-Fit Hardening
Implement a narrow, evidence-based fix if justified, such as:
- better sofa-related style keyword handling
- improved proxy-to-style interpretation for sofa cases
- clearer distinction between true style mismatch and insufficient explicit style evidence
- better weak-style signaling when style evidence is weak but non-contradictory

## 4. Explanation Alignment Review
Review and harden alignment across:
- ranking_context
- weak_reasons / weak_match_reasons
- generated explanation text (`reason_short`) where applicable

The goal is that explanation text does not claim a fit that the ranking context marks as mismatch.

## 5. QA / Review Evidence
Re-run targeted QA and record:
- before vs after for sofa style-fit cases
- whether weak-style classification improves appropriately
- whether explanation text aligns with ranking context
- whether honest weak-result signaling remains intact for genuinely weak cases

## 6. Decision Output
Classify the outcome after this batch:
- SOFA STYLE GAP FIXED
- IMPROVED BUT NEEDS METADATA ENRICHMENT
- NOT FIXED

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Sofa style-fit findings
4. Implemented fix
5. Explanation alignment findings
6. QA/review findings
7. Outcome classification
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- the remaining sofa style-fit weakness is audited with concrete evidence
- explanation alignment is explicitly reviewed
- a narrow fix or a clear metadata-limit diagnosis is produced
- targeted QA is executed again
- the next quality decision is supported by real evidence

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:recommendation-quality
- any targeted sofa-style / explanation QA added in this batch

# Required Result Format
Your final response must include:
- why sofa-style cases were still weak
- what was changed
- whether the weakness is actually fixed or blocked by missing metadata
- what should be the next quality batch after this one