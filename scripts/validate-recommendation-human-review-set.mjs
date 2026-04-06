import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "..")
const REVIEW_SET_PATH = path.join(
  ROOT_DIR,
  "data/qa/recommendation-human-review-set-v1.json"
)

const REQUIRED_DIMENSIONS = new Set([
  "category",
  "budget",
  "style",
  "room-type",
  "mixed",
  "weak-result",
])

const VALID_ROOM_TYPES = new Set(["living", "bedroom", "workspace", "dining"])
const VALID_STYLES = new Set([
  "minimal",
  "bright",
  "warm-wood",
  "calm",
  "modern",
  "hotel",
])
const VALID_BUDGETS = new Set(["low", "medium", "high"])
const VALID_FURNITURE = new Set(["sofa", "chair", "table"])
const REQUIRED_ROOM_TARGETS = [
  "brightness",
  "temperature",
  "footprint",
  "minimalism",
  "contrast",
  "colorfulness",
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertArray(value, message) {
  assert(Array.isArray(value), message)
  return value
}

function assertNumber(value, message) {
  assert(typeof value === "number" && Number.isFinite(value), message)
}

function validateCase(reviewCase, index) {
  assert(typeof reviewCase.caseId === "string", `case ${index} missing caseId`)
  assert(
    typeof reviewCase.dimension === "string",
    `${reviewCase.caseId} missing dimension`
  )
  assert(
    REQUIRED_DIMENSIONS.has(reviewCase.dimension),
    `${reviewCase.caseId} has unsupported dimension ${reviewCase.dimension}`
  )
  assert(typeof reviewCase.scenario === "string", `${reviewCase.caseId} missing scenario`)
  assert(
    typeof reviewCase.input === "object" && reviewCase.input !== null,
    `${reviewCase.caseId} missing input`
  )
  assert(
    VALID_ROOM_TYPES.has(reviewCase.input.roomType),
    `${reviewCase.caseId} has unsupported roomType`
  )
  assert(
    VALID_BUDGETS.has(reviewCase.input.budget),
    `${reviewCase.caseId} has unsupported budget`
  )

  for (const style of assertArray(
    reviewCase.input.styles,
    `${reviewCase.caseId} styles must be an array`
  )) {
    assert(VALID_STYLES.has(style), `${reviewCase.caseId} has unsupported style ${style}`)
  }

  for (const item of assertArray(
    reviewCase.input.furniture,
    `${reviewCase.caseId} furniture must be an array`
  )) {
    assert(
      VALID_FURNITURE.has(item),
      `${reviewCase.caseId} has unsupported furniture ${item}`
    )
  }

  assert(
    typeof reviewCase.input.requestText === "string" &&
      reviewCase.input.requestText.trim().length > 0,
    `${reviewCase.caseId} missing requestText`
  )

  if (reviewCase.roomTargets !== undefined) {
    assert(
      typeof reviewCase.roomTargets === "object" && reviewCase.roomTargets !== null,
      `${reviewCase.caseId} roomTargets must be an object`
    )

    for (const targetName of REQUIRED_ROOM_TARGETS) {
      assertNumber(
        reviewCase.roomTargets[targetName],
        `${reviewCase.caseId} roomTargets.${targetName} must be a number`
      )
      assert(
        reviewCase.roomTargets[targetName] >= 0 &&
          reviewCase.roomTargets[targetName] <= 100,
        `${reviewCase.caseId} roomTargets.${targetName} must be between 0 and 100`
      )
    }
  }

  const expectations = reviewCase.expectations
  assert(
    typeof expectations === "object" && expectations !== null,
    `${reviewCase.caseId} missing expectations`
  )

  assertNumber(
    expectations.top3PreferredCategoryMin,
    `${reviewCase.caseId} missing top3PreferredCategoryMin`
  )
  assertNumber(
    expectations.top3WithinBudgetMin,
    `${reviewCase.caseId} missing top3WithinBudgetMin`
  )
  assertNumber(
    expectations.top3StyleFitMin,
    `${reviewCase.caseId} missing top3StyleFitMin`
  )
  assertNumber(
    expectations.top3RoomFitMin,
    `${reviewCase.caseId} missing top3RoomFitMin`
  )
  assert(
    typeof expectations.weakResultAllowed === "boolean",
    `${reviewCase.caseId} missing weakResultAllowed`
  )

  if (expectations.expectedWeakReasons !== undefined) {
    assertArray(
      expectations.expectedWeakReasons,
      `${reviewCase.caseId} expectedWeakReasons must be an array`
    )
  }

  assert(
    assertArray(
      reviewCase.humanReviewFocus,
      `${reviewCase.caseId} humanReviewFocus must be an array`
    ).length >= 2,
    `${reviewCase.caseId} needs at least two humanReviewFocus bullets`
  )
}

async function main() {
  const raw = await fs.readFile(REVIEW_SET_PATH, "utf8")
  const reviewSet = JSON.parse(raw)

  assert(reviewSet.version === "v1", "review set version must be v1")
  assert(typeof reviewSet.title === "string", "review set missing title")
  assertArray(reviewSet.cases, "review set cases must be an array")
  assert(reviewSet.cases.length >= 6, "review set needs at least six cases")

  const seenCaseIds = new Set()
  const seenDimensions = new Set()

  reviewSet.cases.forEach((reviewCase, index) => {
    validateCase(reviewCase, index)
    assert(!seenCaseIds.has(reviewCase.caseId), `duplicate caseId ${reviewCase.caseId}`)
    seenCaseIds.add(reviewCase.caseId)
    seenDimensions.add(reviewCase.dimension)
  })

  for (const dimension of REQUIRED_DIMENSIONS) {
    assert(seenDimensions.has(dimension), `missing dimension ${dimension}`)
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        review_set: path.relative(ROOT_DIR, REVIEW_SET_PATH),
        case_count: reviewSet.cases.length,
        dimensions: [...seenDimensions].sort(),
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
