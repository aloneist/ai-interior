# n8n

Reserved for future n8n workflow assets.

Potential future contents:
- workflow definitions
- trigger notes
- approval-routing documentation
- execution handoff conventions

Setup reference:
- [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)

Current scaffold note:
- `approval-handoff.ts` defines the v1 typed approval handoff payload contract
- `approval-response-intake.ts` defines the v1 typed approval response intake contract
- `approval-response-intake.ts` also defines the v1 reviewer-facing response summary contract derived from intake
- `approval-response-intake.ts` also defines the v1 safe approval response application contract derived from intake and review summary
- `approval-response-intake.ts` also defines the v1 resume eligibility contract derived from the safe application result
- `approval-response-intake.ts` also defines the v1 manual resume request contract derived from resume eligibility
- `approval-response-intake.ts` also defines the v1 manual resume gate contract derived from the manual resume request
- `approval-response-intake.ts` also defines the v1 manual resume contract derived from the manual resume gate
- `approval-response-webhook-intake.ts` defines the v1 narrow real inbound webhook intake path for approval responses
- that inbound webhook path now expects an `authorization` header with `Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET`
- untrusted inbound approval-response requests are blocked before intake normalization
- `app/api/automation/approval-response/route.ts` now exposes that same inbound path through the main app runtime with explicit caller-provided approval context
- `app/api/automation/readiness/route.ts` now exposes a safe summary-only readiness view for automation runtime bridging
- `webhook-placeholder-sender.ts` now defines the v1 narrow real webhook sender boundary for approval-required handoff
- the sender only attempts delivery when `AUTOMATION_APPROVAL_WEBHOOK_URL` contains an `http(s)` webhook URL
- execution may surface that payload on approval-required results and attempt webhook delivery
- inbound approval-response webhooks can now be parsed, normalized, and validated without resuming execution
- accepted approval responses can now be interpreted into safe internal application states without resuming execution
- accepted approval responses can now be evaluated for future manual-resume eligibility without becoming executable
- accepted approval responses can now surface a manual resume request contract without creating an executable resume action
- accepted approval responses can now surface a manual gate contract without opening a runnable resume path
- accepted approval responses can now surface a manual resume contract without issuing any executable artifact
- the runtime readiness route exposes only safe configured/not-configured summaries and never secret values
- no approval-response-driven risky execution or broader workflow execution is included in this scaffold
