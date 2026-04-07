# Goal
Expand the controlled recommendation review set with a small number of new high-signal cases, run the updated review loop, and detect the next real recommendation-quality gap before opening another implementation batch.

# Scope
This batch is limited to:
- Adding a small number of new review cases to the controlled review set
- Choosing cases that are likely to expose the next real quality gap
- Re-running the controlled review flow with the expanded set
- Recording concrete pass / weak / fail evidence
- Producing a prioritized recommendation-quality gap summary for the next implementation batch

# Primary Objective
Find the next highest-value recommendation-quality gap using review evidence instead of opening another speculative enrichment or ranking batch.

# Allowed Changes
- Add or update controlled review-set fixture cases
- Add or update review runner/reporting scripts
- Add docs/ops artifacts summarizing the expanded review results
- Add small validation/reporting helpers if needed for the expanded set
- Update QA case expectations where justified

# Disallowed Changes
- Do not redesign ranking in this batch
- Do not implement broad metadata enrichment in this batch
- Do not add unrelated UI/product features
- Do not introduce heavy manual review workflow
- Do not mix implementation-heavy fixes into this batch

# Critical Safety Rule
This batch is for gap detection and prioritization only. Do not start changing runtime recommendation behavior unless a tiny script/fixture fix is absolutely necessary for the review flow itself.

# Working Principles
- Review-driven improvement only
- Small number of high-signal new cases
- Prefer realistic MVP cases over edge-case noise
- Pass / weak / fail judgments must be concrete
- The output must directly justify the next implementation batch
- Keep the process fast enough to sustain repeated iteration

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what recommendation quality is already stable
- why review-set expansion is the next correct step
- what risk this batch reduces

## 2. New Review Case Selection
Add only a small number of new review cases, ideally 2-3.
Each new case must document:
- request summary
- why it was chosen
- what possible quality gap it is intended to expose

Suggested case types:
- one new room-type/style combination not yet covered
- one product-type or category combination likely to expose ambiguity
- one case that may stress explanation specificity or metadata coverage

## 3. Review Execution
Run the expanded controlled review flow and record:
- total cases reviewed
- pass / weak / fail counts
- case-by-case judgments
- whether weak-result signaling matched reality
- whether explanation/ranking context remained aligned where relevant

## 4. Gap Detection Summary
Group new findings into practical buckets such as:
- style metadata gap
- room-type mismatch
- category alias gap
- product coverage gap
- explanation specificity gap
- metadata evidence gap
- over-repeated product issue

## 5. Prioritized Next Gap
Produce a short prioritized conclusion:
- what the next highest-value gap is
- why it matters now
- why it should be the next implementation batch instead of other possibilities

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. New review case summary
4. Expanded review run summary
5. Major findings
6. Prioritized next gap
7. Recommended next batch
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- the review set is expanded with a small number of useful new cases
- the expanded review loop is actually executed
- pass / weak / fail judgments are recorded concretely
- the next implementation batch is justified by review evidence
- the output is usable immediately for the next Codex task

# Validation
- run the relevant controlled review flow(s)
- lint/typecheck/build only if scripts/code changed
- verify artifacts are readable and reusable

# Required Result Format
Your final response must include:
- what new cases were added
- what the expanded review found
- what the next real quality gap is
- what should be implemented next and why