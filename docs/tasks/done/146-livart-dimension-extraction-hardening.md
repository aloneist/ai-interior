# Goal
Harden Livart dimension extraction so canonical products can carry usable width/depth/height values, bringing Livart closer to IKEA-level operational completeness for future image-placement and room-fit workflows.

# Scope
This task is limited to:
- inspecting how IKEA dimension extraction currently works
- identifying why Livart dimension fields are currently empty or unreliable
- adding only the minimum Livart-specific dimension extraction/parsing needed
- validating the extracted dimensions through the existing intake -> audit -> publish -> verify workflow
- documenting whether Livart dimensions are now operationally usable

This is not a broad multi-seller task and not a UX task.

# Primary Objective
Make Livart canonical rows carry trustworthy width/depth/height values where the source page exposes them, without loosening current quality gates or redesigning parser architecture.

# Allowed Changes
- Read and reference the existing IKEA parser dimension logic
- Add or update small Livart-specific dimension parsing logic
- Add or update small normalization helpers for deterministic dimension extraction
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, and verify workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates to compensate for missing dimensions
- Do not add broad schema changes
- Do not jump to Hanssem/Todayhouse work in this step
- Do not force dimension values from vague or untrustworthy text

# Critical Safety Rule
Do not invent dimensions. Only extract and normalize width/depth/height when the source page exposes dimension data clearly enough to map deterministically.

# Working Principles
- Use IKEA as the reference level for deterministic dimension handling
- Prefer source-specific extraction over vague generic heuristics
- Preserve current publish and canonical product contracts
- Treat dimension semantics as important operational product data
- End with an honest judgment about Livart dimension reliability
- Keep scope tight and evidence-based

# Required Behavior / Structure

## 1. Inspect IKEA dimension handling
Review the current IKEA parser and identify:
- where dimensions are extracted
- how width/depth/height are normalized
- what source patterns are considered trustworthy
- how ambiguous size strings are avoided

## 2. Reproduce the current Livart dimension gap
Use a small Livart batch and confirm:
- whether dimensions are present in the page HTML/metadata
- whether current Livart parsing misses them entirely
- whether the failure is selector/path-related, normalization-related, or semantic-mapping-related

## 3. Add minimal Livart-specific dimension extraction
Implement only the smallest deterministic Livart-specific extraction needed to populate:
- `width_cm`
- `depth_cm`
- `height_cm`

If some pages expose only partial dimensions or ambiguous size strings, do not force all three fields.

## 4. Normalize and validate the extracted values
Ensure extracted values:
- map into the current canonical dimension fields correctly
- use a consistent unit assumption
- do not confuse material/spec text with actual dimensions
- remain explainable and source-grounded

## 5. Re-run operational validation
On a small Livart batch:
- run intake
- confirm staged dimension extraction results
- publish only truly ready rows
- verify the canonical rows now retain correct dimensions

## 6. End with a dimension-support conclusion
Choose one honest conclusion:
- Livart dimensions are operationally usable for the validated cases
- Livart dimensions work only for limited product/page patterns
- Livart dimensions remain too weak for operational reliance
- Livart should keep dimensions as optional until further source work

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- current outbound URL review policy

# Completion Criteria
- IKEA dimension extraction approach was actually reviewed
- Livart dimension gap was concretely identified
- Livart dimension extraction was improved only with narrow source-specific logic
- Intake -> publish -> verify confirms usable canonical dimensions on the tested batch
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
- what IKEA parser behavior was reused or referenced
- exact dimension issues observed before changes
- exact changes made
- exact staged/canonical dimension results after changes
- final dimension-support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. IKEA reference behavior and Livart dimension gap
3. What changed
4. Post-hardening intake / publish / verify dimension results
5. Final Livart dimension-support conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation