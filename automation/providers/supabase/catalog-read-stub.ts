import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
  CatalogReadOutput,
} from "@/automation/capabilities/types"
import type {
  ProviderCapabilitySupport,
  ProviderDefinition,
  ProviderExecutionContext,
  ProviderExecutor,
} from "@/automation/providers/types"

type MockCatalogItem = {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  status: "active" | "draft"
}

const mockCatalogItems: MockCatalogItem[] = [
  {
    id: "stub-chair-001",
    sku: "AI-CHAIR-001",
    name: "Oak Lounge Chair",
    category: "chair",
    brand: "AI Interior Mock",
    status: "active",
  },
  {
    id: "stub-table-001",
    sku: "AI-TABLE-001",
    name: "Stone Side Table",
    category: "table",
    brand: "AI Interior Mock",
    status: "active",
  },
  {
    id: "stub-sofa-001",
    sku: "AI-SOFA-001",
    name: "Soft Modular Sofa",
    category: "sofa",
    brand: "AI Interior Mock",
    status: "draft",
  },
]

export const supabaseProviderDefinition: ProviderDefinition = {
  id: "supabase",
  displayName: "Supabase Provider Stub",
  status: "placeholder",
  purpose: "Static read-only automation stub for catalog-oriented provider work.",
}

export const supabaseCapabilitySupport: ProviderCapabilitySupport[] = [
  {
    capabilityId: "catalog.read",
    status: "ready",
    notes: "Returns static mock catalog data from an in-memory stub.",
  },
  {
    capabilityId: "catalog.write.safe",
    status: "placeholder",
    notes: "Reserved for future guarded write flows.",
  },
  {
    capabilityId: "asset.upload",
    status: "unsupported",
    notes: "Asset operations are outside this stub.",
  },
  {
    capabilityId: "asset.search",
    status: "unsupported",
    notes: "Asset search is outside this stub.",
  },
  {
    capabilityId: "qa.run",
    status: "unsupported",
    notes: "QA execution is outside this stub.",
  },
  {
    capabilityId: "approval.request",
    status: "unsupported",
    notes: "Approval routing is outside this stub.",
  },
  {
    capabilityId: "notify.send",
    status: "unsupported",
    notes: "Notification delivery is outside this stub.",
  },
]

function getCatalogReadMockResult(
  request: CapabilityRequest<"catalog.read">,
  context?: ProviderExecutionContext
): CapabilityResult<"catalog.read"> {
  void context

  const normalizedQuery = request.payload.query?.trim().toLowerCase()
  const normalizedLimit = request.payload.limit ?? mockCatalogItems.length

  const filteredItems = mockCatalogItems.filter((item) => {
    if (!normalizedQuery) {
      return true
    }

    return [
      item.id,
      item.sku,
      item.name,
      item.category,
      item.brand,
      item.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  })

  const items = filteredItems.slice(0, normalizedLimit)

  const data: CatalogReadOutput = {
    items,
    totalCount: filteredItems.length,
  }

  return {
    capabilityId: "catalog.read",
    ok: true,
    providerId: "supabase",
    data,
  }
}

function getUnsupportedResult<TCapabilityId extends Exclude<CapabilityId, "catalog.read">>(
  request: CapabilityRequest<TCapabilityId>
): CapabilityResult<TCapabilityId> {
  return {
    capabilityId: request.capabilityId,
    ok: false,
    providerId: "supabase",
    error: {
      code: "CAPABILITY_UNSUPPORTED",
      message: `Supabase provider stub does not execute ${request.capabilityId}.`,
    },
  }
}

export const supabaseProviderStub: ProviderExecutor = {
  provider: supabaseProviderDefinition,
  capabilities: supabaseCapabilitySupport,
  async execute<TCapabilityId extends CapabilityId>(
    request: CapabilityRequest<TCapabilityId>,
    context?: ProviderExecutionContext
  ): Promise<CapabilityResult<TCapabilityId>> {
    if (request.capabilityId === "catalog.read") {
      return getCatalogReadMockResult(
        request as CapabilityRequest<"catalog.read">,
        context
      ) as CapabilityResult<TCapabilityId>
    }

    return getUnsupportedResult(
      request as CapabilityRequest<Exclude<TCapabilityId, "catalog.read">>
    ) as CapabilityResult<TCapabilityId>
  },
}
