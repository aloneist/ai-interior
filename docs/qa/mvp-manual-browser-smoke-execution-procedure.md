# MVP Manual Browser Smoke Execution Procedure

## Purpose
Use this procedure when a human operator can run the MVP in a real browser.

This is not browser automation. Do not mark browser smoke complete from API-only checks.

## Required Inputs
- App URL:
- Environment name: local / staging / production-like staging
- Commit SHA or build/deployment reference:
- Browser and version:
- Operator:
- Date/time:

## Environment Setup
1. Confirm the target environment is test-safe.
2. Confirm Supabase points at the intended environment.
3. Confirm the canonical product DB contract has been applied.
4. Confirm outbound product links may open live retailer pages.
5. If running locally, start the app:

```bash
npm run dev
```

Optional capability proof before the manual run:

```bash
npm run build
npm start -- --hostname 127.0.0.1
APP_BASE_URL=http://127.0.0.1:3000 npm run qa:mvp-browser-capability
```

This verified path avoids dev-server lock noise in constrained environments, opens the app in Playwright Chromium, and writes a screenshot under `/tmp`. It is an environment check only; it does not replace the manual browser smoke steps below.

6. If running operational API smoke for the same target, run:

```bash
APP_BASE_URL=<app-url> npm run qa:mvp-operational-smoke
```

For local dev, omit `APP_BASE_URL` only if the app is running at `http://127.0.0.1:3000`.

## Execution Order
Run the browser smoke in this exact order:
1. Open app
2. Image input
3. Conditions
4. Recommendation generation
5. Save
6. Compare
7. Product detail
8. Outbound purchase transition

Use `docs/qa/mvp-manual-browser-smoke-checklist.md` for the step-by-step expected results and failure examples.

## What To Capture
Capture enough evidence to reproduce failures without turning the run into a broad QA sweep.

Required for every run:
- App URL
- Commit/build/deployment reference if available
- Browser and OS
- Whether `npm run qa:mvp-operational-smoke` was run, and its result
- Overall pass/fail recommendation

Required for each issue:
- Step name
- Exact action taken
- Expected result
- Actual result
- Screenshot or screen recording if practical
- Console error text if visible
- Network/API status if visible
- Product name and visible product ID if available

Do not capture secrets, service-role keys, admin tokens, or private user data.

## Stop Rules
Stop and report instead of improvising when:
- The app does not load.
- The target environment is not the intended test environment.
- Required credentials or DB contract are missing.
- Recommendation generation fails for infrastructure reasons twice in a row.
- Save/click behavior appears to write to the wrong product identity.
- Outbound purchase opens a suspicious or unrelated destination.
- A blocker issue prevents later flow steps from being meaningfully tested.

When stopped, record all completed steps as tested, all later steps as blocked, and the blocking issue with severity.

## Pass/Fail Rules
- Overall `pass`: all required browser steps pass, with no blocker or major issues.
- Overall `pass_with_minor_issues`: required steps pass, with only medium/minor issues that do not confuse or block the MVP purchase flow.
- Overall `fail`: any blocker or major issue is present.
- Overall `blocked`: environment/browser capability prevents required browser steps from running.

## Severity Rules

### Blocker
Use for issues that stop the core flow or risk writing the wrong product identity.

Examples:
- App does not load.
- Recommendation generation cannot complete.
- Save/click targets the wrong product.
- Detail opens for the wrong product.
- Outbound purchase cannot open for products with valid URLs.
- Compare allows corrupted or impossible state.

Approval impact:
- Do not approve. Fix and rerun the full browser smoke path.

### Major
Use for issues that make a core step unreliable or seriously confusing, while some flow can continue.

Examples:
- Required input state is misleading.
- Save state appears selected but saved section disagrees.
- Compare limit behavior is unclear or inconsistent.
- Modal cannot be closed by normal controls.
- Empty/weak result messaging leaves the user without a clear next action.

Approval impact:
- Do not approve for MVP validation unless explicitly accepted. Fix and retest affected step plus downstream steps.

### Medium
Use for issues that create friction but do not block the flow.

Examples:
- Copy is ambiguous but recoverable.
- Count text lags briefly but corrects.
- Detail lacks a non-critical field already visible on the card.
- Outbound opens correctly, but the transition copy could be clearer.

Approval impact:
- May approve with documented follow-up if the rest of the core path passes.

### Minor
Use for low-risk polish or documentation gaps.

Examples:
- Small spacing issue.
- Non-blocking label inconsistency.
- Missing screenshot in report when the issue is already reproducible.

Approval impact:
- May approve. Track opportunistically.

## Browser Smoke vs Operational Smoke
Operational API smoke is required support evidence, not a replacement for browser smoke.

Operational smoke currently covers:
- `/api/mvp` success response.
- Recommendation payload shape.
- Canonical product UUID presence.
- Affiliate URL preference in the API payload.
- `/api/log-save` using `canonical_product_id`.
- `/api/log-click` using `canonical_product_id`.

Browser smoke still covers:
- Actual rendering.
- File picker and URL input behavior.
- Client-side disabled/loading states.
- Save and compare UI synchronization.
- Product detail modal interaction.
- New-tab outbound behavior.
- Visual continuity from upload to purchase transition.

If operational smoke passes but browser smoke fails, treat the browser issue as real.
If browser smoke passes but operational smoke fails, investigate backend contract drift before approval.
