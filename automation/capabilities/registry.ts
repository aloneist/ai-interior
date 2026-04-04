import type { CapabilityDefinition, CapabilityId } from "@/automation/capabilities/types"

export const capabilityRegistry: Record<CapabilityId, CapabilityDefinition> = {
  "catalog.read": {
    id: "catalog.read",
    area: "catalog",
    summary:
      "Read catalog data through an explicit provider-backed read-only gateway operation.",
    stage: "active",
    executionPolicy: {
      mode: "auto-allowed",
      riskLevel: "low",
    },
    bindings: [],
  },
  "catalog.write.safe": {
    id: "catalog.write.safe",
    area: "catalog",
    summary: "Write catalog changes through a guarded, review-friendly automation path.",
    stage: "placeholder",
    executionPolicy: {
      mode: "approval-required",
      riskLevel: "high",
      reason: "Catalog write operations must not auto-run in automation v1.",
    },
    bindings: [],
  },
  "asset.upload": {
    id: "asset.upload",
    area: "asset",
    summary: "Upload assets through a provider adapter without binding product runtime code.",
    stage: "planned",
    executionPolicy: {
      mode: "approval-required",
      riskLevel: "high",
      reason: "Asset upload operations must not auto-run in automation v1.",
    },
    bindings: [],
  },
  "asset.search": {
    id: "asset.search",
    area: "asset",
    summary:
      "Search assets through an explicit provider-backed read-only gateway operation.",
    stage: "active",
    executionPolicy: {
      mode: "auto-allowed",
      riskLevel: "low",
    },
    bindings: [],
  },
  "qa.run": {
    id: "qa.run",
    area: "qa",
    summary: "Run QA or verification tasks such as lint, build, or future custom checks.",
    stage: "placeholder",
    executionPolicy: {
      mode: "approval-required",
      riskLevel: "medium",
      reason: "QA execution is not auto-allowed until orchestration approval is explicit.",
    },
    bindings: [],
  },
  "approval.request": {
    id: "approval.request",
    area: "approval",
    summary: "Create an approval request for human review or orchestration routing.",
    stage: "planned",
    executionPolicy: {
      mode: "approval-required",
      riskLevel: "medium",
      reason: "Approval flows stop at the automation boundary until routing is implemented.",
    },
    bindings: [],
  },
  "notify.send": {
    id: "notify.send",
    area: "notify",
    summary: "Send workflow notifications through a later provider implementation.",
    stage: "planned",
    executionPolicy: {
      mode: "approval-required",
      riskLevel: "medium",
      reason: "Notification delivery is not auto-allowed in automation v1.",
    },
    bindings: [],
  },
}

export function getCapabilityDefinition(id: CapabilityId): CapabilityDefinition {
  return capabilityRegistry[id]
}

export function listCapabilityDefinitions(): CapabilityDefinition[] {
  return Object.values(capabilityRegistry)
}
