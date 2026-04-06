# Recommendation Human Review Run

## Run Summary

- Date: 2026-04-06
- Review set: `data/qa/recommendation-human-review-set-v1.json`
- Runner: `npm run qa:recommendation-human-review-run`
- Route: `/api/recommend`
- Room targets used by runner:
  - brightness: `58`
  - temperature: `58`
  - footprint: `48`
  - minimalism: `62`
  - contrast: `42`
  - colorfulness: `38`
- Candidate count per case: `27`
- Deduped candidate count per case: `27`

Summary:

| Judgment | Count |
| --- | ---: |
| pass | 4 |
| weak | 2 |
| fail | 0 |

Important limitation:

- This run reviewed ranking context from `/api/recommend`.
- It did not exercise `/api/mvp` explanation generation, so explanation alignment is recorded as not evaluated in this pass.

## Case Findings

| Case | Judgment | Evidence | Weak signaling | Context / explanation alignment |
| --- | --- | --- | --- | --- |
| `hqa-category-chair-workspace-low` | pass | top3 category preferred `2`, budget within `3`, style fit `2`, room fit `3` | not weak; correct | ranking context aligned; no explanations generated |
| `hqa-budget-living-sofa-low` | weak | top3 sofa/category preferred `0`, budget within `3`, style fit `1`, room fit `3` | `weak_category_match`; correct | ranking context clearly showed category mismatch; no explanations generated |
| `hqa-style-warm-calm-table` | pass | top3 category preferred `2`, budget within `3`, style fit `3`, room fit `3` | not weak; correct | ranking context aligned; no explanations generated |
| `hqa-room-dining-modern-table` | pass | top3 category preferred `2`, budget within `3`, style fit `1`, room fit `3` | not weak; correct | style mismatches were visible per item; no explanations generated |
| `hqa-mixed-workspace-chair-style-budget` | pass | top3 category preferred `2`, budget within `3`, style fit `2`, room fit `3` | not weak; correct | ranking context aligned; no explanations generated |
| `hqa-weak-workspace-sofa-low` | weak | top3 sofa/category preferred `0`, budget within `3`, style fit `1`, room fit `3` | `weak_category_match`; correct | ranking context clearly showed category mismatch; no explanations generated |

## Major Findings

### 1. Sofa-anchor coverage is the clearest quality gap

Both sofa-intent cases were weak:

- `hqa-budget-living-sofa-low`
- `hqa-weak-workspace-sofa-low`

The top 3 did not contain a sofa in either case. This is acceptable for the intentionally weak workspace sofa case, but it is a real product-quality issue for a living-room sofa request.

### 2. Weak-result signaling worked

Weak sofa cases returned `quality_summary.weak_result=true` with `weak_category_match`. Per-item `weak_match_reasons` also showed category mismatch. This is the correct behavior when the system cannot satisfy the explicit furniture request.

### 3. Top-result repetition is too high

The same three products dominated all six cases:

- `GULTARP` stool
- `TÄRNÖ` table
- `LOBERGET / SIBBEN` child desk chair

This may be partly caused by the runner's fixed room-vector targets, but it is still a QA risk because very different user intents are producing nearly identical top results.

### 4. Style metadata is usable but still shallow

Style-fit counts met the fixture thresholds. However, item-level `style_mismatch` still appeared inside otherwise passing top 3 sets. This is acceptable for now because each passing style/mixed case still had at least one explicit/proxy style-fit item.

### 5. Explanation alignment is still unreviewed

The review runner used `/api/recommend`, which does not generate `reason_short`. Ranking context was usable, but explanation/context alignment still needs a follow-up review against `/api/mvp` or a separate explanation fixture.

## Prioritized Backlog

### P0. Sofa-anchor coverage and explicit furniture request handling

- Why it matters: sofa-led living-room recommendations are a core MVP use case.
- User impact: a user asking for a sofa gets chairs/tables, even though weak signaling works.
- Likely scope: audit whether sofa products exist in `furniture_products` and `furniture_vectors`; if present, adjust explicit furniture anchor selection so at least one viable sofa can surface when requested; if absent, prioritize catalog/vector coverage.
- Evidence: `hqa-budget-living-sofa-low` and `hqa-weak-workspace-sofa-low` both had top3 preferred category count `0`.

### P1. Per-case room target profiles for the human review runner

- Why it matters: fixed room targets may over-concentrate the same products across unrelated review cases.
- User impact: future QA may overfit to one generic room profile instead of testing realistic room variation.
- Likely scope: add optional `roomTargets` to the review set and runner; keep defaults for cases without overrides.
- Evidence: all six cases returned the same dominant top 3 products.

### P2. Top-result diversity guardrail

- Why it matters: repeated products across unrelated intents reduce perceived recommendation quality.
- User impact: users see the same cheap utility items even when style/room/category intent changes.
- Likely scope: after P1, add a small diversity/tie-break guardrail if repetition persists under varied room targets.
- Evidence: `GULTARP`, `TÄRNÖ`, and `LOBERGET / SIBBEN` dominated all six cases.

### P3. Explanation alignment review path

- Why it matters: user-facing trust depends on explanations matching the ranking context.
- User impact: a good ranking can still feel wrong if the explanation claims a mismatched style/category fit.
- Likely scope: add an `/api/mvp` review mode or a separate explanation QA fixture that records `reason_short` against `ranking_context`.
- Evidence: this run could not evaluate explanations because `/api/recommend` does not generate them.

### P4. Style metadata enrichment for high-frequency products

- Why it matters: repeated top products need confirmed style labels if they continue dominating outputs.
- User impact: style-fit may remain shallow or proxy-driven for common products.
- Likely scope: apply the metadata proposal to the top repeated catalog items first.
- Evidence: passing cases still included item-level `style_mismatch` in top 3.

## Recommended Next Batch

Run `P0 + P1` as the next implementation batch:

`117-sofa-anchor-coverage-and-review-runner-room-targets-batch-1`

Reason:

- P0 addresses the strongest actual product gap: sofa-intent requests are not getting sofa candidates.
- P1 prevents overfitting the fix to a single generic room-vector profile.
- Together they improve both recommendation quality and review evidence quality without broad ranking redesign.
