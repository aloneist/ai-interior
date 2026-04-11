import type { SupabaseClient } from "@supabase/supabase-js"
import {
  applyCatalogMetadataOverlay,
  type CatalogMetadataOverlay,
} from "@/lib/server/catalog-metadata-overlay"

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
  affiliate_url: string | null
  description: string | null
  color: string | null
  material: string | null
  catalog_metadata: CatalogMetadataOverlay | null
  created_at: string | null
}

export type RuntimeFurnitureVectorRecord = {
  furniture_id: string
  brightness_compatibility: number | null
  color_temperature_score: number | null
  spatial_footprint_score: number | null
  minimalism_score: number | null
  contrast_score: number | null
  colorfulness_score: number | null
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
  published_product_id: string | null
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
  affiliate_url: string | null
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

const PUBLISHED_PRODUCT_SELECT_FIELDS = [
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
  "affiliate_url",
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

const FURNITURE_VECTOR_SELECT_FIELDS = [
  "furniture_id",
  "brightness_compatibility",
  "color_temperature_score",
  "spatial_footprint_score",
  "minimalism_score",
  "contrast_score",
  "colorfulness_score",
].join(", ")

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
  affiliate_url: string | null
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

export function normalizeMaterialForPersistence(
  value: string | null | undefined
) {
  const text = normalizeText(value)

  if (!text) return null

  const compact = text.replace(/\s+/g, " ")

  if (
    /\b(?:width|depth|height|length|diameter|seat width|seat depth|seat height|w|d|h)\s*[:=]?\s*\d/i.test(
      compact
    ) ||
    /(?:폭|깊이|높이|길이|지름|좌면폭|좌면\s*깊이|좌면\s*높이)\s*[:=]?\s*\d/i.test(
      compact
    ) ||
    /\d+(?:\.\d+)?\s*(?:cm|mm|m)\b/i.test(compact) ||
    /\d+(?:\.\d+)?\s*[xX×]\s*\d+(?:\.\d+)?/.test(compact)
  ) {
    return null
  }

  return compact
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

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function parseExtractionNotes(value: string | null | undefined) {
  const text = normalizeText(value)
  if (!text) return null

  try {
    return asObject(JSON.parse(text))
  } catch {
    return null
  }
}

function extractCanonicalGeometrySourceClassification(job: ImportJobRecord) {
  const rawPayload = asObject(job.raw_payload)
  const parserResult = asObject(rawPayload?.parser_result)
  const parserMetadata = asObject(parserResult?.metadata_json)
  const parserSiteMetadata = asObject(parserMetadata?.site_metadata)
  const extractionNotes = parseExtractionNotes(job.extraction_notes)
  const parserDebug = asObject(extractionNotes?.parser_debug)
  const parserDebugSiteMetadata = asObject(parserDebug?.site_metadata)

  const raw_dimension_text_preview =
    asNonEmptyString(parserMetadata?.raw_dimension_text_preview) ??
    asNonEmptyString(parserDebug?.raw_dimension_text_preview)

  const selected_dimension_line =
    asNonEmptyString(parserMetadata?.selected_dimension_line) ??
    asNonEmptyString(parserDebug?.selected_dimension_line)

  const site_dimension_source =
    asNonEmptyString(parserSiteMetadata?.dimension_source) ??
    asNonEmptyString(parserDebugSiteMetadata?.dimension_source)

  const width_cm =
    asFiniteNumber(parserResult?.width_cm) ??
    asFiniteNumber(parserDebug?.width_cm)

  const depth_cm =
    asFiniteNumber(parserResult?.depth_cm) ??
    asFiniteNumber(parserDebug?.depth_cm)

  const height_cm =
    asFiniteNumber(parserResult?.height_cm) ??
    asFiniteNumber(parserDebug?.height_cm)

  const diameter_cm =
    asFiniteNumber(parserMetadata?.diameter_cm) ??
    asFiniteNumber(parserDebug?.diameter_cm)

  const overall_height_cm =
    asFiniteNumber(parserMetadata?.overall_height_cm) ??
    asFiniteNumber(parserDebug?.overall_height_cm)

  const backrest_height_cm =
    asFiniteNumber(parserMetadata?.backrest_height_cm) ??
    asFiniteNumber(parserDebug?.backrest_height_cm)

  const geometryAxes =
    (width_cm != null ? 1 : 0) +
    (depth_cm != null ? 1 : 0) +
    (height_cm != null ? 1 : 0)

  const hasStructuredTextEvidence =
    site_dimension_source === "product_name_explicit_2d_dimensions" ||
    (selected_dimension_line != null && geometryAxes >= 2) ||
    (raw_dimension_text_preview != null &&
      (geometryAxes >= 2 ||
        diameter_cm != null ||
        overall_height_cm != null ||
        backrest_height_cm != null))

  const hasPartialTextEvidence =
    site_dimension_source === "product_name_storage_width_class" ||
    (raw_dimension_text_preview != null && geometryAxes === 1) ||
    (selected_dimension_line != null && geometryAxes === 1)

  let parser_lane_eligibility: "eligible" | "conditional" | "ineligible"
  let geometry_source_shape:
    | "text_structured"
    | "text_partial"
    | "image_heavy_or_absent"
  let geometry_source_reason: string

  if (hasStructuredTextEvidence) {
    parser_lane_eligibility = "eligible"
    geometry_source_shape = "text_structured"

    if (site_dimension_source === "product_name_explicit_2d_dimensions") {
      geometry_source_reason = "explicit_compact_dimension_text"
    } else if (selected_dimension_line != null) {
      geometry_source_reason = "selected_dimension_line"
    } else {
      geometry_source_reason = "trusted_dimension_text_block"
    }
  } else if (hasPartialTextEvidence) {
    parser_lane_eligibility = "conditional"
    geometry_source_shape = "text_partial"

    if (site_dimension_source === "product_name_storage_width_class") {
      geometry_source_reason = "partial_width_class_text"
    } else {
      geometry_source_reason = "partial_dimension_text"
    }
  } else {
    parser_lane_eligibility = "ineligible"
    geometry_source_shape = "image_heavy_or_absent"
    geometry_source_reason = "no_trustworthy_text_geometry"
  }

  return {
    parser_lane_eligibility,
    geometry_source_shape,
    geometry_source_reason,
  }
}

function extractCanonicalGeometryMetadata(job: ImportJobRecord) {
  const rawPayload = asObject(job.raw_payload)
  const parserResult = asObject(rawPayload?.parser_result)
  const parserMetadata = asObject(parserResult?.metadata_json)
  const extractionNotes = parseExtractionNotes(job.extraction_notes)
  const parserDebug = asObject(extractionNotes?.parser_debug)

  const raw_dimension_text_preview =
    asNonEmptyString(parserMetadata?.raw_dimension_text_preview) ??
    asNonEmptyString(parserDebug?.raw_dimension_text_preview)

  const selected_dimension_line =
    asNonEmptyString(parserMetadata?.selected_dimension_line) ??
    asNonEmptyString(parserDebug?.selected_dimension_line)

  const selected_dimension_unit =
    asNonEmptyString(parserMetadata?.selected_dimension_unit) ??
    asNonEmptyString(parserDebug?.selected_dimension_unit)

  const range_policy_applied =
    asNonEmptyString(parserMetadata?.range_policy_applied) ??
    asNonEmptyString(parserDebug?.range_policy_applied)

  const overall_height_cm =
    asFiniteNumber(parserMetadata?.overall_height_cm) ??
    asFiniteNumber(parserDebug?.overall_height_cm)

  const backrest_height_cm =
    asFiniteNumber(parserMetadata?.backrest_height_cm) ??
    asFiniteNumber(parserDebug?.backrest_height_cm)

  const diameter_cm =
    asFiniteNumber(parserMetadata?.diameter_cm) ??
    asFiniteNumber(parserDebug?.diameter_cm)

  const width_is_diameter =
    asBoolean(parserMetadata?.width_is_diameter) ??
    asBoolean(parserMetadata?.derived_width_from_diameter) ??
    asBoolean(parserDebug?.width_is_diameter) ??
    asBoolean(parserDebug?.derived_width_from_diameter)

  const depth_is_diameter =
    asBoolean(parserMetadata?.depth_is_diameter) ??
    asBoolean(parserMetadata?.derived_depth_from_diameter) ??
    asBoolean(parserDebug?.depth_is_diameter) ??
    asBoolean(parserDebug?.derived_depth_from_diameter)

  const explicitFootprintShape =
    typeof parserMetadata?.footprint_shape === "string" &&
    parserMetadata.footprint_shape.trim()
      ? parserMetadata.footprint_shape.trim()
      : typeof parserDebug?.footprint_shape === "string" &&
        parserDebug.footprint_shape.trim()
      ? parserDebug.footprint_shape.trim()
      : null

  const footprint_shape =
    explicitFootprintShape ??
    (diameter_cm != null && width_is_diameter && depth_is_diameter
      ? "round"
      : null)

  const result: Record<string, JsonLike> = {}

  if (raw_dimension_text_preview) {
    result.raw_dimension_text_preview = raw_dimension_text_preview
  }
  if (selected_dimension_line) {
    result.selected_dimension_line = selected_dimension_line
  }
  if (selected_dimension_unit) {
    result.selected_dimension_unit = selected_dimension_unit
  }
  if (range_policy_applied) {
    result.range_policy_applied = range_policy_applied
  }
  if (overall_height_cm != null) {
    result.overall_height_cm = overall_height_cm
  }
  if (backrest_height_cm != null) {
    result.backrest_height_cm = backrest_height_cm
  }
  if (diameter_cm != null) {
    result.diameter_cm = diameter_cm
  }
  if (width_is_diameter != null) {
    result.width_is_diameter = width_is_diameter
    result.derived_width_from_diameter = width_is_diameter
  }
  if (depth_is_diameter != null) {
    result.depth_is_diameter = depth_is_diameter
    result.derived_depth_from_diameter = depth_is_diameter
  }
  if (footprint_shape) {
    result.footprint_shape = footprint_shape
  }

  if (Object.keys(result).length === 0) {
    return null
  }

  return result
}

function toRuntimeFurnitureRecord(row: PublishedProductRow): RuntimeFurnitureRecord {
  return applyCatalogMetadataOverlay({
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
    affiliate_url: row.affiliate_url,
    description: row.description,
    color: row.color,
    material: normalizeMaterialForPersistence(row.material),
    catalog_metadata: null,
    created_at: row.created_at,
  })
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
    .select(PUBLISHED_PRODUCT_SELECT_FIELDS)
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

export async function loadRuntimeRecommendationCatalog(
  supabase: SupabaseClient
) {
  const { data: publishedRows, error: publishedError } = await supabase
    .from("furniture_products")
    .select(PUBLISHED_PRODUCT_SELECT_FIELDS)
    .eq("status", "active")

  if (publishedError) throw publishedError

  const typedPublishedRows = (publishedRows ?? []) as unknown as PublishedProductRow[]
  const furnitureById = new Map<string, RuntimeFurnitureRecord>()

  for (const row of typedPublishedRows) {
    furnitureById.set(row.id, toRuntimeFurnitureRecord(row))
  }

  const activeIds = typedPublishedRows.map((row) => row.id)

  if (activeIds.length === 0) {
    return {
      vectors: [] as RuntimeFurnitureVectorRecord[],
      furnitureById,
      activeProductCount: 0,
      vectorBackfillCount: 0,
    }
  }

  const { data: vectorRows, error: vectorError } = await supabase
    .from("furniture_vectors")
    .select(FURNITURE_VECTOR_SELECT_FIELDS)
    .in("furniture_id", activeIds)

  if (vectorError) throw vectorError

  const vectorById = new Map<string, RuntimeFurnitureVectorRecord>()
  for (const row of ((vectorRows ?? []) as unknown as RuntimeFurnitureVectorRecord[])) {
    vectorById.set(row.furniture_id, row)
  }

  const vectors = activeIds.map((id) => {
    return (
      vectorById.get(id) ?? {
        furniture_id: id,
        brightness_compatibility: null,
        color_temperature_score: null,
        spatial_footprint_score: null,
        minimalism_score: null,
        contrast_score: null,
        colorfulness_score: null,
      }
    )
  })

  const vectorBackfillCount = vectors.filter(
    (item) => !vectorById.has(item.furniture_id)
  ).length

  if (vectorBackfillCount > 0) {
    console.warn("RUNTIME_VECTOR_COMPATIBILITY_BACKFILL", {
      activeProductCount: activeIds.length,
      vectorBackfillCount,
      sampleFurnitureIds: activeIds.filter((id) => !vectorById.has(id)).slice(0, 5),
    })
  }

  return {
    vectors,
    furnitureById,
    activeProductCount: activeIds.length,
    vectorBackfillCount,
  }
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

  const geometryMetadata = extractCanonicalGeometryMetadata(job)
  const sourceShapeClassification =
    extractCanonicalGeometrySourceClassification(job)

  return {
    source_site: sourceSite,
    source_url: sourceUrl,
    product_name: productName,
    brand: normalizeText(job.extracted_brand) || null,
    category: normalizeText(job.extracted_category) || null,
    price: typeof job.extracted_price === "number" ? job.extracted_price : null,
    currency: "KRW",
    image_url: firstString(job.extracted_image_urls),
    product_url: sourceUrl,
    affiliate_url: normalizeText(job.extracted_affiliate_url) || null,
    description: normalizeText(job.extraction_notes) || null,
    color: firstString(job.extracted_color_options),
    material: normalizeMaterialForPersistence(job.extracted_material),
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
      ...sourceShapeClassification,
      ...(geometryMetadata ?? {}),
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

  const { error } = await supabase
    .from("import_jobs")
    .update({
      status: IMPORT_JOB_STATUS.published,
      published_product_id: publishedProductId,
    })
    .eq("id", importJobId)

  if (error) throw error
}

export async function publishImportJobToCanonicalProduct(params: {
  supabase: SupabaseClient
  importJob: ImportJobRecord
}) {
  const { supabase, importJob } = params
  const eligibility = validateImportJobForPublish(importJob)

  if (!eligibility.ok) {
    return { ok: false as const, eligibility }
  }

  const productPayload = buildPublishedProductPayloadFromImportJob(importJob)

  const { data: publishedProduct, error: publishError } = await supabase
    .from("furniture_products")
    .upsert(productPayload, { onConflict: "source_url" })
    .select()
    .single()

  if (publishError) throw publishError

  await markImportJobPublished({
    supabase,
    importJobId: importJob.id,
    publishedProductId: publishedProduct.id,
  })

  return {
    ok: true as const,
    publishedProduct,
    repeated:
      Boolean(importJob.published_product_id) &&
      importJob.published_product_id === publishedProduct.id,
  }
}
