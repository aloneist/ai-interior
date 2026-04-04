import type {
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
  CatalogReadInput,
  CatalogReadItem,
  CatalogReadOutput,
} from "@/automation/capabilities/types"
import { createClient } from "@supabase/supabase-js"
import type {
  ProviderCapabilitySupport,
  ProviderDefinition,
  ProviderExecutionContext,
  ProviderExecutor,
} from "@/automation/providers/types"

type FurnitureProductRow = {
  id: string | number
  source_url: string | null
  product_name: string | null
  brand: string | null
  category: string | null
  price: number | null
  currency: string | null
  image_url: string | null
  product_url: string | null
  status: string | null
}

const LIST_ACTIVE_FURNITURE_PRODUCTS = "list_active_furniture_products"
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 20

const demoCatalogItems: CatalogReadItem[] = [
  {
    id: "demo-chair-001",
    source_url: "https://demo.example.com/products/oak-lounge-chair",
    product_name: "Oak Lounge Chair",
    category: "chair",
    brand: "AI Interior Mock",
    price: 249000,
    currency: "KRW",
    image_url: "https://demo.example.com/images/oak-lounge-chair.jpg",
    product_url: "https://demo.example.com/products/oak-lounge-chair",
    status: "active",
  },
  {
    id: "demo-table-001",
    source_url: "https://demo.example.com/products/stone-side-table",
    product_name: "Stone Side Table",
    category: "table",
    brand: "AI Interior Mock",
    price: 179000,
    currency: "KRW",
    image_url: "https://demo.example.com/images/stone-side-table.jpg",
    product_url: "https://demo.example.com/products/stone-side-table",
    status: "active",
  },
  {
    id: "demo-chair-002",
    source_url: "https://demo.example.com/products/linen-dining-chair",
    product_name: "Linen Dining Chair",
    category: "chair",
    brand: "AI Interior Mock",
    price: 139000,
    currency: "KRW",
    image_url: "https://demo.example.com/images/linen-dining-chair.jpg",
    product_url: "https://demo.example.com/products/linen-dining-chair",
    status: "active",
  },
]

export const supabaseProviderDefinition: ProviderDefinition = {
  id: "supabase",
  displayName: "Supabase Read-Only Gateway",
  status: "planned",
  purpose:
    "Restricted automation gateway for explicit read-only Supabase catalog operations.",
}

export const supabaseCapabilitySupport: ProviderCapabilitySupport[] = [
  {
    capabilityId: "catalog.read",
    status: "ready",
    notes:
      "Executes the explicit list_active_furniture_products read-only operation through a constrained gateway.",
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

function normalizeCategory(category?: string): string | undefined {
  const normalized = category?.trim().toLowerCase()
  return normalized ? normalized : undefined
}

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT
  }

  const boundedLimit = Math.floor(limit as number)

  if (boundedLimit < 1) {
    return 1
  }

  return Math.min(boundedLimit, MAX_LIMIT)
}

function hasSupabaseGatewayEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function createSupabaseReadonlyClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

function mapFurnitureProductRow(row: FurnitureProductRow): CatalogReadItem | undefined {
  if (!row.product_name) {
    return undefined
  }

  return {
    id: String(row.id),
    source_url: row.source_url,
    product_name: row.product_name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    currency: row.currency,
    image_url: row.image_url,
    product_url: row.product_url,
    status: row.status,
  }
}

function buildInvalidCatalogReadResult(
  message: string
): CapabilityResult<"catalog.read"> {
  return {
    capabilityId: "catalog.read",
    ok: false,
    providerId: "supabase",
    error: {
      code: "INVALID_CATALOG_READ_REQUEST",
      message,
    },
  }
}

function buildCatalogReadFallbackResult(
  payload: CatalogReadInput
): CapabilityResult<"catalog.read"> {
  const category = normalizeCategory(payload.category)
  const limit = normalizeLimit(payload.limit)
  const filteredItems = demoCatalogItems.filter((item) => {
    if (!category) {
      return true
    }

    return item.category?.toLowerCase() === category
  })

  const items = filteredItems.slice(0, limit)

  const data: CatalogReadOutput = {
    operation: LIST_ACTIVE_FURNITURE_PRODUCTS,
    source: "demo-fallback",
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

function shouldUseDemoFallback(errorMessage: string): boolean {
  return errorMessage.toLowerCase().includes("fetch failed")
}

async function runListActiveFurnitureProducts(
  payload: CatalogReadInput
): Promise<CapabilityResult<"catalog.read">> {
  if (!hasSupabaseGatewayEnv()) {
    return buildCatalogReadFallbackResult(payload)
  }

  const client = createSupabaseReadonlyClient()
  const category = normalizeCategory(payload.category)
  const limit = normalizeLimit(payload.limit)

  let query = client
    .from("furniture_products")
    .select(
      "id, source_url, product_name, brand, category, price, currency, image_url, product_url, status",
      { count: "exact" }
    )
    .eq("status", "active")
    .order("product_name", { ascending: true })
    .limit(limit)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, count, error } = await query

  if (error) {
    if (shouldUseDemoFallback(error.message)) {
      return buildCatalogReadFallbackResult(payload)
    }

    return {
      capabilityId: "catalog.read",
      ok: false,
      providerId: "supabase",
      error: {
        code: "SUPABASE_READ_FAILED",
        message: error.message,
      },
    }
  }

  const items = (data ?? [])
    .map((row) => mapFurnitureProductRow(row as FurnitureProductRow))
    .filter((item): item is CatalogReadItem => Boolean(item))

  return {
    capabilityId: "catalog.read",
    ok: true,
    providerId: "supabase",
    data: {
      operation: LIST_ACTIVE_FURNITURE_PRODUCTS,
      source: "supabase",
      items,
      totalCount: count ?? items.length,
    },
  }
}

async function getCatalogReadGatewayResult(
  request: CapabilityRequest<"catalog.read">,
  context?: ProviderExecutionContext
): Promise<CapabilityResult<"catalog.read">> {
  void context

  if (request.payload.operation !== LIST_ACTIVE_FURNITURE_PRODUCTS) {
    return buildInvalidCatalogReadResult(
      `Unsupported catalog.read operation: ${request.payload.operation}.`
    )
  }

  return runListActiveFurnitureProducts(request.payload)
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
      const gatewayResult = await getCatalogReadGatewayResult(
        request as CapabilityRequest<"catalog.read">,
        context
      )

      return gatewayResult as unknown as CapabilityResult<TCapabilityId>
    }

    return getUnsupportedResult(
      request as CapabilityRequest<Exclude<TCapabilityId, "catalog.read">>
    ) as CapabilityResult<TCapabilityId>
  },
}
