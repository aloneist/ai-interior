import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import OpenAI from "openai"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const FIXTURE_PATH = path.join(
  ROOT_DIR,
  "data/qa/mvp-explanation-review-fixtures-v1.json"
)
const PROMPT_PATH = path.join(ROOT_DIR, "lib/mvp/prompts.ts")
const MODEL = "gpt-4o-mini"
const ROOM_SIGNAL_TERMS = [
  "밝기",
  "톤",
  "웜톤",
  "쿨톤",
  "미니멀",
  "밀도",
  "대비",
  "컬러감",
]
const FORBIDDEN_GENERIC_PHRASES = [
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
]
const CATEGORY_TERMS = {
  sofa: ["소파", "sofa"],
  table: ["테이블", "table", "탁자"],
  chair: ["의자", "chair", "체어", "벤치"],
}
const CATEGORY_LABELS = {
  sofa: "소파",
  table: "테이블",
  chair: "의자",
}
const STYLE_CLAIM_TERMS = {
  minimal: ["미니멀", "심플", "깔끔", "간결"],
  modern: ["모던", "현대적"],
  bright: ["밝", "화이트", "밝기"],
  "warm-wood": ["우드", "나무", "웜톤", "따뜻"],
  calm: ["차분", "낮은 대비", "부드러운"],
  hotel: ["호텔", "라운지", "고급"],
}
const ROOM_CLAIM_TERMS = {
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
]
const BROAD_FIT_CLAIM_TERMS = ["잘 어울", "잘 맞", "조화", "적합", "맞습니다"]

function extractPrompt(source) {
  const match = source.match(
    /export const RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT = `([\s\S]*?)`\.trim\(\)/
  )

  if (!match?.[1]) {
    throw new Error("Could not extract RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT")
  }

  return match[1]
}

async function loadPrompt() {
  return extractPrompt(await fs.readFile(PROMPT_PATH, "utf8"))
}

function normalizeReasons(raw) {
  const reasons = Array.isArray(raw?.reasons) ? raw.reasons : []
  const result = new Map()

  for (const reason of reasons) {
    if (
      typeof reason?.product_key === "string" &&
      typeof reason?.reason_short === "string"
    ) {
      result.set(reason.product_key, reason.reason_short)
    }
  }

  return result
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

function getCategoryTerms(category) {
  return CATEGORY_TERMS[category] ?? [category].filter(Boolean)
}

function getCategoryLabel(category) {
  if (!category) return "제품"

  return CATEGORY_LABELS[category] ?? category
}

function getStyleClaimTerms(styles) {
  return styles.flatMap((style) => STYLE_CLAIM_TERMS[style] ?? [style])
}

function getRoomClaimTerms(roomType) {
  return ROOM_CLAIM_TERMS[roomType] ?? [roomType].filter(Boolean)
}

function evaluateReason({ reason, item, userInput }) {
  const failures = []
  const warnings = []
  const context = item.ranking_context ?? {}

  if (!reason) {
    failures.push("missing_reason")
    return { judgment: "fail", failures, warnings }
  }

  if (includesAny(reason, FORBIDDEN_GENERIC_PHRASES)) {
    warnings.push("contains_forbidden_generic_phrase")
  }

  if (!includesAny(reason, ROOM_SIGNAL_TERMS)) {
    warnings.push("missing_room_signal_term")
  }

  if (!includesAny(reason, getCategoryTerms(item.category))) {
    warnings.push("missing_item_category_signal")
  }

  if (
    context.style_fit === "mismatch" &&
    includesAny(reason, getStyleClaimTerms(userInput.styles ?? []))
  ) {
    failures.push("style_fit_claim_mismatch")
  }

  if (
    context.room_fit === "mismatch" &&
    includesAny(reason, getRoomClaimTerms(userInput.roomType))
  ) {
    failures.push("room_fit_claim_mismatch")
  }

  if (
    ["over", "unknown"].includes(context.budget_fit) &&
    includesAny(reason, BUDGET_POSITIVE_CLAIM_TERMS)
  ) {
    failures.push("budget_fit_claim_mismatch")
  }

  if (context.room_fit === "mismatch" && includesAny(reason, BROAD_FIT_CLAIM_TERMS)) {
    failures.push("room_fit_overconfidence")
  }

  if (
    context.category_fit === "mismatch" &&
    includesAny(reason, BROAD_FIT_CLAIM_TERMS)
  ) {
    failures.push("category_fit_overconfidence")
  }

  return {
    judgment: failures.length > 0 ? "fail" : warnings.length > 0 ? "weak" : "pass",
    failures,
    warnings,
  }
}

function buildFallbackExplanation(item) {
  const categoryLabel = getCategoryLabel(item.category)
  const context = item.ranking_context ?? {}

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
    return `${categoryLabel}의 톤과 미니멀감이 맞아요.`
  }

  return `${categoryLabel}의 톤과 밀도를 기준으로 골랐어요.`
}

function summarizeCaseJudgment(items) {
  if (items.some((item) => item.judgment === "fail")) return "fail"
  if (items.some((item) => item.judgment === "weak")) return "weak"
  return "pass"
}

async function generateReasons({ client, systemPrompt, payload }) {
  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  })

  return JSON.parse(response.choices[0].message.content ?? "{}")
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required")
  }

  const [fixture, systemPrompt] = await Promise.all([
    fs.readFile(FIXTURE_PATH, "utf8").then(JSON.parse),
    loadPrompt(),
  ])
  const client = new OpenAI({ apiKey })
  const cases = []

  for (const fixtureCase of fixture.cases) {
    const generated = await generateReasons({
      client,
      systemPrompt,
      payload: fixtureCase.payload,
    })
    const reasonMap = normalizeReasons(generated)
    const items = fixtureCase.payload.items.map((item) => {
      const generatedReason = reasonMap.get(item.product_key) ?? ""
      const generatedEvaluation = evaluateReason({
        reason: generatedReason,
        item,
        userInput: fixtureCase.payload.user_input,
      })
      const usesFallback = generatedEvaluation.failures.length > 0 ||
        generatedEvaluation.warnings.length > 0
      const reason = usesFallback
        ? buildFallbackExplanation(item)
        : generatedReason
      const finalEvaluation = evaluateReason({
        reason,
        item,
        userInput: fixtureCase.payload.user_input,
      })

      return {
        product_key: item.product_key,
        name: item.name,
        category: item.category,
        ranking_context: item.ranking_context,
        generated_reason_short: generatedReason,
        reason_short: reason,
        explanation_source: usesFallback ? "fallback" : "generated",
        fallback_reasons: usesFallback
          ? [...generatedEvaluation.failures, ...generatedEvaluation.warnings]
          : [],
        ...finalEvaluation,
      }
    })

    cases.push({
      caseId: fixtureCase.caseId,
      scenario: fixtureCase.scenario,
      requestSummary: fixtureCase.requestSummary,
      quality_summary: fixtureCase.quality_summary,
      judgment: summarizeCaseJudgment(items),
      items,
      generated_raw: generated,
    })
  }

  const fallbackFixtureCase = fixture.cases[0]
  const fallbackRegressionGenerated = {
    reasons: [
      {
        product_key: "glostad-sofa",
        reason_short: "소파가 공간과 잘 맞아요.",
      },
      {
        product_key: "fixture://linanas-sofa",
        reason_short: "소파가 예산에 맞고 공간과 잘 어울려요.",
      },
      {
        product_key: "fixture://lillehem-sofa",
        reason_short: "",
      },
    ],
  }
  const fallbackRegressionReasonMap = normalizeReasons(fallbackRegressionGenerated)
  const fallbackRegressionItems = fallbackFixtureCase.payload.items.map((item) => {
    const generatedReason = fallbackRegressionReasonMap.get(item.product_key) ?? ""
    const generatedEvaluation = evaluateReason({
      reason: generatedReason,
      item,
      userInput: fallbackFixtureCase.payload.user_input,
    })
    const usesFallback =
      generatedEvaluation.failures.length > 0 ||
      generatedEvaluation.warnings.length > 0
    const reason = usesFallback
      ? buildFallbackExplanation(item)
      : generatedReason
    const finalEvaluation = evaluateReason({
      reason,
      item,
      userInput: fallbackFixtureCase.payload.user_input,
    })

    return {
      product_key: item.product_key,
      generated_reason_short: generatedReason,
      reason_short: reason,
      explanation_source: usesFallback ? "fallback" : "generated",
      fallback_reasons: usesFallback
        ? [...generatedEvaluation.failures, ...generatedEvaluation.warnings]
        : [],
      ...finalEvaluation,
    }
  })
  const fallbackRegression = {
    caseId: "fallback-regression-invalid-output",
    fallback_count: fallbackRegressionItems.filter(
      (item) => item.explanation_source === "fallback"
    ).length,
    judgment: summarizeCaseJudgment(fallbackRegressionItems),
    items: fallbackRegressionItems,
  }

  const summary = cases.reduce(
    (acc, item) => {
      acc[item.judgment] += 1
      acc.fallback += item.items.filter(
        (caseItem) => caseItem.explanation_source === "fallback"
      ).length
      return acc
    },
    { pass: 0, weak: 0, fail: 0, fallback: 0 }
  )

  const report = {
    generated_at: new Date().toISOString(),
    fixture_path: path.relative(ROOT_DIR, FIXTURE_PATH),
    fixture_version: fixture.version,
    model: MODEL,
    strategy:
      "fixed explanation payload fixtures with frozen ranking_context; direct OpenAI explanation call; no image analysis or ranking rerun",
    summary,
    fallback_regression: fallbackRegression,
    cases,
  }

  console.log(JSON.stringify(report, null, 2))

  if (summary.fail > 0 || fallbackRegression.judgment === "fail") {
    process.exitCode = 1
  }
}

main().catch((error) => {
  const normalizedError =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) }

  console.error(JSON.stringify({ error: normalizedError }, null, 2))
  process.exit(1)
})
