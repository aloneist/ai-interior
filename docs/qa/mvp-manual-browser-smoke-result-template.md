# MVP Manual Browser Smoke Result Template

Copy this template into a dated QA note for each manual browser smoke run.

## Run Metadata
- Run date/time:
- Operator:
- Environment:
- App URL:
- Commit SHA:
- Build/deployment reference:
- Browser and version:
- OS/device:
- Operational smoke command:
- Operational smoke result: not_run / pass / fail
- Browser smoke result: pass / pass_with_minor_issues / fail / blocked

## Summary
- Overall approval recommendation: approve / approve_with_followups / do_not_approve / blocked
- Short rationale:
- Highest severity found: none / minor / medium / major / blocker

## Scenario Results

| Step | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Open app | pass / fail / blocked / not_run | | |
| Image input | pass / fail / blocked / not_run | | |
| Conditions | pass / fail / blocked / not_run | | |
| Recommendation generation | pass / fail / blocked / not_run | | |
| Save | pass / fail / blocked / not_run | | |
| Compare | pass / fail / blocked / not_run | | |
| Product detail | pass / fail / blocked / not_run | | |
| Outbound purchase transition | pass / fail / blocked / not_run | | |

## Operational Smoke Evidence

Command used:

```bash
APP_BASE_URL=<app-url> npm run qa:mvp-operational-smoke
```

Result summary:
- `/api/mvp` status:
- Recommendation count:
- Grouped recommendation count:
- Top canonical product ID:
- Affiliate URL preferred: yes / no / not_applicable
- Save status:
- Click status:
- Notes:

## Issues

### Issue 1
- Severity: blocker / major / medium / minor
- Step:
- Reproduction:
- Expected:
- Actual:
- User-facing impact:
- Contract impact:
  - canonical product identity: unaffected / suspected risk / broken
  - save/click semantics: unaffected / suspected risk / broken
  - compare max-selection rule: unaffected / suspected risk / broken
  - affiliate outbound preference: unaffected / suspected risk / broken
  - detail payload contract: unaffected / suspected risk / broken
- Evidence:
- Fix recommendation: fix_now / defer / needs_investigation
- Retest scope:

### Issue 2
- Severity:
- Step:
- Reproduction:
- Expected:
- Actual:
- User-facing impact:
- Contract impact:
- Evidence:
- Fix recommendation:
- Retest scope:

## Stop Or Block Notes
Use this section if the run stopped early.

- Stop reason:
- Last completed step:
- First blocked step:
- Environment or app issue:
- Required next action:

## Approval Decision Rules
- `approve`: all required browser steps passed, operational smoke passed or is not required for the target, and there are no blocker/major issues.
- `approve_with_followups`: all required browser steps passed, operational smoke passed, and only medium/minor issues remain.
- `do_not_approve`: any blocker or major issue remains.
- `blocked`: browser capability, environment setup, credentials, or deployment access prevented a meaningful run.

## Retest Plan
- Steps to rerun:
- Operational smoke required again: yes / no
- Browser smoke required again: full / affected_steps_only / no
- Owner:
- Target date:
