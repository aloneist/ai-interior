export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/server/openai"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import {
  loadRuntimeFurnitureRecordsByIds,
} from "@/lib/server/furniture-catalog"
import { rankFurnitureForRecommendations } from "@/lib/server/recommendation-ranking"
import {
  buildRecommendationGroups,
  type GroupableFurniture,
} from "@/lib/mvp/grouping"
import {
  ROOM_ANALYSIS_SYSTEM_PROMPT,
  RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT,
} from "@/lib/mvp/prompts"
import { buildRecommendationExplainPayload } from "@/lib/mvp/payloads"
import {
  calcTrustScore,
  labelRoom,
  normalizeRoomAnalysis,
  trustNote,
} from "@/lib/mvp/room-analysis"

type ScoredFurniture = GroupableFurniture & {
  product_key?: string | null
  created_at?: string | null
}

type FurnitureVectorRow = {
  furniture_id: string
  brightness_compatibility: number | null
  color_temperature_score: number | null
  spatial_footprint_score: number | null
  minimalism_score: number | null
  contrast_score: number | null
  colorfulness_score: number | null
}

type ExplainReason = {
  product_key: string
  reason_short: string
}

type ExplainResponse = {
  reasons?: ExplainReason[]
}

function formatPriceText(price: number | null) {
  if (!price || !Number.isFinite(price)) return "-"
  return `${price.toLocaleString()}원`
}

function buildExternalProductUrl(item: {
  product_key?: string | null
  brand?: string | null
  name?: string | null
}): string | undefined {
  const rawKey = item.product_key?.trim() ?? ""

  if (/^https?:\/\//i.test(rawKey)) {
    return rawKey
  }

  const query = [item.brand, item.name].filter(Boolean).join(" ").trim()

  if (!query) return undefined

  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
    query
  )}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unknown error"
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

    const openai = getOpenAIClient()
    const supabase = getSupabaseAdminClient()
    const request_id = crypto.randomUUID()

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

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

    const { data: spaceRow, error: spaceErr } = await supabase
      .from("spaces")
      .insert(spaceNormalized)
      .select()
      .single()

    if (spaceErr) throw spaceErr

    const brightness = spaceNormalized.brightness_score
    const temperature = spaceNormalized.color_temperature_score
    const density = spaceNormalized.spatial_density_score
    const footprint = density
    const minimalism = spaceNormalized.minimalism_score
    const contrast = spaceNormalized.contrast_score
    const colorfulness = spaceNormalized.colorfulness_score

    const trust_score = calcTrustScore({
      brightness,
      density,
      contrast,
      colorfulness,
    })
    const trust_note = trustNote(trust_score)

    const roomLabels = labelRoom({
      brightness,
      temperature,
      density,
      minimalism,
      contrast,
      colorfulness,
    })

    const { data: vectors, error: vecErr } = await supabase
      .from("furniture_vectors")
      .select(`
        furniture_id,
        brightness_compatibility,
        color_temperature_score,
        spatial_footprint_score,
        minimalism_score,
        contrast_score,
        colorfulness_score
      `)

    if (vecErr) throw vecErr

    const typedVectors = (vectors ?? []) as FurnitureVectorRow[]
    const furnitureById = await loadRuntimeFurnitureRecordsByIds(
      supabase,
      typedVectors.map((item) => item.furniture_id)
    )

    const ranked = rankFurnitureForRecommendations({
      vectors: typedVectors,
      furnitureById,
      targets: {
        brightness,
        temperature,
        footprint,
        minimalism,
        contrast,
        colorfulness,
      },
      userInput: {
        roomType,
        styles,
        budget,
        furniture,
        requestText,
      },
      limit: 10,
    })

    const rankedItems: ScoredFurniture[] = ranked.items.map((item) => ({
      ...item,
      external_url: buildExternalProductUrl(item),
    }))

    const top3 = rankedItems.slice(0, 3)

    const recommendationGroups = buildRecommendationGroups({
      items: rankedItems,
      roomLabels,
      userInput: {
        roomType,
        styles,
        budget,
        furniture,
        requestText,
      },
    })

    const { error: recommendationsInsertError } = await supabase
      .from("recommendations")
      .insert(
        top3.map((item) => ({
          request_id,
          event_source: "web",
          space_id: spaceRow.id,
          furniture_id: item.id,
          compatibility_score: item.recommendation_score,
          clicked: false,
          saved: false,
        }))
      )

    if (recommendationsInsertError) throw recommendationsInsertError

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
              items: top3.map((item) => ({
                product_key: item.product_key,
                name: item.name,
                category: item.category,
                price: item.price,
                score: item.recommendation_score,
              })),
            })
          ),
        },
      ],
    })

    const explainJson = JSON.parse(
      explainRes.choices[0].message.content!
    ) as ExplainResponse

    const reasonMap = new Map<string, string>(
      (explainJson.reasons ?? []).map((reason) => [
        reason.product_key,
        reason.reason_short,
      ])
    )

    const top3WithReasons = top3.map((item) => ({
      ...item,
      external_url: item.external_url ?? buildExternalProductUrl(item),
      reason_short:
        reasonMap.get(item.product_key ?? "") ??
        "공간 톤과 대비에 무난히 맞는 선택이에요.",
    }))

    const groupedRecommendations = recommendationGroups.map((group) => ({
      ...group,
      products: group.products.map((product) => {
        const matched = top3WithReasons.find((item) => item.id === product.id)

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
      quality_summary: ranked.qualitySummary,
    })
  } catch (err: unknown) {
    console.error("MVP API ERROR:", err)
    return NextResponse.json(
      { error: "MVP failed", message: getErrorMessage(err) },
      { status: 500 }
    )
  }
}
