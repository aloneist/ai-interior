import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import type { ProviderCapabilityMatch, ProviderId } from "@/automation/providers"

export type ExecuteCapabilityOptions = {
  preferredProviderId?: ProviderId
}

export type CapabilityExecutionSelection<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  requestedCapabilityId: TCapabilityId
  selectedProviderId?: ProviderId
  availableReadyProviderIds: ProviderId[]
}

export type CapabilityExecutionResult<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  selection: CapabilityExecutionSelection<TCapabilityId>
  result: CapabilityResult<TCapabilityId>
}

export type CapabilityExecutionHandler = <
  TCapabilityId extends CapabilityId,
>(
  request: CapabilityRequest<TCapabilityId>,
  options?: ExecuteCapabilityOptions
) => Promise<CapabilityExecutionResult<TCapabilityId>>

export type ReadyProviderMatch<TCapabilityId extends CapabilityId = CapabilityId> =
  ProviderCapabilityMatch<TCapabilityId>
