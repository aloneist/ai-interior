import process from "node:process"
import { writeFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import sharp from "sharp"

const ACTIVE_STATUS = "active"
const SCORE_FIELDS = [
  "brightness_compatibility",
  "color_temperature_score",
  "spatial_footprint_score",
  "minimalism_score",
  "contrast_score",
  "colorfulness_score",
]
const BACKFILL_PRIORITY = ["livart", "hanssem", "ikea"]
const SKIPPED_SOURCE_SITES = new Set(["qa", "manual_admin"])

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function parseArgs(argv) {
  const parsed = {
    apply: false,
    reportPath: "",
    limit: 0,
  }

  for (const arg of argv) {
    if (arg === "--apply") {
      parsed.apply = true
      continue
    }

    if (arg.startsWith("--report-path=")) {
      parsed.reportPath = arg.slice("--report-path=".length).trim()
      continue
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length).trim())
      parsed.limit = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
    }
  }

  return parsed
}

function makeSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  )
}

function makeOpenAiClient() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") })
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : ""
}

function isHttpUrl(value) {
  const url = normalizeText(value)
  return /^https?:\/\//i.test(url)
}

function makeLegacyProductKey(product) {
  const normalizePart = (value) =>
    normalizeText(value)
      .toLowerCase()
      .replace(/\s+/g, " ")

  const sourceSite = normalizePart(product.source_site) || "canonical"
  const name = normalizePart(product.product_name)
  const category = normalizePart(product.category)

  return `${sourceSite}|${name}|${category}`
}

function clampScore(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalizeHex(value) {
  const hex = normalizeText(value).toUpperCase()
  return /^#[0-9A-F]{6}$/.test(hex) ? hex : null
}

function describeError(error) {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === "object") {
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }

  return String(error)
}

function normalizeAnalysis(raw) {
  return {
    brightness_compatibility: clampScore(raw?.brightness_compatibility),
    color_temperature_score: clampScore(raw?.color_temperature_score),
    spatial_footprint_score: clampScore(raw?.spatial_footprint_score),
    minimalism_score: clampScore(raw?.minimalism_score),
    contrast_score: clampScore(raw?.contrast_score),
    colorfulness_score: clampScore(raw?.colorfulness_score),
    dominant_color_hex: normalizeHex(raw?.dominant_color_hex),
  }
}

async function analyzeFurnitureImage(params) {
  const { openai, product } = params
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are an interior furniture analysis engine.
Return ONLY valid JSON. No explanation.

Return this exact structure with integers 0-100:

{
  "brightness_compatibility": integer,
  "color_temperature_score": integer,
  "spatial_footprint_score": integer,
  "minimalism_score": integer,
  "contrast_score": integer,
  "colorfulness_score": integer,
  "dominant_color_hex": "#RRGGBB"
}

Definitions:
- brightness_compatibility: fits bright rooms (0=only dark rooms, 100=great in bright rooms)
- color_temperature_score: 0=cool, 100=warm
- spatial_footprint_score: 0=small/light, 100=large/visually heavy
- minimalism_score: 0=ornate/maximal, 100=minimal
- contrast_score: 0=low contrast (soft), 100=high contrast (bold)
- colorfulness_score: 0=neutral/monochrome, 100=very colorful

Rules:
- All scores must be integers 0..100
- dominant_color_hex must be valid 7-char hex like #A1B2C3
- Judge from the product image only. Do not infer room fit from seller or geometry metadata.
`.trim(),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify({
              task: "Analyze this furniture product image for runtime scoring.",
              id: product.id,
              source_site: product.source_site,
              product_name: product.product_name,
              brand: product.brand,
              category: product.category,
            }),
          },
          {
            type: "image_url",
            image_url: { url: product.image_url },
          },
        ],
      },
    ],
  })

  return normalizeAnalysis(JSON.parse(response.choices[0].message.content ?? "{}"))
}

async function buildImageDataUrl(imageUrl) {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status} ${imageUrl}`)
  }

  const inputBuffer = Buffer.from(await response.arrayBuffer())
  const outputBuffer = await sharp(inputBuffer)
    .resize({
      width: 768,
      height: 768,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer()

  return `data:image/jpeg;base64,${outputBuffer.toString("base64")}`
}

function makeCoverageSummary(products, vectorById) {
  const bySource = {}
  const byCategory = {}
  let covered = 0
  let uncovered = 0

  for (const product of products) {
    const source = normalizeText(product.source_site) || "unknown"
    const category = normalizeText(product.category) || "unknown"
    const hasCoverage = vectorById.has(product.id)

    bySource[source] ??= { total: 0, covered: 0, uncovered: 0 }
    byCategory[category] ??= { total: 0, covered: 0, uncovered: 0 }

    bySource[source].total += 1
    byCategory[category].total += 1

    if (hasCoverage) {
      covered += 1
      bySource[source].covered += 1
      byCategory[category].covered += 1
    } else {
      uncovered += 1
      bySource[source].uncovered += 1
      byCategory[category].uncovered += 1
    }
  }

  return {
    total_active_products: products.length,
    covered_products: covered,
    uncovered_products: uncovered,
    coverage_percent: products.length
      ? Number(((covered / products.length) * 100).toFixed(1))
      : 0,
    by_source: Object.fromEntries(
      Object.entries(bySource).sort((a, b) => b[1].uncovered - a[1].uncovered)
    ),
    by_category: Object.fromEntries(
      Object.entries(byCategory).sort((a, b) => b[1].uncovered - a[1].uncovered)
    ),
  }
}

async function fetchActiveProducts(supabase) {
  const { data, error } = await supabase
    .from("furniture_products")
    .select(
      [
        "id",
        "source_site",
        "source_url",
        "affiliate_url",
        "product_name",
        "brand",
        "category",
        "price",
        "image_url",
        "material",
        "width_cm",
        "depth_cm",
        "height_cm",
        "status",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("status", ACTIVE_STATUS)

  if (error) throw error
  return data ?? []
}

async function fetchLegacyFurnitureIdSet(supabase, ids) {
  if (ids.length === 0) return new Set()

  const { data, error } = await supabase
    .from("furniture")
    .select("id")
    .in("id", ids)

  if (error) throw error

  return new Set((data ?? []).map((row) => row.id))
}

async function ensureLegacyFurnitureMirror(params) {
  const { supabase, product, existingLegacyIds } = params

  if (existingLegacyIds.has(product.id)) {
    return { inserted: false }
  }

  const payload = {
    id: product.id,
    name: product.product_name,
    brand: product.brand ?? null,
    category: product.category ?? null,
    price: typeof product.price === "number" ? product.price : null,
    image_url: product.image_url,
    product_key: makeLegacyProductKey(product),
    created_at: product.created_at ?? new Date().toISOString(),
    source_site: product.source_site ?? null,
    source_url: product.source_url ?? null,
    affiliate_url: product.affiliate_url ?? null,
    material: product.material ?? null,
    width_cm: typeof product.width_cm === "number" ? product.width_cm : null,
    depth_cm: typeof product.depth_cm === "number" ? product.depth_cm : null,
    height_cm: typeof product.height_cm === "number" ? product.height_cm : null,
  }

  const { error } = await supabase.from("furniture").upsert(payload, {
    onConflict: "id",
  })

  if (error) throw error

  existingLegacyIds.add(product.id)

  return { inserted: true }
}

async function fetchVectorCoverage(supabase, ids) {
  if (ids.length === 0) return new Map()

  const { data, error } = await supabase
    .from("furniture_vectors")
    .select(["furniture_id", ...SCORE_FIELDS].join(", "))
    .in("furniture_id", ids)

  if (error) throw error

  const map = new Map()
  for (const row of data ?? []) {
    const usable = SCORE_FIELDS.some(
      (field) => row[field] !== null && row[field] !== undefined
    )
    if (!usable) continue
    map.set(row.furniture_id, row)
  }

  return map
}

function sortBackfillTargets(products) {
  const priorityIndex = (sourceSite) => {
    const index = BACKFILL_PRIORITY.indexOf(sourceSite)
    return index >= 0 ? index : BACKFILL_PRIORITY.length
  }

  return [...products].sort((a, b) => {
    const sourceGap =
      priorityIndex(normalizeText(a.source_site)) -
      priorityIndex(normalizeText(b.source_site))
    if (sourceGap !== 0) return sourceGap

    const updatedGap = String(a.updated_at ?? "").localeCompare(
      String(b.updated_at ?? "")
    )
    if (updatedGap !== 0) return updatedGap

    return String(a.product_name ?? "").localeCompare(String(b.product_name ?? ""))
  })
}

async function writeReportIfRequested(reportPath, payload) {
  if (!reportPath) return
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const supabase = makeSupabaseAdminClient()

  const beforeProducts = await fetchActiveProducts(supabase)
  const beforeCoverageMap = await fetchVectorCoverage(
    supabase,
    beforeProducts.map((product) => product.id)
  )
  const beforeSummary = makeCoverageSummary(beforeProducts, beforeCoverageMap)

  const uncoveredProducts = sortBackfillTargets(
    beforeProducts.filter((product) => !beforeCoverageMap.has(product.id))
  )

  const planned = []
  const skipped = []

  for (const product of uncoveredProducts) {
    const sourceSite = normalizeText(product.source_site) || "unknown"

    if (SKIPPED_SOURCE_SITES.has(sourceSite)) {
      skipped.push({
        id: product.id,
        source_site: sourceSite,
        category: product.category ?? null,
        product_name: product.product_name ?? null,
        reason: "source_site_excluded_from_live_backfill",
      })
      continue
    }

    if (!isHttpUrl(product.image_url)) {
      skipped.push({
        id: product.id,
        source_site: sourceSite,
        category: product.category ?? null,
        product_name: product.product_name ?? null,
        reason: "missing_or_invalid_image_url",
      })
      continue
    }

    planned.push(product)
  }

  const executionTargets =
    args.limit > 0 ? planned.slice(0, args.limit) : planned

  const report = {
    generated_at: new Date().toISOString(),
    mode: args.apply ? "apply" : "dry_run",
    target_priority_order: BACKFILL_PRIORITY,
    before: beforeSummary,
    uncovered_before: {
      planned_count: planned.length,
      skipped_count: skipped.length,
      skipped,
      planned: executionTargets.map((product) => ({
        id: product.id,
        source_site: product.source_site,
        category: product.category,
        product_name: product.product_name,
        image_url: product.image_url,
      })),
    },
    execution: {
      attempted_count: 0,
      succeeded_count: 0,
      failed_count: 0,
      legacy_mirror_inserted_count: 0,
      legacy_mirror_reused_count: 0,
      upserted_rows: [],
      failures: [],
    },
    after: null,
  }

  if (args.apply) {
    const openai = makeOpenAiClient()
    const existingLegacyIds = await fetchLegacyFurnitureIdSet(
      supabase,
      executionTargets.map((product) => product.id)
    )

    for (const product of executionTargets) {
      report.execution.attempted_count += 1

      try {
        const legacyMirror = await ensureLegacyFurnitureMirror({
          supabase,
          product,
          existingLegacyIds,
        })
        if (legacyMirror.inserted) {
          report.execution.legacy_mirror_inserted_count += 1
        } else {
          report.execution.legacy_mirror_reused_count += 1
        }

        const imageDataUrl = await buildImageDataUrl(product.image_url)
        const analysis = await analyzeFurnitureImage({
          openai,
          product: {
            ...product,
            image_url: imageDataUrl,
          },
        })
        const { error } = await supabase.from("furniture_vectors").upsert(
          {
            furniture_id: product.id,
            brightness_compatibility: analysis.brightness_compatibility,
            color_temperature_score: analysis.color_temperature_score,
            spatial_footprint_score: analysis.spatial_footprint_score,
            minimalism_score: analysis.minimalism_score,
            contrast_score: analysis.contrast_score,
            colorfulness_score: analysis.colorfulness_score,
          },
          { onConflict: "furniture_id" }
        )

        if (error) throw error

        report.execution.succeeded_count += 1
        report.execution.upserted_rows.push({
          id: product.id,
          source_site: product.source_site,
          category: product.category,
          product_name: product.product_name,
          image_url: product.image_url,
          legacy_mirror_inserted: legacyMirror.inserted,
          analysis,
        })
      } catch (error) {
        report.execution.failed_count += 1
        report.execution.failures.push({
          id: product.id,
          source_site: product.source_site,
          category: product.category,
          product_name: product.product_name,
          message: describeError(error),
        })
      }
    }
  }

  const afterProducts = await fetchActiveProducts(supabase)
  const afterCoverageMap = await fetchVectorCoverage(
    supabase,
    afterProducts.map((product) => product.id)
  )
  report.after = makeCoverageSummary(afterProducts, afterCoverageMap)

  await writeReportIfRequested(args.reportPath, report)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  )
  process.exit(1)
})
