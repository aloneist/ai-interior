import type { ProviderId } from "@/automation/providers/types"

export type CapabilityId =
  | "catalog.read"
  | "catalog.write.safe"
  | "asset.upload"
  | "asset.search"
  | "qa.run"
  | "approval.request"
  | "notify.send"

export type CapabilityStage = "planned" | "placeholder" | "active"

export type CapabilityArea =
  | "catalog"
  | "asset"
  | "qa"
  | "approval"
  | "notify"

export type CapabilityProviderBinding = {
  providerId: ProviderId
  providerKey: string
  notes?: string
}

export type CapabilityDefinition = {
  id: CapabilityId
  area: CapabilityArea
  summary: string
  stage: CapabilityStage
  bindings: CapabilityProviderBinding[]
}

export type CatalogReadInput = {
  query?: string
  filters?: Record<string, string | number | boolean>
  limit?: number
}

export type CatalogReadOutput = {
  items: Array<Record<string, unknown>>
  totalCount?: number
}

export type CatalogWriteSafeInput = {
  operation: "upsert" | "archive"
  records: Array<Record<string, unknown>>
  reason: string
  dryRun?: boolean
}

export type CatalogWriteSafeOutput = {
  accepted: boolean
  affectedCount: number
  dryRun: boolean
}

export type AssetUploadInput = {
  sourcePath?: string
  sourceUrl?: string
  tags?: string[]
  folder?: string
}

export type AssetUploadOutput = {
  assetId: string
  assetUrl?: string
}

export type AssetSearchInput = {
  query: string
  tags?: string[]
  limit?: number
}

export type AssetSearchOutput = {
  results: Array<{
    assetId: string
    assetUrl?: string
    title?: string
  }>
}

export type QaRunInput = {
  suite: "lint" | "build" | "typecheck" | "custom"
  target?: string
  notes?: string
}

export type QaRunOutput = {
  suite: string
  status: "passed" | "failed" | "partial"
  summary: string
}

export type ApprovalRequestInput = {
  title: string
  summary: string
  requestedBy?: string
  riskLevel?: "low" | "medium" | "high"
}

export type ApprovalRequestOutput = {
  requestId: string
  status: "pending" | "approved" | "rejected"
}

export type NotifySendInput = {
  channel: "email" | "slack" | "webhook" | "other"
  subject?: string
  message: string
  recipients: string[]
}

export type NotifySendOutput = {
  delivered: boolean
  recipientCount: number
}

export type CapabilityInputMap = {
  "catalog.read": CatalogReadInput
  "catalog.write.safe": CatalogWriteSafeInput
  "asset.upload": AssetUploadInput
  "asset.search": AssetSearchInput
  "qa.run": QaRunInput
  "approval.request": ApprovalRequestInput
  "notify.send": NotifySendInput
}

export type CapabilityOutputMap = {
  "catalog.read": CatalogReadOutput
  "catalog.write.safe": CatalogWriteSafeOutput
  "asset.upload": AssetUploadOutput
  "asset.search": AssetSearchOutput
  "qa.run": QaRunOutput
  "approval.request": ApprovalRequestOutput
  "notify.send": NotifySendOutput
}

export type CapabilityRequest<TCapabilityId extends CapabilityId = CapabilityId> = {
  capabilityId: TCapabilityId
  payload: CapabilityInputMap[TCapabilityId]
  requestId?: string
  actorId?: string
}

export type CapabilityError = {
  code: string
  message: string
}

export type CapabilityResult<TCapabilityId extends CapabilityId = CapabilityId> = {
  capabilityId: TCapabilityId
  ok: boolean
  providerId?: ProviderId
  data?: CapabilityOutputMap[TCapabilityId]
  error?: CapabilityError
}
