import {
  matchesAnyFurniturePreference,
  scoreFurnitureByRoomType,
  scoreFurnitureByUserInput,
  type UserPreferenceInput,
} from "@/lib/mvp/scoring"
import { normalizeText } from "@/lib/mvp/request-signals"
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
    category_fit: "preferred" | "room_match" | "mismatch" | "neutral"
    budget_fit: "within" | "over" | "under" | "unknown" | "neutral"
    metadata_quality: "complete" | "partial" | "weak"
    weak_match_reasons: string[]
  }
}

export type RankingQualitySummary = {
  candidate_count: number
  deduped_candidate_count: number
  returned_count: number
  weak_result: boolean
  weak_reasons: string[]
  preferred_category_in_top3: number | null
  within_budget_in_top3: number | null
}

const DEFAULT_WEIGHTS = {
  brightness: 0.2,
  temperature: 0.2,
  footprint: 0.2,
  minimalism: 0.2,
  contrast: 0.1,
  colorfulness: 0.1,
} as const

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

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
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

function scoreStyleSignals(
  vector: FurnitureVectorLike,
  userInput?: UserPreferenceInput
) {
  const styles = (userInput?.styles ?? []).map((style) => normalizeText(style))
  let bonus = 0

  if (styles.includes("minimal") && (vector.minimalism_score ?? 50) >= 68) {
    bonus += 6
  }

  if (styles.includes("bright") && (vector.brightness_compatibility ?? 50) >= 65) {
    bonus += 4
  }

  if (styles.includes("warm-wood") && (vector.color_temperature_score ?? 50) >= 60) {
    bonus += 4
  }

  if (styles.includes("calm")) {
    if ((vector.contrast_score ?? 50) <= 55) bonus += 3
    if ((vector.colorfulness_score ?? 50) <= 55) bonus += 2
  }

  if (styles.includes("modern")) {
    if ((vector.minimalism_score ?? 50) >= 60) bonus += 3
    if ((vector.contrast_score ?? 50) >= 50) bonus += 2
  }

  if (styles.includes("hotel")) {
    if ((vector.minimalism_score ?? 50) >= 58) bonus += 3
    if ((vector.color_temperature_score ?? 50) >= 52) bonus += 2
  }

  return bonus
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
  categoryFit: RankedFurniture["ranking_context"]["category_fit"]
  budgetFit: RankedFurniture["ranking_context"]["budget_fit"]
  metadataQuality: RankedFurniture["ranking_context"]["metadata_quality"]
  finalScore: number
}) {
  const reasons: string[] = []

  if (params.categoryFit === "mismatch") {
    reasons.push("category_mismatch")
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
        },
        userInput
      )
      const styleBonus = scoreStyleSignals(vector, userInput)
      const budgetPenalty = getBudgetPenalty(furniture.price, userInput?.budget)
      const metadataPenalty = getMetadataPenalty(furniture, userInput)
      const finalScore = clampScore(
        baseScore + preferenceScore + styleBonus + budgetPenalty + metadataPenalty
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
          category_fit: categoryFit,
          budget_fit: budgetFit,
          metadata_quality: metadataQuality,
          weak_match_reasons: buildWeakMatchReasons({
            categoryFit,
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
  const preferredCategoryInTop3 = userInput?.furniture?.length
    ? top3.filter((item) => item.ranking_context.category_fit === "preferred")
        .length
    : null
  const withinBudgetInTop3 = normalizeText(userInput?.budget)
    ? top3.filter((item) => item.ranking_context.budget_fit === "within").length
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

  if (top3.some((item) => item.ranking_context.final_score < 60)) {
    weakReasons.push("low_confidence_top_result")
  }

  if (top3.some((item) => item.ranking_context.metadata_quality === "weak")) {
    weakReasons.push("weak_metadata_in_top_result")
  }

  return {
    items: topItems,
    qualitySummary: {
      candidate_count: scored.length,
      deduped_candidate_count: deduped.length,
      returned_count: topItems.length,
      weak_result: weakReasons.length > 0,
      weak_reasons: weakReasons,
      preferred_category_in_top3: preferredCategoryInTop3,
      within_budget_in_top3: withinBudgetInTop3,
    } satisfies RankingQualitySummary,
  }
}
