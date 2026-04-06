import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const REVIEW_SET_PATH = path.join(
  ROOT_DIR,
  "data/qa/recommendation-human-review-set-v1.json"
)
const DEFAULT_BASE_URL = "http://127.0.0.1:3000"
const DEFAULT_ROOM_TARGETS = {
  brightness: 58,
  temperature: 58,
  footprint: 48,
  minimalism: 62,
  contrast: 42,
  colorfulness: 38,
}

async function parseJson(response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { raw: text }
  }
}

async function apiPost(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    ok: response.ok,
    json: await parseJson(response),
  }
}

function countTop3(items, predicate) {
  return items.slice(0, 3).filter(predicate).length
}

function includesExpectedWeakReasons(actualReasons, expectedReasons) {
  return expectedReasons.every((reason) => actualReasons.includes(reason))
}

function judgeCase(params) {
  const { status, metrics, expectations, qualitySummary } = params

  if (status !== 200) return "fail"

  const weakResult = qualitySummary?.weak_result === true
  const weakReasons = Array.isArray(qualitySummary?.weak_reasons)
    ? qualitySummary.weak_reasons
    : []
  const expectedWeakReasons = Array.isArray(expectations.expectedWeakReasons)
    ? expectations.expectedWeakReasons
    : []
  const missesHardExpectation =
    metrics.top3PreferredCategoryCount < expectations.top3PreferredCategoryMin ||
    metrics.top3WithinBudgetCount < expectations.top3WithinBudgetMin ||
    metrics.top3StyleFitCount < expectations.top3StyleFitMin ||
    metrics.top3RoomFitCount < expectations.top3RoomFitMin

  if (!expectations.weakResultAllowed) {
    if (weakResult || missesHardExpectation) return "weak"
    return "pass"
  }

  if (
    weakResult &&
    expectedWeakReasons.length > 0 &&
    includesExpectedWeakReasons(weakReasons, expectedWeakReasons)
  ) {
    return "weak"
  }

  if (missesHardExpectation) return "fail"

  return weakResult ? "weak" : "pass"
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL
  const reviewSet = JSON.parse(await fs.readFile(REVIEW_SET_PATH, "utf8"))

  const cases = []

  for (const reviewCase of reviewSet.cases) {
    const roomTargets = {
      ...DEFAULT_ROOM_TARGETS,
      ...(reviewCase.roomTargets ?? {}),
    }
    const response = await apiPost(`${baseUrl}/api/recommend`, {
      ...roomTargets,
      ...reviewCase.input,
    })
    const recommendations = Array.isArray(response.json?.recommendations)
      ? response.json.recommendations
      : []
    const top3 = recommendations.slice(0, 3)
    const qualitySummary = response.json?.quality_summary ?? null
    const metrics = {
      top3PreferredCategoryCount: countTop3(
        recommendations,
        (item) => item.ranking_context?.category_fit === "preferred"
      ),
      top3WithinBudgetCount: countTop3(
        recommendations,
        (item) => item.ranking_context?.budget_fit === "within"
      ),
      top3StyleFitCount: countTop3(recommendations, (item) =>
        ["explicit", "proxy"].includes(item.ranking_context?.style_fit)
      ),
      top3RoomFitCount: countTop3(
        recommendations,
        (item) => item.ranking_context?.room_fit === "good"
      ),
    }

    cases.push({
      caseId: reviewCase.caseId,
      dimension: reviewCase.dimension,
      scenario: reviewCase.scenario,
      input: reviewCase.input,
      roomTargets,
      expectations: reviewCase.expectations,
      status: response.status,
      mechanicalJudgment: judgeCase({
        status: response.status,
        metrics,
        expectations: reviewCase.expectations,
        qualitySummary,
      }),
      metrics,
      qualitySummary,
      top3: top3.map((item) => ({
        id: item.id ?? null,
        name: item.name ?? null,
        category: item.category ?? null,
        price: item.price ?? null,
        score: item.recommendation_score ?? null,
        category_fit: item.ranking_context?.category_fit ?? null,
        room_fit: item.ranking_context?.room_fit ?? null,
        style_fit: item.ranking_context?.style_fit ?? null,
        budget_fit: item.ranking_context?.budget_fit ?? null,
        metadata_quality: item.ranking_context?.metadata_quality ?? null,
        weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
      })),
    })
  }

  const summary = cases.reduce(
    (acc, item) => {
      acc[item.mechanicalJudgment] += 1
      return acc
    },
    { pass: 0, weak: 0, fail: 0 }
  )

  console.log(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        review_set: path.relative(ROOT_DIR, REVIEW_SET_PATH),
        review_set_version: reviewSet.version,
        base_url: baseUrl,
        route: "/api/recommend",
        default_room_targets: DEFAULT_ROOM_TARGETS,
        summary,
        cases,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  const normalizedError =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) }

  console.error(JSON.stringify({ error: normalizedError }, null, 2))
  process.exit(1)
})
