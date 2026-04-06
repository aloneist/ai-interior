import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const FIXTURE_PATH = path.join(ROOT_DIR, "data/qa/controlled-mvp-fixtures-v1.json")
const DEFAULT_BASE_URL = "http://127.0.0.1:3000"
const BUDGET_POSITIVE_CLAIM_TERMS = [
  "가성비",
  "저렴",
  "예산에 맞",
  "예산과 맞",
  "예산 부담",
  "가격 부담",
]
const BROAD_FIT_CLAIM_TERMS = ["잘 어울", "잘 맞", "조화", "적합", "맞습니다"]

function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

async function parseJson(response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { raw: text }
  }
}

async function apiPost(url, body, adminToken) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-token": adminToken,
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

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

function validateExplanationAlignment(item) {
  const reason = item.reason_short ?? ""
  const context = item.ranking_context ?? {}
  const failures = []

  if (!reason.trim()) {
    failures.push("missing_reason_short")
  }

  if (!context.category_fit || !context.room_fit || !context.style_fit) {
    failures.push("missing_ranking_context")
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

  return failures
}

function judgeCase({ status, response, metrics, expectations, alignmentFailures }) {
  if (status !== 200 || response?.success !== true) return "fail"
  if (response?.qa?.mode !== "controlled_fixture") return "fail"
  if (response?.qa?.persistence !== "skipped") return "fail"
  if (alignmentFailures.length > 0) return "fail"

  const qualitySummary = response.quality_summary ?? {}
  const weakReasons = Array.isArray(qualitySummary.weak_reasons)
    ? qualitySummary.weak_reasons
    : []
  const expectedWeakReasons = expectations.expectedWeakReasons ?? []
  const missesExpectation =
    metrics.recommendationCount < expectations.minRecommendations ||
    metrics.groupCount < expectations.minGroups ||
    metrics.top3PreferredCategoryCount < expectations.top3PreferredCategoryMin ||
    metrics.top3WithinBudgetCount < expectations.top3WithinBudgetMin ||
    metrics.top3StyleFitCount < expectations.top3StyleFitMin ||
    metrics.top3RoomFitCount < expectations.top3RoomFitMin

  if (!expectations.weakResultAllowed) {
    return qualitySummary.weak_result || missesExpectation ? "weak" : "pass"
  }

  if (
    qualitySummary.weak_result &&
    expectedWeakReasons.every((reason) => weakReasons.includes(reason))
  ) {
    return "weak"
  }

  return missesExpectation ? "fail" : qualitySummary.weak_result ? "weak" : "pass"
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL
  const adminToken = requireEnv("ADMIN_TOKEN")
  const fixture = JSON.parse(await fs.readFile(FIXTURE_PATH, "utf8"))
  const cases = []

  for (const fixtureCase of fixture.cases) {
    const response = await apiPost(
      `${baseUrl}/api/mvp`,
      fixtureCase.body,
      adminToken
    )
    const recommendations = Array.isArray(response.json?.recommendations)
      ? response.json.recommendations
      : []
    const groupedRecommendations = Array.isArray(
      response.json?.grouped_recommendations
    )
      ? response.json.grouped_recommendations
      : []
    const top3 = recommendations.slice(0, 3)
    const alignmentFailures = top3.flatMap((item) =>
      validateExplanationAlignment(item).map((reason) => ({
        product_id: item.id ?? null,
        reason,
      }))
    )
    const metrics = {
      recommendationCount: recommendations.length,
      groupCount: groupedRecommendations.length,
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
      explanationFallbackCount: Array.isArray(response.json?.qa?.explanation_sources)
        ? response.json.qa.explanation_sources.filter(
            (item) => item.source === "fallback"
          ).length
        : null,
    }

    cases.push({
      caseId: fixtureCase.caseId,
      dimension: fixtureCase.dimension,
      scenario: fixtureCase.scenario,
      status: response.status,
      judgment: judgeCase({
        status: response.status,
        response: response.json,
        metrics,
        expectations: fixtureCase.expectations,
        alignmentFailures,
      }),
      metrics,
      qa: response.json?.qa ?? null,
      quality_summary: response.json?.quality_summary ?? null,
      alignmentFailures,
      top3: top3.map((item) => ({
        id: item.id ?? null,
        name: item.name ?? null,
        category: item.category ?? null,
        price: item.price ?? null,
        score: item.recommendation_score ?? null,
        reason_short: item.reason_short ?? null,
        category_fit: item.ranking_context?.category_fit ?? null,
        room_fit: item.ranking_context?.room_fit ?? null,
        style_fit: item.ranking_context?.style_fit ?? null,
        budget_fit: item.ranking_context?.budget_fit ?? null,
        weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
      })),
      grouped_summary: groupedRecommendations.map((group) => ({
        id: group.id,
        product_count: Array.isArray(group.products) ? group.products.length : 0,
      })),
    })
  }

  const summary = cases.reduce(
    (acc, item) => {
      acc[item.judgment] += 1
      acc.fallback += item.metrics.explanationFallbackCount ?? 0
      return acc
    },
    { pass: 0, weak: 0, fail: 0, fallback: 0 }
  )
  const report = {
    generated_at: new Date().toISOString(),
    fixture_path: path.relative(ROOT_DIR, FIXTURE_PATH),
    fixture_version: fixture.version,
    base_url: baseUrl,
    route: "/api/mvp",
    strategy:
      "controlled_fixture mode bypasses image analysis with fixed room scores, skips persistence by default, and exercises real ranking, explanation, validation, grouping, and response shaping",
    summary,
    cases,
  }

  console.log(JSON.stringify(report, null, 2))

  if (summary.fail > 0) {
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
