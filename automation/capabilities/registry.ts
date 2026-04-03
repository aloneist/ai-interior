import type { CapabilityDefinition, CapabilityId } from "@/automation/capabilities/types"

export const capabilityRegistry: Record<CapabilityId, CapabilityDefinition> = {
  "catalog.read": {
    id: "catalog.read",
    area: "catalog",
    summary: "Read catalog data through a provider-backed automation interface.",
    stage: "placeholder",
    bindings: [],
  },
  "catalog.write.safe": {
    id: "catalog.write.safe",
    area: "catalog",
    summary: "Write catalog changes through a guarded, review-friendly automation path.",
    stage: "placeholder",
    bindings: [],
  },
  "asset.upload": {
    id: "asset.upload",
    area: "asset",
    summary: "Upload assets through a provider adapter without binding product runtime code.",
    stage: "planned",
    bindings: [],
  },
  "asset.search": {
    id: "asset.search",
    area: "asset",
    summary: "Search or locate assets through a provider-backed automation interface.",
    stage: "planned",
    bindings: [],
  },
  "qa.run": {
    id: "qa.run",
    area: "qa",
    summary: "Run QA or verification tasks such as lint, build, or future custom checks.",
    stage: "placeholder",
    bindings: [],
  },
  "approval.request": {
    id: "approval.request",
    area: "approval",
    summary: "Create an approval request for human review or orchestration routing.",
    stage: "planned",
    bindings: [],
  },
  "notify.send": {
    id: "notify.send",
    area: "notify",
    summary: "Send workflow notifications through a later provider implementation.",
    stage: "planned",
    bindings: [],
  },
}

export function getCapabilityDefinition(id: CapabilityId): CapabilityDefinition {
  return capabilityRegistry[id]
}

export function listCapabilityDefinitions(): CapabilityDefinition[] {
  return Object.values(capabilityRegistry)
}
