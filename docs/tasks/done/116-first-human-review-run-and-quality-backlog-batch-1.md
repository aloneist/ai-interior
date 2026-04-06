# Goal
Run the first real human-style QA review pass using the new recommendation review set, record concrete pass/weak/fail findings, and turn those findings into a prioritized recommendation-quality backlog for the next implementation batches.

# Scope
This batch is limited to:
- Running the existing human review set against current recommendation outputs
- Recording structured findings for each case
- Identifying concrete quality gaps in current outputs
- Producing a prioritized backlog of recommendation-quality fixes
- Adding only minimal helper/reporting support if needed

# Primary Objective
Convert the newly created QA assets into an actual repeatable review loop that drives the next recommendation-quality improvements.

# Allowed Changes
- Add review result artifacts
- Add scripts/helpers that record or summarize review run output
- Add docs/ops review reports
- Add structured backlog documentation based on the review findings
- Add minimal non-runtime helpers if needed for repeatable review execution

# Disallowed Changes
- Do not redesign runtime ranking in this batch
- Do not add unrelated product features
- Do not introduce heavy manual workflow overhead
- Do not change recommendation behavior unless a tiny fix is absolutely necessary for the review process itself
- Do not mix implementation-heavy quality fixes into this batch

# Critical Safety Rule
This batch is for review execution and backlog creation, not for broad ranking changes. Keep the runtime stable and focus on producing trustworthy review evidence.

# Working Principles
- Review results must be concrete and reusable
- Prefer a small number of high-signal findings over long vague notes
- Distinguish clearly between pass / weak / fail
- Prioritize fixes that are both high-impact and realistic for MVP
- Use the existing review set as the reference baseline

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why the first real review run is the next correct step
- what quality risk this batch reduces

## 2. Review Execution
Run the human review set and record, for each case:
- request summary
- top results summary
- pass / weak / fail judgment
- why it passed or failed
- whether weak-result signaling matched reality
- whether ranking context and explanation were aligned

## 3. Finding Categories
Group findings into practical buckets such as:
- style metadata gap
- room-type mismatch
- category handling gap
- budget edge case
- weak-result surfacing issue
- explanation mismatch
- metadata incompleteness

## 4. Prioritized Backlog
Produce a short prioritized backlog with:
- issue name
- why it matters
- expected user impact
- likely implementation scope
- suggested priority order

## 5. Recommended Next Batch
Recommend the next single best implementation batch based on the review findings.

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Review run summary
4. Major findings
5. Prioritized backlog
6. Recommended next batch
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- the review set was actually run
- each case received a concrete judgment
- a usable backlog was created
- the next implementation batch is clearly justified by review evidence

# Validation
- run the review-set validator or supporting scripts
- lint/typecheck/build only if code/scripts changed
- verify artifacts are consistent and readable

# Required Result Format
Your final response must include:
- what the first review run found
- what the highest-priority quality gap is
- what should be fixed next
- why that next fix should come before others