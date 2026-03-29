import {
  toBudgetLabel,
  toFurnitureLabel,
  toRoomTypeLabel,
  toStyleLabel,
} from "@/lib/mvp/labels"
import {
  buildPreferredFurniturePool,
  buildUserAdjustedPool,
  getGroupProductLimit,
  type UserPreferenceInput,
} from "@/lib/mvp/scoring"
import type { RoomLabels } from "@/lib/mvp/room-analysis"

const GROUP_CONFIG = {
  balanced: {
    id: "balanced",
    title: "추천안 A | 균형형",
    fallbackTag: "무난한 조합",
    sortMode: "balanced",
  },
  budget: {
    id: "budget",
    title: "추천안 B | 예산 절약형",
    fallbackTag: "가성비 중심",
    sortMode: "budget",
  },
  mood: {
    id: "mood",
    title: "추천안 C | 분위기 강조형",
    fallbackTag: "분위기 변화",
    sortMode: "mood",
  },
} as const

const GROUP_COPY = {
  balanced: {
    summarySuffix: (roomLabels: RoomLabels) =>
      `${roomLabels.brightness}, ${roomLabels.minimalism} 흐름에 무난하게 어울리는 조합이에요.`,
  },
  budget: {
    summarySuffix: (roomLabels: RoomLabels) =>
      `가격 부담을 낮추면서도 ${roomLabels.temperature} 톤과 어색하지 않게 맞춘 조합이에요.`,
  },
  mood: {
    summarySuffix: (roomLabels: RoomLabels) =>
      `${roomLabels.colorfulness}, ${roomLabels.contrast} 흐름을 살려 분위기 변화를 더 주는 조합이에요.`,
  },
} as const

type GroupMode = (typeof GROUP_CONFIG)[keyof typeof GROUP_CONFIG]["sortMode"]

export type GroupableFurniture = {
  id: string
  name: string
  brand: string | null
  category: string | null
  price: number | null
  image_url: string | null
  recommendation_score: number
  reason_short?: string
  external_url?: string
}

export type RecommendationGroup = {
  id: "balanced" | "budget" | "mood"
  title: string
  concept_tag: string
  total_price_text: string
  summary_text: string
  products: Array<GroupableFurniture & { adjusted_score?: number }>
}

function formatTotalPriceText(
  items: Array<GroupableFurniture & { adjusted_score?: number }>
) {
  const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0)

  if (!total) return "가격 정보 확인 필요"

  return `약 ${total.toLocaleString()}원`
}

function sortGroupItems(
  items: Array<GroupableFurniture & { adjusted_score?: number }>,
  mode: GroupMode
) {
  const sorted = [...items].sort((a, b) => {
    const aAdjusted = a.adjusted_score ?? a.recommendation_score
    const bAdjusted = b.adjusted_score ?? b.recommendation_score

    if (mode === "balanced") {
      return bAdjusted - aAdjusted
    }

    if (mode === "budget") {
      const aPrice = a.price ?? Number.MAX_SAFE_INTEGER
      const bPrice = b.price ?? Number.MAX_SAFE_INTEGER

      if (aPrice !== bPrice) return aPrice - bPrice

      return bAdjusted - aAdjusted
    }

    const aPrice = a.price ?? 0
    const bPrice = b.price ?? 0

    if (bAdjusted !== aAdjusted) return bAdjusted - aAdjusted

    return bPrice - aPrice
  })

  return sorted
}

function pickGroupItems(
  items: Array<GroupableFurniture & { adjusted_score?: number }>,
  mode: GroupMode,
  limit: number
) {
  return sortGroupItems(items, mode).slice(0, limit)
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }

  return result
}

function buildSummaryText(params: {
  mode: GroupMode
  roomLabels: RoomLabels
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

  return `${roomTypeText}${styleText}${budgetText}${furnitureText}${requestSnippet}${GROUP_COPY[
    mode
  ].summarySuffix(roomLabels)}`
}

function buildConceptTag(mode: GroupMode, userInput?: UserPreferenceInput) {
  if (
    mode === "balanced" &&
    userInput?.furniture &&
    userInput.furniture.length > 0
  ) {
    return `${userInput.furniture.map(toFurnitureLabel).join(", ")} 우선`
  }

  if (mode === "budget") {
    if (userInput?.budget === "low") return "낮은 예산 우선"
    if (userInput?.budget === "medium") return "예산 균형"

    return GROUP_CONFIG.budget.fallbackTag
  }

  if (mode === "mood" && userInput?.styles && userInput.styles.length > 0) {
    return `${userInput.styles.slice(0, 2).map(toStyleLabel).join(", ")} 반영`
  }

  return GROUP_CONFIG[mode].fallbackTag
}

export function buildRecommendationGroups(params: {
  items: GroupableFurniture[]
  roomLabels: RoomLabels
  userInput?: UserPreferenceInput
}) {
  const { items, roomLabels, userInput } = params

  const adjustedPool = buildUserAdjustedPool(items, userInput)
  const preferredPool = buildPreferredFurniturePool(adjustedPool, userInput)
  const groupLimit = getGroupProductLimit(userInput)

  const balanced = uniqueById(
    pickGroupItems(preferredPool, GROUP_CONFIG.balanced.sortMode, groupLimit)
  )
  const budget = uniqueById(
    pickGroupItems(preferredPool, GROUP_CONFIG.budget.sortMode, groupLimit)
  )
  const mood = uniqueById(
    pickGroupItems(preferredPool, GROUP_CONFIG.mood.sortMode, groupLimit)
  )

  const groups: RecommendationGroup[] = [
    {
      id: GROUP_CONFIG.balanced.id,
      title: GROUP_CONFIG.balanced.title,
      concept_tag: buildConceptTag(GROUP_CONFIG.balanced.sortMode, userInput),
      total_price_text: formatTotalPriceText(balanced),
      summary_text: buildSummaryText({
        mode: GROUP_CONFIG.balanced.sortMode,
        roomLabels,
        userInput,
      }),
      products: balanced,
    },
    {
      id: GROUP_CONFIG.budget.id,
      title: GROUP_CONFIG.budget.title,
      concept_tag: buildConceptTag(GROUP_CONFIG.budget.sortMode, userInput),
      total_price_text: formatTotalPriceText(budget),
      summary_text: buildSummaryText({
        mode: GROUP_CONFIG.budget.sortMode,
        roomLabels,
        userInput,
      }),
      products: budget,
    },
    {
      id: GROUP_CONFIG.mood.id,
      title: GROUP_CONFIG.mood.title,
      concept_tag: buildConceptTag(GROUP_CONFIG.mood.sortMode, userInput),
      total_price_text: formatTotalPriceText(mood),
      summary_text: buildSummaryText({
        mode: GROUP_CONFIG.mood.sortMode,
        roomLabels,
        userInput,
      }),
      products: mood,
    },
  ]

  return groups
}