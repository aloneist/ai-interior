import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import { resolveReadyProvidersByCapability } from "@/automation/providers"
import type { ProviderId } from "@/automation/providers"
import type {
  CapabilityExecutionResult,
  ExecuteCapabilityOptions,
  ReadyProviderMatch,
} from "@/automation/execution/types"

function buildNoReadyProviderResult<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  preferredProviderId?: ProviderId
): CapabilityResult<TCapabilityId> {
  const preferredProviderMessage = preferredProviderId
    ? ` Preferred provider ${preferredProviderId} is not ready for ${request.capabilityId}.`
    : ""

  return {
    capabilityId: request.capabilityId,
    ok: false,
    error: {
      code: "NO_READY_PROVIDER",
      message: `No ready provider found for ${request.capabilityId}.${preferredProviderMessage}`,
    },
  }
}

function selectReadyProvider<TCapabilityId extends CapabilityId>(
  readyProviders: ReadyProviderMatch<TCapabilityId>[],
  preferredProviderId?: ProviderId
): ReadyProviderMatch<TCapabilityId> | undefined {
  if (preferredProviderId) {
    return readyProviders.find(
      (provider) => provider.providerId === preferredProviderId
    )
  }

  return readyProviders[0]
}

export async function executeCapability<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  options?: ExecuteCapabilityOptions
): Promise<CapabilityExecutionResult<TCapabilityId>> {
  const readyProviders = resolveReadyProvidersByCapability(request.capabilityId)
  const selectedProvider = selectReadyProvider(
    readyProviders,
    options?.preferredProviderId
  )

  if (!selectedProvider) {
    return {
      selection: {
        requestedCapabilityId: request.capabilityId,
        selectedProviderId: undefined,
        availableReadyProviderIds: readyProviders.map((provider) => provider.providerId),
      },
      result: buildNoReadyProviderResult(request, options?.preferredProviderId),
    }
  }

  const result = await selectedProvider.executor.execute(request, {
    requestId: request.requestId,
    actorId: request.actorId,
  })

  return {
    selection: {
      requestedCapabilityId: request.capabilityId,
      selectedProviderId: selectedProvider.providerId,
      availableReadyProviderIds: readyProviders.map((provider) => provider.providerId),
    },
    result,
  }
}
