import {
  matchesAnyFurniturePreference,
  scoreFurnitureByRoomType,
  scoreFurnitureByUserInput,
  type UserPreferenceInput,
} from "@/lib/mvp/scoring"
import {
  includesAnyKeyword,
  normalizeText,
  parseRequestSignals,
} from "@/lib/mvp/request-signals"
import type { RuntimeFurnitureRecord } from "@/lib/server/furniture-catalog"

export type FurnitureVectorLike = {
  furniture_id: string
  brightness_compatibility: number | null
  color_temperature_score: number | null
  spatial_footprint_score: number | null
  minimalism_score: number | null
  contrast_score: number | null
  colorfulness_score: number | null
}

export type RankingTargets = {
  brightness: number
  temperature: number
  footprint: number
  minimalism: number
  contrast: number
  colorfulness: number
}

export type RankedFurniture = RuntimeFurnitureRecord & {
  recommendation_score: number
  ranking_context: {
    base_score: number
    final_score: number
    vector_coverage: "present" | "missing"
    category_fit: "preferred" | "room_match" | "mismatch" | "neutral"
    room_fit: "good" | "mismatch" | "neutral"
    style_fit: "explicit" | "proxy" | "mismatch" | "neutral"
    budget_fit: "within" | "over" | "under" | "unknown" | "neutral"
    metadata_quality: "complete" | "partial" | "weak"
    weak_match_reasons: string[]
  }
}

export type RankingQualitySummary = {
  candidate_count: number
  deduped_candidate_count: number
  returned_count: number
  vector_covered_candidate_count: number
  vector_missing_candidate_count: number
  vector_missing_top3_count: number
  weak_result: boolean
  weak_reasons: string[]
  preferred_category_in_top3: number | null
  within_budget_in_top3: number | null
  style_fit_in_top3: number | null
  room_fit_in_top3: number | null
}

const DEFAULT_WEIGHTS = {
  brightness: 0.2,
  temperature: 0.2,
  footprint: 0.2,
  minimalism: 0.2,
  contrast: 0.1,
  colorfulness: 0.1,
} as const

const STYLE_KEYWORDS = {
  minimal: ["minimal", "미니멀", "simple", "심플", "sleek", "깔끔"],
  bright: [
    "white",
    "화이트",
    "light",
    "라이트",
    "beige",
    "베이지",
    "cream",
    "크림",
    "natural",
    "내추럴",
  ],
  "warm-wood": [
    "wood",
    "우드",
    "나무",
    "oak",
    "오크",
    "walnut",
    "월넛",
    "acacia",
    "아카시아",
    "brown",
    "브라운",
  ],
  calm: [
    "grey",
    "gray",
    "그레이",
    "beige",
    "베이지",
    "natural",
    "내추럴",
    "blue",
    "블루",
  ],
  modern: [
    "black",
    "블랙",
    "steel",
    "스틸",
    "metal",
    "메탈",
    "chrome",
    "크롬",
    "glass",
    "유리",
  ],
  hotel: [
    "velvet",
    "벨벳",
    "dark",
    "다크",
    "black",
    "블랙",
    "gold",
    "골드",
    "lounge",
    "라운지",
  ],
} as const

type StyleToken = keyof typeof STYLE_KEYWORDS

const MINIMAL_STYLE_CONTRADICTION_KEYWORDS = [
  "red",
  "레드",
  "yellow",
  "옐로",
  "blue",
  "블루",
  "gold",
  "골드",
  "velvet",
  "벨벳",
  "pattern",
  "패턴",
]

const DIRECT_CHAIR_ALIASES = new Set([
  "chair",
  "desk_chair",
  "children_chair",
  "workspace_chair",
  "armchair",
])

const DIRECT_CHAIR_SUPPORT_ALIASES = new Set([
  "bench",
  "bench_support",
  "chair_support",
  "outdoor_storage",
  "seating_support",
  "storage",
  "storage_bench",
  "storage_box",
])

const DIRECT_CHAIR_ROLE_KEYWORDS = [
  "armchair",
  "암체어",
  "desk chair",
  "책상 의자",
  "children chair",
  "어린이용 책상 의자",
  "workspace chair",
  "chair",
  "의자",
]

const DIRECT_CHAIR_SUPPORT_ROLE_KEYWORDS = [
  "bench",
  "벤치",
  "storage",
  "수납",
  "storage box",
  "수납상자",
  "storage bench",
  "수납벤치",
]

function normalizeKeyPart(value: string | null | undefined) {
  return normalizeText(value).replace(/\s+/g, " ")
}

function buildDeduplicationKey(item: RuntimeFurnitureRecord) {
  if (item.product_key) return normalizeKeyPart(item.product_key)
  if (item.image_url) return normalizeKeyPart(item.image_url)

  return [
    normalizeKeyPart(item.brand),
    normalizeKeyPart(item.name),
    normalizeKeyPart(item.category),
  ].join("|")
}

function getFurnitureSearchText(item: RuntimeFurnitureRecord) {
  const metadata = item.catalog_metadata

  return normalizeText(
    [
      item.brand,
      item.name,
      item.category,
      item.description,
      item.color,
      item.material,
      ...(metadata?.style_labels ?? []),
      ...(metadata?.category_aliases ?? []),
      ...(metadata?.room_affinity.strong ?? []),
      ...(metadata?.room_affinity.medium ?? []),
      ...(metadata?.evidence ?? []),
    ]
      .filter(Boolean)
      .join(" ")
  )
}

function isSofaLike(item: RuntimeFurnitureRecord) {
  return includesAnyKeyword(getFurnitureSearchText(item), [
    "sofa",
    "소파",
    "settee",
    "loveseat",
    "chaise",
    "긴의자",
  ])
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function hasVectorCoverage(vector: FurnitureVectorLike) {
  return [
    vector.brightness_compatibility,
    vector.color_temperature_score,
    vector.spatial_footprint_score,
    vector.minimalism_score,
    vector.contrast_score,
    vector.colorfulness_score,
  ].some((value) => value !== null && value !== undefined)
}

function getMetadataPenalty(
  item: RuntimeFurnitureRecord,
  userInput?: UserPreferenceInput
) {
  let penalty = 0

  if (!item.image_url) penalty -= 6
  if (!item.category) penalty -= 4
  if (!item.product_key) penalty -= 3
  if (normalizeText(userInput?.budget) && item.price == null) penalty -= 8

  return penalty
}

function hasDirectChairIntent(userInput?: UserPreferenceInput) {
  return (userInput?.furniture ?? []).some((value) => {
    const normalized = normalizeText(value)

    return normalized === "chair" || normalized === "의자"
  })
}

function getFurnitureSemanticRoleText(item: RuntimeFurnitureRecord) {
  return normalizeText(
    [item.name, item.material]
      .filter(Boolean)
      .join(" ")
  )
}

function isSupportOnlyForDirectChair(item: RuntimeFurnitureRecord) {
  const aliases = item.catalog_metadata?.category_aliases ?? []
  const semanticRoleText = getFurnitureSemanticRoleText(item)

  if (aliases.some((alias) => DIRECT_CHAIR_ALIASES.has(alias))) {
    return false
  }

  if (includesAnyKeyword(semanticRoleText, DIRECT_CHAIR_ROLE_KEYWORDS)) {
    return false
  }

  return (
    aliases.some((alias) => DIRECT_CHAIR_SUPPORT_ALIASES.has(alias)) ||
    includesAnyKeyword(semanticRoleText, DIRECT_CHAIR_SUPPORT_ROLE_KEYWORDS)
  )
}

function getDirectChairSemanticPenalty(
  item: RuntimeFurnitureRecord,
  userInput?: UserPreferenceInput
) {
  if (!hasDirectChairIntent(userInput)) return 0
  if (!isSupportOnlyForDirectChair(item)) return 0

  return -32
}

function getRequestedStyleTokens(userInput?: UserPreferenceInput) {
  const tokens = new Set<StyleToken>()
  const selectedStyles = (userInput?.styles ?? []).map((style) =>
    normalizeText(style)
  )
  const requestSignals = parseRequestSignals(userInput?.requestText)

  for (const style of selectedStyles) {
    if (style in STYLE_KEYWORDS) tokens.add(style as StyleToken)
  }

  if (requestSignals.wantsMinimal) tokens.add("minimal")
  if (requestSignals.wantsBright) tokens.add("bright")
  if (requestSignals.wantsCalm) tokens.add("calm")
  if (requestSignals.wantsWarm) tokens.add("warm-wood")
  if (requestSignals.wantsModern) tokens.add("modern")
  if (requestSignals.wantsHotel) tokens.add("hotel")

  return [...tokens]
}

function vectorMatchesStyle(vector: FurnitureVectorLike, style: StyleToken) {
  if (style === "minimal") return (vector.minimalism_score ?? 50) >= 68
  if (style === "bright") return (vector.brightness_compatibility ?? 50) >= 65
  if (style === "warm-wood") return (vector.color_temperature_score ?? 50) >= 60

  if (style === "calm") {
    return (
      (vector.contrast_score ?? 50) <= 55 &&
      (vector.colorfulness_score ?? 50) <= 60
    )
  }

  if (style === "modern") {
    return (
      (vector.minimalism_score ?? 50) >= 60 &&
      (vector.contrast_score ?? 50) >= 50
    )
  }

  return (
    (vector.minimalism_score ?? 50) >= 58 &&
    (vector.color_temperature_score ?? 50) >= 52
  )
}

function sofaMatchesMinimalProxy(
  item: RuntimeFurnitureRecord,
  vector: FurnitureVectorLike
) {
  if (!isSofaLike(item)) return false

  const itemText = getFurnitureSearchText(item)

  if (includesAnyKeyword(itemText, MINIMAL_STYLE_CONTRADICTION_KEYWORDS)) {
    return false
  }

  return (
    (vector.minimalism_score ?? 50) >= 50 &&
    (vector.contrast_score ?? 50) <= 55 &&
    (vector.colorfulness_score ?? 50) <= 50 &&
    (vector.spatial_footprint_score ?? 50) <= 80
  )
}

function sofaHasMinimalNeutralEvidence(
  item: RuntimeFurnitureRecord,
  requestedStyles: StyleToken[]
) {
  if (!requestedStyles.includes("minimal")) return false
  if (!isSofaLike(item)) return false

  return !includesAnyKeyword(
    getFurnitureSearchText(item),
    MINIMAL_STYLE_CONTRADICTION_KEYWORDS
  )
}

function getStyleFit(params: {
  item: RuntimeFurnitureRecord
  vector: FurnitureVectorLike
  hasVectorCoverage: boolean
  userInput?: UserPreferenceInput
}): RankedFurniture["ranking_context"]["style_fit"] {
  const requestedStyles = getRequestedStyleTokens(params.userInput)

  if (requestedStyles.length === 0) return "neutral"

  const itemText = getFurnitureSearchText(params.item)
  const hasExplicitMatch = requestedStyles.some((style) =>
    includesAnyKeyword(itemText, STYLE_KEYWORDS[style])
  )

  if (hasExplicitMatch) return "explicit"
  if (!params.hasVectorCoverage) return "neutral"

  const hasProxyMatch = requestedStyles.some((style) =>
    vectorMatchesStyle(params.vector, style)
  )

  if (hasProxyMatch) return "proxy"

  if (
    requestedStyles.includes("minimal") &&
    sofaMatchesMinimalProxy(params.item, params.vector)
  ) {
    return "proxy"
  }

  if (sofaHasMinimalNeutralEvidence(params.item, requestedStyles)) {
    return "neutral"
  }

  return "mismatch"
}

function getStyleAdjustment(
  styleFit: RankedFurniture["ranking_context"]["style_fit"]
) {
  if (styleFit === "explicit") return 10
  if (styleFit === "proxy") return 5
  if (styleFit === "mismatch") return -8

  return 0
}

function getRoomFit(
  item: RuntimeFurnitureRecord,
  userInput?: UserPreferenceInput
): RankedFurniture["ranking_context"]["room_fit"] {
  if (!normalizeText(userInput?.roomType)) return "neutral"

  const roomTypeScore = scoreFurnitureByRoomType(
    {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      recommendation_score: 0,
      catalog_metadata: item.catalog_metadata,
    },
    userInput?.roomType
  )

  if (roomTypeScore > 0) return "good"
  if (roomTypeScore < 0) return "mismatch"

  return "neutral"
}

function getRoomFitAdjustment(
  roomFit: RankedFurniture["ranking_context"]["room_fit"]
) {
  if (roomFit === "good") return 5
  if (roomFit === "mismatch") return -10

  return 0
}

function getBudgetFit(
  price: number | null,
  budget?: string | null
): RankedFurniture["ranking_context"]["budget_fit"] {
  const normalizedBudget = normalizeText(budget)

  if (!normalizedBudget) return "neutral"
  if (price == null || !Number.isFinite(price) || price <= 0) return "unknown"

  if (normalizedBudget === "low") {
    if (price <= 150000) return "within"
    if (price > 300000) return "over"
    return "neutral"
  }

  if (normalizedBudget === "medium") {
    if (price < 80000) return "under"
    if (price <= 400000) return "within"
    return "over"
  }

  if (normalizedBudget === "high") {
    if (price >= 250000) return "within"
    return "under"
  }

  return "neutral"
}

function getBudgetPenalty(
  price: number | null,
  budget?: string | null
) {
  const budgetFit = getBudgetFit(price, budget)

  if (budgetFit === "within") return 4
  if (budgetFit === "over") return -18
  if (budgetFit === "under") return -2
  if (budgetFit === "unknown") return -8

  return 0
}

function getCategoryFit(
  item: RuntimeFurnitureRecord,
  userInput?: UserPreferenceInput
): RankedFurniture["ranking_context"]["category_fit"] {
  const selectedFurniture = (userInput?.furniture ?? []).map((value) =>
    normalizeText(value)
  )

  if (selectedFurniture.length > 0) {
    if (hasDirectChairIntent(userInput) && isSupportOnlyForDirectChair(item)) {
      return "mismatch"
    }

    return matchesAnyFurniturePreference(item, selectedFurniture)
      ? "preferred"
      : "mismatch"
  }

  const roomTypeScore = scoreFurnitureByRoomType(
    {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      recommendation_score: 0,
      catalog_metadata: item.catalog_metadata,
    },
    userInput?.roomType
  )

  if (roomTypeScore > 0) return "room_match"
  if (roomTypeScore < 0) return "mismatch"

  return "neutral"
}

function getMetadataQuality(item: RuntimeFurnitureRecord) {
  const score = [item.image_url, item.category, item.price, item.product_key].filter(
    (value) => value !== null && value !== undefined && value !== ""
  ).length

  if (score >= 4) return "complete"
  if (score >= 2) return "partial"

  return "weak"
}

function buildWeakMatchReasons(params: {
  vectorCoverage: RankedFurniture["ranking_context"]["vector_coverage"]
  categoryFit: RankedFurniture["ranking_context"]["category_fit"]
  roomFit: RankedFurniture["ranking_context"]["room_fit"]
  styleFit: RankedFurniture["ranking_context"]["style_fit"]
  budgetFit: RankedFurniture["ranking_context"]["budget_fit"]
  metadataQuality: RankedFurniture["ranking_context"]["metadata_quality"]
  finalScore: number
}) {
  const reasons: string[] = []

  if (params.vectorCoverage === "missing") {
    reasons.push("vector_scoring_unavailable")
  }

  if (params.categoryFit === "mismatch") {
    reasons.push("category_mismatch")
  }

  if (params.roomFit === "mismatch") {
    reasons.push("room_type_mismatch")
  }

  if (params.styleFit === "mismatch") {
    reasons.push("style_mismatch")
  }

  if (params.budgetFit === "over" || params.budgetFit === "unknown") {
    reasons.push("budget_uncertain")
  }

  if (params.metadataQuality !== "complete") {
    reasons.push("metadata_incomplete")
  }

  if (params.finalScore < 60) {
    reasons.push("low_similarity")
  }

  return reasons
}

function sortRankedFurniture(a: RankedFurniture, b: RankedFurniture) {
  if (b.recommendation_score !== a.recommendation_score) {
    return b.recommendation_score - a.recommendation_score
  }

  const categoryFitOrder = {
    preferred: 3,
    room_match: 2,
    neutral: 1,
    mismatch: 0,
  } as const
  const categoryFitGap =
    categoryFitOrder[b.ranking_context.category_fit] -
    categoryFitOrder[a.ranking_context.category_fit]

  if (categoryFitGap !== 0) return categoryFitGap

  const roomFitOrder = {
    good: 2,
    neutral: 1,
    mismatch: 0,
  } as const
  const roomFitGap =
    roomFitOrder[b.ranking_context.room_fit] -
    roomFitOrder[a.ranking_context.room_fit]

  if (roomFitGap !== 0) return roomFitGap

  const styleFitOrder = {
    explicit: 3,
    proxy: 2,
    neutral: 1,
    mismatch: 0,
  } as const
  const styleFitGap =
    styleFitOrder[b.ranking_context.style_fit] -
    styleFitOrder[a.ranking_context.style_fit]

  if (styleFitGap !== 0) return styleFitGap

  const metadataOrder = {
    complete: 2,
    partial: 1,
    weak: 0,
  } as const

  const metadataGap =
    metadataOrder[b.ranking_context.metadata_quality] -
    metadataOrder[a.ranking_context.metadata_quality]

  if (metadataGap !== 0) return metadataGap

  const aPrice = a.price ?? Number.MAX_SAFE_INTEGER
  const bPrice = b.price ?? Number.MAX_SAFE_INTEGER

  if (aPrice !== bPrice) return aPrice - bPrice

  return a.name.localeCompare(b.name)
}

export function rankFurnitureForRecommendations(params: {
  vectors: FurnitureVectorLike[]
  furnitureById: Map<string, RuntimeFurnitureRecord>
  targets: RankingTargets
  userInput?: UserPreferenceInput
  limit?: number
}) {
  const { vectors, furnitureById, targets, userInput, limit = 10 } = params

  const scored = vectors
    .map((vector): RankedFurniture | null => {
      const furniture = furnitureById.get(vector.furniture_id)
      if (!furniture) return null
      const vectorCoverage = hasVectorCoverage(vector) ? "present" : "missing"

      const distance =
        DEFAULT_WEIGHTS.brightness *
          Math.abs((vector.brightness_compatibility ?? 50) - targets.brightness) +
        DEFAULT_WEIGHTS.temperature *
          Math.abs((vector.color_temperature_score ?? 50) - targets.temperature) +
        DEFAULT_WEIGHTS.footprint *
          Math.abs((vector.spatial_footprint_score ?? 50) - targets.footprint) +
        DEFAULT_WEIGHTS.minimalism *
          Math.abs((vector.minimalism_score ?? 50) - targets.minimalism) +
        DEFAULT_WEIGHTS.contrast *
          Math.abs((vector.contrast_score ?? 50) - targets.contrast) +
        DEFAULT_WEIGHTS.colorfulness *
          Math.abs((vector.colorfulness_score ?? 50) - targets.colorfulness)

      const baseScore = clampScore(100 - distance)
      const preferenceScore = scoreFurnitureByUserInput(
        {
          id: furniture.id,
          name: furniture.name,
          category: furniture.category,
          price: furniture.price,
          recommendation_score: baseScore,
          catalog_metadata: furniture.catalog_metadata,
        },
        userInput
      )
      const styleFit = getStyleFit({
        item: furniture,
        vector,
        hasVectorCoverage: vectorCoverage === "present",
        userInput,
      })
      const styleAdjustment = getStyleAdjustment(styleFit)
      const roomFit = getRoomFit(furniture, userInput)
      const roomAdjustment = getRoomFitAdjustment(roomFit)
      const budgetPenalty = getBudgetPenalty(furniture.price, userInput?.budget)
      const metadataPenalty = getMetadataPenalty(furniture, userInput)
      const directChairSemanticPenalty = getDirectChairSemanticPenalty(
        furniture,
        userInput
      )
      const finalScore = clampScore(
        baseScore +
          preferenceScore +
          styleAdjustment +
          roomAdjustment +
          budgetPenalty +
          metadataPenalty +
          directChairSemanticPenalty
      )
      const categoryFit = getCategoryFit(furniture, userInput)
      const budgetFit = getBudgetFit(furniture.price, userInput?.budget)
      const metadataQuality = getMetadataQuality(furniture)

      return {
        ...furniture,
        recommendation_score: finalScore,
        ranking_context: {
          base_score: baseScore,
          final_score: finalScore,
          vector_coverage: vectorCoverage,
          category_fit: categoryFit,
          room_fit: roomFit,
          style_fit: styleFit,
          budget_fit: budgetFit,
          metadata_quality: metadataQuality,
          weak_match_reasons: buildWeakMatchReasons({
            vectorCoverage,
            categoryFit,
            roomFit,
            styleFit,
            budgetFit,
            metadataQuality,
            finalScore,
          }),
        },
      }
    })
    .filter((item): item is RankedFurniture => item !== null)
    .sort(sortRankedFurniture)

  const seen = new Set<string>()
  const deduped: RankedFurniture[] = []

  for (const item of scored) {
    const key = buildDeduplicationKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
  }

  const topItems = deduped.slice(0, limit)
  const top3 = topItems.slice(0, 3)
  const vectorCoveredCandidateCount = deduped.filter(
    (item) => item.ranking_context.vector_coverage === "present"
  ).length
  const vectorMissingCandidateCount = deduped.length - vectorCoveredCandidateCount
  const vectorMissingTop3Count = top3.filter(
    (item) => item.ranking_context.vector_coverage === "missing"
  ).length
  const preferredCategoryInTop3 = userInput?.furniture?.length
    ? top3.filter((item) => item.ranking_context.category_fit === "preferred")
        .length
    : null
  const withinBudgetInTop3 = normalizeText(userInput?.budget)
    ? top3.filter((item) => item.ranking_context.budget_fit === "within").length
    : null
  const styleFitInTop3 = getRequestedStyleTokens(userInput).length
    ? top3.filter((item) =>
        ["explicit", "proxy"].includes(item.ranking_context.style_fit)
      ).length
    : null
  const roomFitInTop3 = normalizeText(userInput?.roomType)
    ? top3.filter((item) => item.ranking_context.room_fit === "good").length
    : null
  const weakReasons: string[] = []

  if (top3.length < Math.min(3, limit)) {
    weakReasons.push("insufficient_candidates")
  }

  if (
    preferredCategoryInTop3 !== null &&
    preferredCategoryInTop3 < Math.min(2, top3.length)
  ) {
    weakReasons.push("weak_category_match")
  }

  if (withinBudgetInTop3 !== null && withinBudgetInTop3 === 0) {
    weakReasons.push("weak_budget_match")
  }

  if (styleFitInTop3 !== null && styleFitInTop3 === 0) {
    weakReasons.push("weak_style_match")
  }

  if (roomFitInTop3 !== null && roomFitInTop3 < Math.min(2, top3.length)) {
    weakReasons.push("weak_room_match")
  }

  if (top3.some((item) => item.ranking_context.final_score < 60)) {
    weakReasons.push("low_confidence_top_result")
  }

  if (top3.some((item) => item.ranking_context.metadata_quality === "weak")) {
    weakReasons.push("weak_metadata_in_top_result")
  }

  if (vectorMissingTop3Count > 0) {
    weakReasons.push("vector_coverage_gap_in_top_result")
  }

  return {
    items: topItems,
    qualitySummary: {
      candidate_count: scored.length,
      deduped_candidate_count: deduped.length,
      returned_count: topItems.length,
      vector_covered_candidate_count: vectorCoveredCandidateCount,
      vector_missing_candidate_count: vectorMissingCandidateCount,
      vector_missing_top3_count: vectorMissingTop3Count,
      weak_result: weakReasons.length > 0,
      weak_reasons: weakReasons,
      preferred_category_in_top3: preferredCategoryInTop3,
      within_budget_in_top3: withinBudgetInTop3,
      style_fit_in_top3: styleFitInTop3,
      room_fit_in_top3: roomFitInTop3,
    } satisfies RankingQualitySummary,
  }
}
