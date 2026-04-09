import { writeFile } from "node:fs/promises";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const IMPORT_JOB_STATUS = {
  pendingReview: "pending_review",
  published: "published",
  rejected: "rejected",
};

const ACTIVE_PRODUCT_STATUS = "active";
const ALLOWED_IMPORT_JOB_STATUSES = new Set(Object.values(IMPORT_JOB_STATUS));
const QUALITY_GATE = {
  publishReady: "publish_ready",
  publishAllowedWithWarning: "publish_allowed_with_warning",
  publishBlocked: "publish_blocked",
  manualReviewRequired: "manual_review_required",
};
const GENERIC_OUTBOUND_URL_PATTERNS = [
  /\/cat\//i,
  /\/products-products\/?$/i,
  /\/search\//i,
  /search\.shopping\.naver\.com/i,
  /\/offers\//i,
];
const MANUAL_REVIEW_BLOCKER_CODES = new Set([
  "invalid_status",
  "rejected_status",
  "ambiguous_source_url_match",
  "linked_canonical_product_missing",
  "linked_canonical_product_source_mismatch",
  "canonical_source_url_match_not_active",
]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseArgs(argv) {
  const parsed = {
    apply: false,
    jobId: "",
    reportPath: "",
  };

  for (const arg of argv) {
    if (arg === "--apply") {
      parsed.apply = true;
      continue;
    }

    if (arg.startsWith("--job-id=")) {
      parsed.jobId = arg.slice("--job-id=".length).trim();
      continue;
    }

    if (arg.startsWith("--report-path=")) {
      parsed.reportPath = arg.slice("--report-path=".length).trim();
    }
  }

  return parsed;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function makeSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

function canonicalProductUrl(product) {
  return normalizeText(product.source_url) || normalizeText(product.product_url);
}

function canonicalOutboundUrl(product) {
  return normalizeText(product.affiliate_url) || normalizeText(product.product_url);
}

function isHttpUrl(value) {
  const url = normalizeText(value);

  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isLikelyGenericOutboundUrl(value) {
  const url = normalizeText(value);
  if (!isHttpUrl(url)) {
    return false;
  }

  return GENERIC_OUTBOUND_URL_PATTERNS.some((pattern) => pattern.test(url));
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function makeMessage(code, message) {
  return { code, message };
}

function hasMessage(messages, code) {
  return messages.some((message) => message.code === code);
}

function buildQualityGate(blockers, warnings) {
  if (blockers.length) {
    return blockers.some((item) => MANUAL_REVIEW_BLOCKER_CODES.has(item.code))
      ? QUALITY_GATE.manualReviewRequired
      : QUALITY_GATE.publishBlocked;
  }

  return warnings.length
    ? QUALITY_GATE.publishAllowedWithWarning
    : QUALITY_GATE.publishReady;
}

function buildAssessment(job, productsById, productsBySourceUrl) {
  const sourceUrl = normalizeText(job.source_url);
  const status = normalizeText(job.status);
  const extractedName = normalizeText(job.extracted_name);
  const extractedBrand = normalizeText(job.extracted_brand);
  const extractedAffiliateUrl = normalizeText(job.extracted_affiliate_url);
  const extractedCategory = normalizeText(job.extracted_category);
  const extractedPrice =
    typeof job.extracted_price === "number" ? job.extracted_price : null;
  const images = toArray(job.extracted_image_urls).filter(
    (item) => typeof item === "string" && item.trim()
  );
  const blockers = [];
  const warnings = [];
  const linkedCanonicalProduct = job.published_product_id
    ? productsById.get(job.published_product_id) ?? null
    : null;
  const exactSourceMatches = sourceUrl
    ? productsBySourceUrl.get(sourceUrl) ?? []
    : [];
  const exactSourceMatch =
    exactSourceMatches.length === 1 ? exactSourceMatches[0] : null;
  const linkedCanonicalMatchesSource =
    Boolean(linkedCanonicalProduct) &&
    canonicalProductUrl(linkedCanonicalProduct) === sourceUrl;
  const exactSourceMatchIsActive =
    Boolean(exactSourceMatch) &&
    normalizeText(exactSourceMatch.status) === ACTIVE_PRODUCT_STATUS;

  if (!sourceUrl) {
    blockers.push(
      makeMessage("missing_source_url", "source_url is required for publish.")
    );
  } else if (!isHttpUrl(sourceUrl)) {
    blockers.push(
      makeMessage(
        "invalid_source_url",
        "source_url must be an http(s) PDP URL for live publish review."
      )
    );
  }

  if (!status || !ALLOWED_IMPORT_JOB_STATUSES.has(status)) {
    blockers.push(
      makeMessage(
        "invalid_status",
        `status must be one of pending_review, published, rejected. Current value: ${
          status || "null"
        }`
      )
    );
  } else if (status === IMPORT_JOB_STATUS.rejected) {
    blockers.push(
      makeMessage(
        "rejected_status",
        "rejected rows are not publishable without explicit manual rework."
      )
    );
  }

  if (!extractedName) {
    blockers.push(
      makeMessage(
        "missing_name",
        "extracted_name is required for publish."
      )
    );
  }

  if (!extractedCategory) {
    blockers.push(
      makeMessage(
        "missing_category",
        "extracted_category is required for publish approval."
      )
    );
  }

  if (extractedPrice === null || extractedPrice <= 0) {
    blockers.push(
      makeMessage(
        "missing_price",
        "A positive extracted_price is required for publish approval."
      )
    );
  }

  if (exactSourceMatches.length > 1) {
    blockers.push(
      makeMessage(
        "ambiguous_source_url_match",
        `source_url matched ${exactSourceMatches.length} canonical products. Manual review is required.`
      )
    );
  }

  if (job.published_product_id && !linkedCanonicalProduct) {
    blockers.push(
      makeMessage(
        "linked_canonical_product_missing",
        "published_product_id points to a missing canonical product."
      )
    );
  }

  if (
    linkedCanonicalProduct &&
    sourceUrl &&
    !linkedCanonicalMatchesSource &&
    !exactSourceMatch
  ) {
    blockers.push(
      makeMessage(
        "linked_canonical_product_source_mismatch",
        "published_product_id points at a canonical product with a different source_url and no exact canonical source_url match exists."
      )
    );
  }

  if (!images.length) {
    warnings.push(
      makeMessage(
        "missing_image",
        "No extracted image URLs are present. Publish remains possible, but outbound/product review should confirm the PDP is usable."
      )
    );
  }

  if (!extractedAffiliateUrl) {
    warnings.push(
      makeMessage(
        "missing_affiliate_url",
        "No extracted affiliate URL is present. Publish remains possible, but outbound review should confirm the canonical PDP target."
      )
    );
  } else if (!isHttpUrl(extractedAffiliateUrl)) {
    warnings.push(
      makeMessage(
        "invalid_affiliate_url",
        "The extracted affiliate URL is present but is not a valid http(s) URL."
      )
    );
  }

  if (!extractedBrand) {
    warnings.push(
      makeMessage(
        "missing_brand",
        "No extracted brand is present. Manual review should confirm the canonical brand field before approval."
      )
    );
  }

  if (
    [sourceUrl, extractedAffiliateUrl]
      .filter(Boolean)
      .some((value) => isLikelyGenericOutboundUrl(value))
  ) {
    warnings.push(
      makeMessage(
        "outbound_url_requires_review",
        "One or more outbound URLs look generic or category-like and should be reviewed before approval."
      )
    );
  }

  if (hasMessage(warnings, "missing_affiliate_url")) {
    warnings.push(
      makeMessage(
        "outbound_url_missing_review",
        "Outbound purchase flow should be reviewed because the staged row does not provide an affiliate URL."
      )
    );
  }

  let deterministicRemediation = null;

  if (!blockers.length) {
    if (
      status === IMPORT_JOB_STATUS.pendingReview &&
      linkedCanonicalProduct &&
      linkedCanonicalMatchesSource
    ) {
      warnings.push(
        makeMessage(
          "pending_review_already_linked",
          "pending_review row already has a valid canonical link and should be marked published."
        )
      );
      deterministicRemediation = {
        action: "sync_status_to_published_from_existing_link",
        target_published_product_id: linkedCanonicalProduct.id,
        reason:
          "published_product_id already points to the exact canonical product for this source_url.",
      };
    } else if (
      exactSourceMatch &&
      exactSourceMatchIsActive &&
      (!job.published_product_id || !linkedCanonicalMatchesSource)
    ) {
      warnings.push(
        makeMessage(
          "pending_review_already_effectively_published",
          "An active canonical product already exists for this exact source_url."
        )
      );
      deterministicRemediation = {
        action: "backfill_link_and_mark_published_from_exact_source_url_match",
        target_published_product_id: exactSourceMatch.id,
        reason:
          "Exactly one active canonical product matches the import source_url.",
      };
    } else if (
      exactSourceMatch &&
      !exactSourceMatchIsActive
    ) {
      blockers.push(
        makeMessage(
          "canonical_source_url_match_not_active",
          "A canonical source_url match exists but is not active. Manual review is required."
        )
      );
      deterministicRemediation = null;
    }
  }

  const disposition = blockers.length
    ? "manual_review_required"
    : deterministicRemediation
    ? "deterministic_reconciliation_available"
    : status === IMPORT_JOB_STATUS.published
    ? "already_consistent_published"
    : "ready_to_publish";
  const qualityGate = buildQualityGate(blockers, warnings);
  const outboundReviewRequired = warnings.some((item) =>
    ["missing_affiliate_url", "invalid_affiliate_url", "outbound_url_requires_review", "outbound_url_missing_review"].includes(
      item.code
    )
  );

  return {
    job_id: job.id,
    source_url: sourceUrl,
    status: status || null,
    extracted_name: extractedName || null,
    extracted_brand: extractedBrand || null,
    extracted_category: extractedCategory || null,
    extracted_price: extractedPrice,
    published_product_id: job.published_product_id ?? null,
    linked_canonical_product_id: linkedCanonicalProduct?.id ?? null,
    exact_source_url_match_product_id: exactSourceMatch?.id ?? null,
    exact_source_url_match_count: exactSourceMatches.length,
    publish_ready: disposition === "ready_to_publish",
    disposition,
    quality_gate: qualityGate,
    outbound_review_required: outboundReviewRequired,
    blockers,
    warnings,
    deterministic_remediation: deterministicRemediation,
  };
}

async function fetchOperationalState(supabase) {
  const { data: jobs, error: jobsError } = await supabase
    .from("import_jobs")
    .select(
      [
        "id",
        "source_url",
        "status",
        "published_product_id",
        "extracted_name",
        "extracted_brand",
        "extracted_image_urls",
        "extracted_affiliate_url",
        "extracted_category",
        "extracted_price",
        "review_note",
        "created_at",
      ].join(", ")
    )
    .order("created_at", { ascending: false });

  if (jobsError) throw jobsError;

  const { data: products, error: productsError } = await supabase
    .from("furniture_products")
    .select(
      [
        "id",
        "source_url",
        "product_url",
        "affiliate_url",
        "status",
        "product_name",
        "category",
        "price",
        "image_url",
      ].join(", ")
    );

  if (productsError) throw productsError;

  const productsById = new Map();
  const productsBySourceUrl = new Map();

  for (const product of products ?? []) {
    productsById.set(product.id, product);
    const key = canonicalProductUrl(product);
    if (!key) continue;
    const current = productsBySourceUrl.get(key) ?? [];
    current.push(product);
    productsBySourceUrl.set(key, current);
  }

  return {
    jobs: jobs ?? [],
    products: products ?? [],
    productsById,
    productsBySourceUrl,
  };
}

function summarizeAssessments(assessments) {
  const summary = {
    total_jobs: assessments.length,
    status_counts: {},
    disposition_counts: {},
    quality_gate_counts: {},
    blocker_counts: {},
    warning_counts: {},
    remediation_action_counts: {},
  };

  for (const assessment of assessments) {
    summary.status_counts[assessment.status ?? "null"] =
      (summary.status_counts[assessment.status ?? "null"] ?? 0) + 1;
    summary.disposition_counts[assessment.disposition] =
      (summary.disposition_counts[assessment.disposition] ?? 0) + 1;
    summary.quality_gate_counts[assessment.quality_gate] =
      (summary.quality_gate_counts[assessment.quality_gate] ?? 0) + 1;

    for (const blocker of assessment.blockers) {
      summary.blocker_counts[blocker.code] =
        (summary.blocker_counts[blocker.code] ?? 0) + 1;
    }

    for (const warning of assessment.warnings) {
      summary.warning_counts[warning.code] =
        (summary.warning_counts[warning.code] ?? 0) + 1;
    }

    if (assessment.deterministic_remediation) {
      const action = assessment.deterministic_remediation.action;
      summary.remediation_action_counts[action] =
        (summary.remediation_action_counts[action] ?? 0) + 1;
    }
  }

  return summary;
}

async function writeReportIfRequested(reportPath, payload) {
  if (!reportPath) return;
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function summarizeQueues(assessments) {
  const pick = (assessment) => ({
    job_id: assessment.job_id,
    source_url: assessment.source_url,
    status: assessment.status,
    quality_gate: assessment.quality_gate,
    disposition: assessment.disposition,
    blockers: assessment.blockers,
    warnings: assessment.warnings,
  });

  return {
    publish_ready_rows: assessments
      .filter((item) => item.quality_gate === QUALITY_GATE.publishReady)
      .map(pick),
    publish_allowed_with_warning_rows: assessments
      .filter((item) => item.quality_gate === QUALITY_GATE.publishAllowedWithWarning)
      .map(pick),
    publish_blocked_rows: assessments
      .filter((item) => item.quality_gate === QUALITY_GATE.publishBlocked)
      .map(pick),
    manual_review_rows: assessments
      .filter((item) => item.quality_gate === QUALITY_GATE.manualReviewRequired)
      .map(pick),
    outbound_review_rows: assessments
      .filter((item) => item.outbound_review_required)
      .map(pick),
  };
}

function buildPostPublishVerification(job, canonicalProduct) {
  const checks = [];
  const sourceUrl = normalizeText(job?.source_url);
  const canonicalSourceUrl = canonicalProductUrl(canonicalProduct ?? {});
  const outboundUrl = canonicalOutboundUrl(canonicalProduct ?? {});

  checks.push({
    code: "import_job_status_published",
    ok: normalizeText(job?.status) === IMPORT_JOB_STATUS.published,
    severity: "error",
    message: "import_jobs.status must be published after publish.",
  });
  checks.push({
    code: "import_job_link_present",
    ok: Boolean(job?.published_product_id),
    severity: "error",
    message: "import_jobs.published_product_id must be present after publish.",
  });
  checks.push({
    code: "canonical_product_exists",
    ok: Boolean(canonicalProduct?.id),
    severity: "error",
    message: "Linked canonical furniture_products row must exist.",
  });
  checks.push({
    code: "canonical_product_active",
    ok: normalizeText(canonicalProduct?.status) === ACTIVE_PRODUCT_STATUS,
    severity: "error",
    message: "Linked canonical furniture_products row must be active.",
  });
  checks.push({
    code: "canonical_source_url_matches",
    ok: Boolean(sourceUrl) && canonicalSourceUrl === sourceUrl,
    severity: "error",
    message: "Canonical source_url or product_url must match the staged source_url.",
  });
  checks.push({
    code: "canonical_product_name_present",
    ok: Boolean(normalizeText(canonicalProduct?.product_name)),
    severity: "error",
    message: "Canonical product_name must be present.",
  });
  checks.push({
    code: "canonical_category_present",
    ok: Boolean(normalizeText(canonicalProduct?.category)),
    severity: "error",
    message: "Canonical category must be present.",
  });
  checks.push({
    code: "canonical_price_present",
    ok:
      typeof canonicalProduct?.price === "number" &&
      Number.isFinite(canonicalProduct.price) &&
      canonicalProduct.price > 0,
    severity: "error",
    message: "Canonical price must be present and positive.",
  });
  checks.push({
    code: "canonical_image_present",
    ok: Boolean(normalizeText(canonicalProduct?.image_url)),
    severity: "warning",
    message: "Canonical image_url should be present for publish quality.",
  });
  checks.push({
    code: "canonical_outbound_present",
    ok: Boolean(normalizeText(outboundUrl)),
    severity: "warning",
    message: "Canonical outbound URL should be present and reviewable.",
  });
  checks.push({
    code: "canonical_outbound_http",
    ok: !outboundUrl || isHttpUrl(outboundUrl),
    severity: "warning",
    message: "Canonical outbound URL should be a valid http(s) URL.",
  });
  checks.push({
    code: "canonical_outbound_not_generic",
    ok: !outboundUrl || !isLikelyGenericOutboundUrl(outboundUrl),
    severity: "warning",
    message: "Canonical outbound URL should not obviously point to a generic category or search page.",
  });

  const failures = checks.filter((item) => !item.ok && item.severity === "error");
  const warnings = checks.filter((item) => !item.ok && item.severity === "warning");

  return {
    ok: failures.length === 0,
    warnings_present: warnings.length > 0,
    canonical_product_id: canonicalProduct?.id ?? null,
    outbound_url: outboundUrl || null,
    failures,
    warnings,
    checks,
  };
}

async function runAudit(args) {
  const supabase = makeSupabaseAdminClient();
  const state = await fetchOperationalState(supabase);
  const assessments = state.jobs.map((job) =>
    buildAssessment(job, state.productsById, state.productsBySourceUrl)
  );
  const report = {
    generated_at: new Date().toISOString(),
    mode: "audit",
    summary: summarizeAssessments(assessments),
    queues: summarizeQueues(assessments),
    rows: assessments,
  };

  await writeReportIfRequested(args.reportPath, report);
  console.log(JSON.stringify(report, null, 2));
}

async function runVerifyPublish(args) {
  if (!args.jobId) {
    throw new Error("--job-id=<uuid> is required for verify-publish mode");
  }

  const supabase = makeSupabaseAdminClient();
  const state = await fetchOperationalState(supabase);
  const job = state.jobs.find((item) => item.id === args.jobId);

  if (!job) {
    throw new Error(`Import job not found: ${args.jobId}`);
  }

  const canonicalProduct = job.published_product_id
    ? state.productsById.get(job.published_product_id) ?? null
    : null;
  const verification = buildPostPublishVerification(job, canonicalProduct);
  const report = {
    generated_at: new Date().toISOString(),
    mode: "verify-publish",
    job_id: args.jobId,
    import_job: {
      id: job.id,
      source_url: normalizeText(job.source_url) || null,
      status: normalizeText(job.status) || null,
      published_product_id: job.published_product_id ?? null,
      extracted_name: normalizeText(job.extracted_name) || null,
      extracted_category: normalizeText(job.extracted_category) || null,
      extracted_price:
        typeof job.extracted_price === "number" ? job.extracted_price : null,
    },
    canonical_product: canonicalProduct
      ? {
          id: canonicalProduct.id,
          source_url: normalizeText(canonicalProduct.source_url) || null,
          product_url: normalizeText(canonicalProduct.product_url) || null,
          affiliate_url: normalizeText(canonicalProduct.affiliate_url) || null,
          status: normalizeText(canonicalProduct.status) || null,
          product_name: normalizeText(canonicalProduct.product_name) || null,
          category: normalizeText(canonicalProduct.category) || null,
          price:
            typeof canonicalProduct.price === "number"
              ? canonicalProduct.price
              : null,
          image_url: normalizeText(canonicalProduct.image_url) || null,
        }
      : null,
    verification,
  };

  await writeReportIfRequested(args.reportPath, report);
  console.log(JSON.stringify(report, null, 2));

  if (!verification.ok) {
    process.exit(1);
  }
}

async function applyDeterministicRemediation(supabase, assessment) {
  const remediation = assessment.deterministic_remediation;

  if (!remediation) {
    throw new Error(`No deterministic remediation exists for ${assessment.job_id}`);
  }

  const patch = {
    status: IMPORT_JOB_STATUS.published,
    published_product_id: remediation.target_published_product_id,
  };

  const { data, error } = await supabase
    .from("import_jobs")
    .update(patch)
    .eq("id", assessment.job_id)
    .select("id, status, published_product_id")
    .single();

  if (error) throw error;

  return {
    job_id: assessment.job_id,
    action: remediation.action,
    reason: remediation.reason,
    patch,
    updated_row: data,
  };
}

async function runRemediation(args) {
  const supabase = makeSupabaseAdminClient();
  const state = await fetchOperationalState(supabase);
  let assessments = state.jobs.map((job) =>
    buildAssessment(job, state.productsById, state.productsBySourceUrl)
  );

  if (args.jobId) {
    assessments = assessments.filter((item) => item.job_id === args.jobId);
  }

  const remediationCandidates = assessments.filter(
    (item) => item.deterministic_remediation
  );

  const result = {
    generated_at: new Date().toISOString(),
    mode: "remediate",
    apply: args.apply,
    remediation_candidates: remediationCandidates.map((item) => ({
      job_id: item.job_id,
      source_url: item.source_url,
      status: item.status,
      remediation: item.deterministic_remediation,
    })),
    applied: [],
  };

  if (args.apply) {
    for (const candidate of remediationCandidates) {
      result.applied.push(
        await applyDeterministicRemediation(supabase, candidate)
      );
    }
  }

  await writeReportIfRequested(args.reportPath, result);
  console.log(JSON.stringify(result, null, 2));
}

async function runPublish(args) {
  if (!args.jobId) {
    throw new Error("--job-id=<uuid> is required for publish mode");
  }

  const supabase = makeSupabaseAdminClient();
  const state = await fetchOperationalState(supabase);
  const job = state.jobs.find((item) => item.id === args.jobId);

  if (!job) {
    throw new Error(`Import job not found: ${args.jobId}`);
  }

  const assessment = buildAssessment(
    job,
    state.productsById,
    state.productsBySourceUrl
  );

  const report = {
    generated_at: new Date().toISOString(),
    mode: "publish",
    job_id: args.jobId,
    assessment,
    outcome: null,
  };

  if (assessment.blockers.length) {
    report.outcome = {
      status: "blocked",
      blockers: assessment.blockers,
    };
    await writeReportIfRequested(args.reportPath, report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  if (assessment.deterministic_remediation) {
    if (!args.apply) {
      report.outcome = {
        status: "dry_run_reconciliation",
        remediation: assessment.deterministic_remediation,
      };
    } else {
      report.outcome = {
        status: "reconciled_existing_canonical_product",
        remediation: await applyDeterministicRemediation(supabase, assessment),
      };
    }

    await writeReportIfRequested(args.reportPath, report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!args.apply) {
    report.outcome = {
      status: "dry_run_publish_ready",
      app_base_url: process.env.APP_BASE_URL?.trim() || "http://127.0.0.1:3000",
    };
    await writeReportIfRequested(args.reportPath, report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const adminToken = requireEnv("ADMIN_TOKEN");
  const appBaseUrl = normalizeText(process.env.APP_BASE_URL) || "http://127.0.0.1:3000";
  const response = await fetch(
    `${appBaseUrl}/api/admin/import-jobs/${args.jobId}/publish`,
    {
      method: "POST",
      headers: {
        "x-admin-token": adminToken,
      },
    }
  );

  const responseText = await response.text();
  let responseJson = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseJson = { raw: responseText };
  }

  report.outcome = {
    status: response.ok ? "published" : "publish_failed",
    http_status: response.status,
    response: responseJson,
  };

  if (response.ok) {
    const refreshedState = await fetchOperationalState(supabase);
    const refreshedJob = refreshedState.jobs.find((item) => item.id === args.jobId);
    const canonicalProduct = refreshedJob?.published_product_id
      ? refreshedState.productsById.get(refreshedJob.published_product_id) ?? null
      : null;
    report.post_publish_verification = buildPostPublishVerification(
      refreshedJob ?? null,
      canonicalProduct
    );
  }

  await writeReportIfRequested(args.reportPath, report);
  console.log(JSON.stringify(report, null, 2));

  if (!response.ok) {
    process.exit(1);
  }
}

const mode = process.argv[2] ?? "audit";
const args = parseArgs(process.argv.slice(3));

if (mode === "audit") {
  await runAudit(args);
} else if (mode === "remediate") {
  await runRemediation(args);
} else if (mode === "publish") {
  await runPublish(args);
} else if (mode === "verify-publish") {
  await runVerifyPublish(args);
} else {
  throw new Error(`Unsupported mode: ${mode}`);
}
