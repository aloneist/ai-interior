import type { SupabaseClient } from "@supabase/supabase-js"

type JsonLike =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonLike | undefined }
  | JsonLike[]

export type RuntimeFurnitureRecord = {
  id: string
  name: string
  brand: string | null
  category: string | null
  price: number | null
  image_url: string | null
  product_key: string | null
  created_at: string | null
}

export type ImportJobRecord = {
  id: string
  source_site: string | null
  source_url: string
  raw_payload: JsonLike | null
  extracted_name: string | null
  extracted_brand: string | null
  extracted_category: string | null
  extracted_price: number | null
  extracted_material: string | null
  extracted_width_cm: number | null
  extracted_depth_cm: number | null
  extracted_height_cm: number | null
  extracted_color_options: JsonLike | null
  extracted_image_urls: JsonLike | null
  status: string | null
  review_note: string | null
  extracted_source_site: string | null
  extracted_affiliate_url: string | null
  extracted_size_label: string | null
  extracted_capacity_label: string | null
  extracted_source_variant_ids: JsonLike | null
  extracted_option_summaries: JsonLike | null
  extracted_confidence: number | null
  extraction_notes: string | null
}

export type PublishEligibility =
  | { ok: true }
  | { ok: false; code: "invalid_status" | "missing_name"; message: string }

export const IMPORT_JOB_STATUS = {
  pendingReview: "pending_review",
  published: "published",
  rejected: "rejected",
} as const

export const PUBLISHABLE_IMPORT_JOB_STATUSES = [
  IMPORT_JOB_STATUS.pendingReview,
  IMPORT_JOB_STATUS.published,
] as const

type PublishedProductRow = {
  id: string
  source_site: string
  source_url: string
  product_name: string
  brand: string | null
  category: string | null
  price: number | null
  currency: string | null
  image_url: string | null
  product_url: string
  description: string | null
  color: string | null
  material: string | null
  width_cm: number | null
  depth_cm: number | null
  height_cm: number | null
  metadata_json: JsonLike | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

type PublishableProductPayload = {
  source_site: string
  source_url: string
  product_name: string
  brand: string | null
  category: string | null
  price: number | null
  currency: string
  image_url: string | null
  product_url: string
  description: string | null
  color: string | null
  material: string | null
  width_cm: number | null
  depth_cm: number | null
  height_cm: number | null
  metadata_json: JsonLike
  status: "active"
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim()
}

function normalizeKeyPart(value: string | null | undefined) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, " ")
}

function makeRuntimeProductKey(input: {
  primaryUrl?: string | null
  secondaryUrl?: string | null
  brand?: string | null
  name?: string | null
  category?: string | null
}) {
  const primaryUrl = normalizeText(input.primaryUrl)
  if (primaryUrl) return primaryUrl

  const secondaryUrl = normalizeText(input.secondaryUrl)
  if (secondaryUrl) return secondaryUrl

  return `${normalizeKeyPart(input.brand)}|${normalizeKeyPart(
    input.name
  )}|${normalizeKeyPart(input.category)}`
}

function firstString(value: JsonLike | null) {
  if (!Array.isArray(value)) return null

  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      return item.trim()
    }
  }

  return null
}

function toRuntimeFurnitureRecord(row: PublishedProductRow): RuntimeFurnitureRecord {
  return {
    id: row.id,
    name: row.product_name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    image_url: row.image_url,
    product_key: makeRuntimeProductKey({
      primaryUrl: row.product_url,
      secondaryUrl: row.source_url,
      brand: row.brand,
      name: row.product_name,
      category: row.category,
    }),
    created_at: row.created_at,
  }
}

export async function loadRuntimeFurnitureRecordsByIds(
  supabase: SupabaseClient,
  ids: string[]
) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const result = new Map<string, RuntimeFurnitureRecord>()

  if (uniqueIds.length === 0) {
    return result
  }

  const { data: publishedRows, error: publishedError } = await supabase
    .from("furniture_products")
    .select(
      [
        "id",
        "source_site",
        "source_url",
        "product_name",
        "brand",
        "category",
        "price",
        "currency",
        "image_url",
        "product_url",
        "description",
        "color",
        "material",
        "width_cm",
        "depth_cm",
        "height_cm",
        "metadata_json",
        "status",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .in("id", uniqueIds)

  if (publishedError) throw publishedError

  for (const row of ((publishedRows ?? []) as unknown as PublishedProductRow[])) {
    result.set(row.id, toRuntimeFurnitureRecord(row))
  }

  const missingIds = uniqueIds.filter((id) => !result.has(id))

  if (missingIds.length > 0) {
    console.warn("RUNTIME_FURNITURE_HYDRATION_MISSING", {
      unresolvedCount: missingIds.length,
      sampleFurnitureIds: missingIds.slice(0, 5),
    })
  }

  return result
}

export function validateImportJobForPublish(
  job: Pick<ImportJobRecord, "status" | "extracted_name">
): PublishEligibility {
  const status = normalizeText(job.status)

  if (
    status &&
    !PUBLISHABLE_IMPORT_JOB_STATUSES.includes(
      status as (typeof PUBLISHABLE_IMPORT_JOB_STATUSES)[number]
    )
  ) {
    return {
      ok: false,
      code: "invalid_status",
      message: `Import job status is not publishable: ${status}`,
    }
  }

  if (!normalizeText(job.extracted_name)) {
    return {
      ok: false,
      code: "missing_name",
      message: "Import job is missing extracted_name",
    }
  }

  return { ok: true }
}

export function buildPublishedProductPayloadFromImportJob(
  job: ImportJobRecord
): PublishableProductPayload {
  const productName = normalizeText(job.extracted_name)

  if (!productName) {
    throw new Error("Import job is missing extracted_name")
  }

  const sourceSite =
    normalizeText(job.extracted_source_site) ||
    normalizeText(job.source_site) ||
    "unknown"

  const sourceUrl = normalizeText(job.source_url)

  if (!sourceUrl) {
    throw new Error("Import job is missing source_url")
  }

  const productUrl = normalizeText(job.extracted_affiliate_url) || sourceUrl

  return {
    source_site: sourceSite,
    source_url: sourceUrl,
    product_name: productName,
    brand: normalizeText(job.extracted_brand) || null,
    category: normalizeText(job.extracted_category) || null,
    price: typeof job.extracted_price === "number" ? job.extracted_price : null,
    currency: "KRW",
    image_url: firstString(job.extracted_image_urls),
    product_url: productUrl,
    description: normalizeText(job.extraction_notes) || null,
    color: firstString(job.extracted_color_options),
    material: normalizeText(job.extracted_material) || null,
    width_cm:
      typeof job.extracted_width_cm === "number" ? job.extracted_width_cm : null,
    depth_cm:
      typeof job.extracted_depth_cm === "number" ? job.extracted_depth_cm : null,
    height_cm:
      typeof job.extracted_height_cm === "number" ? job.extracted_height_cm : null,
    metadata_json: {
      import_job_id: job.id,
      raw_payload: job.raw_payload,
      review_note: job.review_note,
      extracted_size_label: job.extracted_size_label,
      extracted_capacity_label: job.extracted_capacity_label,
      extracted_source_variant_ids: job.extracted_source_variant_ids,
      extracted_option_summaries: job.extracted_option_summaries,
      extracted_confidence: job.extracted_confidence,
      extraction_notes: job.extraction_notes,
    },
    status: "active",
  }
}

export async function markImportJobPublished(params: {
  supabase: SupabaseClient
  importJobId: string
  publishedProductId: string
}) {
  const { supabase, importJobId, publishedProductId } = params
  const baseUpdate = {
    status: IMPORT_JOB_STATUS.published,
  }

  const { error: updateWithLinkError } = await supabase
    .from("import_jobs")
    .update({
      ...baseUpdate,
      published_product_id: publishedProductId,
    })
    .eq("id", importJobId)

  if (!updateWithLinkError) {
    return
  }

  if (!/published_product_id/i.test(updateWithLinkError.message)) {
    throw updateWithLinkError
  }

  const { error: fallbackError } = await supabase
    .from("import_jobs")
    .update(baseUpdate)
    .eq("id", importJobId)

  if (fallbackError) throw fallbackError
}
