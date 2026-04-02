# Recommendation QA Run 1

## Run Summary
- Run date: 2026-04-02
- Baseline used: `data/qa/recommendation-baseline-v1.json`
- Execution target: `/api/mvp`
- Cases reviewed: 7
- Result split: 0 pass / 5 mixed / 2 fail
- Overall snapshot: the system is stable enough to review, but current recommendation differentiation is weak and category coverage is narrow

## Method
This run used the existing baseline and mapped each case to the current MVP request inputs:
- `imageUrl`
- `roomType`
- `styles`
- `budget`
- `furniture`
- `requestText`

Each case was executed once.
This report records observed output only.
No product logic was changed.

## Per-Case Review
### rec-qa-001
- Judgment: mixed
- Scenario: small studio / one-room setup
- Brief result summary: compact items were returned and no oversized products appeared, but the system did not surface a clear mixed-use studio anchor item
- Observed positive signals:
  - compact table and storage bench are directionally plausible for a smaller room
  - no bulky lounge furniture dominated the result
  - grouped copy reflected the small-space request text
- Observed failure signals:
  - no sofa or mixed-use anchor item appeared
  - the output was effectively the same as several other cases
  - short reasons stayed generic
- Reviewer notes: useful for exposing small-space limits, but category variety is too narrow for a stronger verdict

### rec-qa-002
- Judgment: fail
- Scenario: bedroom-focused request
- Brief result summary: the output stayed calm and compact but did not produce bedroom-relevant categories
- Observed positive signals:
  - products were not obviously off-budget
  - grouped summary acknowledged bedroom and calm/minimal preferences
- Observed failure signals:
  - no bed, nightstand, dresser, or bedroom-storage category appeared
  - room-context fit was weak because the products still read as generic table/chair picks
  - short explanations were not bedroom-specific
- Reviewer notes: this is a clear room-type relevance miss

### rec-qa-003
- Judgment: fail
- Scenario: living room / sofa-centered request
- Brief result summary: the system did not return a sofa despite an explicit sofa-centered living-room request
- Observed positive signals:
  - output stayed coherent instead of becoming random
  - grouped summary preserved the sofa-first wording from the input
- Observed failure signals:
  - no sofa category appeared
  - category relevance was poor for a sofa-led living-room case
  - the product set was nearly identical to non-sofa cases
- Reviewer notes: this is the strongest miss in the run because it directly hits a core MVP expectation

### rec-qa-004
- Judgment: mixed
- Scenario: budget-sensitive request
- Brief result summary: budget fit was directionally reasonable, but the output still missed the requested sofa focus
- Observed positive signals:
  - both returned items stayed in a lower price band
  - budget summary copy reflected the low-budget request
  - the cheaper bench surfaced in the budget grouping
- Observed failure signals:
  - no sofa appeared
  - the result set did not materially diversify from the other cases
  - short reasons did not explicitly explain affordability or value
- Reviewer notes: there is some budget sensitivity, but not enough category relevance for a pass

### rec-qa-005
- Judgment: mixed
- Scenario: style-constrained modern minimalist request
- Brief result summary: style fit was directionally acceptable, but the output remained too repetitive and too narrow to show strong style control
- Observed positive signals:
  - returned products were broadly compatible with a minimal/modern direction
  - grouped summary reflected the selected styles cleanly
- Observed failure signals:
  - the same two products appeared again with minimal differentiation
  - the style-constrained case did not show a broader curated set
  - short reasons were generic rather than style-grounded
- Reviewer notes: style wording is visible in the output, but style discrimination is still shallow

### rec-qa-006
- Judgment: mixed
- Scenario: small-space / narrow-room constraint
- Brief result summary: the returned categories were directionally better for a tight room, but the output still lacked strong small-space differentiation
- Observed positive signals:
  - a table and chair pairing is more plausible than bulky lounge furniture here
  - no oversized items appeared
  - grouped summary preserved the circulation-focused request
- Observed failure signals:
  - the output remained almost identical to the studio and style cases
  - short reasons did not explicitly address footprint or circulation
  - the system did not show stronger small-space prioritization than in generic cases
- Reviewer notes: this shows avoidance of large items more than active compact-fit reasoning

### rec-qa-007
- Judgment: mixed
- Scenario: storage-priority case
- Brief result summary: the storage bench helped, but storage was not the primary outcome and the top recommendation remained a generic table
- Observed positive signals:
  - the storage bench surfaced in the set
  - one short reason explicitly mentioned storage
- Observed failure signals:
  - the top recommendation was still a plain table rather than a storage-first item
  - no dresser, shelf, cabinet, or bedroom-storage category appeared
  - the result stayed too close to the non-storage bedroom case
- Reviewer notes: storage is partially recognized but still too weak for a pass

## Common Strengths
- All seven cases returned successful responses.
- The system consistently avoided obviously oversized recommendations.
- Budget-low behavior showed some directional sensitivity.
- Grouped recommendation summaries reflected room type, budget, style, and request text cleanly.

## Common Failure Patterns
- The same two products appeared across every case.
- Category relevance was weak for bedroom, sofa-first living-room, and storage-led scenarios.
- Room-type and style changes had limited visible effect on the actual product set.
- Short explanations were often generic and only loosely grounded in product-room fit.
- Small-space, storage, and mixed-use intents were only partially recognized.

## Baseline Usability Judgment
Baseline v1 is usable with minor refinement.

Why:
- it was small enough to run quickly
- it exposed obvious category-fit and differentiation problems without needing a scoring framework
- it produced actionable next priorities

What minor refinement would help:
- add an optional input-mapping note per case for the current MVP controls
- keep the baseline structure otherwise unchanged

## Next Quality Priorities
1. Improve category and catalog coverage before tuning ranking details.
2. Strengthen room-type relevance so bedroom, living-room, and storage-led requests produce distinct product sets.
3. Increase request-text sensitivity for sofa intent, small-space intent, and storage intent.
4. Ground short explanations more tightly in actual product attributes and the active scenario.
5. Re-run this same baseline after any recommendation-data or selection improvement.
