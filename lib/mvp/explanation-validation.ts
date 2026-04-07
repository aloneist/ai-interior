type RankingContextLike = {
  category_fit?: string | null
  room_fit?: string | null
  style_fit?: string | null
  budget_fit?: string | null
  weak_match_reasons?: string[]
}

export type ExplainReasonLike = {
  product_key?: string | null
  reason_short?: string | null
}

export type ExplainItemLike = {
  product_key?: string | null
  name: string
  category: string | null
  description?: string | null
  color?: string | null
  material?: string | null
  metadata?: {
    style_labels?: string[]
    category_aliases?: string[]
    room_affinity?: {
      strong?: string[]
      medium?: string[]
      weak?: string[]
    }
  } | null
  ranking_context?: RankingContextLike
}

export type ExplanationUserInputLike = {
  roomType?: string | null
  styles?: string[]
  budget?: string | null
}

export type ValidatedExplanation = {
  product_key: string
  reason_short: string
  source: "generated" | "fallback"
  validation_reasons: string[]
}

export const ROOM_SIGNAL_TERMS = [
  "밝기",
  "톤",
  "웜톤",
  "쿨톤",
  "미니멀",
  "밀도",
  "대비",
  "컬러감",
] as const

export const FORBIDDEN_GENERIC_PHRASES = [
  "편안",
  "시원",
  "자연적인 느낌",
  "분위기",
  "고급",
  "감성",
  "좋아요",
  "좋네요",
  "좋습니다",
  "제공",
] as const

const CATEGORY_TERMS: Record<string, string[]> = {
  sofa: ["소파", "sofa"],
  table: ["테이블", "table", "탁자"],
  chair: ["의자", "chair", "체어", "벤치"],
}

const CATEGORY_LABELS: Record<string, string> = {
  sofa: "소파",
  table: "테이블",
  chair: "의자",
}

const CATEGORY_ALIAS_TERMS: Record<string, string[]> = {
  bench: ["벤치", "bench"],
  bench_support: ["벤치", "수납", "bench"],
  chair_support: ["벤치", "의자", "수납", "bench"],
  children_chair: ["어린이용 책상 의자", "의자", "chair"],
  compact_sofa: ["소파", "sofa"],
  desk_chair: ["책상 의자", "의자", "chair"],
  outdoor_storage: ["수납상자", "수납", "storage"],
  outdoor_table: ["야외테이블", "테이블", "table"],
  seating_support: ["벤치", "의자", "bench"],
  side_table: ["보조테이블", "테이블", "table"],
  small_table: ["테이블", "table"],
  sofa: ["소파", "sofa"],
  storage: ["수납", "storage"],
  storage_bench: ["수납벤치", "벤치", "수납", "bench"],
  storage_box: ["수납상자", "수납", "storage box", "storage"],
  table: ["테이블", "table", "탁자"],
  two_seat_sofa: ["2인용소파", "소파", "sofa"],
  workspace_chair: ["책상 의자", "의자", "chair"],
}

const CATEGORY_ALIAS_LABELS: Record<string, string> = {
  bench: "벤치",
  bench_support: "벤치",
  chair_support: "벤치",
  children_chair: "의자",
  compact_sofa: "소파",
  desk_chair: "의자",
  outdoor_storage: "수납상자",
  outdoor_table: "테이블",
  seating_support: "벤치",
  side_table: "테이블",
  small_table: "테이블",
  sofa: "소파",
  storage: "수납상자",
  storage_bench: "벤치",
  storage_box: "수납상자",
  table: "테이블",
  two_seat_sofa: "소파",
  workspace_chair: "의자",
}

const STYLE_CLAIM_TERMS: Record<string, string[]> = {
  minimal: ["미니멀", "심플", "깔끔", "간결"],
  modern: ["모던", "현대적"],
  bright: ["밝", "화이트", "밝기"],
  "warm-wood": ["우드", "나무", "웜톤", "따뜻"],
  calm: ["차분", "낮은 대비", "부드러운"],
  hotel: ["호텔", "라운지", "고급"],
}

const ROOM_CLAIM_TERMS: Record<string, string[]> = {
  living: ["거실"],
  workspace: ["작업 공간", "업무 공간", "워크스페이스", "작업실"],
  dining: ["다이닝", "식사 공간"],
  bedroom: ["침실"],
}

const BUDGET_POSITIVE_CLAIM_TERMS = [
  "가성비",
  "저렴",
  "예산에 맞",
  "예산과 맞",
  "예산 부담",
  "가격 부담",
] as const

const BROAD_FIT_CLAIM_TERMS = ["잘 어울", "잘 맞", "조화", "적합", "맞습니다"] as const

function includesAny(text: string, terms: readonly string[]) {
  return terms.some((term) => text.includes(term))
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getItemCategoryTerms(item: ExplainItemLike) {
  const categoryTerms = item.category ? CATEGORY_TERMS[item.category] ?? [item.category] : []
  const aliasTerms =
    item.metadata?.category_aliases?.flatMap(
      (alias) => CATEGORY_ALIAS_TERMS[alias] ?? [alias]
    ) ?? []

  return uniqueStrings([...categoryTerms, ...aliasTerms])
}

function getCategoryLabel(item: ExplainItemLike) {
  const aliases = item.metadata?.category_aliases ?? []
  const primaryAlias = aliases.find((alias) => CATEGORY_ALIAS_LABELS[alias])

  if (primaryAlias) return CATEGORY_ALIAS_LABELS[primaryAlias]
  if (!item.category) return "제품"

  return CATEGORY_LABELS[item.category] ?? item.category
}

function getStyleClaimTerms(styles: string[] = []) {
  return styles.flatMap((style) => STYLE_CLAIM_TERMS[style] ?? [style])
}

function getRoomClaimTerms(roomType?: string | null) {
  if (!roomType) return []

  return ROOM_CLAIM_TERMS[roomType] ?? [roomType]
}

export function validateGeneratedExplanation(params: {
  reason: string | null | undefined
  item: ExplainItemLike
  userInput?: ExplanationUserInputLike
}) {
  const reasons: string[] = []
  const reason = params.reason?.trim() ?? ""
  const context = params.item.ranking_context ?? {}

  if (!reason) {
    return ["missing_reason"]
  }

  if (includesAny(reason, FORBIDDEN_GENERIC_PHRASES)) {
    reasons.push("contains_forbidden_generic_phrase")
  }

  if (!includesAny(reason, ROOM_SIGNAL_TERMS)) {
    reasons.push("missing_room_signal_term")
  }

  if (!includesAny(reason, getItemCategoryTerms(params.item))) {
    reasons.push("missing_item_category_signal")
  }

  if (
    context.style_fit === "mismatch" &&
    includesAny(reason, getStyleClaimTerms(params.userInput?.styles))
  ) {
    reasons.push("style_fit_claim_mismatch")
  }

  if (
    context.room_fit === "mismatch" &&
    includesAny(reason, getRoomClaimTerms(params.userInput?.roomType))
  ) {
    reasons.push("room_fit_claim_mismatch")
  }

  if (
    ["over", "unknown"].includes(context.budget_fit ?? "") &&
    includesAny(reason, BUDGET_POSITIVE_CLAIM_TERMS)
  ) {
    reasons.push("budget_fit_claim_mismatch")
  }

  if (
    context.room_fit === "mismatch" &&
    includesAny(reason, BROAD_FIT_CLAIM_TERMS)
  ) {
    reasons.push("room_fit_overconfidence")
  }

  if (
    context.category_fit === "mismatch" &&
    includesAny(reason, BROAD_FIT_CLAIM_TERMS)
  ) {
    reasons.push("category_fit_overconfidence")
  }

  return reasons
}

export function buildFallbackExplanation(item: ExplainItemLike) {
  const categoryLabel = getCategoryLabel(item)
  const context = item.ranking_context ?? {}
  const styleLabels = item.metadata?.style_labels ?? []
  const usesWarmWood = styleLabels.includes("warm-wood")
  const usesBright = styleLabels.includes("bright")
  const usesCalm = styleLabels.includes("calm")

  if (context.room_fit === "mismatch") {
    return `${categoryLabel}의 톤만 참고할 수 있어요.`
  }

  if (context.budget_fit === "over" || context.budget_fit === "unknown") {
    return `${categoryLabel}의 톤과 밀도를 참고해 주세요.`
  }

  if (context.style_fit === "mismatch") {
    return `${categoryLabel}의 밝기와 밀도를 기준으로 골랐어요.`
  }

  if (context.style_fit === "explicit" || context.style_fit === "proxy") {
    if (usesWarmWood) {
      return `${categoryLabel}의 우드톤과 밀도가 맞아요.`
    }

    if (usesBright) {
      return `${categoryLabel}의 밝기와 톤이 맞아요.`
    }

    if (usesCalm) {
      return `${categoryLabel}의 차분한 톤이 맞아요.`
    }

    return `${categoryLabel}의 톤과 미니멀감이 맞아요.`
  }

  return `${categoryLabel}의 톤과 밀도를 기준으로 골랐어요.`
}

export function validateExplanationSet(params: {
  generated: unknown
  items: ExplainItemLike[]
  userInput?: ExplanationUserInputLike
}) {
  const structurallyValid =
    typeof params.generated === "object" &&
    params.generated !== null &&
    Array.isArray((params.generated as { reasons?: unknown }).reasons)
  const rawReasons = structurallyValid
    ? ((params.generated as { reasons: unknown[] }).reasons ?? [])
    : []
  const reasonMap = new Map<string, string>()
  const duplicateKeys = new Set<string>()

  for (const rawReason of rawReasons) {
    if (
      typeof rawReason === "object" &&
      rawReason !== null &&
      typeof (rawReason as ExplainReasonLike).product_key === "string" &&
      typeof (rawReason as ExplainReasonLike).reason_short === "string"
    ) {
      const productKey = (rawReason as ExplainReasonLike).product_key?.trim() ?? ""

      if (!productKey) continue

      if (reasonMap.has(productKey)) {
        duplicateKeys.add(productKey)
      }

      reasonMap.set(
        productKey,
        (rawReason as ExplainReasonLike).reason_short?.trim() ?? ""
      )
    }
  }

  return params.items.map((item): ValidatedExplanation => {
    const productKey = item.product_key?.trim() ?? ""
    const generatedReason = reasonMap.get(productKey) ?? null
    const validationReasons = [
      ...(structurallyValid ? [] : ["invalid_explanation_response"]),
      ...(productKey ? [] : ["missing_product_key"]),
      ...(duplicateKeys.has(productKey) ? ["duplicate_product_key"] : []),
      ...validateGeneratedExplanation({
        reason: generatedReason,
        item,
        userInput: params.userInput,
      }),
    ]

    if (validationReasons.length > 0) {
      return {
        product_key: productKey,
        reason_short: buildFallbackExplanation(item),
        source: "fallback",
        validation_reasons: validationReasons,
      }
    }

    return {
      product_key: productKey,
      reason_short: generatedReason ?? buildFallbackExplanation(item),
      source: "generated",
      validation_reasons: [],
    }
  })
}
