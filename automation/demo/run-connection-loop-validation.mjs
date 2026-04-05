import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { v2 as cloudinary } from "cloudinary"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "../..")
const DEFAULT_REPORT_PATH = path.join(
  ROOT_DIR,
  "automation/connection-loop-readiness.json"
)

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

function hasEnv(name) {
  return Boolean(process.env[name]?.trim())
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }

  return String(error)
}

async function validateSupabaseConnection() {
  const env = {
    url: hasEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRole: hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
  }

  if (!env.url || !env.serviceRole) {
    return {
      status: "not_configured",
      isReady: false,
      hardBlocker: true,
      env,
      checks: [],
      note: "Supabase admin env is missing, so current catalog/runtime data access is not ready.",
    }
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const checks = []
  const warnings = []

  try {
    const [catalogResult, vectorsResult] = await Promise.all([
      client
        .from("furniture_products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      client
        .from("furniture_vectors")
        .select("furniture_id", { count: "exact", head: true }),
    ])

    if (catalogResult.error) throw catalogResult.error
    if (vectorsResult.error) throw vectorsResult.error

    checks.push({
      id: "catalog-read-gateway",
      status: "pass",
      detail: `furniture_products active count reachable (${catalogResult.count ?? 0})`,
    })
    checks.push({
      id: "mvp-vector-surface",
      status: "pass",
      detail: `furniture_vectors reachable (${vectorsResult.count ?? 0})`,
    })

    if ((catalogResult.count ?? 0) === 0) {
      warnings.push(
        "The automation read-only catalog gateway is connected but currently sees 0 active furniture_products rows."
      )
    }

    return {
      status: "ready",
      isReady: true,
      hardBlocker: false,
      env,
      checks,
      warnings,
      note: "Supabase read-only catalog access and current vector surface are both reachable.",
    }
  } catch (error) {
    const message = formatError(error)

    return {
      status: "failed",
      isReady: false,
      hardBlocker: true,
      env,
      checks,
      note: "Supabase env exists but the current repository surfaces were not reachable.",
      error: message,
    }
  }
}

async function validateCloudinaryConnection() {
  const env = {
    name: hasEnv("CLOUDINARY_NAME"),
    key: hasEnv("CLOUDINARY_KEY"),
    secret: hasEnv("CLOUDINARY_SECRET"),
  }

  if (!env.name || !env.key || !env.secret) {
    return {
      status: "not_configured",
      isReady: false,
      hardBlocker: false,
      relevance: "optional_for_current_main_phase",
      env,
      note: "Cloudinary is scaffolded, but it is not a hard blocker for starting recommendation/data/QA work.",
    }
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    })

    const result = await cloudinary.api.ping()

    return {
      status: "ready",
      isReady: true,
      hardBlocker: false,
      relevance: "optional_for_current_main_phase",
      env,
      note: `Cloudinary admin ping succeeded (${result.status ?? "ok"}).`,
    }
  } catch (error) {
    const message = formatError(error)

    return {
      status: "failed",
      isReady: false,
      hardBlocker: false,
      relevance: "optional_for_current_main_phase",
      env,
      note: "Cloudinary env exists but the current asset-search scaffold was not reachable.",
      error: message,
    }
  }
}

async function validateOpenAIConnectionSurface() {
  return {
    status: hasEnv("OPENAI_API_KEY") ? "configured" : "not_configured",
    isReady: hasEnv("OPENAI_API_KEY"),
    hardBlocker: !hasEnv("OPENAI_API_KEY"),
    note: hasEnv("OPENAI_API_KEY")
      ? "OPENAI_API_KEY is present for the current room-analysis/recommendation path."
      : "OPENAI_API_KEY is missing, so the current /api/mvp room-analysis path is not ready.",
  }
}

async function validateExecutionLoop() {
  const loopChecks = [
    {
      id: "task-instruction",
      label: "Task instruction path",
      paths: ["AGENTS.md", "docs/tasks"],
      note: "Task files plus repo operating rules exist.",
    },
    {
      id: "codex-generation",
      label: "Codex code-generation path",
      paths: ["docs/ops/personal-codex-runbook.md", "package.json"],
      note: "Codex operating guidance and runnable repo scripts exist.",
    },
    {
      id: "automated-validation",
      label: "Automated validation path",
      paths: ["package.json", "automation/review-checklist.md"],
      note: "Lint/typecheck and automation validation surfaces are defined.",
    },
    {
      id: "user-review",
      label: "User review path",
      paths: ["automation/review-checklist.md", "automation/operator-runbook.md"],
      note: "Review checklist and operator runbook exist.",
    },
    {
      id: "final-approval",
      label: "Final approval path",
      paths: [
        "automation/final-review.md",
        "automation/baseline-approval.md",
        "automation/baseline-closeout.md",
        "automation/change-log-template.md",
      ],
      note: "Final review, approval, closeout, and recording surfaces exist.",
    },
  ]

  const results = []

  for (const check of loopChecks) {
    const resolved = await Promise.all(
      check.paths.map(async (targetPath) => ({
        path: targetPath,
        present: await fileExists(path.join(ROOT_DIR, targetPath)),
      }))
    )

    const passed = resolved.every((entry) => entry.present)

    results.push({
      id: check.id,
      label: check.label,
      status: passed ? "ready" : "missing_surface",
      isReady: passed,
      note: check.note,
      paths: resolved,
    })
  }

  return {
    status: results.every((item) => item.isReady) ? "ready" : "incomplete",
    isReady: results.every((item) => item.isReady),
    checks: results,
  }
}

function buildConclusion({ supabase, cloudinary, openai, executionLoop }) {
  const blockers = []
  const gaps = []

  if (!supabase.isReady) {
    blockers.push(
      "Supabase is not fully ready for current catalog/vector-backed development surfaces."
    )
  }

  if (!openai.isReady) {
    blockers.push("OpenAI env is not ready for the current /api/mvp analysis path.")
  }

  if (!executionLoop.isReady) {
    blockers.push("The documented human/Codex execution loop is incomplete.")
  }

  for (const warning of supabase.warnings ?? []) {
    gaps.push(warning)
  }

  const overallStatus = blockers.length === 0 ? "go" : "no_go"

  return {
    overallStatus,
    blockers,
    gaps,
    goNoGoReason:
      overallStatus === "go"
        ? "The current repo has the minimum connection and loop surfaces needed to start real main-development work."
        : "One or more hard blockers still prevent a clean start to real main-development work.",
    cloudinaryNote:
      cloudinary.status === "ready"
        ? "Cloudinary is connected."
        : "Cloudinary is scaffolded but not required for the immediate next main-phase recommendation/data/QA batches.",
  }
}

async function main() {
  const [supabase, cloudinary, openai, executionLoop] = await Promise.all([
    validateSupabaseConnection(),
    validateCloudinaryConnection(),
    validateOpenAIConnectionSurface(),
    validateExecutionLoop(),
  ])

  const conclusion = buildConclusion({
    supabase,
    cloudinary,
    openai,
    executionLoop,
  })

  const report = {
    generatedAt: new Date().toISOString(),
    command: "npm run automation:connection:validate",
    reportKind: "automation_connection_loop_readiness",
    purpose: "program_connection_and_human_codex_loop_validation",
    overallStatus: conclusion.overallStatus,
    summary: {
      supabase: supabase.status,
      cloudinary: cloudinary.status,
      openai: openai.status,
      executionLoop: executionLoop.status,
    },
    connections: {
      supabase,
      cloudinary,
      openai,
    },
    executionLoop,
    conclusion,
  }

  const outputPath =
    process.env.AUTOMATION_CONNECTION_READINESS_REPORT_PATH || DEFAULT_REPORT_PATH

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`)

  console.log("FINAL SUMMARY")
  console.log(`- overall: ${conclusion.overallStatus.toUpperCase()}`)
  console.log(`- supabase: ${supabase.status}`)
  console.log(`- openai: ${openai.status}`)
  console.log(`- cloudinary: ${cloudinary.status}`)
  console.log(`- execution loop: ${executionLoop.status}`)
  console.log(`- report file: ${outputPath}`)

  if (conclusion.blockers.length > 0) {
    console.log("BLOCKERS")
    for (const blocker of conclusion.blockers) {
      console.log(`- ${blocker}`)
    }
  }

  console.log("JSON REPORT")
  console.log(JSON.stringify(report, null, 2))

  process.exitCode = conclusion.overallStatus === "go" ? 0 : 1
}

main().catch((error) => {
  console.error("Connection and loop validation failed")
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
