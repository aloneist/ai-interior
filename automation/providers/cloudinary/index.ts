import type {
  AssetSearchOutput,
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

type MockCloudinaryAsset = {
  assetId: string
  assetUrl: string
  title: string
  tags: string[]
  folder: string
  resourceType: "image"
}

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
  displayName: "Cloudinary Provider Stub",
  status: "placeholder",
  purpose: "Static read-only automation stub for asset search provider work.",
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
    notes: "Returns static mock asset search results from an in-memory stub.",
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

function getAssetSearchMockResult(
  request: CapabilityRequest<"asset.search">,
  context?: ProviderExecutionContext
): CapabilityResult<"asset.search"> {
  void context

  const normalizedQuery = request.payload.query.trim().toLowerCase()
  const normalizedTags = (request.payload.tags ?? []).map((tag) =>
    tag.trim().toLowerCase()
  )
  const normalizedLimit = request.payload.limit ?? mockCloudinaryAssets.length

  const filteredAssets = mockCloudinaryAssets.filter((asset) => {
    const haystack = [
      asset.assetId,
      asset.title,
      asset.folder,
      asset.resourceType,
      ...asset.tags,
    ]
      .join(" ")
      .toLowerCase()

    if (normalizedQuery && !haystack.includes(normalizedQuery)) {
      return false
    }

    if (!normalizedTags.length) {
      return true
    }

    const assetTags = asset.tags.map((tag) => tag.toLowerCase())
    return normalizedTags.every((tag) => assetTags.includes(tag))
  })

  const data: AssetSearchOutput = {
    results: filteredAssets.slice(0, normalizedLimit).map((asset) => ({
      assetId: asset.assetId,
      assetUrl: asset.assetUrl,
      title: asset.title,
    })),
  }

  return {
    capabilityId: "asset.search",
    ok: true,
    providerId: "cloudinary",
    data,
  }
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
      return getAssetSearchMockResult(
        request as CapabilityRequest<"asset.search">,
        context
      ) as CapabilityResult<TCapabilityId>
    }

    return getUnsupportedResult(
      request as CapabilityRequest<Exclude<TCapabilityId, "asset.search">>
    ) as CapabilityResult<TCapabilityId>
  },
}
