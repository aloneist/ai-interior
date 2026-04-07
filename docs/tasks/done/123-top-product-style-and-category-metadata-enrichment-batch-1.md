# Goal
Implement the first small, high-impact catalog metadata enrichment batch for the top-priority products identified in the metadata audit, so recommendation quality improves through better explicit style/category/room evidence rather than further ranking churn.

# Scope
This batch is limited to:
- Enriching the top-priority product set identified in the metadata audit (P0-P4)
- Adding a safe and maintainable enrichment path, such as a small metadata overlay or import-safe enrichment utility
- Improving explicit style/category/room evidence for those products
- Re-running the controlled `/api/mvp` QA harness and metadata audit to compare before/after signals
- Producing clear before/after evidence for the enriched products

# Primary Objective
Increase recommendation quality for the highest-impact products by adding explicit metadata where current ranking and explanation logic are too dependent on weak text clues or vector proxies.

# Allowed Changes
- Add a small metadata overlay file or import-safe enrichment utility
- Update product metadata for the audited top-priority products only
- Add helper logic that merges enrichment metadata safely into the published product shape
- Add or update QA scripts/reports that compare before/after results
- Add docs/ops artifacts documenting the enrichment rules and outcomes

# Disallowed Changes
- Do not redesign recommendation ranking in this batch
- Do not start broad catalog-wide metadata mutation
- Do not add a large manual labeling system
- Do not add unrelated UI/product features
- Do not weaken production source-of-truth discipline
- Do not mix schema redesign into this batch

# Critical Safety Rule
Keep enrichment small, explicit, and reversible. Do not create a second hidden product source of truth. Any overlay or utility must clearly feed or decorate the existing published catalog path without replacing it conceptually.

# Working Principles
- High-impact products first
- Better metadata before more ranking tweaks
- Keep the approach sustainable for MVP operations
- Preserve honest weak-result behavior
- Use the controlled `/api/mvp` QA harness as the measurement anchor
- Produce before/after evidence, not only code changes

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why top-product metadata enrichment is the next correct step
- what quality risk this batch reduces

## 2. Enrichment Strategy
Define and implement a practical strategy for P0-P4 only, such as:
- small overlay metadata for style labels / confidence
- category alias clarification
- room-affinity hints
- stronger descriptive text or evidence fields
- minimal color/material enrichment where it improves explanation/ranking

The strategy must remain MVP-safe and maintainable.

## 3. Priority Product Enrichment
Apply enrichment to the audited targets:
- P0 `TÄRNÖ`
- P1 `LOBERGET / SIBBEN`
- P2 `NÄMMARÖ`
- P3 `GLOSTAD`
- P4 `PERJOHAN`

For each target, document:
- what metadata was added or clarified
- why it matters
- what expected QA effect should improve

## 4. Integration Behavior
Show how the enrichment data is used by the existing recommendation/explanation path without changing the published source-of-truth principle.

## 5. QA / Before-After Evidence
Re-run:
- controlled `/api/mvp` QA
- metadata audit

Record:
- pass/weak/fail changes if any
- explanation fallback changes if any
- explicit style/category evidence changes
- reduction in ambiguity for targeted products

## 6. Decision Output
Classify the result after this batch:
- ENRICHMENT BATCH SUCCESSFUL
- IMPROVED BUT NEEDS SECOND ENRICHMENT BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Enrichment strategy
4. Per-product enrichment summary
5. QA / before-after findings
6. Outcome classification
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- P0-P4 metadata enrichment is actually implemented
- the enrichment path is explicit and maintainable
- controlled `/api/mvp` QA and metadata audit are re-run
- before/after evidence is produced
- the next enrichment decision is supported by real QA evidence

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:controlled-mvp
- npm run qa:catalog-metadata-audit
- any additional targeted QA added in this batch

# Required Result Format
Your final response must include:
- what metadata was enriched
- how it affected controlled QA
- whether the enrichment approach is sustainable
- what the next recommendation-quality batch should be