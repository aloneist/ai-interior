# Goal
Run a small, fast second metadata enrichment batch for the highest-frequency remaining non-overlay product targets, so MVP recommendation quality improves with minimal implementation time and without broadening the enrichment scope.

# Scope
This batch is limited to:
- Enriching only the top remaining high-frequency product targets that still lack explicit overlay metadata
- Keeping the batch intentionally small and fast
- Re-running the controlled `/api/mvp` QA harness and metadata audit to confirm improvement
- Producing clear before/after evidence for the targeted products only

# Primary Objective
Get the highest remaining recommendation-quality gain from the smallest practical metadata enrichment change.

# Allowed Changes
- Add small metadata overlay entries for the selected remaining targets
- Update the metadata overlay utility if needed for those entries
- Add or update audit/report artifacts for before/after comparison
- Add minimal docs/ops notes for the new enrichment targets

# Disallowed Changes
- Do not redesign recommendation ranking
- Do not expand enrichment to a broad catalog-wide effort
- Do not add a large metadata system
- Do not add unrelated UI/product features
- Do not change production schema
- Do not mix large explanation or ranking work into this batch

# Critical Safety Rule
Keep this batch intentionally small. Do not add more targets than can be implemented, reviewed, and validated quickly. This is a speed-conscious MVP improvement batch.

# Working Principles
- Smallest useful batch first
- High-frequency targets before long-tail products
- Evidence-based enrichment only
- Preserve honest weak-result behavior
- Use the controlled `/api/mvp` QA harness as the measurement anchor
- Prefer fast completion over perfect coverage

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why a small second metadata enrichment batch is the next correct step
- what quality risk this batch reduces

## 2. Target Selection
Select only the smallest high-impact remaining targets, ideally 1-2 products.
Document:
- why each target was chosen
- what gap remains today
- why the target is worth a fast batch now

## 3. Metadata Enrichment
For each selected target, add grounded metadata such as:
- style labels and confidence
- category aliases
- room-affinity hints
- color/material or short descriptive evidence if useful

## 4. QA / Before-After Evidence
Re-run:
- controlled `/api/mvp` QA
- metadata audit

Record:
- whether explicit metadata coverage improved
- whether explanation fallback changed
- whether pass/weak/fail stayed stable or improved
- whether ambiguity decreased for the targeted products

## 5. Decision Output
Classify the result after this batch:
- SMALL ENRICHMENT SUCCESSFUL
- SMALL IMPROVEMENT ONLY
- NOT WORTH CONTINUING THIS WAY

And explain why.

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Selected targets
4. Per-target enrichment summary
5. QA / before-after findings
6. Outcome classification
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- only a small number of targets were enriched
- the batch remains fast and reviewable
- controlled `/api/mvp` QA and metadata audit were re-run
- before/after evidence exists
- the next decision can be made quickly

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:controlled-mvp
- npm run qa:catalog-metadata-audit

# Required Result Format
Your final response must include:
- what small targets were enriched
- whether the small batch produced a measurable gain
- whether another small enrichment batch is justified
- what the next immediate step should be