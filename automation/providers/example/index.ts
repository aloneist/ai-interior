import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import type {
  ProviderCapabilitySupport,
  ProviderDefinition,
  ProviderExecutionContext,
  ProviderExecutor,
} from "@/automation/providers/types"

export const exampleProviderDefinition: ProviderDefinition = {
  id: "example",
  displayName: "Example Provider Placeholder",
  status: "planned",
  purpose: "Reserved example provider entry for future local automation experiments.",
}

export const exampleCapabilitySupport: ProviderCapabilitySupport[] = [
  {
    capabilityId: "catalog.read",
    status: "placeholder",
    notes: "Reserved for a future example catalog adapter.",
  },
  {
    capabilityId: "catalog.write.safe",
    status: "placeholder",
    notes: "Reserved for a future example catalog write adapter.",
  },
  {
    capabilityId: "asset.upload",
    status: "unsupported",
    notes: "Asset operations are outside this example placeholder.",
  },
  {
    capabilityId: "asset.search",
    status: "unsupported",
    notes: "Asset search is outside this example placeholder.",
  },
  {
    capabilityId: "qa.run",
    status: "placeholder",
    notes: "Reserved for future local QA experimentation.",
  },
  {
    capabilityId: "approval.request",
    status: "unsupported",
    notes: "Approval routing is outside this example placeholder.",
  },
  {
    capabilityId: "notify.send",
    status: "unsupported",
    notes: "Notification delivery is outside this example placeholder.",
  },
]

function getUnsupportedResult<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): CapabilityResult<TCapabilityId> {
  return {
    capabilityId: request.capabilityId,
    ok: false,
    providerId: "example",
    error: {
      code: "CAPABILITY_UNSUPPORTED",
      message: `Example provider placeholder does not execute ${request.capabilityId}.`,
    },
  }
}

export const exampleProviderPlaceholder: ProviderExecutor = {
  provider: exampleProviderDefinition,
  capabilities: exampleCapabilitySupport,
  async execute<TCapabilityId extends CapabilityId>(
    request: CapabilityRequest<TCapabilityId>,
    context?: ProviderExecutionContext
  ): Promise<CapabilityResult<TCapabilityId>> {
    void context
    return getUnsupportedResult(request)
  },
}
