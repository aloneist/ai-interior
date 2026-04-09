# Livart Breadth And Price Semantics Validation - 2026-04-09

## Scope

Validate whether Livart can move beyond the initial two-sofa sample by testing a broader small batch, inspecting discounted vs non-discounted price semantics, and re-running the existing intake -> audit -> publish -> verify workflow.

## Batch Used

- `https://mall.hyundailivart.co.kr/p/P200168513`
- `https://mall.hyundailivart.co.kr/p/P200136061`
- `https://mall.hyundailivart.co.kr/p/P100033578`
- `https://mall.hyundailivart.co.kr/p/P100023620`

Category intent in this batch:

- sofa
- living-room storage
- bookshelf/storage
- bed

Pricing intent in this batch:

- discounted PDPs with visible sale/current price
- non-discounted PDP with a single effective price

## Failure Mode Observed Before Hardening

Before this hardening pass, Livart staging succeeded but extraction was weak in two specific ways:

1. Discounted PDPs were using base/start price instead of the visible operational sale/current price.
2. `거실장` PDPs could fall through category resolution and stage without a usable category.

Observed examples:

- `P200168513`
  - visible price: `2,006,400`
  - staged price before fix: `2,112,000`
- `P200136061`
  - visible price: `255,500`
  - staged price before fix: `269,000`
  - staged category before fix: `null`
- `P100023620`
  - visible price: `327,700`
  - staged price before fix: `345,000`

This was a Livart parser issue, not a publish-gate issue.

## Code Change

Updated [livart.ts](/workspaces/ai-interior/lib/parsers/sites/livart.ts).

Applied only two narrow Livart-specific changes:

1. Price selection now prefers the visible current/sale price on the PDP before falling back to `#startPrice` or weaker signals.
2. Livart category resolution now maps `거실장|TV장|티비장` pages to `storage` before falling back to the generic category resolver.

No publish-gate rules were loosened.
No generic parser framework rewrite was introduced.

## Post-Hardening Intake Results

Re-imported the same four URLs through the existing intake route.

- `c4b9f6fe-0c1c-4b32-b8dd-7d16edccc049`
  - URL: `P200168513`
  - category: `sofa`
  - price: `2006400`
  - selected price source: `visible_sale_or_current_price`
- `70f8ffc3-01b9-43b5-bb0d-52b81232c63e`
  - URL: `P200136061`
  - category: `storage`
  - price: `255500`
  - selected price source: `visible_sale_or_current_price`
- `fa18b6e5-fd5a-4c85-b52d-efe9f49e4077`
  - URL: `P100033578`
  - category: `storage`
  - price: `279000`
  - selected price source: `visible_sale_or_current_price`
- `d2f3a302-df2b-4709-a0f7-ca546bcaf5c5`
  - URL: `P100023620`
  - category: `bed`
  - price: `327700`
  - selected price source: `visible_sale_or_current_price`

Primary image and source/outbound URL remained present and publishable for all four rows.

## Audit Result

Audit artifacts:

- `/tmp/livart-breadth-audit-2026-04-09.json`
- `/tmp/livart-breadth-post-publish-audit-2026-04-09.json`

Ready-state audit after re-import:

- `4` Livart rows were `pending_review`
- all `4` were `publish_ready`
- `0` blockers
- `0` warnings

Post-publish audit:

- `35` total jobs
- `35` published
- `35` `publish_ready`
- `0` blockers
- `0` warnings

## Publish And Verify Results

Published rows:

- `d2f3a302-df2b-4709-a0f7-ca546bcaf5c5` -> canonical `427df9c7-b4a0-4b93-bb69-e75e218a917f`
- `fa18b6e5-fd5a-4c85-b52d-efe9f49e4077` -> canonical `9cbdf8ac-3a4a-49ac-b17e-b8a134f6a419`
- `70f8ffc3-01b9-43b5-bb0d-52b81232c63e` -> canonical `f9a5d488-c63e-48a4-919c-15633b6b21c2`
- `c4b9f6fe-0c1c-4b32-b8dd-7d16edccc049` -> canonical `5f9cdd79-fb12-4ee6-8068-1e402e141fea`

Publish artifacts:

- `/tmp/livart-breadth-publish-d2f3a302-2026-04-09.json`
- `/tmp/livart-breadth-publish-fa18b6e5-2026-04-09.json`
- `/tmp/livart-breadth-publish-70f8ffc3-2026-04-09.json`
- `/tmp/livart-breadth-publish-c4b9f6fe-2026-04-09.json`

Each publish report included successful post-publish verification:

- canonical row exists
- linkage is correct
- name/category/price/image/outbound URL survived publish
- no verification warnings

## Operational Conclusion

Livart is `supported_operational only for limited categories/cases`.

Reason:

- live intake -> audit -> publish -> verify now succeeded across sofa, storage, and bed cases
- discounted and non-discounted sampled PDPs now use the visible operational price rather than the base/start price
- the evidence is broader than the earlier two-sofa sample, but it is still not IKEA-level breadth

## Deferred Items

- Validate more Livart categories before claiming full source-wide operational support.
- Keep watching discount semantics on pages where option-level pricing or strike-through pricing is more complex than the sampled PDPs.
- Do not loosen quality gates; parser coverage should expand only when real blocked cases appear.
