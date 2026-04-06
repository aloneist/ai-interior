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

function uniqueCount(items, keyFn) {
  return new Set(items.map(keyFn)).size
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL
  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    unconstrained: {},
    constrained: {},
    style_case: {},
    room_case: {},
    weak_case: {},
  }

  const unconstrained = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 55,
    temperature: 55,
    footprint: 55,
    minimalism: 55,
    contrast: 55,
    colorfulness: 55,
  })

  assert(unconstrained.status === 200, "Unconstrained recommend route failed")

  const unconstrainedItems = Array.isArray(unconstrained.json?.recommendations)
    ? unconstrained.json.recommendations
    : []
  const unconstrainedSummary = unconstrained.json?.quality_summary ?? null

  assert(unconstrainedItems.length === 10, "Unconstrained recommend returned fewer than 10 items")
  assert(
    uniqueCount(unconstrainedItems, (item) => item.id) === unconstrainedItems.length,
    "Unconstrained recommend returned duplicate product IDs"
  )
  assert(
    unconstrainedItems.every((item) => item.ranking_context),
    "Unconstrained recommend is missing ranking_context"
  )

  report.unconstrained = {
    status: unconstrained.status,
    count: unconstrainedItems.length,
    unique_id_count: uniqueCount(unconstrainedItems, (item) => item.id),
    weak_result: unconstrainedSummary?.weak_result ?? null,
    weak_reasons: unconstrainedSummary?.weak_reasons ?? [],
  }

  const constrained = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 62,
    temperature: 58,
    footprint: 48,
    minimalism: 72,
    contrast: 42,
    colorfulness: 36,
    roomType: "workspace",
    styles: ["minimal", "bright"],
    budget: "low",
    furniture: ["chair"],
    requestText: "밝고 미니멀한 작업 공간으로 가볍게 꾸미고 싶어요",
  })

  assert(constrained.status === 200, "Constrained recommend route failed")

  const constrainedItems = Array.isArray(constrained.json?.recommendations)
    ? constrained.json.recommendations
    : []
  const constrainedSummary = constrained.json?.quality_summary ?? null
  const constrainedTop3 = constrainedItems.slice(0, 3)
  const constrainedPreferredTop3 = constrainedTop3.filter(
    (item) => item.ranking_context?.category_fit === "preferred"
  ).length
  const constrainedBudgetTop3 = constrainedTop3.filter(
    (item) => item.ranking_context?.budget_fit === "within"
  ).length
  const constrainedStyleTop3 = constrainedTop3.filter((item) =>
    ["explicit", "proxy"].includes(item.ranking_context?.style_fit)
  ).length
  const constrainedRoomTop3 = constrainedTop3.filter(
    (item) => item.ranking_context?.room_fit === "good"
  ).length

  assert(constrainedItems.length >= 3, "Constrained recommend returned fewer than 3 items")
  assert(
    constrainedPreferredTop3 >= 1,
    "Constrained recommend did not place any preferred furniture type in the top 3"
  )
  assert(
    constrainedBudgetTop3 >= 1,
    "Constrained recommend did not place any within-budget item in the top 3"
  )
  assert(
    constrainedStyleTop3 >= 1,
    "Constrained recommend did not place any style-fit item in the top 3"
  )
  assert(
    constrainedRoomTop3 >= 1,
    "Constrained recommend did not place any room-fit item in the top 3"
  )

  report.constrained = {
    status: constrained.status,
    count: constrainedItems.length,
    top3_preferred_category_count: constrainedPreferredTop3,
    top3_within_budget_count: constrainedBudgetTop3,
    top3_style_fit_count: constrainedStyleTop3,
    top3_room_fit_count: constrainedRoomTop3,
    quality_summary: constrainedSummary,
    top3: constrainedTop3.map((item) => ({
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
    })),
  }

  const styleCase = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 58,
    temperature: 68,
    footprint: 46,
    minimalism: 60,
    contrast: 42,
    colorfulness: 38,
    roomType: "living",
    styles: ["warm-wood", "calm"],
    budget: "low",
    furniture: ["table"],
    requestText: "따뜻한 우드톤과 차분한 느낌으로 맞추고 싶어요",
  })

  assert(styleCase.status === 200, "Style-case recommend route failed")

  const styleCaseItems = Array.isArray(styleCase.json?.recommendations)
    ? styleCase.json.recommendations
    : []
  const styleCaseTop3 = styleCaseItems.slice(0, 3)
  const styleFitTop3 = styleCaseTop3.filter((item) =>
    ["explicit", "proxy"].includes(item.ranking_context?.style_fit)
  ).length

  assert(styleCaseItems.length >= 3, "Style-case recommend returned fewer than 3 items")
  assert(styleFitTop3 >= 1, "Style-case top 3 has no explicit/proxy style fit")

  report.style_case = {
    status: styleCase.status,
    top3_style_fit_count: styleFitTop3,
    quality_summary: styleCase.json?.quality_summary ?? null,
    top3: styleCaseTop3.map((item) => ({
      id: item.id ?? null,
      name: item.name ?? null,
      category: item.category ?? null,
      style_fit: item.ranking_context?.style_fit ?? null,
      room_fit: item.ranking_context?.room_fit ?? null,
      weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
    })),
  }

  const roomCase = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 55,
    temperature: 52,
    footprint: 50,
    minimalism: 54,
    contrast: 50,
    colorfulness: 45,
    roomType: "dining",
    styles: ["modern"],
    budget: "low",
    furniture: ["table"],
    requestText: "모던한 다이닝 공간에 작은 테이블을 두고 싶어요",
  })

  assert(roomCase.status === 200, "Room-case recommend route failed")

  const roomCaseItems = Array.isArray(roomCase.json?.recommendations)
    ? roomCase.json.recommendations
    : []
  const roomCaseTop3 = roomCaseItems.slice(0, 3)
  const roomFitTop3 = roomCaseTop3.filter(
    (item) => item.ranking_context?.room_fit === "good"
  ).length

  assert(roomCaseItems.length >= 3, "Room-case recommend returned fewer than 3 items")
  assert(roomFitTop3 >= 1, "Room-case top 3 has no room-fit item")

  report.room_case = {
    status: roomCase.status,
    top3_room_fit_count: roomFitTop3,
    quality_summary: roomCase.json?.quality_summary ?? null,
    top3: roomCaseTop3.map((item) => ({
      id: item.id ?? null,
      name: item.name ?? null,
      category: item.category ?? null,
      room_fit: item.ranking_context?.room_fit ?? null,
      style_fit: item.ranking_context?.style_fit ?? null,
      weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
    })),
  }

  const weakCase = await apiPost(`${baseUrl}/api/recommend`, {
    brightness: 30,
    temperature: 70,
    footprint: 30,
    minimalism: 80,
    contrast: 20,
    colorfulness: 20,
    roomType: "workspace",
    styles: ["minimal"],
    budget: "low",
    furniture: ["sofa"],
    requestText: "작은 작업 공간인데 저예산으로 소파를 꼭 넣고 싶어요",
  })

  assert(weakCase.status === 200, "Weak-case recommend route failed")

  const weakCaseSummary = weakCase.json?.quality_summary ?? null
  assert(
    typeof weakCaseSummary?.weak_result === "boolean",
    "Weak-case recommend is missing weak_result visibility"
  )
  assert(
    Array.isArray(weakCaseSummary?.weak_reasons),
    "Weak-case recommend is missing weak_reasons"
  )

  report.weak_case = {
    status: weakCase.status,
    quality_summary: weakCaseSummary,
    top3: Array.isArray(weakCase.json?.recommendations)
      ? weakCase.json.recommendations.slice(0, 3).map((item) => ({
          id: item.id ?? null,
          category_fit: item.ranking_context?.category_fit ?? null,
          room_fit: item.ranking_context?.room_fit ?? null,
          style_fit: item.ranking_context?.style_fit ?? null,
          budget_fit: item.ranking_context?.budget_fit ?? null,
          weak_match_reasons: item.ranking_context?.weak_match_reasons ?? [],
        }))
      : [],
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  const normalizedError =
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
        }
      : { message: String(error) }

  console.error(JSON.stringify({ error: normalizedError }, null, 2))
  process.exit(1)
})
