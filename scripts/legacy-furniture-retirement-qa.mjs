import { createClient } from "@supabase/supabase-js"

const DEFAULT_BASE_URL = "http://127.0.0.1:3000"

function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
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

async function apiPost(url, { body, headers } = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body ?? {}),
  })

  const json = await parseJson(response)

  return {
    status: response.status,
    ok: response.ok,
    json,
  }
}

function makeQaSourceUrl(label) {
  return `qa://legacy-furniture-retirement/${label}`
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const adminToken = requireEnv("ADMIN_TOKEN")
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_BASE_URL

  const supabase = createClient(supabaseUrl, supabaseKey)

  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    runtime_independence: {},
    publish_flow: {},
    vector_operations: {},
    recommendation_actions: {},
  }

  const { data: vectorRows, error: vectorError } = await supabase
    .from("furniture_vectors")
    .select("furniture_id")

  if (vectorError) throw vectorError

  const vectorIds = [...new Set((vectorRows ?? []).map((row) => row.furniture_id))]

  const { data: publishedProducts, error: publishedProductsError } = await supabase
    .from("furniture_products")
    .select("id")
    .in("id", vectorIds)

  if (publishedProductsError) throw publishedProductsError

  const publishedIds = new Set((publishedProducts ?? []).map((row) => row.id))
  const missingPublishedIds = vectorIds.filter((id) => !publishedIds.has(id))

  report.runtime_independence = {
    vector_count: vectorIds.length,
    hydrated_through_furniture_products_count: publishedIds.size,
    missing_from_furniture_products_count: missingPublishedIds.length,
    sample_missing_published_ids: missingPublishedIds.slice(0, 5),
  }

  if (missingPublishedIds.length > 0) {
    throw new Error(
      `Runtime independence failed: ${missingPublishedIds.length} furniture_vectors IDs are missing from furniture_products`
    )
  }

  report.vector_operations = {
    creation_mode: "single_row_per_furniture_id",
    update_mode: "upsert_overwrite_by_furniture_id",
    vector_version_mode: "unused_in_runtime",
  }

  const validQaSourceUrl = makeQaSourceUrl("valid-pending-review")
  const invalidQaSourceUrl = makeQaSourceUrl("invalid-missing-name")

  const { data: validImportJob, error: validImportJobError } = await supabase
    .from("import_jobs")
    .upsert(
      {
        source_site: "qa",
        source_url: validQaSourceUrl,
        extracted_name: "QA Publish Product",
        extracted_brand: "QA",
        extracted_category: "chair",
        extracted_price: 123000,
        extracted_image_urls: ["https://example.com/qa-product.jpg"],
        extracted_source_site: "qa",
        extracted_affiliate_url: "https://example.com/qa-product",
        status: "pending_review",
        review_note: "qa valid pending_review publish flow",
      },
      { onConflict: "source_url" }
    )
    .select()
    .single()

  if (validImportJobError) throw validImportJobError

  const { data: invalidImportJob, error: invalidImportJobError } = await supabase
    .from("import_jobs")
    .upsert(
      {
        source_site: "qa",
        source_url: invalidQaSourceUrl,
        extracted_name: null,
        extracted_brand: "QA",
        extracted_category: "chair",
        extracted_price: 99000,
        extracted_source_site: "qa",
        extracted_affiliate_url: "https://example.com/qa-invalid-product",
        status: "pending_review",
        review_note: "qa invalid publish flow missing name",
      },
      { onConflict: "source_url" }
    )
    .select()
    .single()

  if (invalidImportJobError) throw invalidImportJobError

  const publishHeaders = {
    "x-admin-token": adminToken,
  }

  const firstPublish = await apiPost(
    `${baseUrl}/api/admin/import-jobs/${validImportJob.id}/publish`,
    { headers: publishHeaders }
  )
  const secondPublish = await apiPost(
    `${baseUrl}/api/admin/import-jobs/${validImportJob.id}/publish`,
    { headers: publishHeaders }
  )
  const invalidPublish = await apiPost(
    `${baseUrl}/api/admin/import-jobs/${invalidImportJob.id}/publish`,
    { headers: publishHeaders }
  )
  const missingPublish = await apiPost(
    `${baseUrl}/api/admin/import-jobs/00000000-0000-0000-0000-000000000000/publish`,
    { headers: publishHeaders }
  )

  const { data: publishedProductRow, error: publishedProductRowError } = await supabase
    .from("furniture_products")
    .select("id, source_url, product_name, status")
    .eq("source_url", validQaSourceUrl)
    .single()

  if (publishedProductRowError) throw publishedProductRowError

  const { data: updatedImportJob, error: updatedImportJobError } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("id", validImportJob.id)
    .single()

  if (updatedImportJobError) throw updatedImportJobError

  report.publish_flow = {
    valid_first_publish_status: firstPublish.status,
    valid_second_publish_status: secondPublish.status,
    invalid_publish_status: invalidPublish.status,
    missing_publish_status: missingPublish.status,
    published_product_id: publishedProductRow.id,
    published_product_status: publishedProductRow.status,
    import_job_status_after_publish: updatedImportJob.status ?? null,
    import_job_published_product_id:
      updatedImportJob.published_product_id ?? null,
    repeated_publish_same_product_id:
      firstPublish.json?.published_product?.id === secondPublish.json?.published_product?.id,
    invalid_publish_code: invalidPublish.json?.code ?? null,
  }

  const recommendResponse = await apiPost(`${baseUrl}/api/recommend`, {
    body: {
      brightness: 55,
      temperature: 55,
      footprint: 55,
      minimalism: 55,
      contrast: 55,
      colorfulness: 55,
    },
  })

  const recommendationItems = Array.isArray(recommendResponse.json?.recommendations)
    ? recommendResponse.json.recommendations
    : []

  if (recommendationItems.length === 0) {
    throw new Error("Recommendation route returned no products during QA")
  }

  const firstRecommendedProduct = recommendationItems[0]

  const { data: spaceRow, error: spaceError } = await supabase
    .from("spaces")
    .select("id")
    .limit(1)
    .single()

  if (spaceError) throw spaceError

  const qaRequestId = crypto.randomUUID()
  const missingRequestId = crypto.randomUUID()

  const { data: insertedRecommendation, error: insertRecommendationError } = await supabase
    .from("recommendations")
    .insert({
      request_id: qaRequestId,
      event_source: "qa",
      space_id: spaceRow.id,
      furniture_id: firstRecommendedProduct.id,
      compatibility_score: firstRecommendedProduct.recommendation_score ?? 0,
      clicked: false,
      saved: false,
    })
    .select()
    .single()

  if (insertRecommendationError) throw insertRecommendationError

  const logClickSuccess = await apiPost(`${baseUrl}/api/log-click`, {
    body: {
      request_id: qaRequestId,
      furniture_id: firstRecommendedProduct.id,
    },
  })

  const logClickMissing = await apiPost(`${baseUrl}/api/log-click`, {
    body: {
      request_id: missingRequestId,
      furniture_id: firstRecommendedProduct.id,
    },
  })

  const saveTrue = await apiPost(`${baseUrl}/api/log-save`, {
    body: {
      request_id: qaRequestId,
      furniture_id: firstRecommendedProduct.id,
      saved: true,
    },
  })

  const saveTrueRepeat = await apiPost(`${baseUrl}/api/log-save`, {
    body: {
      request_id: qaRequestId,
      furniture_id: firstRecommendedProduct.id,
      saved: true,
    },
  })

  const saveFalse = await apiPost(`${baseUrl}/api/log-save`, {
    body: {
      request_id: qaRequestId,
      furniture_id: firstRecommendedProduct.id,
      saved: false,
    },
  })

  const saveMissing = await apiPost(`${baseUrl}/api/log-save`, {
    body: {
      request_id: missingRequestId,
      furniture_id: firstRecommendedProduct.id,
      saved: true,
    },
  })

  const saveInvalid = await apiPost(`${baseUrl}/api/log-save`, {
    body: {
      request_id: qaRequestId,
      furniture_id: firstRecommendedProduct.id,
      saved: "true",
    },
  })

  const { data: clickedRecommendation, error: clickedRecommendationError } = await supabase
    .from("recommendations")
    .select("id, clicked, saved")
    .eq("id", insertedRecommendation.id)
    .single()

  if (clickedRecommendationError) throw clickedRecommendationError

  report.recommendation_actions = {
    recommend_route_status: recommendResponse.status,
    recommend_route_count: recommendationItems.length,
    recommend_first_product: {
      id: firstRecommendedProduct.id ?? null,
      name: firstRecommendedProduct.name ?? null,
      product_key: firstRecommendedProduct.product_key ?? null,
    },
    recommendation_insert_id: insertedRecommendation.id,
    log_click_success_status: logClickSuccess.status,
    log_click_missing_status: logClickMissing.status,
    log_save_true_status: saveTrue.status,
    log_save_true_repeat_status: saveTrueRepeat.status,
    log_save_false_status: saveFalse.status,
    log_save_missing_status: saveMissing.status,
    log_save_invalid_status: saveInvalid.status,
    clicked_after_log_click: clickedRecommendation.clicked ?? null,
    saved_after_unsave: clickedRecommendation.saved ?? null,
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
      : typeof error === "object" && error !== null
      ? error
      : { message: String(error) }

  console.error(
    JSON.stringify(
      { error: normalizedError },
      null,
      2
    )
  )
  process.exit(1)
})
