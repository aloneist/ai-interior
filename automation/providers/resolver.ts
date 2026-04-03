import type { CapabilityId } from "@/automation/capabilities/types"
import {
  getRegisteredProvider,
  listRegisteredProviders,
} from "@/automation/providers/registry"
import type {
  ProviderCapabilityMatch,
  ProviderCapabilitySupportStatus,
  ProviderId,
  ProviderResolverOptions,
  RegisteredProvider,
} from "@/automation/providers/types"

const defaultCapabilityStatuses: ProviderCapabilitySupportStatus[] = [
  "ready",
  "placeholder",
  "unsupported",
]

function getCapabilityStatuses(
  options?: ProviderResolverOptions
): ProviderCapabilitySupportStatus[] {
  return options?.statuses?.length
    ? options.statuses
    : defaultCapabilityStatuses
}

export function resolveProviderById(
  providerId: ProviderId
): RegisteredProvider | undefined {
  return getRegisteredProvider(providerId)
}

export function resolveProvidersByCapability<
  TCapabilityId extends CapabilityId,
>(
  capabilityId: TCapabilityId,
  options?: ProviderResolverOptions
): ProviderCapabilityMatch<TCapabilityId>[] {
  const allowedStatuses = new Set(getCapabilityStatuses(options))

  return listRegisteredProviders()
    .map((executor) => {
      const support = executor.capabilities.find(
        (entry) => entry.capabilityId === capabilityId
      )

      if (!support || !allowedStatuses.has(support.status)) {
        return undefined
      }

      return {
        providerId: executor.provider.id,
        provider: executor.provider,
        support: support as ProviderCapabilityMatch<TCapabilityId>["support"],
        executor,
      }
    })
    .filter(
      (
        match
      ): match is ProviderCapabilityMatch<TCapabilityId> => match !== undefined
    )
}

export function resolveReadyProvidersByCapability<
  TCapabilityId extends CapabilityId,
>(
  capabilityId: TCapabilityId
): ProviderCapabilityMatch<TCapabilityId>[] {
  return resolveProvidersByCapability(capabilityId, {
    statuses: ["ready"],
  })
}
