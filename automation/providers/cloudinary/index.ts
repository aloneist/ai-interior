import type {
  AssetSearchInput,
  AssetSearchOutput,
  AssetSearchResultItem,
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import { v2 as cloudinary } from "cloudinary"
import type {
  ProviderCapabilitySupport,
  ProviderDefinition,
  ProviderExecutionContext,
  ProviderExecutor,
} from "@/automation/providers/types"

type MockCloudinaryAsset = {
  assetId: string
  assetUrl: string
  title: string
  tags: string[]
  folder: string
  resourceType: "image"
}

type CloudinarySearchResource = {
  public_id?: string
  secure_url?: string
  display_name?: string
  folder?: string
  tags?: string[]
}

const SEARCH_DESIGN_REFERENCE_ASSETS = "search_design_reference_assets"
const DEFAULT_MAX_RESULTS = 5
const MAX_MAX_RESULTS = 10

const mockCloudinaryAssets: MockCloudinaryAsset[] = [
  {
    assetId: "cld-living-room-001",
    assetUrl: "https://mock.cloudinary.local/ai-interior/living-room-oak-chair.jpg",
    title: "Living Room Oak Chair",
    tags: ["chair", "living-room", "oak", "neutral"],
    folder: "mock/living-room",
    resourceType: "image",
  },
  {
    assetId: "cld-bedroom-002",
    assetUrl: "https://mock.cloudinary.local/ai-interior/bedroom-linen-bed.jpg",
    title: "Bedroom Linen Bed",
    tags: ["bed", "bedroom", "linen", "soft"],
    folder: "mock/bedroom",
    resourceType: "image",
  },
  {
    assetId: "cld-decor-003",
    assetUrl: "https://mock.cloudinary.local/ai-interior/decor-stone-vase.jpg",
    title: "Stone Vase Styling Asset",
    tags: ["decor", "vase", "stone", "styling"],
    folder: "mock/decor",
    resourceType: "image",
  },
]

export const cloudinaryProviderDefinition: ProviderDefinition = {
  id: "cloudinary",
  displayName: "Cloudinary Read-Only Gateway",
  status: "planned",
  purpose:
    "Restricted automation gateway for explicit read-only Cloudinary asset search operations.",
}

export const cloudinaryCapabilitySupport: ProviderCapabilitySupport[] = [
  {
    capabilityId: "catalog.read",
    status: "unsupported",
    notes: "Catalog reads are outside the Cloudinary provider scope.",
  },
  {
    capabilityId: "catalog.write.safe",
    status: "unsupported",
    notes: "Catalog writes are outside the Cloudinary provider scope.",
  },
  {
    capabilityId: "asset.upload",
    status: "placeholder",
    notes: "Reserved for a future upload adapter.",
  },
  {
    capabilityId: "asset.search",
    status: "ready",
    notes:
      "Executes the explicit search_design_reference_assets read-only operation through a constrained gateway.",
  },
  {
    capabilityId: "qa.run",
    status: "unsupported",
    notes: "QA execution is outside the Cloudinary provider scope.",
  },
  {
    capabilityId: "approval.request",
    status: "unsupported",
    notes: "Approval routing is outside the Cloudinary provider scope.",
  },
  {
    capabilityId: "notify.send",
    status: "unsupported",
    notes: "Notification delivery is outside the Cloudinary provider scope.",
  },
]

function normalizeFolder(folder?: string): string | undefined {
  const normalized = folder?.trim().replace(/^\/+|\/+$/g, "")
  return normalized ? normalized : undefined
}

function normalizeTags(tags?: string[]): string[] {
  return (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3)
}

function normalizeMaxResults(maxResults?: number): number {
  if (!Number.isFinite(maxResults)) {
    return DEFAULT_MAX_RESULTS
  }

  const boundedMaxResults = Math.floor(maxResults as number)

  if (boundedMaxResults < 1) {
    return 1
  }

  return Math.min(boundedMaxResults, MAX_MAX_RESULTS)
}

function hasCloudinaryGatewayEnv(): boolean {
  return Boolean(
    process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_KEY &&
      process.env.CLOUDINARY_SECRET
  )
}

function configureCloudinaryReadonly(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  })
}

function mapMockAsset(asset: MockCloudinaryAsset): AssetSearchResultItem {
  return {
    assetId: asset.assetId,
    assetUrl: asset.assetUrl,
    title: asset.title,
    folder: asset.folder,
    tags: asset.tags,
  }
}

function mapCloudinaryResource(
  resource: CloudinarySearchResource
): AssetSearchResultItem | undefined {
  if (!resource.public_id) {
    return undefined
  }

  return {
    assetId: resource.public_id,
    assetUrl: resource.secure_url,
    title: resource.display_name,
    folder: resource.folder,
    tags: resource.tags ?? [],
  }
}

function buildInvalidAssetSearchResult(
  message: string
): CapabilityResult<"asset.search"> {
  return {
    capabilityId: "asset.search",
    ok: false,
    providerId: "cloudinary",
    error: {
      code: "INVALID_ASSET_SEARCH_REQUEST",
      message,
    },
  }
}

function buildAssetSearchFallbackResult(
  payload: AssetSearchInput
): CapabilityResult<"asset.search"> {
  const normalizedFolder = normalizeFolder(payload.folder)
  const normalizedTags = normalizeTags(payload.tags)
  const normalizedMaxResults = normalizeMaxResults(payload.maxResults)

  const filteredAssets = mockCloudinaryAssets.filter((asset) => {
    if (normalizedFolder && asset.folder !== normalizedFolder) {
      return false
    }

    if (!normalizedTags.length) {
      return true
    }

    const assetTags = asset.tags.map((tag) => tag.toLowerCase())
    return normalizedTags.every((tag) => assetTags.includes(tag))
  })

  const data: AssetSearchOutput = {
    operation: SEARCH_DESIGN_REFERENCE_ASSETS,
    source: "demo-fallback",
    results: filteredAssets
      .slice(0, normalizedMaxResults)
      .map((asset) => mapMockAsset(asset)),
  }

  return {
    capabilityId: "asset.search",
    ok: true,
    providerId: "cloudinary",
    data,
  }
}

function shouldUseDemoFallback(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : ""
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("eai_again") ||
    normalizedMessage.includes("getaddrinfo")
  )
}

function buildSearchExpression(payload: AssetSearchInput): string {
  const expressionParts = ['resource_type:image']
  const normalizedFolder = normalizeFolder(payload.folder)
  const normalizedTags = normalizeTags(payload.tags)

  if (normalizedFolder) {
    expressionParts.push(`folder="${normalizedFolder}"`)
  }

  for (const tag of normalizedTags) {
    expressionParts.push(`tags="${tag}"`)
  }

  return expressionParts.join(" AND ")
}

async function runSearchDesignReferenceAssets(
  payload: AssetSearchInput
): Promise<CapabilityResult<"asset.search">> {
  if (!hasCloudinaryGatewayEnv()) {
    return buildAssetSearchFallbackResult(payload)
  }

  const maxResults = normalizeMaxResults(payload.maxResults)

  try {
    configureCloudinaryReadonly()

    const response = await cloudinary.search
      .expression(buildSearchExpression(payload))
      .sort_by("public_id", "asc")
      .max_results(maxResults)
      .execute()

    const results = ((response.resources ?? []) as CloudinarySearchResource[])
      .map((resource) => mapCloudinaryResource(resource))
      .filter((item): item is AssetSearchResultItem => Boolean(item))

    return {
      capabilityId: "asset.search",
      ok: true,
      providerId: "cloudinary",
      data: {
        operation: SEARCH_DESIGN_REFERENCE_ASSETS,
        source: "cloudinary",
        results,
      },
    }
  } catch (error: unknown) {
    if (shouldUseDemoFallback(error)) {
      return buildAssetSearchFallbackResult(payload)
    }

    return {
      capabilityId: "asset.search",
      ok: false,
      providerId: "cloudinary",
      error: {
        code: "CLOUDINARY_READ_FAILED",
        message: error instanceof Error ? error.message : "Cloudinary asset search failed",
      },
    }
  }
}

async function getAssetSearchGatewayResult(
  request: CapabilityRequest<"asset.search">,
  context?: ProviderExecutionContext
): Promise<CapabilityResult<"asset.search">> {
  void context

  if (request.payload.operation !== SEARCH_DESIGN_REFERENCE_ASSETS) {
    return buildInvalidAssetSearchResult(
      `Unsupported asset.search operation: ${request.payload.operation}.`
    )
  }

  return runSearchDesignReferenceAssets(request.payload)
}

function getUnsupportedResult<TCapabilityId extends Exclude<CapabilityId, "asset.search">>(
  request: CapabilityRequest<TCapabilityId>
): CapabilityResult<TCapabilityId> {
  return {
    capabilityId: request.capabilityId,
    ok: false,
    providerId: "cloudinary",
    error: {
      code: "CAPABILITY_UNSUPPORTED",
      message: `Cloudinary provider stub does not execute ${request.capabilityId}.`,
    },
  }
}

export const cloudinaryProviderStub: ProviderExecutor = {
  provider: cloudinaryProviderDefinition,
  capabilities: cloudinaryCapabilitySupport,
  async execute<TCapabilityId extends CapabilityId>(
    request: CapabilityRequest<TCapabilityId>,
    context?: ProviderExecutionContext
  ): Promise<CapabilityResult<TCapabilityId>> {
    if (request.capabilityId === "asset.search") {
      const gatewayResult = await getAssetSearchGatewayResult(
        request as CapabilityRequest<"asset.search">,
        context
      )

      return gatewayResult as unknown as CapabilityResult<TCapabilityId>
    }

    return getUnsupportedResult(
      request as CapabilityRequest<Exclude<TCapabilityId, "asset.search">>
    ) as CapabilityResult<TCapabilityId>
  },
}
