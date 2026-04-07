# Goal
Tighten direct-chair intent handling so the recommendation system stops treating bench/storage/support items as equivalent to real chairs when the user explicitly asks for a chair, while preserving those items for support-oriented contexts where they still make sense.

# Scope
This batch is limited to:
- Using existing overlay/category alias evidence to distinguish direct chairs from bench/storage/support items
- Tightening recommendation ranking or category-fit interpretation only for direct chair intent cases
- Preserving current behavior for support contexts where non-chair support items remain useful
- Re-running the controlled `/api/mvp` QA harness to verify the direct-chair improvement
- Producing narrow before/after evidence for the affected chair cases

# Primary Objective
Fix the next real recommendation-quality gap identified by review evidence without opening a broad ranking or metadata redesign.

# Allowed Changes
- Update recommendation ranking/category-fit logic for direct chair intent
- Use existing catalog metadata overlay aliases and support-role hints
- Add or refine direct-chair semantic helpers if needed
- Add or update targeted QA/reporting for chair-intent cases
- Add docs/ops artifacts summarizing the chair strictness change and evidence

# Disallowed Changes
- Do not redesign overall ranking
- Do not broaden metadata enrichment in this batch
- Do not add unrelated UI/product features
- Do not weaken honest weak-result behavior
- Do not treat all support/storage items as globally bad recommendations
- Do not mix large room-type or style changes into this batch

# Critical Safety Rule
Tighten only direct chair intent. Do not globally demote bench/storage/support items across all contexts. The fix must remain context-aware and review-driven.

# Working Principles
- Fix only the identified gap
- Use existing metadata before adding more metadata
- Preserve support-role usefulness where appropriate
- Prefer narrow semantic strictness over broad category rewrites
- Use the controlled `/api/mvp` QA harness as the measurement anchor
- Keep the batch small and fast for MVP iteration

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why direct-chair semantic strictness is the next correct step
- what quality risk this batch reduces

## 2. Root Cause Audit
Document:
- why direct chair intent currently over-accepts bench/storage/support items
- which existing aliases or metadata signals are already available
- why this is a ranking/category-fit interpretation issue rather than a new metadata issue

## 3. Chair Strictness Hardening
Implement a narrow, grounded change so that:
- real chair items are preferred for direct chair intent
- bench/storage/support items are downgraded for direct chair intent
- support-role items are not globally penalized in contexts where they remain useful

## 4. QA / Before-After Evidence
Re-run controlled `/api/mvp` QA and record:
- whether direct chair top results now contain more real chair items
- whether bench/storage/support items are downgraded appropriately
- whether weak-result behavior remains honest
- whether unrelated stable cases remain stable

## 5. Decision Output
Classify the result after this batch:
- DIRECT CHAIR GAP FIXED
- IMPROVED BUT NEEDS CATEGORY SEMANTICS BATCH
- NOT FIXED

And explain why.

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Root-cause findings
4. Implemented change
5. QA / before-after findings
6. Outcome classification
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- direct chair intent becomes semantically stricter
- support/storage items are not globally broken
- controlled `/api/mvp` QA is re-run
- before/after evidence exists
- the next decision can be made quickly

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run qa:controlled-mvp
- any targeted chair-intent QA added in this batch

# Required Result Format
Your final response must include:
- why chair intent was too loose
- what was changed
- whether the chair gap is actually fixed
- what should be the next small batch after this one