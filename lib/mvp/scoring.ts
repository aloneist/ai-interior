import {
  includesAnyKeyword,
  normalizeText,
  parseRequestSignals,
} from "@/lib/mvp/request-signals"

const ROOM_TYPE_CATEGORY_WEIGHTS = {
  living: {
    sofa: 14,
    chair: 5,
    table: 5,
    default: -2,
  },
  bedroom: {
    sofa: 2,
    chair: 8,
    table: 5,
    default: 0,
  },
  workspace: {
    sofa: -6,
    chair: 14,
    table: 12,
    default: -2,
  },
  dining: {
    sofa: -6,
    chair: 10,
    table: 14,
    default: -2,
  },
} as const

const BUDGET_RULES = {
  low: {
    cheapMax: 150000,
    expensiveMin: 300000,
    cheapBonus: 12,
    expensivePenalty: -10,
  },
  medium: {
    min: 80000,
    max: 400000,
    bonus: 8,
  },
  high: {
    premiumMin: 250000,
    bonus: 8,
  },
} as const

const REQUEST_SIGNAL_BONUSES = {
  airyFurnitureBonus: 6,
  minimalStyleBonus: 6,
  brightBonus: 4,
  calmBonus: 3,
  warmBonus: 4,
} as const

const STYLE_SELECTION_BONUSES = {
  minimalThreshold: 75,
  minimalBonus: 4,
  brightThreshold: 70,
  brightBonus: 3,
} as const

const FURNITURE_MATCH_BONUSES = {
  matched: 18,
  unmatched: -8,
} as const

export type UserPreferenceInput = {
  roomType?: string | null
  styles?: string[]
  budget?: string | null
  furniture?: string[]
  requestText?: string
}

export type ScoredFurnitureLike = {
  id: string
  name: string
  category: string | null
  price: number | null
  recommendation_score: number
}

export function scoreFurnitureByRoomType(
  item: ScoredFurnitureLike,
  roomType?: string | null
) {
  const category = normalizeText(item.category)
  const room = normalizeText(
    roomType
  ) as keyof typeof ROOM_TYPE_CATEGORY_WEIGHTS | ""

  if (!room || !(room in ROOM_TYPE_CATEGORY_WEIGHTS)) return 0

  const weights = ROOM_TYPE_CATEGORY_WEIGHTS[room]

  if (includesAnyKeyword(category, ["sofa"])) return weights.sofa
  if (includesAnyKeyword(category, ["chair"])) return weights.chair
  if (includesAnyKeyword(category, ["table"])) return weights.table

  return weights.default
}

export function scoreFurnitureByUserInput(
  item: ScoredFurnitureLike,
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

  if (selectedFurniture.length > 0) {
    if (selectedFurniture.includes(category)) {
      bonus += FURNITURE_MATCH_BONUSES.matched
    } else {
      bonus += FURNITURE_MATCH_BONUSES.unmatched
    }
  }

  if (budget === "low") {
    const rule = BUDGET_RULES.low

    if ((item.price ?? 0) > 0 && (item.price ?? 0) <= rule.cheapMax) {
      bonus += rule.cheapBonus
    }

    if ((item.price ?? 0) > rule.expensiveMin) {
      bonus += rule.expensivePenalty
    }
  }

  if (budget === "medium") {
    const rule = BUDGET_RULES.medium

    if ((item.price ?? 0) >= rule.min && (item.price ?? 0) <= rule.max) {
      bonus += rule.bonus
    }
  }

  if (budget === "high") {
    const rule = BUDGET_RULES.high

    if ((item.price ?? 0) >= rule.premiumMin) {
      bonus += rule.bonus
    }
  }

  if (requestText) {
    if (
      requestSignals.wantsAiry &&
      includesAnyKeyword(category, ["chair", "table"])
    ) {
      bonus += REQUEST_SIGNAL_BONUSES.airyFurnitureBonus
    }

    if (
      requestSignals.wantsMinimal &&
      includesAnyKeyword(selectedStyles.join(" "), ["minimal", "modern"])
    ) {
      bonus += REQUEST_SIGNAL_BONUSES.minimalStyleBonus
    }

    if (requestSignals.wantsBright && item.recommendation_score >= 70) {
      bonus += REQUEST_SIGNAL_BONUSES.brightBonus
    }

    if (requestSignals.wantsCalm && item.recommendation_score >= 72) {
      bonus += REQUEST_SIGNAL_BONUSES.calmBonus
    }

    if (
      requestSignals.wantsWarm &&
      includesAnyKeyword(selectedStyles.join(" "), ["warm-wood"])
    ) {
      bonus += REQUEST_SIGNAL_BONUSES.warmBonus
    }
  }

  if (selectedStyles.includes("minimal")) {
    if (item.recommendation_score >= STYLE_SELECTION_BONUSES.minimalThreshold) {
      bonus += STYLE_SELECTION_BONUSES.minimalBonus
    }
  }

  if (selectedStyles.includes("bright")) {
    if (item.recommendation_score >= STYLE_SELECTION_BONUSES.brightThreshold) {
      bonus += STYLE_SELECTION_BONUSES.brightBonus
    }
  }

  return bonus
}

export function buildUserAdjustedPool<T extends ScoredFurnitureLike>(
  items: T[],
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

export function getGroupProductLimit(userInput?: UserPreferenceInput) {
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

export function buildPreferredFurniturePool<
  T extends ScoredFurnitureLike & { adjusted_score?: number }
>(items: T[], userInput?: UserPreferenceInput) {
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