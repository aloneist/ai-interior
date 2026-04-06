# Goal
Improve recommendation quality beyond the current stable ranking baseline by defining better catalog style metadata rules and creating a practical human QA review set for repeated product-quality evaluation.

# Scope
This batch is limited to:
- Defining a practical MVP style metadata enrichment approach for catalog items
- Defining a practical human QA review set for recommendation quality checks
- Adding light-weight helpers, docs, or QA artifacts that support repeatable style/room/category/budget review
- Improving quality observability without redesigning the recommendation architecture

# Primary Objective
Move recommendation quality improvement from ranking-only tuning to better product metadata and repeatable human review.

# Allowed Changes
- Add docs/ops artifacts for style metadata rules
- Add docs/ops artifacts or fixtures for human QA review cases
- Add small helper scripts for QA set generation or validation
- Add non-destructive metadata mapping helpers if needed
- Add explicit recommendation review criteria for operators/QA

# Disallowed Changes
- Do not redesign the recommendation architecture
- Do not add unrelated product features
- Do not introduce broad labeling systems that cannot be operated
- Do not change runtime data sources in speculative ways
- Do not add heavy manual process overhead that the project cannot sustain

# Critical Safety Rule
Any added metadata or QA process in this batch must be realistic to maintain. Do not propose a labeling system that is too expensive or too vague to operate.

# Working Principles
- Better metadata should directly improve recommendation relevance
- Human QA should focus on small, high-value review sets
- Keep the process sustainable for MVP
- Prefer explicit labels and examples over abstract quality language
- Build assets that future recommendation changes can be tested against

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what recommendation quality is already stable
- why metadata enrichment and QA sets are the next step
- what quality risk this batch reduces

## 2. Catalog Style Metadata Proposal
Define an MVP-safe style metadata approach:
- which style labels should exist
- how labels can be inferred or assigned
- what minimum confidence/quality rule should apply
- how style metadata should relate to room-type and category logic

## 3. Human QA Review Set
Create a practical review set covering:
- category-constrained cases
- budget-constrained cases
- style-constrained cases
- room-type-constrained cases
- mixed cases
- intentionally weak-result cases

## 4. QA Review Rules
Define clear pass/fail or acceptable/weak review criteria:
- what counts as a good top result
- what counts as acceptable weak-result surfacing
- what should trigger follow-up fixes

## 5. Decision Output
Classify the output after this batch:
- READY FOR ONGOING MVP ITERATION
- NEEDS ONE MORE QA-ASSET BATCH
- NOT READY

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Metadata proposal
4. Human QA review set summary
5. Review criteria
6. Readiness judgment
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- a practical style metadata proposal exists
- a usable human QA review set exists
- QA criteria are explicit enough to reuse in future batches
- the result is sustainable for MVP operations

# Validation
- lint/typecheck/build if code/scripts changed
- validate any new fixtures/scripts
- ensure the review set is usable and not just theoretical

# Required Result Format
Your final response must include:
- what metadata approach is proposed
- what QA set now exists
- whether this is enough to support ongoing recommendation iteration
- what the next recommendation-quality batch should be