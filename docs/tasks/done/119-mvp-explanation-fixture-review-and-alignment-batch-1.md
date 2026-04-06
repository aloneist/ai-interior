# Goal
Run a controlled QA batch for `/api/mvp` explanation text using stable fixtures or a mockable explanation path, and verify that generated explanation output stays aligned with ranking context, weak reasons, and quality summary without making false-fit claims.

# Scope
This batch is limited to:
- Defining or selecting stable explanation review fixtures
- Running `/api/mvp` explanation generation in a controlled way, or using a mockable explanation path if needed for repeatability
- Reviewing generated explanation text against ranking context, weak reasons, and quality summary
- Recording concrete pass/weak/fail explanation findings
- Producing a prioritized explanation-quality backlog if gaps are found
- Adding only minimal helper/reporting support needed for repeatable explanation review

# Primary Objective
Make explanation quality review evidence-based and repeatable, so the project can verify that explanation text is truthful to the actual ranking signals.

# Allowed Changes
- Add or update fixture files for explanation review
- Add or update scripts/helpers that run controlled explanation QA
- Add or update docs/ops review reports
- Add small non-runtime helpers that improve explanation review repeatability
- Add narrow prompt/payload adjustments only if directly justified by the review findings

# Disallowed Changes
- Do not redesign recommendation ranking in this batch
- Do not add unrelated product features
- Do not introduce a heavy manual workflow
- Do not add broad metadata systems in this batch
- Do not mix large runtime refactors into this batch

# Critical Safety Rule
This batch is for controlled explanation review first. Do not make broad prompt changes without concrete fixture-based evidence that the current explanation text is misaligned.

# Working Principles
- Explanation text must never claim a fit that ranking context marks as mismatch or uncertain
- Controlled fixtures are more valuable than noisy live sampling
- Prefer concise, high-signal review findings over vague commentary
- Distinguish clearly between pass / weak / fail
- Preserve current ranking behavior unless a tiny explanation-alignment fix is directly justified

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what recommendation quality is already stable
- why explanation review is the next correct step
- what risk this batch reduces

## 2. Fixture Strategy
Define and document:
- which stable inputs/fixtures are used
- whether `/api/mvp` is called directly or a controlled/mockable explanation path is used
- why the chosen strategy is repeatable enough for QA

## 3. Explanation Review Execution
Run the controlled explanation review and record, for each case:
- request summary
- ranking context summary
- weak reasons / quality summary summary
- generated explanation text
- pass / weak / fail judgment
- why it passed or failed

## 4. Alignment Criteria
Review and document at minimum:
- whether explanation claims style fit when style_fit is mismatch
- whether explanation claims room fit when room_fit is mismatch
- whether explanation ignores budget mismatch or uncertainty
- whether explanation sounds overconfident in weak-result cases
- whether explanation and ranking context materially disagree

## 5. Findings and Backlog
Group findings into practical buckets such as:
- style-fit claim mismatch
- room-fit claim mismatch
- budget-fit claim mismatch
- weak-result overconfidence
- explanation too generic
- explanation missing the strongest ranking evidence

Produce a short prioritized backlog if fixes are needed.

## 6. Decision Output
Classify the current explanation layer after this batch:
- EXPLANATION BASELINE STABLE
- NEEDS ONE MORE EXPLANATION HARDENING BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Fixture strategy
4. Review run summary
5. Major explanation findings
6. Prioritized backlog
7. Stability judgment
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- a repeatable explanation review method exists
- controlled explanation review was actually executed
- each reviewed case received a concrete judgment
- a usable backlog was created if issues were found
- the next explanation decision is supported by real evidence

# Validation
- run the explanation review script/flow
- lint/typecheck/build only if code/scripts changed
- verify artifacts are readable and reusable
- preserve runtime stability

# Required Result Format
Your final response must include:
- what the explanation review found
- whether explanation text is currently trustworthy enough for MVP
- what the highest-priority explanation gap is if any
- what should be fixed next and why