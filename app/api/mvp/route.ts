export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

function clampScore(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalizeHex(hex: any) {
  if (typeof hex !== "string") return "#808080"
  const h = hex.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(h) ? h : "#808080"
}

function clamp01to100(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function calcTrustScore(input: {
  brightness: number
  density: number
  contrast: number
  colorfulness: number
}) {
  let trust = 100

  trust -= Math.max(0, input.density - 70) * 1.2
  trust -= Math.max(0, input.colorfulness - 80) * 0.8
  trust -= Math.max(0, input.contrast - 80) * 0.8
  trust -= Math.max(0, 45 - input.brightness) * 1.5

  return clamp01to100(trust)
}

function trustNote(trust: number) {
  if (trust >= 85) return null
  if (trust >= 70) return "공간 정보가 일부 복잡해 추천이 다소 보수적으로 나왔을 수 있어요."
  return "방이 다소 어수선하거나 조명이 불안정해 분석 신뢰도가 낮을 수 있어요. 정리/밝은 사진으로 다시 시도해보세요."
}

function labelRoom(v: {
  brightness: number
  temperature: number
  density: number
  minimalism: number
  contrast: number
  colorfulness: number
}) {
  return {
    brightness: v.brightness >= 70 ? "밝은 편" : v.brightness <= 40 ? "어두운 편" : "중간",
    temperature: v.temperature >= 60 ? "웜톤" : v.temperature <= 40 ? "쿨톤" : "중간",
    density: v.density >= 70 ? "밀도 높음" : v.density <= 40 ? "밀도 낮음" : "중간",
    minimalism: v.minimalism >= 70 ? "미니멀" : v.minimalism <= 40 ? "맥시멀" : "중간",
    contrast: v.contrast >= 70 ? "대비 강함" : v.contrast <= 40 ? "대비 약함" : "중간",
    colorfulness: v.colorfulness >= 70 ? "컬러감 높음" : v.colorfulness <= 40 ? "컬러감 낮음" : "중간",
  }
}

type ScoredFurniture = {
  id: string
  name: string
  brand: string | null
  category: string | null
  price: number | null
  image_url: string | null
  product_key?: string | null
  created_at?: string | null
  recommendation_score: number
  reason_short?: string
  external_url?: string
}

type RecommendationGroup = {
  id: "balanced" | "budget" | "mood"
  title: string
  concept_tag: string
  total_price_text: string
  summary_text: string
  products: ScoredFurniture[]
}

type UserPreferenceInput = {
  roomType?: string | null
  styles?: string[]
  budget?: string | null
  furniture?: string[]
  requestText?: string
}

function formatPriceText(price: number | null) {
  if (!price || !Number.isFinite(price)) return "-"
  return `${price.toLocaleString()}원`
}

function formatTotalPriceText(items: ScoredFurniture[]) {
  const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0)
  if (!total) return "가격 정보 확인 필요"
  return `약 ${total.toLocaleString()}원`
}

function pickTopByScore(
  items: Array<ScoredFurniture & { adjusted_score?: number }>,
  limit: number
) {
  return [...items]
    .sort(
      (a, b) =>
        (b.adjusted_score ?? b.recommendation_score) -
        (a.adjusted_score ?? a.recommendation_score)
    )
    .slice(0, limit)
}

function pickBudgetItems(
  items: Array<ScoredFurniture & { adjusted_score?: number }>,
  limit: number
) {
  return [...items]
    .sort((a, b) => {
      const aPrice = a.price ?? Number.MAX_SAFE_INTEGER
      const bPrice = b.price ?? Number.MAX_SAFE_INTEGER

      if (aPrice !== bPrice) return aPrice - bPrice

      return (
        (b.adjusted_score ?? b.recommendation_score) -
        (a.adjusted_score ?? a.recommendation_score)
      )
    })
    .slice(0, limit)
}

function pickMoodItems(
  items: Array<ScoredFurniture & { adjusted_score?: number }>,
  limit: number
) {
  return [...items]
    .sort((a, b) => {
      const aBoost = a.adjusted_score ?? a.recommendation_score
      const bBoost = b.adjusted_score ?? b.recommendation_score

      if (bBoost !== aBoost) return bBoost - aBoost

      const aPrice = a.price ?? 0
      const bPrice = b.price ?? 0
      return bPrice - aPrice
    })
    .slice(0, limit)
}

function uniqueById(items: ScoredFurniture[]) {
  const seen = new Set<string>()
  const result: ScoredFurniture[] = []

  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }

  return result
}

function buildSummaryText(params: {
  mode: "balanced" | "budget" | "mood"
  roomLabels: ReturnType<typeof labelRoom>
  userInput?: UserPreferenceInput
}) {
  const { mode, roomLabels, userInput } = params

  const roomTypeLabel = toRoomTypeLabel(userInput?.roomType)
const budgetLabel = toBudgetLabel(userInput?.budget)

const styleLabels =
  userInput?.styles && userInput.styles.length > 0
    ? userInput.styles.slice(0, 2).map(toStyleLabel)
    : []

const furnitureLabels =
  userInput?.furniture && userInput.furniture.length > 0
    ? userInput.furniture.slice(0, 2).map(toFurnitureLabel)
    : []

const styleText =
  styleLabels.length > 0 ? `${styleLabels.join(", ")} 취향을 반영해 ` : ""

const roomTypeText = roomTypeLabel ? `${roomTypeLabel} 기준으로 ` : ""

const budgetText = budgetLabel ? `${budgetLabel} 안에서 ` : ""

const furnitureText =
  furnitureLabels.length > 0 ? `${furnitureLabels.join(", ")} 위주로 ` : ""

  const requestSnippet = userInput?.requestText?.trim()
    ? `"${userInput.requestText.trim()}" 요청을 고려해 `
    : ""

  if (mode === "balanced") {
  return `${roomTypeText}${styleText}${budgetText}${furnitureText}${requestSnippet}${roomLabels.brightness}, ${roomLabels.minimalism} 흐름에 무난하게 어울리는 조합이에요.`
  }

  if (mode === "budget") {
  return `${roomTypeText}${styleText}${budgetText}${furnitureText}${requestSnippet}가격 부담을 낮추면서도 ${roomLabels.temperature} 톤과 어색하지 않게 맞춘 조합이에요.`
  }

  return `${roomTypeText}${styleText}${budgetText}${furnitureText}${requestSnippet}${roomLabels.colorfulness}, ${roomLabels.contrast} 흐름을 살려 분위기 변화를 더 주는 조합이에요.`
  }
  
function buildRecommendationGroups(params: {
  items: ScoredFurniture[]
  roomLabels: ReturnType<typeof labelRoom>
  userInput?: UserPreferenceInput
}) {
  const { items, roomLabels, userInput } = params

  const adjustedPool = buildUserAdjustedPool(items, userInput)
  const preferredPool = buildPreferredFurniturePool(adjustedPool, userInput)

  const groupLimit = getGroupProductLimit(userInput)

  const balanced = uniqueById(pickTopByScore(adjustedPool, groupLimit))
  const budget = uniqueById(pickBudgetItems(adjustedPool, groupLimit))
  const mood = uniqueById(pickMoodItems(adjustedPool, groupLimit))

  const groups: RecommendationGroup[] = [
    {
      id: "balanced",
      title: "추천안 A | 균형형",
      concept_tag:
        userInput?.furniture && userInput.furniture.length > 0
          ? `${userInput.furniture.map(toFurnitureLabel).join(", ")} 우선`
          : "무난한 조합",
      total_price_text: formatTotalPriceText(balanced),
      summary_text: buildSummaryText({ mode: "balanced", roomLabels, userInput }),
      products: balanced,
    },
    {
      id: "budget",
      title: "추천안 B | 예산 절약형",
      concept_tag:
        userInput?.budget === "low"
          ? "낮은 예산 우선"
          : userInput?.budget === "medium"
          ? "예산 균형"
          : "가성비 중심",
      total_price_text: formatTotalPriceText(budget),
      summary_text: buildSummaryText({ mode: "budget", roomLabels, userInput }),
      products: budget,
    },
    {
      id: "mood",
      title: "추천안 C | 분위기 강조형",
      concept_tag:
        userInput?.styles && userInput.styles.length > 0
          ? `${userInput.styles.slice(0, 2).map(toStyleLabel).join(", ")} 반영`
          : "분위기 변화",
      total_price_text: formatTotalPriceText(mood),
      summary_text: buildSummaryText({ mode: "mood", roomLabels, userInput }),
      products: mood,
    },
  ]

  return groups
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

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

function toRoomTypeLabel(roomType?: string | null) {
  const room = normalizeText(roomType)

  if (room === "living") return "거실"
  if (room === "bedroom") return "침실"
  if (room === "workspace") return "작업 공간"
  if (room === "dining") return "다이닝 공간"

  return null
}

function toBudgetLabel(budget?: string | null) {
  const value = normalizeText(budget)

  if (value === "low") return "낮은 예산"
  if (value === "medium") return "보통 예산"
  if (value === "high") return "여유 있는 예산"

  return null
}

function toStyleLabel(style: string) {
  const value = normalizeText(style)

  if (value === "modern") return "모던"
  if (value === "minimal") return "미니멀"
  if (value === "warm-wood") return "따뜻한 우드톤"
  if (value === "bright") return "밝고 화사한"
  if (value === "calm") return "차분한"
  if (value === "hotel") return "호텔 같은 느낌"

  return style
}

function toFurnitureLabel(furniture: string) {
  const value = normalizeText(furniture)

  if (value === "sofa") return "소파"
  if (value === "chair") return "의자"
  if (value === "table") return "테이블"

  return furniture
}

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function parseRequestSignals(requestText?: string) {
  const text = normalizeText(requestText)

  return {
    wantsAiry: includesAnyKeyword(text, ["답답", "좁", "넓", "가벼", "여유"]),
    wantsBright: includesAnyKeyword(text, ["밝", "화사", "환한"]),
    wantsCalm: includesAnyKeyword(text, ["차분", "잔잔", "정돈"]),
    wantsMinimal: includesAnyKeyword(text, ["미니멀", "깔끔", "단정", "심플"]),
    wantsWarm: includesAnyKeyword(text, ["따뜻", "우드", "포근"]),
  }
}

function scoreFurnitureByUserInput(
  item: ScoredFurniture,
  userInput?: UserPreferenceInput
) {
  let bonus = 0
  bonus += scoreFurnitureByRoomType(item, userInput?.roomType)

  const category = normalizeText(item.category)
  const requestText = normalizeText(userInput?.requestText)
  const requestSignals = parseRequestSignals(userInput?.requestText)
  const selectedFurniture = (userInput?.furniture ?? []).map((v) =>
   normalizeText(v)
  )
  const selectedStyles = (userInput?.styles ?? []).map((v) => normalizeText(v))
  const budget = normalizeText(userInput?.budget)

  // 1) 필요한 가구 우선
  if (selectedFurniture.length > 0) {
    if (selectedFurniture.includes(category)) {
      bonus += 18
    } else {
      bonus -= 8
    }
  }

  // 2) 예산 반영
  if (budget === "low") {
    if ((item.price ?? 0) > 0 && (item.price ?? 0) <= 150000) bonus += 12
    if ((item.price ?? 0) > 300000) bonus -= 10
  }

  if (budget === "medium") {
    if ((item.price ?? 0) >= 80000 && (item.price ?? 0) <= 400000) bonus += 8
  }

  if (budget === "high") {
    if ((item.price ?? 0) >= 250000) bonus += 8
  }

  // 3) 요청 문구 반영
  if (requestText) {
  if (requestSignals.wantsAiry && includesAnyKeyword(category, ["chair", "table"])) {
    bonus += 6
  }

  if (
    requestSignals.wantsMinimal &&
    includesAnyKeyword(selectedStyles.join(" "), ["minimal", "modern"])
  ) {
    bonus += 6
  }

  if (requestSignals.wantsBright && item.recommendation_score >= 70) {
    bonus += 4
  }

  if (requestSignals.wantsCalm && item.recommendation_score >= 72) {
    bonus += 3
  }

  if (requestSignals.wantsWarm && includesAnyKeyword(selectedStyles.join(" "), ["warm-wood"])) {
    bonus += 4
  }
}

  // 4) 스타일 선택 반영
  if (selectedStyles.includes("minimal")) {
    if (item.recommendation_score >= 75) bonus += 4
  }

  if (selectedStyles.includes("bright")) {
    if (item.recommendation_score >= 70) bonus += 3
  }

  return bonus
}

function scoreFurnitureByRoomType(
  item: ScoredFurniture,
  roomType?: string | null
) {
  const category = normalizeText(item.category)
  const room = normalizeText(roomType)

  if (!room) return 0

  if (room === "living") {
    if (includesAnyKeyword(category, ["sofa"])) return 14
    if (includesAnyKeyword(category, ["chair", "table"])) return 5
    return -2
  }

  if (room === "bedroom") {
    if (includesAnyKeyword(category, ["chair"])) return 8
    if (includesAnyKeyword(category, ["table"])) return 5
    if (includesAnyKeyword(category, ["sofa"])) return 2
    return 0
  }

  if (room === "workspace") {
    if (includesAnyKeyword(category, ["chair"])) return 14
    if (includesAnyKeyword(category, ["table"])) return 12
    if (includesAnyKeyword(category, ["sofa"])) return -6
    return -2
  }

  if (room === "dining") {
    if (includesAnyKeyword(category, ["table"])) return 14
    if (includesAnyKeyword(category, ["chair"])) return 10
    if (includesAnyKeyword(category, ["sofa"])) return -6
    return -2
  }

  return 0
}

function buildUserAdjustedPool(
  items: ScoredFurniture[],
  userInput?: UserPreferenceInput
) {
  return items
    .map((item) => {
      const inputBonus = scoreFurnitureByUserInput(item, userInput)
      return {
        ...item,
        adjusted_score: item.recommendation_score + inputBonus,
      }
    })
    .sort((a, b) => b.adjusted_score - a.adjusted_score)
}

function getGroupProductLimit(userInput?: UserPreferenceInput) {
  const furnitureCount = userInput?.furniture?.length ?? 0
  const budget = normalizeText(userInput?.budget)

  if (budget === "low") {
    if (furnitureCount <= 1) return 2
    return 3
  }

  if (furnitureCount <= 1) return 2
  if (furnitureCount === 2) return 3
  return 4
}

function buildPreferredFurniturePool(
  items: Array<ScoredFurniture & { adjusted_score?: number }>,
  userInput?: UserPreferenceInput
) {
  const selectedFurniture = (userInput?.furniture ?? []).map((v) =>
    normalizeText(v)
  )

  if (selectedFurniture.length === 0) return items

  const preferred = items.filter((item) =>
    selectedFurniture.includes(normalizeText(item.category))
  )

  if (preferred.length >= 2) return preferred

  return items
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
          content: `
You are an interior room analysis engine.
Return ONLY valid JSON. No explanation.

Return this exact structure with integers 0-100:

{
  "brightness_score": integer,
  "color_temperature_score": integer,
  "spatial_density_score": integer,
  "minimalism_score": integer,
  "contrast_score": integer,
  "colorfulness_score": integer,
  "dominant_color_hex": "#RRGGBB"
}

Definitions:
- brightness_score: perceived brightness of the room (0=very dark, 100=very bright)
- color_temperature_score: 0=cool/blue, 100=warm/yellow
- spatial_density_score: clutter/furniture density (0=very empty, 100=very cluttered)
- minimalism_score: 0=maximal/ornate, 100=minimal
- contrast_score: 0=soft/low contrast, 100=high contrast
- colorfulness_score: 0=neutral/monochrome, 100=very colorful
- dominant_color_hex: dominant overall tone color in the room

Rules:
- All scores must be integers 0..100
- dominant_color_hex must be valid #RRGGBB
`,
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

    const rawSpace = JSON.parse(analyzeRes.choices[0].message.content!)

    const spaceNormalized = {
      image_url: imageUrl,
      brightness_score: clampScore(rawSpace.brightness_score),
      color_temperature_score: clampScore(rawSpace.color_temperature_score),
      spatial_density_score: clampScore(rawSpace.spatial_density_score),
      minimalism_score: clampScore(rawSpace.minimalism_score),
      contrast_score: clampScore(rawSpace.contrast_score),
      colorfulness_score: clampScore(rawSpace.colorfulness_score),
      dominant_color_hex: normalizeHex(rawSpace.dominant_color_hex),
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
          content: `
You are an interior recommendation explainer for a room photo.
Return ONLY JSON. No extra text.

Write exactly ONE short Korean sentence per item (25~40 characters).
Tone: polite and concise, ending with "~입니다/~해요" (consistent tone).

Hard rules:
- Explain WHY it matches the ROOM, not product benefits.
- Mention at least 1 ROOM attribute and at least 1 ITEM attribute.
- Use at least 2 of these keywords overall in each sentence:
  밝기/톤/웜톤/쿨톤/미니멀/밀도/대비/컬러감
- Forbidden generic phrases:
  "편안", "시원", "자연적인 느낌", "분위기", "고급", "감성", "좋아요", "제공"
- No emojis, no exclamation marks.
- If user_input exists, reflect style/budget/request briefly in the sentence when natural.
- Prioritize the user's requestText when it clearly indicates desired feeling or constraint.
- If user_input.furniture exists, prefer explaining items that match the selected furniture types first.

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
    scores: { brightness, temperature, density, minimalism, contrast, colorfulness },
    labels: roomLabels,
    trust_score,
  },
  user_input: {
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
}),
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