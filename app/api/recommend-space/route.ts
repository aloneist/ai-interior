export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/server/openai"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import { loadRuntimeFurnitureRecordsByIds } from "@/lib/server/furniture-catalog"
import type { RuntimeFurnitureRecord as FurnitureRecord } from "@/lib/server/furniture-catalog"
import { rankFurnitureForRecommendations } from "@/lib/server/recommendation-ranking"

type FurnitureVectorRow = {
  furniture_id: string
  brightness_compatibility: number | null
  color_temperature_score: number | null
  spatial_footprint_score: number | null
  minimalism_score: number | null
  contrast_score: number | null
  colorfulness_score: number | null
}

type ScoredFurniture = FurnitureRecord & {
  recommendation_score: number
}

type ExplainReason = {
  product_key: string
  reason_short: string
}

function isScoredFurniture(value: ScoredFurniture | null): value is ScoredFurniture {
  return value !== null
}

function isExplainReason(value: unknown): value is ExplainReason {
  if (typeof value !== "object" || value === null) return false

  const candidate = value as Record<string, unknown>
  return typeof candidate.product_key === "string" && typeof candidate.reason_short === "string"
}

function clamp01to100(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function calcTrustScore(input: {
  density: number
  contrast: number
  colorfulness: number
}) {
  let trust = 100
  trust -= Math.max(0, input.density - 70) * 1.2
  trust -= Math.max(0, input.colorfulness - 80) * 0.8
  trust -= Math.max(0, input.contrast - 80) * 0.8
  return clamp01to100(trust)
}

function trustNote(trust: number) {
  if (trust >= 85) return null
  if (trust >= 70)
    return "공간 정보가 일부 복잡해 추천이 다소 보수적으로 나왔을 수 있어요."
  return "방이 다소 어수선하거나 조명이 불안정해 분석 신뢰도가 낮을 수 있어요. 정리/밝은 사진으로 다시 시도해보세요."
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const openai = getOpenAIClient()
    const { space_id } = await req.json()

    if (!space_id) {
      return NextResponse.json({ error: "space_id is required" }, { status: 400 })
    }

    // 1) space 벡터 가져오기
    const { data: space, error: spaceErr } = await supabase
      .from("spaces")
      .select(
        "brightness_score, color_temperature_score, spatial_density_score, minimalism_score, contrast_score, colorfulness_score"
      )
      .eq("id", space_id)
      .single()

    if (spaceErr) throw spaceErr

    const brightness = space.brightness_score ?? 50
    const temperature = space.color_temperature_score ?? 50
    // 현재는 footprint에 density를 임시 매핑 (MVP 단계)
    const footprint = space.spatial_density_score ?? 50
    const minimalism = space.minimalism_score ?? 50
    const contrast = space.contrast_score ?? 50
    const colorfulness = space.colorfulness_score ?? 50

    // 2) 신뢰도 점수 계산
    const trust_score = calcTrustScore({
      density: footprint,
      contrast,
      colorfulness,
    })
    const trust_note = trustNote(trust_score)

    // 4) 모든 가구 벡터 + 상품 정보 가져오기
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
      limit: 3,
    })

    // 8) Top3
    const top3 = ranked.items.filter(isScoredFurniture)

    // 9) 추천 이유 생성 (OpenAI 1회 호출)
    const explainRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an interior recommendation explainer for a room photo.

Return ONLY JSON. No extra text.

Write exactly ONE short Korean sentence per item (20~35 characters).
The sentence MUST explain WHY it matches the ROOM, not the product benefits.

Hard rules:
- Mention at least 1 ROOM attribute and at least 1 ITEM attribute.
- Use at least 2 of these keywords overall in the sentence:
  밝기/톤/웜톤/쿨톤/미니멀/밀도/대비/컬러감
- Forbidden generic phrases (do NOT use):
  "편안", "시원", "자연적인 느낌", "분위기", "고급", "감성", "좋아요", "제공"
- Do not mention seasons, health, or general comfort.
- Do not use emojis or punctuation like "!".
- Focus on matching: color tone, warmth/coolness, minimalism, density, contrast, colorfulness.

Return format:
{
  "reasons": [
    {"product_key": "...", "reason_short": "..."},
    {"product_key": "...", "reason_short": "..."},
    {"product_key": "...", "reason_short": "..."}
  ]
}
`,
        },
        {
          role: "user",
          content: JSON.stringify({
            room: {
              brightness,
              temperature,
              footprint,
              minimalism,
              contrast,
              colorfulness,
              trust_score,
              labels: {
                brightness: brightness >= 70 ? "밝은 편" : brightness <= 40 ? "어두운 편" : "중간",
                temperature: temperature >= 60 ? "웜톤" : temperature <= 40 ? "쿨톤" : "중간",
                density: footprint >= 70 ? "밀도 높음" : footprint <= 40 ? "밀도 낮음" : "중간",
                minimalism: minimalism >= 70 ? "미니멀" : minimalism <= 40 ? "맥시멀" : "중간",
                contrast: contrast >= 70 ? "대비 강함" : contrast <= 40 ? "대비 약함" : "중간",
                colorfulness: colorfulness >= 70 ? "컬러감 높음" : colorfulness <= 40 ? "컬러감 낮음" : "중간",
              }
            },
            items: top3.map((x) => ({
              product_key: x.product_key,
              name: x.name,
              category: x.category,
              score: x.recommendation_score,
            })),
          }),
        },
      ],
    })

    const explainJson = JSON.parse(explainRes.choices[0].message.content!) as {
      reasons?: unknown
    }
    const reasonMap = new Map<string, string>(
      Array.isArray(explainJson.reasons)
        ? explainJson.reasons
            .filter(isExplainReason)
            .map((reason) => [reason.product_key, reason.reason_short] as const)
        : []
    )

    const sanitize = (s: unknown) => {
      if (typeof s !== "string") return null
      const t = s.replace(/\s+/g, " ").trim()
      // 너무 짧거나 끝이 어색하면 null 처리해서 fallback 사용
      if (t.length < 12) return null
      // 문장 끝이 끊긴 느낌이면 fallback (예: "밝은 톤의")
      if (/의$/.test(t)) return null
      return t
    }

    const top3WithReasons = top3.map((x) => {
      const rawReason = x.product_key ? reasonMap.get(x.product_key) : undefined
      const cleaned = sanitize(rawReason)
      return {
        ...x,
        reason_short: cleaned ?? "톤·대비·미니멀 지수 기준으로 무난해요.",
      }
    })

    return NextResponse.json({
      success: true,
      space_id,
      trust_score,
      trust_note,
      recommendations: top3WithReasons,
      quality_summary: ranked.qualitySummary,
    })
    } catch (err: unknown) {
    console.error("RECOMMEND SPACE ERROR:", err)

    const message =
      err instanceof Error ? err.message : "Recommend space failed"

    return NextResponse.json(
      { error: "Recommend space failed", message },
      { status: 500 }
    )
  }
}
