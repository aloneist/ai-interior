import type { ProviderId } from "@/automation/providers/types"
import type { N8nApprovalHandoffPayload } from "@/automation/orchestration/n8n/approval-handoff"
import type { N8nWebhookDeliveryResult } from "@/automation/orchestration/n8n/webhook-placeholder-sender"

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
  executionPolicy: CapabilityExecutionPolicy
  bindings: CapabilityProviderBinding[]
}

export type CapabilityExecutionPolicy =
  | {
      mode: "auto-allowed"
      riskLevel: "low"
    }
  | {
      mode: "approval-required"
      riskLevel: "medium" | "high"
      reason: string
    }

export type CatalogReadOperation = "list_active_furniture_products"

export type CatalogReadItem = {
  id: string
  source_url?: string | null
  product_name: string
  brand?: string | null
  category?: string | null
  price?: number | null
  currency?: string | null
  image_url?: string | null
  product_url?: string | null
  status?: string | null
}

export type CatalogReadInput = {
  operation: CatalogReadOperation
  category?: string
  limit?: number
}

export type CatalogReadOutput = {
  operation: CatalogReadOperation
  source: "supabase" | "demo-fallback"
  items: CatalogReadItem[]
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

export type AssetSearchOperation = "search_design_reference_assets"

export type AssetSearchResultItem = {
  assetId: string
  assetUrl?: string
  title?: string
  folder?: string | null
  tags?: string[]
}

export type AssetSearchInput = {
  operation: AssetSearchOperation
  folder?: string
  tags?: string[]
  maxResults?: number
}

export type AssetSearchOutput = {
  operation: AssetSearchOperation
  source: "cloudinary" | "demo-fallback"
  results: AssetSearchResultItem[]
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

export type CapabilityApprovalRequirement = {
  status: "not-required" | "required"
  reason?: string
  riskLevel?: "low" | "medium" | "high"
  handoff?: N8nApprovalHandoffPayload
  senderResult?: N8nWebhookDeliveryResult
  lifecycle?: CapabilityApprovalLifecycle
}

export type ApprovalLifecycleState =
  | "approval_required"
  | "handoff_prepared"
  | "handoff_not_sent"
  | "handoff_sent"
  | "approved"
  | "rejected"

export type CapabilityApprovalLifecycle = {
  currentState: ApprovalLifecycleState
  reachedStates: ApprovalLifecycleState[]
  availableStates: ApprovalLifecycleState[]
}

export type CapabilityResult<TCapabilityId extends CapabilityId = CapabilityId> = {
  capabilityId: TCapabilityId
  ok: boolean
  providerId?: ProviderId
  approval?: CapabilityApprovalRequirement
  data?: CapabilityOutputMap[TCapabilityId]
  error?: CapabilityError
}
