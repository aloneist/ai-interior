export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/server/openai"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import {
  loadRuntimeFurnitureRecordsByIds,
} from "@/lib/server/furniture-catalog"
import {
  rankFurnitureForRecommendations,
  type RankedFurniture,
} from "@/lib/server/recommendation-ranking"
import {
  buildRecommendationGroups,
  type GroupableFurniture,
} from "@/lib/mvp/grouping"
import {
  ROOM_ANALYSIS_SYSTEM_PROMPT,
  RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT,
} from "@/lib/mvp/prompts"
import { buildRecommendationExplainPayload } from "@/lib/mvp/payloads"
import { validateExplanationSet } from "@/lib/mvp/explanation-validation"
import {
  calcTrustScore,
  labelRoom,
  normalizeRoomAnalysis,
  trustNote,
} from "@/lib/mvp/room-analysis"
import { resolveOutboundProductUrl } from "@/lib/mvp/product-contract"

type ScoredFurniture = GroupableFurniture &
  Pick<
    RankedFurniture,
    "ranking_context" | "description" | "color" | "material" | "catalog_metadata"
  > & {
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

type MvpRequestBody = {
  imageUrl?: string
  roomType?: string | null
  styles?: string[]
  budget?: string | null
  furniture?: string[]
  requestText?: string
  qaMode?: string
  qaSkipPersistence?: boolean
  qaRoomAnalysis?: {
    brightness_score?: number
    color_temperature_score?: number
    spatial_density_score?: number
    minimalism_score?: number
    contrast_score?: number
    colorfulness_score?: number
    dominant_color_hex?: string
  }
}

function formatPriceText(price: number | null) {
  if (!price || !Number.isFinite(price)) return "-"
  return `${price.toLocaleString()}원`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unknown error"
}

function isControlledQaMode(body: MvpRequestBody) {
  return body.qaMode === "controlled_fixture"
}

function isAuthorizedQaRequest(req: Request) {
  const token = req.headers.get("x-admin-token")
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MvpRequestBody
    const {
      imageUrl,
      roomType,
      styles = [],
      budget,
      furniture = [],
      requestText = "",
    } = body
    const qaMode = isControlledQaMode(body)
    const skipPersistence = qaMode && body.qaSkipPersistence !== false

    const openai = getOpenAIClient()
    const supabase = getSupabaseAdminClient()
    const request_id = crypto.randomUUID()

    if (qaMode && !isAuthorizedQaRequest(req)) {
      return NextResponse.json({ error: "Unauthorized QA mode" }, { status: 403 })
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    const analysis = qaMode
      ? body.qaRoomAnalysis ?? {}
      : JSON.parse(
          (
            await openai.chat.completions.create({
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
          ).choices[0].message.content ?? "{}"
        )
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

    const spaceRow = skipPersistence
      ? {
          id: request_id,
          ...spaceNormalized,
          qa_mode: "controlled_fixture",
        }
      : await (async () => {
          const { data, error } = await supabase
            .from("spaces")
            .insert(spaceNormalized)
            .select()
            .single()

          if (error) throw error

          return data
        })()

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
      external_url: resolveOutboundProductUrl(item),
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

    if (!skipPersistence) {
      const { error: recommendationsInsertError } = await supabase
        .from("recommendations")
        .insert(
          top3.map((item) => {
            const canonicalProductId = item.id

            return {
              request_id,
              event_source: qaMode ? "qa_controlled_fixture" : "web",
              space_id: spaceRow.id,
              furniture_id: canonicalProductId,
              compatibility_score: item.recommendation_score,
              clicked: false,
              saved: false,
            }
          })
        )

      if (recommendationsInsertError) throw recommendationsInsertError
    }

    const explainRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
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
                description: item.description,
                color: item.color,
                material: item.material,
                metadata: item.catalog_metadata
                  ? {
                      style_labels: item.catalog_metadata.style_labels,
                      category_aliases: item.catalog_metadata.category_aliases,
                      room_affinity: item.catalog_metadata.room_affinity,
                    }
                  : null,
                ranking_context: item.ranking_context,
              })),
            })
          ),
        },
      ],
    })

    const explainJson = JSON.parse(explainRes.choices[0].message.content ?? "{}")
    const validatedExplanations = validateExplanationSet({
      generated: explainJson,
      items: top3.map((item) => ({
        product_key: item.product_key,
        name: item.name,
        category: item.category,
        description: item.description,
        color: item.color,
        material: item.material,
        metadata: item.catalog_metadata
          ? {
              style_labels: item.catalog_metadata.style_labels,
              category_aliases: item.catalog_metadata.category_aliases,
              room_affinity: item.catalog_metadata.room_affinity,
            }
          : null,
        ranking_context: item.ranking_context,
      })),
      userInput: {
        roomType,
        styles,
        budget,
      },
    })
    const reasonMap = new Map(
      validatedExplanations.map((reason) => [
        reason.product_key,
        reason.reason_short,
      ])
    )

    const top3WithReasons = top3.map((item) => ({
      ...item,
      external_url: resolveOutboundProductUrl(item),
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
            resolveOutboundProductUrl(product),
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
      qa: qaMode
        ? {
            mode: "controlled_fixture",
            persistence: skipPersistence ? "skipped" : "enabled",
            explanation_sources: validatedExplanations.map((reason) => ({
              product_key: reason.product_key,
              source: reason.source,
              validation_reasons: reason.validation_reasons,
            })),
          }
        : undefined,
    })
  } catch (err: unknown) {
    console.error("MVP API ERROR:", err)
    return NextResponse.json(
      { error: "MVP failed", message: getErrorMessage(err) },
      { status: 500 }
    )
  }
}
