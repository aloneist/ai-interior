# Automation Env Setup

This document covers only the current automation webhook configuration.

## Current Variables

Required for outbound approval handoff delivery:
- `AUTOMATION_APPROVAL_WEBHOOK_URL`

Required for inbound approval-response auth:
- `AUTOMATION_APPROVAL_WEBHOOK_SECRET`

Not part of automation webhook config:
- `ADMIN_TOKEN`

## What Uses What

Outbound approval handoff:
- code path: [webhook-placeholder-sender.ts](/workspaces/ai-interior/automation/orchestration/n8n/webhook-placeholder-sender.ts)
- reads: `AUTOMATION_APPROVAL_WEBHOOK_URL`
- expected value: full `http(s)` webhook URL
- current behavior when missing or invalid: delivery result stays `not_configured`

Inbound approval-response auth:
- code path: [approval-response-webhook-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-webhook-intake.ts)
- reads: `AUTOMATION_APPROVAL_WEBHOOK_SECRET`
- expected value: shared secret sent as `authorization: Bearer <secret>`
- current behavior when missing or mismatched: webhook result is `blocked_untrusted` before intake normalization

## Minimal Example

```bash
export AUTOMATION_APPROVAL_WEBHOOK_URL="http://127.0.0.1:4010/n8n-approval"
export AUTOMATION_APPROVAL_WEBHOOK_SECRET="local-automation-approval-secret"
```

Example trusted inbound request:

```bash
curl -X POST "http://127.0.0.1:4020/n8n-approval-response" \
  -H "content-type: application/json" \
  -H "authorization: Bearer local-automation-approval-secret" \
  -d '{"requestId":"example-request","capabilityId":"catalog.write.safe","decision":"approved","source":"n8n"}'
```

## Local Smoke Reality

`npm run automation:smoke` sets both variables for the local test harness:
- `AUTOMATION_APPROVAL_WEBHOOK_URL` points to the local outbound capture server
- `AUTOMATION_APPROVAL_WEBHOOK_SECRET` is used to build trusted inbound `Bearer` auth

Smoke also proves:
- trusted inbound requests reach the existing receive-side contract chain
- untrusted inbound requests are blocked before normalization

## Operator Checklist

- Set `AUTOMATION_APPROVAL_WEBHOOK_URL` to the approval handoff receiver URL.
- Set `AUTOMATION_APPROVAL_WEBHOOK_SECRET` to the shared secret expected by the inbound approval-response receiver.
- Do not use `ADMIN_TOKEN` for automation webhook delivery or automation webhook auth.
- Run `npm run automation:smoke` to verify the split outbound/inbound setup path.

## Read Next

- [automation/README.md](/workspaces/ai-interior/automation/README.md)
- [automation/orchestration/n8n/README.md](/workspaces/ai-interior/automation/orchestration/n8n/README.md)
- [automation/demo/README.md](/workspaces/ai-interior/automation/demo/README.md)
