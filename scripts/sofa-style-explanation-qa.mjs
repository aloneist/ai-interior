import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const DEFAULT_BASE_URL = "http://127.0.0.1:3000"

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function countTop3(items, predicate) {
  return items.slice(0, 3).filter(predicate).length
}

function summarizeTop3(items) {
  return items.slice(0, 3).map((item) => ({
    id: item.id ?? null,
    name: item.name ?? null,
    category: item.category ?? null,
    price: item.price ?? null,
    score: item.recommendation_score ?? null,
    category_fit: item.ranking_context?.category_fit ?? null,
    room_fit: item.ranking_context?.room_fit ?? null,
    style_fit: item.ranking_context?.style_fit ?? null,
    budget_fit: item.ranking_context?.budget_fit ?? null,
    weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
  }))
}

async function assertExplanationContract() {
  const [promptSource, payloadSource, mvpRouteSource] = await Promise.all([
    fs.readFile(path.join(ROOT_DIR, "lib/mvp/prompts.ts"), "utf8"),
    fs.readFile(path.join(ROOT_DIR, "lib/mvp/payloads.ts"), "utf8"),
    fs.readFile(path.join(ROOT_DIR, "app/api/mvp/route.ts"), "utf8"),
  ])

  assert(
    promptSource.includes("ranking_context.style_fit") &&
      promptSource.includes("ranking_context.room_fit") &&
      promptSource.includes("ranking_context.budget_fit"),
    "Explanation prompt does not include ranking-context mismatch rules"
  )
  assert(
    payloadSource.includes("ranking_context") &&
      mvpRouteSource.includes("ranking_context: item.ranking_context"),
    "MVP explanation payload does not pass ranking_context"
  )
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL

  const livingSofa = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 56,
    temperature: 54,
    footprint: 72,
    minimalism: 56,
    contrast: 44,
    colorfulness: 40,
    roomType: "living",
    styles: ["minimal"],
    budget: "low",
    furniture: ["sofa"],
    requestText: "예산이 낮아서 가성비 위주로 소파 중심 거실을 맞추고 싶어요",
  })

  assert(livingSofa.status === 200, "Living-room sofa recommend route failed")

  const livingSofaItems = Array.isArray(livingSofa.json?.recommendations)
    ? livingSofa.json.recommendations
    : []
  const livingSofaTop3 = livingSofaItems.slice(0, 3)
  const livingSofaSummary = livingSofa.json?.quality_summary ?? null
  const livingSofaMetrics = {
    top3PreferredCategoryCount: countTop3(
      livingSofaItems,
      (item) => item.ranking_context?.category_fit === "preferred"
    ),
    top3WithinBudgetCount: countTop3(
      livingSofaItems,
      (item) => item.ranking_context?.budget_fit === "within"
    ),
    top3StyleFitCount: countTop3(livingSofaItems, (item) =>
      ["explicit", "proxy"].includes(item.ranking_context?.style_fit)
    ),
    top3RoomFitCount: countTop3(
      livingSofaItems,
      (item) => item.ranking_context?.room_fit === "good"
    ),
  }

  assert(livingSofaTop3.length >= 3, "Living-room sofa returned fewer than 3 items")
  assert(
    livingSofaMetrics.top3PreferredCategoryCount >= 1,
    "Living-room sofa top 3 has no sofa/category-preferred item"
  )
  assert(
    livingSofaMetrics.top3WithinBudgetCount >= 1,
    "Living-room sofa top 3 has no within-budget item"
  )
  assert(
    livingSofaMetrics.top3StyleFitCount >= 1,
    "Living-room sofa top 3 has no explicit/proxy style-fit item"
  )
  assert(
    livingSofaMetrics.top3RoomFitCount >= 1,
    "Living-room sofa top 3 has no room-fit item"
  )
  assert(
    !(livingSofaSummary?.weak_reasons ?? []).includes("weak_style_match"),
    "Living-room sofa still reports weak_style_match"
  )

  const weakWorkspaceSofa = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 50,
    temperature: 56,
    footprint: 34,
    minimalism: 76,
    contrast: 30,
    colorfulness: 26,
    roomType: "workspace",
    styles: ["minimal"],
    budget: "low",
    furniture: ["sofa"],
    requestText: "작은 작업 공간인데 저예산으로 소파를 꼭 넣고 싶어요",
  })

  assert(
    weakWorkspaceSofa.status === 200,
    "Weak workspace sofa recommend route failed"
  )

  const weakWorkspaceSummary = weakWorkspaceSofa.json?.quality_summary ?? null

  assert(
    weakWorkspaceSummary?.weak_result === true,
    "Weak workspace sofa case should remain weak"
  )
  assert(
    (weakWorkspaceSummary?.weak_reasons ?? []).includes("weak_category_match"),
    "Weak workspace sofa case should preserve weak_category_match"
  )

  await assertExplanationContract()

  console.log(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        base_url: baseUrl,
        living_sofa: {
          status: livingSofa.status,
          metrics: livingSofaMetrics,
          quality_summary: livingSofaSummary,
          top3: summarizeTop3(livingSofaItems),
        },
        weak_workspace_sofa: {
          status: weakWorkspaceSofa.status,
          quality_summary: weakWorkspaceSummary,
          top3: summarizeTop3(
            Array.isArray(weakWorkspaceSofa.json?.recommendations)
              ? weakWorkspaceSofa.json.recommendations
              : []
          ),
        },
        explanation_contract: {
          ranking_context_passed_to_mvp_explainer: true,
          prompt_blocks_mismatched_fit_claims: true,
        },
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
