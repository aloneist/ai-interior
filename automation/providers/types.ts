import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"

export type ProviderId = "supabase" | "cloudinary" | "example"

export type ProviderStatus = "placeholder" | "planned" | "connected"

export type ProviderDefinition = {
  id: ProviderId
  displayName: string
  status: ProviderStatus
  purpose: string
}

export type ProviderCapabilitySupport = {
  capabilityId: CapabilityId
  status: "unsupported" | "placeholder" | "ready"
  notes?: string
}

export type ProviderCapabilitySupportStatus = ProviderCapabilitySupport["status"]

export type ProviderExecutionContext = {
  dryRun?: boolean
  requestId?: string
  actorId?: string
}

export type ProviderExecutionResult<TData = unknown> = {
  ok: boolean
  providerId: ProviderId
  data?: TData
  message?: string
}

export interface ProviderExecutor {
  provider: ProviderDefinition
  capabilities: ProviderCapabilitySupport[]
  execute<TCapabilityId extends CapabilityId>(
    request: CapabilityRequest<TCapabilityId>,
    context?: ProviderExecutionContext
  ): Promise<CapabilityResult<TCapabilityId>>
}

export type RegisteredProvider = ProviderExecutor

export type ProviderRegistry = Record<ProviderId, RegisteredProvider>

export type ProviderCapabilityMatch<TCapabilityId extends CapabilityId = CapabilityId> = {
  providerId: ProviderId
  provider: ProviderDefinition
  support: Extract<ProviderCapabilitySupport, { capabilityId: TCapabilityId }>
  executor: RegisteredProvider
}

export type ProviderResolverOptions = {
  statuses?: ProviderCapabilitySupportStatus[]
}
