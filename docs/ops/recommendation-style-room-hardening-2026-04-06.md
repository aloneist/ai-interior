# Recommendation Style And Room-Type Hardening

## Current Audit Findings

- Style handling was still too proxy-driven. `minimal`, `bright`, `warm-wood`, `calm`, `modern`, and `hotel` were mostly inferred from vector dimensions rather than explicit product text signals.
- Request text parsing covered minimal, bright, calm, warm, and airy intent, but did not explicitly parse modern or hotel-like language.
- Room type already affected score through room/category weights, but runtime output did not expose whether a top item was actually a good room-type fit.
- Weak result visibility existed for category and budget, but style/room fit was not first-class in `ranking_context` or `quality_summary`.

## MVP Style / Room-Type Baseline

This batch adds a practical QA baseline for style and room intent.

### Style Fit

- A style-constrained request should expose `ranking_context.style_fit` per product.
- `style_fit` values are:
  - `explicit`: product text contains a mapped style signal
  - `proxy`: vector dimensions support the requested style
  - `mismatch`: style was requested but neither explicit nor proxy fit exists
  - `neutral`: no style was requested
- Style-constrained QA must place at least 1 `explicit` or `proxy` style-fit item in the top 3.

### Room Fit

- A room-constrained request should expose `ranking_context.room_fit` per product.
- `room_fit` values are:
  - `good`: product type fits the requested room type
  - `mismatch`: product type is an obvious poor fit for the requested room type
  - `neutral`: no room type was requested or the match is unknown
- Room-constrained QA must place at least 1 `good` room-fit item in the top 3.

### Weak Fit Visibility

- `quality_summary` now includes:
  - `style_fit_in_top3`
  - `room_fit_in_top3`
- Weak result reasons can now include:
  - `weak_style_match`
  - `weak_room_match`
- Per-item `weak_match_reasons` can now include:
  - `style_mismatch`
  - `room_type_mismatch`

## Implemented Rules

- Added explicit style keyword mapping for:
  - `minimal`
  - `bright`
  - `warm-wood`
  - `calm`
  - `modern`
  - `hotel`
- Added request-text parsing for:
  - `modern`
  - `hotel`
- Added explicit ranking adjustments:
  - `style_fit=explicit`: positive adjustment
  - `style_fit=proxy`: smaller positive adjustment
  - `style_fit=mismatch`: negative adjustment
  - `room_fit=good`: positive adjustment
  - `room_fit=mismatch`: negative adjustment
- Preserved the prior category, budget, metadata, and dedupe baseline.

## QA Coverage

The recommendation quality QA now covers:

- unconstrained runtime stability
- mixed category + budget + style + room case
- style-constrained case
- room-type-constrained case
- weak-result visibility case

## Decision

Current classification after this batch: `STABLE BASELINE`

Reason:

- category, budget, dedupe, metadata, weak-result, style-fit, and room-fit now have explicit QA-visible signals
- style is still not perfect because product metadata is limited, but it is no longer proxy-only
- the remaining quality work should shift from ranking mechanics to catalog metadata enrichment and human QA review cases
