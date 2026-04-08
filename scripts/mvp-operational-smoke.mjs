const DEFAULT_BASE_URL = "http://127.0.0.1:3000"
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function parseJson(response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { raw: text }
  }
}

async function postJson(baseUrl, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    ok: response.ok,
    json: await parseJson(response),
  }
}

function assert(condition, message, details = undefined) {
  if (!condition) {
    const error = new Error(message)
    error.details = details
    throw error
  }
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function requireUuid(value, label) {
  assert(
    typeof value === "string" && UUID_PATTERN.test(value),
    `${label} must be a UUID`,
    { value }
  )
}

function validateRecommendationPayload(response) {
  assert(response.status === 200, "/api/mvp must return 200", {
    status: response.status,
    body: response.json,
  })
  assert(response.json?.success === true, "/api/mvp must return success=true", {
    body: response.json,
  })

  requireUuid(response.json.request_id, "request_id")
  assert(
    Array.isArray(response.json.recommendations) &&
      response.json.recommendations.length > 0,
    "/api/mvp must return at least one recommendation",
    { recommendations: response.json.recommendations }
  )

  const topRecommendation = response.json.recommendations[0]
  requireUuid(topRecommendation.id, "recommendations[0].id")
  assert(
    typeof topRecommendation.name === "string" && topRecommendation.name.trim(),
    "recommendations[0].name must be present",
    { topRecommendation }
  )
  assert(
    typeof topRecommendation.recommendation_score === "number",
    "recommendations[0].recommendation_score must be numeric",
    { topRecommendation }
  )
  assert(
    isHttpUrl(topRecommendation.external_url),
    "recommendations[0].external_url must be an http(s) URL",
    { topRecommendation }
  )

  if (topRecommendation.affiliate_url) {
    assert(
      topRecommendation.external_url === topRecommendation.affiliate_url,
      "external_url must prefer affiliate_url when affiliate_url is present",
      {
        external_url: topRecommendation.external_url,
        affiliate_url: topRecommendation.affiliate_url,
      }
    )
  }

  if (Array.isArray(response.json.grouped_recommendations)) {
    for (const group of response.json.grouped_recommendations) {
      assert(typeof group.id === "string" && group.id, "group.id must exist", {
        group,
      })
      assert(
        Array.isArray(group.products) && group.products.length > 0,
        "each recommendation group must include products",
        { group }
      )

      for (const product of group.products) {
        requireUuid(product.id, `grouped_recommendations.${group.id}.product.id`)
      }
    }
  }

  return topRecommendation
}

function validateActionUpdate(response, expected) {
  assert(response.status === 200, `${expected.route} must return 200`, {
    status: response.status,
    body: response.json,
  })
  assert(
    response.json?.success === true,
    `${expected.route} must return success=true`,
    { body: response.json }
  )
  assert(
    response.json?.updated?.request_id === expected.requestId,
    `${expected.route} must update the target request_id`,
    { updated: response.json?.updated, expected }
  )
  assert(
    response.json?.updated?.furniture_id === expected.productId,
    `${expected.route} must update by canonical product id despite legacy furniture_id column name`,
    { updated: response.json?.updated, expected }
  )

  if ("saved" in expected) {
    assert(
      response.json.updated.saved === expected.saved,
      `${expected.route} must persist expected saved state`,
      { updated: response.json.updated, expected }
    )
  }

  if ("clicked" in expected) {
    assert(
      response.json.updated.clicked === expected.clicked,
      `${expected.route} must persist expected clicked state`,
      { updated: response.json.updated, expected }
    )
  }
}

async function main() {
  const baseUrl = (process.env.APP_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "")
  const input = {
    imageUrl: process.env.MVP_SMOKE_IMAGE_URL || DEFAULT_IMAGE_URL,
    roomType: "living",
    styles: ["modern", "minimal"],
    budget: "medium",
    furniture: ["sofa", "table"],
    requestText: "답답해 보이지 않았으면 좋겠어요",
  }

  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    mode: "environment_independent_api_smoke",
    browser_coverage: "none",
    input,
    checks: {},
  }

  const mvpResponse = await postJson(baseUrl, "/api/mvp", input)
  const topRecommendation = validateRecommendationPayload(mvpResponse)
  const requestId = mvpResponse.json.request_id
  const productId = topRecommendation.id

  report.checks.mvp = {
    status: mvpResponse.status,
    request_id: requestId,
    recommendation_count: mvpResponse.json.recommendations.length,
    grouped_recommendation_count:
      mvpResponse.json.grouped_recommendations?.length ?? 0,
    top_product_id: productId,
    top_product_external_url: topRecommendation.external_url,
    top_product_uses_affiliate_url:
      Boolean(topRecommendation.affiliate_url) &&
      topRecommendation.external_url === topRecommendation.affiliate_url,
    quality_summary: mvpResponse.json.quality_summary ?? null,
  }

  const saveTrue = await postJson(baseUrl, "/api/log-save", {
    request_id: requestId,
    canonical_product_id: productId,
    saved: true,
  })
  validateActionUpdate(saveTrue, {
    route: "/api/log-save",
    requestId,
    productId,
    saved: true,
  })

  const click = await postJson(baseUrl, "/api/log-click", {
    request_id: requestId,
    canonical_product_id: productId,
  })
  validateActionUpdate(click, {
    route: "/api/log-click",
    requestId,
    productId,
    clicked: true,
  })

  const saveFalse = await postJson(baseUrl, "/api/log-save", {
    request_id: requestId,
    canonical_product_id: productId,
    saved: false,
  })
  validateActionUpdate(saveFalse, {
    route: "/api/log-save",
    requestId,
    productId,
    saved: false,
  })

  report.checks.actions = {
    save_true_status: saveTrue.status,
    click_status: click.status,
    save_false_status: saveFalse.status,
    canonical_product_id: productId,
    db_column_note:
      "recommendations.furniture_id is legacy naming and stores canonical furniture_products.id",
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  const normalizedError =
    error instanceof Error
      ? {
          message: error.message,
          details: error.details ?? null,
          stack: error.stack,
        }
      : { message: String(error) }

  console.error(JSON.stringify({ error: normalizedError }, null, 2))
  process.exit(1)
})
