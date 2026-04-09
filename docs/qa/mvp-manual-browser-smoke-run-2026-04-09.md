# MVP Manual Browser Smoke Run 2026-04-09

## Run Metadata
- Run date/time: 2026-04-09 UTC
- Operator: Codex
- Environment: local
- App URL: `http://127.0.0.1:3000`
- Commit SHA: `9d686701148b62647230cfdca34af2738d50d2e1`
- Build/deployment reference: local `npm run build` + `npm start -- --hostname 127.0.0.1`
- Browser and version: Playwright Chromium (Chrome for Testing 147.0.7727.15)
- OS/device: Linux workspace container
- Operational smoke command: `APP_BASE_URL=http://127.0.0.1:3000 npm run qa:mvp-operational-smoke`
- Operational smoke result: pass
- Browser smoke result: pass_with_minor_issues

## Summary
- Overall approval recommendation: approve_with_followups
- Short rationale: the full real-browser MVP flow was exercised on the verified local Chromium path. One live issue was found in Save for grouped recommendation cards, fixed immediately, then the full flow was rerun successfully.
- Highest severity found: major

## Scenario Results

| Step | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Open app | pass | `/tmp/mvp-live-smoke-2026-04-09/01-open-app.png` | Title matched `AI 인테리어 큐레이션`. |
| Image input | pass | `/tmp/mvp-live-smoke-2026-04-09/02-image-input.png` | Verified `다음` disabled without image URL and enabled after URL + room type. |
| Conditions | pass | `/tmp/mvp-live-smoke-2026-04-09/03-conditions.png` | Verified `추천 받기` disabled before required inputs and enabled after selection. |
| Recommendation generation | pass | `/tmp/mvp-live-smoke-2026-04-09/04-results.png` | Balanced group rendered 3 actionable cards. |
| Save | pass | `/tmp/mvp-live-smoke-2026-04-09/05-final-state.png` | Initially failed on first live run; fixed and rerun passed. |
| Compare | pass | `/tmp/mvp-live-smoke-2026-04-09/result.json` | Verified `2/2` limit and alert `비교는 최대 2개까지 가능합니다.` |
| Product detail | pass | `/tmp/mvp-live-smoke-2026-04-09/result.json` | Verified modal content and close behavior via Escape, `닫기`, and backdrop. |
| Outbound purchase transition | pass | `/tmp/mvp-live-smoke-2026-04-09/result.json` | Product-card outbound opened a direct IKEA product URL. Modal outbound opened a third-party final redirect that needs follow-up classification. |

## Operational Smoke Evidence

Command used:

```bash
APP_BASE_URL=http://127.0.0.1:3000 npm run qa:mvp-operational-smoke
```

Result summary:
- `/api/mvp` status: `200`
- Recommendation count: `3`
- Grouped recommendation count: `3`
- Top canonical product ID: `d09a79cc-a1c6-4359-b615-138014dd905d`
- Affiliate URL preferred: yes
- Save status: `200`
- Click status: `200`
- Notes: operational smoke confirmed canonical product UUIDs and `/api/log-save` + `/api/log-click` behavior for the API path.

## Issues

### Issue 1
- Severity: major
- Step: Save
- Reproduction: run the browser flow to results, then click `저장` on a grouped recommendation card before the fix.
- Expected: the card toggles to `저장됨` and the saved section updates.
- Actual: the client logged `SAVE TOGGLE ERROR: Save update failed`, the save request returned no matching recommendation exposure row, and the saved section did not update.
- User-facing impact: Save was unreliable for valid cards rendered in grouped recommendations.
- Contract impact:
  - canonical product identity: unaffected
  - save/click semantics: broken
  - compare max-selection rule: unaffected
  - affiliate outbound preference: unaffected
  - detail payload contract: unaffected
- Evidence: first live browser run in `/tmp/mvp-live-smoke-2026-04-09/result.json` before rerun, plus observed browser console error.
- Fix recommendation: fix_now
- Retest scope: full browser flow from recommendation results through save, compare, detail, and outbound.
- Resolution: fixed in [route.ts](/workspaces/ai-interior/app/api/mvp/route.ts) by persisting recommendation exposure rows for every surfaced product in the grouped UI, not just the top-3 flat recommendations.

### Issue 2
- Severity: minor
- Step: Outbound purchase transition
- Reproduction: after the fix, open the second balanced recommendation in the detail modal and trigger `상품 보기`.
- Expected: the final destination remains the product page.
- Actual: the API payload carried the correct product affiliate URL, but the observed final popup URL landed on a broader IKEA category page.
- User-facing impact: possible retailer-side redirect ambiguity for at least one product.
- Contract impact:
  - canonical product identity: unaffected
  - save/click semantics: unaffected
  - compare max-selection rule: unaffected
  - affiliate outbound preference: unaffected in API payload
  - detail payload contract: unaffected
- Evidence: `/tmp/mvp-live-smoke-2026-04-09/result.json`
- Fix recommendation: defer
- Retest scope: operational data / outbound publish review, not immediate UI contract work

## Stop Or Block Notes
- Stop reason: none
- Last completed step: outbound purchase transition
- First blocked step: none
- Environment or app issue: none after the save fix
- Required next action: review the deferred outbound redirect against live catalog data if this product remains in the MVP set

## Retest Plan
- Steps to rerun: full browser smoke after any outbound catalog/data correction; otherwise affected-step retest is sufficient
- Operational smoke required again: yes
- Browser smoke required again: affected_steps_only
- Owner: Codex / repo operator
- Target date: next outbound catalog review window
