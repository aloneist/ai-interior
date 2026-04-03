# Recommendation QA Run 2

## Run Summary
- Run date: 2026-04-02
- Baseline source: `data/qa/recommendation-baseline-v1.json`
- Comparison source: `data/qa/recommendation-qa-run-1.json`
- Coverage: 7 of 7 baseline cases reviewed
- Result split: 1 pass / 5 mixed / 1 fail
- Overall snapshot: the temporary catalog refresh materially improved candidate diversity and sofa relevance, but bedroom relevance and storage-led semantic targeting remain weak.

## Execution Method
This rerun was kept as close as possible to run 1 using the saved case inputs from `data/qa/recommendation-qa-run-1.json`.

Important constraint:
- run 1 did not preserve the original `imageUrl` values or room-analysis outputs
- the current rerun therefore used the same saved case preference inputs plus stable room-feature proxy values per baseline case
- this keeps the refreshed-catalog comparison practical and repeatable without changing product behavior

## Per-Case Review

### rec-qa-001
- Judgment: mixed
- Result summary: the top results now include compact sofas and small tables instead of a repeated table-plus-bench pair.
- Top results:
  - JÄTTEBO 예테보 1인용 모듈+수납, 삼살라 다크블루
  - GLOSTAD 글로스타드 2인용소파
  - SÖDERHAMN 쇠데르함 코너섹션, 토네루드 레드
- Observed positive signals:
  - compact sofas now appear at the top
  - the result set is more plausible for a studio-like mixed-use room
  - repeated-output behavior is clearly reduced versus run 1
- Observed failure signals:
  - the set is still sofa-heavy rather than a fuller mixed-use room solution
  - no explicit sleep-oriented or transformable-room reasoning is visible
- Reviewer notes: improved versus run 1, but still not a full pass because the solution remains narrow.
- Comparison vs run 1: improved from repetitive table/chair output to compact sofa-led output with better anchor-item relevance.

### rec-qa-002
- Judgment: fail
- Result summary: the refreshed catalog surfaces different items, but the bedroom-focused case still lacks bedroom-specific categories.
- Top results:
  - MÖRBYLÅNGA 뫼르뷜롱아 벤치
  - EKENÄSET 에케네세트 암체어
  - NÄMMARÖ 넴마뢰 수납상자
- Observed positive signals:
  - output variety improved relative to run 1
  - the set remains moderate in scale and does not drift into clearly oversized products
- Observed failure signals:
  - no bed, nightstand, dresser, or bedroom-storage category appears
  - room-type relevance is still weak
  - the top set still reads as generic furniture rather than a bedroom solution
- Reviewer notes: no meaningful quality recovery for bedroom intent.
- Comparison vs run 1: minor variety improvement only; core bedroom relevance did not improve.

### rec-qa-003
- Judgment: pass
- Result summary: the sofa-centered living-room case now returns only sofas in the top 10, fixing the clearest run 1 miss.
- Top results:
  - SÖDERHAMN 쇠데르함 코너섹션, 토네루드 레드
  - GLOSTAD 글로스타드 2인용소파
  - JÄTTEBO 예테보 1인용 모듈+수납, 삼살라 다크블루
- Observed positive signals:
  - sofa-only category dominance in the top 10
  - strong anchor-item relevance for a sofa-led living room
  - clear recovery from the run 1 fail state
- Observed failure signals:
  - sofa size and style variety are still imperfect
  - one or two top options remain more compact or sectional-specific than ideal
- Reviewer notes: this is the strongest quality improvement in run 2.
- Comparison vs run 1: improved from fail to pass, with direct recovery of sofa-centered relevance.

### rec-qa-004
- Judgment: mixed
- Result summary: the budget-sensitive case now surfaces an affordable sofa first, which is a real improvement, but the broader set is still uneven.
- Top results:
  - GLOSTAD 글로스타드 2인용소파
  - JÄTTEBO 예테보 1인용 모듈+수납, 삼살라 다크블루
  - NÄMMARÖ 넴마뢰 수납상자
- Observed positive signals:
  - an affordable sofa now ranks first
  - low-budget compatibility is more visible than in run 1
  - candidate diversity is improved
- Observed failure signals:
  - the rest of the set still mixes in items that do not form a clean budget-first bundle
  - the second-ranked sofa is less budget-friendly
- Reviewer notes: better than run 1, but not consistent enough for a pass.
- Comparison vs run 1: improved from a non-sofa budget set to a sofa-first budget-leaning set.

### rec-qa-005
- Judgment: mixed
- Result summary: the style-constrained case now shows more differentiated output, but style fit is still only partial.
- Top results:
  - JÄTTEBO 예테보 1인용 모듈+수납, 삼살라 다크블루
  - BOLLPOJKE 볼포이케 책상
  - GLOSTAD 글로스타드 2인용소파
- Observed positive signals:
  - the set is less repetitive than run 1
  - several products are still directionally compatible with a modern/minimal brief
  - sofa presence improved relative to run 1
- Observed failure signals:
  - style coherence is still not strong enough to read as a clearly curated modern minimalist room
  - category mix is broader, but not strongly style-expressive
- Reviewer notes: improved diversity, limited semantic style control.
- Comparison vs run 1: improved modestly through better variety and stronger sofa presence, but still mixed.

### rec-qa-006
- Judgment: mixed
- Result summary: the constrained-space case now favors smaller chairs and tables with more variety, but still leans too heavily on standalone small items.
- Top results:
  - NÄMMARÖ 넴마뢰 수납상자
  - BOLLPOJKE 볼포이케 책상
  - LOBERGET 로베리에트 / SIBBEN 시벤 어린이용 책상 의자+패드
- Observed positive signals:
  - small-space plausibility remains strong
  - the output is more varied than run 1
  - the set better reflects compact circulation constraints
- Observed failure signals:
  - the room solution still feels fragmented
  - several top items are small, but not necessarily the best overall room anchors
- Reviewer notes: improvement is real but still partial.
- Comparison vs run 1: improved on diversity and small-space plausibility, though still not a full room-composition win.

### rec-qa-007
- Judgment: mixed
- Result summary: the storage-priority case now starts with a storage-capable sofa and shows somewhat broader practical options.
- Top results:
  - JÄTTEBO 예테보 1인용 모듈+수납, 삼살라 다크블루
  - MÖRBYLÅNGA 뫼르뷜롱아 벤치
  - GLOSTAD 글로스타드 2인용소파
- Observed positive signals:
  - a storage-capable sofa ranks first
  - output diversity is better than run 1
  - storage utility is more visible in the leading set
- Observed failure signals:
  - storage is still not the dominant theme across the full result set
  - explicit storage-specific categories remain limited
- Reviewer notes: improved, but still too weak for a pass.
- Comparison vs run 1: improved from generic table-first output to a more storage-adjacent leading set.

## Common Strengths
- Repeated output was reduced substantially versus run 1.
- Sofa-centered relevance improved the most.
- Candidate diversity improved across studio, budget, style, and small-space cases.
- The refreshed catalog produces more plausible anchor items in several cases.

## Common Failure Patterns
- Bedroom relevance is still weak.
- Storage priority is still only partially expressed.
- Several cases still produce narrow or fragmented room solutions.
- Style fit remains coarse rather than clearly semantic.

## Improvement Summary Vs Run 1
- Overall judgment: improved
- Clear improvement areas:
  - sofa-centered living-room relevance
  - output diversity across cases
  - reduced repeated-output behavior
  - better affordable-sofa coverage in the budget case
- Limited or missing improvement:
  - bedroom-specific category relevance
  - strong storage-led ranking behavior
  - complete room-solution composition for constrained spaces

## Next Quality Priorities
- Improve bedroom and storage-specific category targeting.
- Improve room-solution composition so small-space and studio outputs do not collapse into loose item mixes.
- Preserve the improved sofa coverage while tightening style and storage semantics.
- Re-run this same baseline again after the next recommendation or catalog iteration to verify that the gains hold.
