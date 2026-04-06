import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const FIXTURE_PATH = path.join(ROOT_DIR, "data/qa/controlled-mvp-fixtures-v1.json")
const DEFAULT_BASE_URL = "http://127.0.0.1:3000"
const STYLE_METADATA_KEYS = ["style_labels", "style_confidence", "styleTags"]
const DIMENSION_KEYS = ["width_cm", "depth_cm", "height_cm"]

function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

async function parseJson(response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { raw: text }
  }
}

async function apiPost(url, body, adminToken) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-token": adminToken,
    },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    ok: response.ok,
    json: await parseJson(response),
  }
}

async function supabaseGet(pathname, params) {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const url = new URL(`/rest/v1/${pathname}`, supabaseUrl)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
    },
  })
  const json = await parseJson(response)

  if (!response.ok) {
    throw new Error(`${pathname} query failed: ${JSON.stringify(json)}`)
  }

  return json
}

function hasStyleMetadata(product) {
  const metadata = product.metadata_json

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false
  }

  return STYLE_METADATA_KEYS.some((key) => {
    const value = metadata[key]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
}

function hasAllDimensions(product) {
  return DIMENSION_KEYS.every((key) => typeof product[key] === "number")
}

function hasUsefulDescription(product) {
  return typeof product.description === "string" && product.description.trim().length >= 20
}

function inferSemanticNotes(product) {
  const name = `${product.product_name ?? ""}`.toLowerCase()
  const category = `${product.category ?? ""}`.toLowerCase()
  const notes = []

  if (category === "chair" && /storage|수납|bench|벤치/.test(name)) {
    notes.push("chair_alias_blurs_bench_or_storage")
  }

  if (category === "table" && /outdoor|야외|conference|회의/.test(name)) {
    notes.push("table_room_affinity_needs_context")
  }

  if (category === "sofa" && /armchair|암체어|module|모듈|section|섹션/.test(name)) {
    notes.push("sofa_subtype_needs_context")
  }

  return notes
}

function vectorNotes(vector) {
  if (!vector) return ["missing_vector"]

  const notes = []

  if ((vector.minimalism_score ?? 50) === 52 && (vector.contrast_score ?? 50) === 52) {
    notes.push("generic_style_vector_values")
  }

  return notes
}

function priorityScore(candidate) {
  let score = candidate.top3Count * 10

  if (!candidate.hasStyleMetadata) score += 8
  if (!candidate.hasUsefulDescription) score += 5
  if (!candidate.hasAllDimensions) score += 4
  if (candidate.semanticNotes.length > 0) score += 6
  if (candidate.vectorNotes.length > 0) score += 5
  if (candidate.fallbackCount > 0) score += 4
  if (candidate.weakMatchReasons.length > 0) score += 3

  return score
}

function recommendedMetadata(candidate) {
  const fields = []

  if (!candidate.hasStyleMetadata) fields.push("style_labels")
  if (candidate.semanticNotes.length > 0) fields.push("category_aliases")
  if (candidate.vectorNotes.length > 0) fields.push("style_confidence_notes")
  if (!candidate.hasUsefulDescription) fields.push("description")
  if (!candidate.hasAllDimensions) fields.push("dimensions")
  if (!candidate.product.color) fields.push("color")
  if (!candidate.product.material) fields.push("material")

  return [...new Set(fields)]
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL
  const adminToken = requireEnv("ADMIN_TOKEN")
  const fixture = JSON.parse(await fs.readFile(FIXTURE_PATH, "utf8"))
  const caseRuns = []
  const productHits = new Map()

  for (const fixtureCase of fixture.cases) {
    const response = await apiPost(
      `${baseUrl}/api/mvp`,
      fixtureCase.body,
      adminToken
    )

    if (response.status !== 200 || response.json?.success !== true) {
      throw new Error(`${fixtureCase.caseId} failed: ${response.status}`)
    }

    const top3 = Array.isArray(response.json.recommendations)
      ? response.json.recommendations.slice(0, 3)
      : []
    const explanationSources = new Map(
      (response.json.qa?.explanation_sources ?? []).map((item) => [
        item.product_key,
        item,
      ])
    )

    for (const item of top3) {
      if (!item.id) continue

      const hit = productHits.get(item.id) ?? {
        id: item.id,
        name: item.name,
        category: item.category,
        top3Count: 0,
        cases: [],
        weakMatchReasons: new Set(),
        fallbackCount: 0,
      }
      const explanationSource = explanationSources.get(item.product_key)

      hit.top3Count += 1
      hit.cases.push(fixtureCase.caseId)
      hit.fallbackCount += explanationSource?.source === "fallback" ? 1 : 0

      for (const reason of item.ranking_context?.weak_match_reasons ?? []) {
        hit.weakMatchReasons.add(reason)
      }

      productHits.set(item.id, hit)
    }

    caseRuns.push({
      caseId: fixtureCase.caseId,
      weak_result: response.json.quality_summary?.weak_result ?? null,
      weak_reasons: response.json.quality_summary?.weak_reasons ?? [],
      top3: top3.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        style_fit: item.ranking_context?.style_fit ?? null,
        room_fit: item.ranking_context?.room_fit ?? null,
        category_fit: item.ranking_context?.category_fit ?? null,
        budget_fit: item.ranking_context?.budget_fit ?? null,
        weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
      })),
    })
  }

  const ids = [...productHits.keys()]
  const products = ids.length
    ? await supabaseGet("furniture_products", {
        select:
          "id,product_name,category,price,product_url,description,color,material,width_cm,depth_cm,height_cm,metadata_json",
        id: `in.(${ids.join(",")})`,
      })
    : []
  const vectors = ids.length
    ? await supabaseGet("furniture_vectors", {
        select:
          "furniture_id,brightness_compatibility,color_temperature_score,spatial_footprint_score,minimalism_score,contrast_score,colorfulness_score",
        furniture_id: `in.(${ids.join(",")})`,
      })
    : []
  const productById = new Map(products.map((product) => [product.id, product]))
  const vectorById = new Map(vectors.map((vector) => [vector.furniture_id, vector]))
  const candidates = [...productHits.values()]
    .map((hit) => {
      const product = productById.get(hit.id) ?? {}
      const vector = vectorById.get(hit.id) ?? null
      const candidate = {
        id: hit.id,
        name: product.product_name ?? hit.name,
        category: product.category ?? hit.category,
        top3Count: hit.top3Count,
        cases: [...new Set(hit.cases)],
        fallbackCount: hit.fallbackCount,
        weakMatchReasons: [...hit.weakMatchReasons],
        product,
        vector,
        hasStyleMetadata: hasStyleMetadata(product),
        hasUsefulDescription: hasUsefulDescription(product),
        hasAllDimensions: hasAllDimensions(product),
        semanticNotes: inferSemanticNotes(product),
        vectorNotes: vectorNotes(vector),
      }

      return {
        ...candidate,
        priorityScore: priorityScore(candidate),
        recommendedMetadata: recommendedMetadata(candidate),
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || b.top3Count - a.top3Count)

  const report = {
    generated_at: new Date().toISOString(),
    fixture_path: path.relative(ROOT_DIR, FIXTURE_PATH),
    fixture_version: fixture.version,
    base_url: baseUrl,
    summary: {
      controlled_case_count: caseRuns.length,
      unique_top3_product_count: candidates.length,
      products_without_style_metadata: candidates.filter(
        (item) => !item.hasStyleMetadata
      ).length,
      products_with_semantic_notes: candidates.filter(
        (item) => item.semanticNotes.length > 0
      ).length,
      products_with_generic_vector_notes: candidates.filter(
        (item) => item.vectorNotes.length > 0
      ).length,
      explanation_fallback_count: candidates.reduce(
        (sum, item) => sum + item.fallbackCount,
        0
      ),
    },
    cases: caseRuns,
    priority_candidates: candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      category: candidate.category,
      priorityScore: candidate.priorityScore,
      top3Count: candidate.top3Count,
      cases: candidate.cases,
      fallbackCount: candidate.fallbackCount,
      weakMatchReasons: candidate.weakMatchReasons,
      hasStyleMetadata: candidate.hasStyleMetadata,
      hasUsefulDescription: candidate.hasUsefulDescription,
      hasAllDimensions: candidate.hasAllDimensions,
      semanticNotes: candidate.semanticNotes,
      vectorNotes: candidate.vectorNotes,
      recommendedMetadata: candidate.recommendedMetadata,
      vector: candidate.vector,
    })),
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  const normalizedError =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) }

  console.error(JSON.stringify({ error: normalizedError }, null, 2))
  process.exit(1)
})
