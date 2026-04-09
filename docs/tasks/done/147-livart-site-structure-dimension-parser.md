# Goal
Build a Livart-specific dimension parser by first analyzing Livart’s own product-page structure, then extracting and normalizing trustworthy dimensions into canonical `cm` fields.

# Scope
This task is limited to:
- analyzing Livart product-page HTML structure for dimension content
- identifying where trustworthy overall product dimensions appear on Livart PDPs
- implementing a Livart-specific dimension parser based on Livart’s own structure
- normalizing source units (especially `mm`) into canonical `cm`
- rerunning intake -> publish -> verify on a small Livart batch
- documenting whether Livart dimensions are now operationally usable

This is not a generic parser task and not a UX task.

# Primary Objective
Close the Livart dimension gap by using Livart-specific structure analysis, not IKEA-specific structure reuse, while still preserving the canonical contract that dimensions must end up in trustworthy `width_cm`, `depth_cm`, and `height_cm` fields.

# Allowed Changes
- Analyze current Livart HTML/PDP structure and source patterns
- Add or update small Livart-specific dimension extraction logic
- Add or update small normalization helpers for deterministic `mm -> cm` conversion
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, and verify workflows

# Disallowed Changes
- Do not copy IKEA’s DOM/section assumptions into Livart
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen quality gates to hide missing dimensions
- Do not add broad schema changes
- Do not jump to Hanssem or Todayhouse in this step
- Do not invent dimensions from vague or untrustworthy text
- Do not store raw `mm` values in canonical `*_cm` fields

# Critical Safety Rule
Livart dimensions must be extracted from Livart-specific trustworthy PDP structures. If the page text is ambiguous, seat-specific, calculator-related, marketing-only, or range-based without a deterministic rule, do not map it into canonical overall dimensions.

# Working Principles
- Analyze Livart first, then implement Livart
- IKEA is only a reference for canonical outcome, not for DOM structure reuse
- Prefer source-specific extraction over vague generic heuristics
- Treat unit normalization as part of correctness
- Allow partial dimension output when only some fields are trustworthy
- End with an honest dimension-support conclusion

# Required Behavior / Structure

## 1. Analyze Livart-specific dimension structure
Inspect real Livart PDP HTML and identify:
- where overall product dimensions actually appear
- what labels/phrases Livart uses
- how those differ from seat-specific or other sub-component dimensions
- where unrelated calculator/configurator dimension text appears
- what content blocks are trustworthy for overall product size extraction

## 2. Reproduce the current gap
Using a small Livart batch, confirm:
- dimension content exists in source HTML
- current Livart parser misses it
- source values are often expressed in `mm`
- the current failure is primarily Livart-specific section-selection and parsing gap

## 3. Implement Livart-specific dimension extraction
Add only the smallest deterministic Livart-only extraction logic needed to populate:
- `width_cm`
- `depth_cm`
- `height_cm`

Requirements:
- target real Livart PDP content blocks
- ignore unrelated calculator/configurator sections
- ignore seat-specific or accessory-specific dimension text unless clearly mapped to the overall product
- support compact Livart strings like `가로2160 x 세로413 x 높이440mm` only when they are in trustworthy overall-size context

## 4. Normalize units into canonical `cm`
Ensure:
- `mm` source values are converted into `cm`
- canonical DB fields remain semantically correct
- partial values are allowed when only some dimensions are trustworthy
- range values such as `730~980 mm` remain null unless an explicit deterministic single-value rule is implemented

## 5. Re-run operational validation
On a small Livart batch:
- run intake
- inspect staged dimension values
- publish only truly ready rows
- verify canonical rows retain correct `*_cm` values

## 6. End with a real dimension-support decision
Choose one honest conclusion:
- Livart dimensions are operationally usable for the validated cases
- Livart dimensions work only for limited product/page patterns
- Livart dimensions remain too weak for operational reliance
- Livart should keep dimensions optional until further source work

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- current outbound URL review policy

# Completion Criteria
- Livart page structure was actually analyzed first
- Livart-specific trustworthy dimension context was identified
- Livart dimension extraction was improved only with narrow source-specific logic
- `mm -> cm` normalization is implemented correctly where needed
- Intake -> publish -> verify confirms usable canonical `*_cm` values on the tested batch
- Final Livart dimension support status is stated honestly
- No quality-gate loosening or product/runtime drift
- Build/lint/type checks pass if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact Livart batch used
- exact Livart structure cues used for trustworthy extraction
- exact dimension/unit issues observed before changes
- exact changes made
- exact staged/canonical dimension results after changes
- final dimension-support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Livart-specific structure analysis and current gap
3. What changed
4. Post-hardening intake / publish / verify dimension results
5. Final Livart dimension-support conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation