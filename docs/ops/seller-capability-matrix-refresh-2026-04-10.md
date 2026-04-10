# Seller Capability Matrix Refresh And Next Priority - 2026-04-10

## Purpose

This document refreshes current seller/source support using the latest validated evidence.

It separates:

- current deterministic parser-backed operational support
- future image-derived dimension extraction opportunity

Current support status must be read narrowly:

- "supported" means the source works on the current deterministic parser path
- it does not mean image-derived dimensions are implemented
- it does not mean source-wide completeness across all categories and page patterns

## Current Capability States

### `supported_operational`

Meaning:

- fetch works
- deterministic parser coverage produces required identity fields reliably enough for current staged review
- quality gates can approve valid rows
- publish and post-publish verification are operationally proven

### `supported_operational only for limited categories/cases`

Meaning:

- deterministic intake -> audit -> publish -> verify is proven on a real but still narrow sample
- source coverage is still incomplete
- the source is usable, but not yet source-wide reliable

### `fetch_blocked`

Meaning:

- route-level fetch fails before staging
- parser or quality tuning is premature until a real staged row can exist

### `experimental`

Meaning:

- some parser/path evidence exists
- operational evidence is not yet strong enough for normal publish use

## Deterministic Support vs Image-Derived Opportunity

Use this rule consistently:

- current operational support means deterministic parser-backed support only
- image-derived dimension extraction is a future research/implementation track
- image-derived opportunity does not upgrade a source's current support status

Operational implication:

- do not treat image-heavy sellers as geometry-supported today unless the deterministic parser is actually carrying canonical `width_cm`, `depth_cm`, and `height_cm`
- do not relax geometry contract v1 because a seller may be a good future OCR/image candidate

## Refreshed Source Matrix

| Source | Current Support Status | Evidence Basis | Current Blocker Stage | Current Geometry Support | Image-Derived Dimension Relevance Later | Current Practical Meaning | Next Deterministic Work |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IKEA | `supported_operational` | Existing deterministic parser, real intake -> audit -> publish -> verify, geometry contract alignment already validated | None on active path | Strong deterministic geometry support | Low | Operational baseline and regression reference source | Maintain as baseline; no expansion priority needed |
| Livart | `supported_operational only for limited categories/cases` | Real parser hardening succeeded; real publish succeeded across sofa, storage, and bed; limited geometry succeeded on trusted Livart text blocks | Source breadth, not core viability | Limited deterministic geometry support on trusted page patterns only | Medium | Usable source with real operational value, but not yet source-wide | Continue deterministic breadth completion first |
| Hanssem | `supported_operational only for limited categories/cases` | Real identity parser hardening succeeded; real publish/verify succeeded on 4 rows; narrow geometry only from explicit title size pattern | Deterministic geometry breadth remains weak; many PDP detail blocks are image-heavy | Narrow deterministic geometry support only | High | Identity/publish path is operational, but geometry is still weak and source-wide support is not proven | Expand only when trustworthy text specs are found; otherwise treat geometry as limited |
| Todayhouse | `fetch_blocked` | Live intake attempt failed before staging with `403` | Fetch/access | None | Unknown until fetch works | Not actionable for parser or geometry work yet | Do not do parser work until fetch/access is solved |
| Other generic hosts / fallback | `experimental` | Generic host detection exists, but no real end-to-end proof | Unknown; source-specific | None proven | Source-dependent | Exploratory only | Do not prioritize without a real staged validation batch |

## Source Notes

### IKEA

IKEA remains the only source with strong deterministic geometry and broad operational proof.

Use it as:

- the operator baseline
- the parser behavior reference for canonical outcomes
- the regression source when seller expansion changes are made

### Livart

Livart is currently the strongest non-IKEA deterministic expansion path.

Why:

- fetch works
- deterministic identity parsing works
- deterministic geometry works on trusted Livart PDP text blocks
- multiple categories already passed real publish

What still limits it:

- geometry only works where Livart exposes a trustworthy overall-size line
- source-wide breadth is still not proven

### Hanssem

Hanssem is now operationally usable for identity and publish, but geometry remains materially weaker than Livart.

Why:

- deterministic identity path works
- real publish and verify are proven
- but the sampled detail/spec sections are mostly image-based
- only one validated desk case exposed a trustworthy deterministic size pattern (`120x70cm`) on the active path

Operational implication:

- Hanssem is no longer blocked
- but Hanssem should not be treated as broad geometry-capable today

### Todayhouse

Todayhouse still has not reached the parser stage on the live path.

Operational implication:

- keep it out of current seller-expansion execution
- do not spend time on quality or geometry tuning until fetch is real

## Priority Decision

### 1. Next Seller / Parser Work

Priority: **Livart breadth completion**

Reason:

- Livart is already closer to source-wide deterministic support than Hanssem
- Livart has a real trusted text geometry path on some PDPs
- remaining Livart work is mostly breadth and page-pattern expansion, not a fundamental source-shape mismatch

### 2. Next Geometry / Spec Work

Priority: **Livart deterministic geometry breadth before more Hanssem geometry expansion**

Reason:

- Livart already exposes parseable text spec blocks on at least some pages
- Hanssem sampled detail blocks are mostly image-based, so deterministic geometry gains are currently narrow
- the best deterministic return is finishing the source that already has a viable text-spec path

### 3. Next Experimental / Research Track

Priority: **image-derived dimension extraction remains deferred as execution work, but should be queued as a scoped research track with Hanssem as the strongest candidate**

Reason:

- Hanssem’s image-heavy detail structure makes future image-derived dimensions more relevant there than on Livart
- but that is not current support
- and it should not displace the remaining deterministic seller work yet

Practical rule:

- do not start OCR/image-derived implementation as the next execution task
- only open it as a scoped research track after the next deterministic breadth pass is complete

## Recommended Execution Order

1. Livart deterministic breadth completion
2. Livart deterministic geometry/spec breadth on additional trusted page patterns
3. Hanssem breadth validation on more categories, watching for trustworthy text spec rows
4. Todayhouse only if fetch/access becomes viable
5. Image-derived dimension extraction as a separate scoped experiment, not as current operational support work

## Operator / Developer Guidance

Use this decision rule:

- choose IKEA and current validated Livart/Hanssem cases for operational publish work
- choose Livart first for deterministic seller-expansion work
- choose Hanssem deterministic geometry work only when a real PDP exposes trustworthy text specs
- treat image-derived dimensions as roadmap/research, not as present support
- treat Todayhouse as blocked until fetch succeeds

## Deferred Items

- Livart still needs more category/page-pattern breadth before full source-wide support
- Hanssem still needs more category breadth and trustworthy text-spec evidence before broad geometry reliance
- Todayhouse still needs fetch/access resolution before any meaningful parser work
- image-derived dimension extraction should stay explicitly separate from current deterministic support status
