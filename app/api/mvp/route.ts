export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { buildRecommendationGroups, type GroupableFurniture } from "@/lib/mvp/grouping"
import { ROOM_ANALYSIS_SYSTEM_PROMPT, RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT } from "@/lib/mvp/prompts"
import { buildRecommendationExplainPayload } from "@/lib/mvp/payloads"
import {
  calcTrustScore,
  labelRoom,
  normalizeRoomAnalysis,
  trustNote,
} from "@/lib/mvp/room-analysis"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type ScoredFurniture = GroupableFurniture & {
  product_key?: string | null
  created_at?: string | null
}

function formatPriceText(price: number | null) {
  if (!price || !Number.isFinite(price)) return "-"
  return `${price.toLocaleString()}원`
}

function buildExternalProductUrl(item: {
  product_key?: string | null
  brand?: string | null
  name?: string | null
}) {
  const rawKey = item.product_key?.trim() ?? ""

  if (/^https?:\/\//i.test(rawKey)) {
    return rawKey
  }

  const query = [item.brand, item.name].filter(Boolean).join(" ").trim()

  if (!query) return null

  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
    query
  )}`
}

export async function POST(req: Request) {
  try {
    const {
  imageUrl,
  roomType,
  styles = [],
  budget,
  furniture = [],
  requestText = "",
} = await req.json()

const request_id = crypto.randomUUID()

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    // -----------------------
    // 1) 공간 분석 (OpenAI Vision)
    // -----------------------
    const analyzeRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: ROOM_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this room photo." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    })
const analysis = JSON.parse(analyzeRes.choices[0].message.content!)
const normalized = normalizeRoomAnalysis(analysis)

const spaceNormalized = {
  image_url: imageUrl,
  brightness_score: normalized.brightness,
  color_temperature_score: normalized.temperature,
  spatial_density_score: normalized.density,
  minimalism_score: normalized.minimalism,
  contrast_score: normalized.contrast,
  colorfulness_score: normalized.colorfulness,
  dominant_color_hex: normalized.dominant_color_hex,
}

    // -----------------------
    // 2) spaces 저장
    // -----------------------
    const { data: spaceRow, error: spaceErr } = await supabase
      .from("spaces")
      .insert(spaceNormalized)
      .select()
      .single()

    if (spaceErr) throw spaceErr

    // -----------------------
    // 3) 추천 점수 계산
    // -----------------------
    const brightness = spaceNormalized.brightness_score
    const temperature = spaceNormalized.color_temperature_score
    const density = spaceNormalized.spatial_density_score
    // MVP: density를 footprint에 임시 매핑
    const footprint = density
    const minimalism = spaceNormalized.minimalism_score
    const contrast = spaceNormalized.contrast_score
    const colorfulness = spaceNormalized.colorfulness_score

    const trust_score = calcTrustScore({ brightness, density, contrast, colorfulness })
const trust_note = trustNote(trust_score)

const roomLabels = labelRoom({
  brightness,
  temperature,
  density,
  minimalism,
  contrast,
  colorfulness,
})

    const weights = {
      brightness: 0.2,
      temperature: 0.2,
      footprint: 0.2,
      minimalism: 0.2,
      contrast: 0.1,
      colorfulness: 0.1,
    }

    const { data: vectors, error: vecErr } = await supabase
      .from("furniture_vectors")
      .select(`
        furniture_id,
        brightness_compatibility,
        color_temperature_score,
        spatial_footprint_score,
        minimalism_score,
        contrast_score,
        colorfulness_score,
        furniture:furniture_id (
          id, name, brand, category, price, image_url, product_key, created_at
        )
      `)

    if (vecErr) throw vecErr

    const scored = vectors.map((item: any) => {
      const d =
        weights.brightness * Math.abs((item.brightness_compatibility ?? 50) - brightness) +
        weights.temperature * Math.abs((item.color_temperature_score ?? 50) - temperature) +
        weights.footprint * Math.abs((item.spatial_footprint_score ?? 50) - footprint) +
        weights.minimalism * Math.abs((item.minimalism_score ?? 50) - minimalism) +
        weights.contrast * Math.abs((item.contrast_score ?? 50) - contrast) +
        weights.colorfulness * Math.abs((item.colorfulness_score ?? 50) - colorfulness)

      const score = 100 - d

      return {
        ...item.furniture,
        recommendation_score: Math.round(score),
        external_url: buildExternalProductUrl(item.furniture),
      }
    })

    scored.sort((a: any, b: any) => b.recommendation_score - a.recommendation_score)

    // dedupe (product_key 우선)
    const seen = new Set<string>()
    const deduped: any[] = []
    for (const item of scored) {
      const key =
        item.product_key ||
        item.image_url ||
        `${(item.brand ?? "").toLowerCase()}|${(item.name ?? "").toLowerCase()}|${(item.category ?? "").toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(item)
    }

    const top3 = deduped.slice(0, 3)
const recommendationGroups = buildRecommendationGroups({
  items: deduped as ScoredFurniture[],
  roomLabels,
  userInput: {
    roomType,
    styles,
    budget,
    furniture,
    requestText,
  },
})

// ✅ 추천 노출 로그 저장 (Top3)
await supabase.from("recommendations").insert(
  top3.map((x: any) => ({
    request_id,
    event_source: "web",
    space_id: spaceRow.id,
    furniture_id: x.id,
    compatibility_score: x.recommendation_score,
    clicked: false,
    saved: false,
    purchased: false,
  }))
)

    const explainRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(
  buildRecommendationExplainPayload({
    room: {
      brightness,
      temperature,
      density,
      minimalism,
      contrast,
      colorfulness,
      trust_score,
      labels: roomLabels,
    },
    userInput: {
      roomType,
      styles,
      budget,
      furniture,
      requestText,
    },
    items: top3.map((x: any) => ({
      product_key: x.product_key,
      name: x.name,
      category: x.category,
      price: x.price,
      score: x.recommendation_score,
    })),
  })
),
        },
      ],
    })

    const explainJson = JSON.parse(explainRes.choices[0].message.content!)
    const reasonMap = new Map<string, string>(
      (explainJson.reasons ?? []).map((r: any) => [r.product_key, r.reason_short])
    )

    const top3WithReasons = top3.map((x: any) => ({
      ...x,
      external_url: x.external_url ?? buildExternalProductUrl(x),
      reason_short: reasonMap.get(x.product_key) ?? "공간 톤과 대비에 무난히 맞는 선택이에요.",
    }))

    // -----------------------
    // 5) 최종 응답
    // -----------------------
    const groupedRecommendations = recommendationGroups.map((group) => ({
  ...group,
  products: group.products.map((product) => {
    const matched = top3WithReasons.find((item: any) => item.id === product.id)

    return {
  ...product,
  external_url:
    matched?.external_url ??
    product.external_url ??
    buildExternalProductUrl(product),
  reason_short:
    matched?.reason_short ??
    product.reason_short ??
    "공간 톤과 대비에 무난히 맞는 선택이에요.",
  price_text: formatPriceText(product.price ?? null),
}
  }),
}))

return NextResponse.json({
  success: true,
  request_id,
  space: spaceRow,
  analysis: spaceNormalized,
  trust_score,
  trust_note,
  recommendations: top3WithReasons,
  grouped_recommendations: groupedRecommendations,
})
  } catch (err: any) {
    console.error("MVP API ERROR:", err)
    return NextResponse.json(
      { error: "MVP failed", message: err.message },
      { status: 500 }
    )
  }
}