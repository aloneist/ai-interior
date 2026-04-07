# Goal
Prioritize the next catalog metadata enrichment work so recommendation quality can improve through better product data, not more ranking churn, and make the priority list measurable through the controlled `/api/mvp` QA harness.

# Scope
This batch is limited to:
- Auditing which current catalog metadata gaps most affect recommendation quality
- Identifying high-impact products or product segments for metadata enrichment first
- Defining a practical MVP enrichment priority order for style/category/room-related metadata
- Connecting those priorities to the controlled `/api/mvp` QA harness so future before/after checks are possible
- Producing reusable documentation and artifacts for the next implementation batch

# Primary Objective
Decide where metadata enrichment should start so the next quality implementation batch improves recommendation relevance with the highest return for the least effort.

# Allowed Changes
- Add docs/ops artifacts describing metadata enrichment priorities
- Add scripts or reports that inspect current product metadata coverage
- Add QA-support artifacts that map candidate products/cases to likely metadata gaps
- Add small non-destructive helpers for metadata audit or reporting
- Add backlog/prioritization artifacts for the next implementation batch

# Disallowed Changes
- Do not redesign recommendation ranking in this batch
- Do not add unrelated UI/product features
- Do not introduce a large manual labeling system in this batch
- Do not change production schema or runtime write paths yet
- Do not mix the actual enrichment implementation into this prioritization batch

# Critical Safety Rule
This batch is for prioritization and evidence gathering, not broad runtime change. Do not start mutating production metadata at scale without first proving which enrichment targets matter most.

# Working Principles
- Improve recommendation quality through better product metadata, not endless ranking tweaks
- Prioritize high-impact/high-frequency products first
- Use the controlled `/api/mvp` QA harness as the measurement anchor
- Keep the enrichment approach sustainable for MVP operations
- Prefer explicit priorities over vague “metadata should improve” statements

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why metadata enrichment is the next correct focus
- what quality risk this batch reduces

## 2. Metadata Gap Audit
Audit current product metadata with emphasis on:
- style-label gaps
- weak category alias/semantic coverage
- weak room-type relevance evidence
- missing/weak descriptive text for top-ranked products
- products that repeatedly appear in QA runs but lack strong metadata support

## 3. Priority Model
Define a practical prioritization model, such as:
- high-frequency products in top results
- products causing repeated weak/mismatch signals
- product categories with the largest quality impact (for example sofa/table/chair)
- metadata fields with the highest likely ranking/explanation value

## 4. Recommended Enrichment Targets
Produce a concrete list of first enrichment targets:
- top product/product-group candidates
- which metadata should be enriched first
- why each target matters
- how future QA will verify the improvement

## 5. QA Measurement Link
Show how the controlled `/api/mvp` QA harness and existing review sets will be used to validate future enrichment results.
This must include:
- which cases are most relevant
- what before/after signals should improve
- what counts as a meaningful gain

## 6. Decision Output
Classify the output after this batch:
- READY FOR ENRICHMENT IMPLEMENTATION
- NEEDS ONE MORE AUDIT BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Metadata gap findings
4. Priority model
5. Recommended enrichment targets
6. QA measurement plan
7. Readiness judgment
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- current metadata gaps are explicitly identified
- enrichment priorities are concrete and ranked
- the next implementation batch can start from this output directly
- QA measurement for future enrichment is clearly tied to existing harness/review assets

# Validation
- run any metadata audit/reporting scripts added
- lint/typecheck/build only if code/scripts changed
- verify artifacts are readable and directly usable for the next batch

# Required Result Format
Your final response must include:
- what the biggest metadata gaps are
- what should be enriched first
- how future QA will prove the enrichment helped
- what the next implementation batch should be