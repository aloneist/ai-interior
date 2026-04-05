import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const SNAPSHOT_PATH = path.join(
  ROOT_DIR,
  "automation/supabase-readiness-snapshot.json"
)
const SUMMARY_PATH = path.join(
  ROOT_DIR,
  "automation/supabase-readiness-summary.md"
)

const TARGET_TABLES = [
  {
    name: "furniture_products",
    purpose: "Catalog product ingest and save path.",
    sourcePaths: [
      "app/api/test-save-product/route.ts",
      "automation/providers/supabase/catalog-read-stub.ts",
      "automation/demo/run-connection-loop-validation.mjs",
    ],
    sampleColumns: [
      "id",
      "product_name",
      "brand",
      "category",
      "status",
      "updated_at",
    ],
    filteredCounts: [
      {
        label: "active",
        filter: {
          column: "status",
          operator: "eq",
          value: "active",
        },
      },
    ],
  },
  {
    name: "furniture_vectors",
    purpose: "Recommendation scoring vector surface.",
    sourcePaths: [
      "app/api/recommend/route.ts",
      "app/api/recommend-space/route.ts",
      "app/api/mvp/route.ts",
    ],
    sampleColumns: [
      "furniture_id",
      "vector_version",
      "brightness_compatibility",
      "minimalism_score",
      "updated_at",
    ],
  },
  {
    name: "furniture",
    purpose: "Furniture record joined from recommendation vectors.",
    sourcePaths: [
      "app/api/analyze-furniture/route.ts",
      "app/api/recommend/route.ts",
      "app/api/mvp/route.ts",
    ],
    sampleColumns: ["id", "name", "brand", "category", "product_key", "created_at"],
  },
  {
    name: "spaces",
    purpose: "Room analysis persistence before recommendation.",
    sourcePaths: [
      "app/api/analyze-space/route.ts",
      "app/api/recommend-space/route.ts",
      "app/api/mvp/route.ts",
    ],
    sampleColumns: ["id", "image_url", "brightness_score", "minimalism_score", "created_at"],
  },
  {
    name: "recommendations",
    purpose: "Recommendation click logging and result persistence.",
    sourcePaths: ["app/api/log-click/route.ts", "app/api/mvp/route.ts"],
    sampleColumns: ["id", "request_id", "product_key", "score", "clicked", "created_at"],
  },
  {
    name: "import_jobs",
    purpose: "Imported product normalization and review queue.",
    sourcePaths: ["app/api/import-product/route.ts"],
    sampleColumns: [
      "id",
      "source_url",
      "extracted_product_name",
      "status",
      "created_at",
      "updated_at",
    ],
  },
]

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

async function loadEnvFileIfPresent(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      const separatorIndex = trimmed.indexOf("=")
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      if (!key || process.env[key]) continue

      let value = trimmed.slice(separatorIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      process.env[key] = value
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error
    }
  }
}

async function loadSupabaseEnv() {
  await loadEnvFileIfPresent(path.join(ROOT_DIR, ".env.local"))
  await loadEnvFileIfPresent(path.join(ROOT_DIR, ".env"))
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required for Supabase readiness snapshot`)
  }

  return value
}

function buildClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

async function fetchOpenApiDocument() {
  const url = `${requireEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1/`
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const response = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/openapi+json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `Supabase OpenAPI fetch failed with ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

function buildTableCatalog(openApiDocument) {
  const definitions = openApiDocument.definitions ?? {}
  return new Map(Object.entries(definitions))
}

function buildColumnSnapshot(tableDefinition) {
  const requiredColumns = new Set(tableDefinition.required ?? [])
  const properties = tableDefinition.properties ?? {}

  return Object.entries(properties).map(([name, property], index) => ({
    name,
    dataType: property.type ?? property.format ?? "unknown",
    nullable: property["x-nullable"] === true || !requiredColumns.has(name),
    default: property.default ?? null,
    ordinalPosition: index + 1,
  }))
}

function applyFilter(query, filter) {
  if (!filter) return query

  if (filter.operator === "eq") {
    return query.eq(filter.column, filter.value)
  }

  throw new Error(`Unsupported filter operator: ${filter.operator}`)
}

async function fetchRowCount(client, tableName, filter) {
  const query = applyFilter(
    client.from(tableName).select("*", { count: "exact", head: true }),
    filter
  )
  const { count, error } = await query

  if (error) throw error

  return count ?? 0
}

async function fetchSampleRow(client, tableName, availableColumns, preferredColumns) {
  const sampleColumns = (preferredColumns ?? []).filter((column) =>
    availableColumns.some((available) => available.name === column)
  )

  const selectedColumns =
    sampleColumns.length > 0
      ? sampleColumns
      : availableColumns.slice(0, 6).map((column) => column.name)

  if (!selectedColumns.length) {
    return null
  }

  const { data, error } = await client
    .from(tableName)
    .select(selectedColumns.join(", "))
    .limit(1)

  if (error) throw error

  return data?.[0] ?? null
}

function buildConclusion(tableSnapshots) {
  const missingTables = tableSnapshots.filter((table) => !table.exists)
  const emptyCriticalTables = tableSnapshots.filter(
    (table) =>
      ["furniture_products", "furniture_vectors"].includes(table.table) &&
      table.exists &&
      (table.counts.total ?? 0) === 0
  )

  if (missingTables.length > 0) {
    return {
      status: "blocked",
      summary: `Missing required public tables: ${missingTables
        .map((table) => table.table)
        .join(", ")}.`,
    }
  }

  if (emptyCriticalTables.length > 0) {
    return {
      status: "partial",
      summary: `Direct schema reads work, but critical tables are empty: ${emptyCriticalTables
        .map((table) => table.table)
        .join(", ")}.`,
    }
  }

  return {
    status: "ready",
    summary:
      "Direct schema reads, row counts, and current table samples are available for the current Supabase development surfaces.",
  }
}

function buildSummary(snapshot) {
  const lines = [
    "# Supabase Direct Readiness Summary",
    "",
    `- Generated: ${snapshot.generatedAt}`,
    `- Command: \`npm run supabase:readiness:snapshot\``,
    `- Conclusion: ${snapshot.conclusion.status} - ${snapshot.conclusion.summary}`,
    "",
    "## Table Readiness",
  ]

  for (const table of snapshot.tables) {
    const columnPreview = table.columns.slice(0, 8).map((column) => column.name).join(", ")
    const filteredCounts = Object.entries(table.counts.filtered ?? {})
      .map(([label, value]) => `${label}=${value}`)
      .join(", ")

    lines.push(
      `- \`${table.table}\`: ${table.exists ? "present" : "missing"}, total=${table.counts.total}${filteredCounts ? `, ${filteredCounts}` : ""}, columns=${table.columns.length}, sample_row=${table.sampleRow ? "present" : "empty"}`
    )

    if (columnPreview) {
      lines.push(`  columns: ${columnPreview}`)
    }

    lines.push(`  purpose: ${table.purpose}`)
  }

  lines.push("", "## Blockers", ...snapshot.blockers.map((item) => `- ${item}`))
  lines.push("", "## Non-Blockers", ...snapshot.nonBlockers.map((item) => `- ${item}`))

  return `${lines.join("\n")}\n`
}

async function main() {
  await loadSupabaseEnv()

  const client = buildClient()
  const openApiDocument = await fetchOpenApiDocument()
  const catalog = buildTableCatalog(openApiDocument)
  const tableSnapshots = []

  for (const table of TARGET_TABLES) {
    const catalogRow = catalog.get(table.name)
    const exists = Boolean(catalogRow)

    if (!exists) {
      tableSnapshots.push({
        table: table.name,
        exists: false,
        purpose: table.purpose,
        sourcePaths: table.sourcePaths,
        columns: [],
        counts: {
          total: 0,
          filtered: {},
        },
        sampleRow: null,
      })
      continue
    }

    const columns = buildColumnSnapshot(catalogRow)
    const totalCount = await fetchRowCount(client, table.name)
    const filteredCounts = {}

    for (const countTarget of table.filteredCounts ?? []) {
      filteredCounts[countTarget.label] = await fetchRowCount(
        client,
        table.name,
        countTarget.filter
      )
    }

    const sampleRow = await fetchSampleRow(
      client,
      table.name,
      columns,
      table.sampleColumns
    )

    tableSnapshots.push({
      table: table.name,
      exists: true,
      purpose: table.purpose,
      sourcePaths: table.sourcePaths,
      columns,
      counts: {
        total: totalCount,
        filtered: filteredCounts,
      },
      sampleRow,
    })
  }

  const conclusion = buildConclusion(tableSnapshots)
  const blockers = []
  const nonBlockers = []

  for (const table of tableSnapshots) {
    if (!table.exists) {
      blockers.push(`${table.table} is missing from the public schema.`)
      continue
    }

    if (table.table === "furniture_products" && (table.counts.filtered.active ?? 0) === 0) {
      blockers.push(
        "furniture_products currently has 0 active rows, so the catalog read path has no live active inventory."
      )
    } else if (table.table === "furniture_products") {
      nonBlockers.push(
        `furniture_products active catalog rows are reachable (${table.counts.filtered.active}).`
      )
    }

    if (table.table === "furniture_vectors" && (table.counts.total ?? 0) === 0) {
      blockers.push(
        "furniture_vectors is reachable but empty, so recommendation scoring cannot use live vectors yet."
      )
    } else if (table.table === "furniture_vectors") {
      nonBlockers.push(
        `furniture_vectors is reachable with ${table.counts.total} rows.`
      )
    }
  }

  if (blockers.length === 0) {
    blockers.push("No hard blockers were detected in the inspected Supabase surfaces.")
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    command: "npm run supabase:readiness:snapshot",
    artifacts: {
      snapshot: path.relative(ROOT_DIR, SNAPSHOT_PATH),
      summary: path.relative(ROOT_DIR, SUMMARY_PATH),
    },
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    conclusion,
    tables: tableSnapshots,
    blockers,
    nonBlockers,
  }

  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")
  await fs.writeFile(SUMMARY_PATH, buildSummary(snapshot), "utf8")

  console.log(`Wrote ${path.relative(ROOT_DIR, SNAPSHOT_PATH)}`)
  console.log(`Wrote ${path.relative(ROOT_DIR, SUMMARY_PATH)}`)
  console.log(`${conclusion.status}: ${conclusion.summary}`)
}

main().catch((error) => {
  console.error("Supabase readiness snapshot failed.")
  console.error(formatError(error))
  process.exitCode = 1
})
