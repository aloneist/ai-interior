# Goal
Improve MVP explanation specificity by making generated explanation text use the newly enriched catalog metadata more effectively, while reducing unnecessary fallback usage in the controlled `/api/mvp` QA path without changing recommendation ranking.

# Scope
This batch is limited to:
- Auditing why explanation fallback count did not improve after the first metadata enrichment batch
- Improving how explanation generation uses `catalog_metadata` and `ranking_context`
- Increasing explanation specificity, especially item/category evidence and explicit metadata-backed claims
- Reducing avoidable fallback triggers in the controlled `/api/mvp` QA path
- Re-running controlled `/api/mvp` QA and explanation QA to compare before/after evidence

# Primary Objective
Make explanation output more specific and evidence-based so it can use explicit metadata better and rely less often on deterministic fallback.

# Allowed Changes
- Update explanation payload construction
- Update explanation prompt wording in narrow, evidence-based ways
- Update explanation validation/fallback helpers only where directly justified
- Add or refine explanation QA scripts and reports
- Add docs/ops artifacts summarizing before/after explanation evidence usage
- Add small helper logic for selecting or formatting metadata evidence

# Disallowed Changes
- Do not redesign recommendation ranking in this batch
- Do not broaden metadata enrichment to a large new product set in this batch
- Do not add unrelated UI/product features
- Do not weaken truthfulness guards just to reduce fallback counts
- Do not reintroduce noisy live-only QA as the main validation path
- Do not create a second hidden explanation source outside the existing runtime path

# Critical Safety Rule
Do not reduce fallback count by relaxing contradiction or truthfulness checks. Fallback reduction is only valid if explanation output becomes genuinely more specific and still remains aligned with ranking context.

# Working Principles
- Truthfulness before fluency
- Specific evidence before generic phrasing
- Use explicit catalog metadata where available
- Preserve honest weak-result signaling
- Keep the change narrow, measurable, and reversible
- Use the controlled `/api/mvp` QA harness as the measurement anchor

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why explanation specificity is now the next correct focus
- what quality risk this batch reduces

## 2. Root Cause Audit
Audit and document:
- why explanation fallback count increased or did not improve after metadata enrichment
- whether the issue is prompt behavior, payload evidence selection, validation harshness, or weak item/category wording
- which cases/products most often still fall back

## 3. Metadata Evidence Usage Hardening
Implement narrow improvements so explanation generation uses explicit metadata better, such as:
- style labels and confidence where relevant
- item/category nouns
- room-affinity hints where grounded
- descriptive text snippets where helpful
- stronger selection of the best evidence to expose to the prompt

## 4. Explanation Specificity Hardening
Improve explanation output so it:
- mentions item/category/type evidence more consistently
- uses explicit metadata-backed language where available
- avoids generic “nice fit” style language
- remains aligned with `ranking_context`, `weak_reasons`, and budget/style/room signals

## 5. QA / Before-After Evidence
Re-run:
- controlled `/api/mvp` QA
- explanation review QA

Record:
- fallback count before/after
- contradiction count before/after
- weak/generic explanation count before/after
- cases where metadata evidence is now explicitly used
- whether weak cases remain honestly weak

## 6. Decision Output
Classify the result after this batch:
- EXPLANATION SPECIFICITY IMPROVED
- IMPROVED BUT NEEDS SECOND METADATA BATCH
- NOT READY

And explain why.

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Root-cause findings
4. Implemented explanation improvements
5. QA / before-after findings
6. Outcome classification
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- the main cause of current fallback persistence is identified
- explanation output becomes more metadata-evidence-driven in measurable ways
- controlled `/api/mvp` QA and explanation QA are re-run
- fallback count is evaluated honestly
- the next explanation/metadata decision is supported by real evidence

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:controlled-mvp
- npm run qa:mvp-explanation-review
- any additional targeted explanation QA added in this batch

# Required Result Format
Your final response must include:
- why fallback remained higher than expected
- what explanation-side change was made
- whether fallback use is now more acceptable for MVP
- what the next quality batch should be