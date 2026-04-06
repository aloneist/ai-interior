# Goal
Fix the highest-priority recommendation quality gap found in the first human review run by improving sofa-anchor coverage for explicit sofa-intent cases and making the human review runner use per-case room target profiles instead of a single fixed room vector.

# Scope
This batch is limited to:
- Auditing why sofa-intent cases fail to surface sofa products in top results
- Verifying whether the issue is caused by catalog coverage, vector coverage, category mapping, or ranking behavior
- Improving explicit furniture-intent anchoring for sofa cases in a narrow, measurable way
- Updating the human review runner so each review case can carry its own room target profile
- Re-running the human review flow and documenting before/after evidence

# Primary Objective
Close the most important product-quality gap from the first review run without overfitting the entire ranking system.

# Allowed Changes
- Update recommendation ranking helpers
- Update category/furniture-intent handling where needed
- Add or refine sofa/category alias handling if grounded
- Add or refine review-runner input schema so each case can specify room target values
- Add or update QA scripts and review reports
- Add docs/ops artifacts summarizing root cause and the applied fix

# Disallowed Changes
- Do not redesign the full recommendation architecture
- Do not introduce broad new metadata systems in this batch
- Do not add unrelated UI features
- Do not add speculative ranking complexity not supported by the review findings
- Do not mix large style-label implementation work into this batch

# Critical Safety Rule
Do not force sofa products into the top results blindly. First confirm whether the weakness comes from missing supply, missing vectors, bad category matching, or weak ranking weights. The fix must stay evidence-based and QA-measurable.

# Working Principles
- Review-driven fixes only
- Fix the highest-signal gap first
- Improve review evidence quality together with ranking quality
- Keep the change narrow, explainable, and measurable
- Preserve the existing category/budget/style/room baseline unless the sofa-anchor fix clearly requires adjustment

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why sofa-anchor coverage is the next highest-priority fix
- why the review runner also needs per-case room targets now

## 2. Sofa-Intent Root Cause Audit
Audit and document:
- whether sofa products exist in `furniture_products`
- whether corresponding rows exist in `furniture_vectors`
- whether sofa items are being filtered out, under-ranked, or mismatched by category logic
- whether current explicit furniture intent handling is too weak for sofa cases

## 3. Sofa-Anchor Hardening
Implement a narrow, grounded fix if justified, such as:
- stronger explicit furniture-intent anchoring for sofa requests
- better sofa-related category alias handling
- better handling of sofa-intent requests when coverage is weak
- clearer weak-result signaling if true sofa coverage is missing

## 4. Review Runner Room Targets
Upgrade the human review runner so each review case can define its own room target vector/profile.
This should reduce false repetition caused by one generic room target across unrelated review cases.

## 5. QA / Review Evidence
Re-run the review flow and record:
- before vs after summary for sofa-intent cases
- whether top 3 now contains at least one sofa candidate where it should
- whether repeated-top-product behavior decreases under per-case room targets
- whether weak-result signaling remains honest

## 6. Decision Output
Classify the outcome after this batch:
- SOFA GAP FIXED
- IMPROVED BUT NEEDS CATALOG COVERAGE
- NOT FIXED

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Sofa root-cause findings
4. Implemented fix
5. Review-runner improvements
6. QA/review findings
7. Outcome classification
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- the sofa-intent weakness is audited with concrete evidence
- a narrow fix or a clear coverage diagnosis is produced
- the review runner supports per-case room targets
- the updated review flow is executed again
- the next quality decision is supported by real evidence

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:recommendation-human-review-run
- any targeted recommendation-quality QA needed for sofa cases

# Required Result Format
Your final response must include:
- why sofa-intent cases were weak
- what was changed
- whether the weakness is actually fixed or blocked by missing catalog/vector coverage
- what should be the next quality batch after this one