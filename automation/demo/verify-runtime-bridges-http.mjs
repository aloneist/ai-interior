import { createServer } from "node:http"
import { once } from "node:events"
import { spawn } from "node:child_process"

const DEV_PORT = 3101
const DEV_HOST = "127.0.0.1"
const WEBHOOK_CAPTURE_HOST = "127.0.0.1"
const WEBHOOK_CAPTURE_PORT = 4011
const WEBHOOK_SECRET = "runtime-bridge-http-secret"
const DEV_SERVER_START_TIMEOUT_MS = 30000
const HTTP_POLL_INTERVAL_MS = 500

function logSection(title) {
  console.log("")
  console.log(title)
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function startWebhookCaptureServer() {
  const requests = []

  const server = createServer((request, response) => {
    const chunks = []

    request.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on("end", () => {
      requests.push({
        method: request.method,
        body: Buffer.concat(chunks).toString("utf8"),
      })

      response.statusCode = 200
      response.setHeader("content-type", "application/json")
      response.end(JSON.stringify({ ok: true }))
    })
  })

  server.listen(WEBHOOK_CAPTURE_PORT, WEBHOOK_CAPTURE_HOST)
  await once(server, "listening")

  return {
    requests,
    close: async () => {
      server.close()
      await once(server, "close")
    },
  }
}

async function waitForDevServer(baseUrl) {
  const deadline = Date.now() + DEV_SERVER_START_TIMEOUT_MS

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/automation/readiness`)

      if (response.ok) {
        return
      }
    } catch {}

    await wait(HTTP_POLL_INTERVAL_MS)
  }

  throw new Error("Timed out waiting for the local Next runtime bridge server.")
}

async function main() {
  const baseUrl = `http://${DEV_HOST}:${DEV_PORT}`
  const webhookUrl = `http://${WEBHOOK_CAPTURE_HOST}:${WEBHOOK_CAPTURE_PORT}/n8n-approval`
  const webhookCapture = await startWebhookCaptureServer()

  const nextBin = new URL("../../node_modules/next/dist/bin/next", import.meta.url)
  const devServer = spawn(
    process.execPath,
    [nextBin.pathname, "dev", "--hostname", DEV_HOST, "--port", String(DEV_PORT)],
    {
      cwd: process.cwd(),
      stdio: "pipe",
      env: {
        ...process.env,
        AUTOMATION_APPROVAL_WEBHOOK_URL: webhookUrl,
        AUTOMATION_APPROVAL_WEBHOOK_SECRET: WEBHOOK_SECRET,
      },
    }
  )

  devServer.stdout.on("data", (chunk) => {
    process.stdout.write(chunk)
  })

  devServer.stderr.on("data", (chunk) => {
    process.stderr.write(chunk)
  })

  try {
    await waitForDevServer(baseUrl)

    logSection("READINESS VERIFY")
    const readinessResponse = await fetch(`${baseUrl}/api/automation/readiness`)
    const readinessJson = await readinessResponse.json()

    assert(readinessResponse.status === 200, "Readiness route must return HTTP 200.")
    assert(
      readinessJson.route === "/api/automation/readiness",
      "Readiness route must identify itself explicitly."
    )
    assert(
      readinessJson.readiness.outboundApprovalWebhookConfigured === true,
      "Readiness route must report outbound webhook configured during verification."
    )
    assert(
      readinessJson.readiness.inboundApprovalWebhookAuthConfigured === true,
      "Readiness route must report inbound webhook auth configured during verification."
    )
    assert(
      readinessJson.safety.exposesSecrets === false,
      "Readiness route must not report secret exposure."
    )
    assert(
      !JSON.stringify(readinessJson).includes(WEBHOOK_SECRET),
      "Readiness route must not expose the webhook secret."
    )
    console.log("  readiness route: PASS")

    logSection("WEBHOOK TEST VERIFY")
    const webhookTestResponse = await fetch(`${baseUrl}/api/automation/webhook-test`, {
      method: "POST",
    })
    const webhookTestJson = await webhookTestResponse.json()

    assert(
      webhookTestResponse.status === 200,
      "Webhook-test route must return HTTP 200 when the local capture server is available."
    )
    assert(
      webhookTestJson.route === "/api/automation/webhook-test",
      "Webhook-test route must identify itself explicitly."
    )
    assert(
      webhookTestJson.delivery.status === "sent",
      "Webhook-test route must report sent delivery during local verification."
    )
    assert(
      webhookTestJson.verification.executesRiskyWork === false,
      "Webhook-test route must state that it does not execute risky work."
    )
    assert(
      webhookCapture.requests.length >= 1,
      "Webhook-test route must exercise the outbound sender path."
    )
    console.log("  webhook-test route: PASS")

    logSection("APPROVAL RESPONSE VERIFY")
    const trustedBody = {
      context: {
        requestId: "runtime-approval-request-id",
        reportId: "report-runtime-approval-request-id",
        capabilityId: "catalog.write.safe",
        finalStatus: "approval_required",
        decisionId: "decision-runtime-approval-request-id",
      },
      requestId: "runtime-approval-request-id",
      reportId: "report-runtime-approval-request-id",
      capabilityId: "catalog.write.safe",
      decisionId: "decision-runtime-approval-request-id",
      source: "n8n",
      decision: "approved",
      note: "Runtime HTTP verification only.",
    }

    const trustedResponse = await fetch(`${baseUrl}/api/automation/approval-response`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${WEBHOOK_SECRET}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(trustedBody),
    })
    const trustedJson = await trustedResponse.json()

    assert(trustedResponse.status === 200, "Trusted approval-response route call must return HTTP 200.")
    assert(
      trustedJson.webhook?.status === "accepted",
      "Trusted approval-response route call must reach the normalization chain."
    )
    assert(
      trustedJson.webhook?.auth?.status === "trusted",
      "Trusted approval-response route call must report trusted auth."
    )
    assert(
      trustedJson.webhook?.application?.applicationStatus === "remain_blocked",
      "Trusted approval-response route call must keep execution blocked."
    )

    const untrustedResponse = await fetch(`${baseUrl}/api/automation/approval-response`, {
      method: "POST",
      headers: {
        authorization: "Bearer wrong-secret",
        "content-type": "application/json",
      },
      body: JSON.stringify(trustedBody),
    })
    const untrustedJson = await untrustedResponse.json()

    assert(
      untrustedResponse.status === 401,
      "Untrusted approval-response route call must return HTTP 401."
    )
    assert(
      untrustedJson.webhook?.status === "blocked_untrusted",
      "Untrusted approval-response route call must be blocked before normalization."
    )
    assert(
      !untrustedJson.webhook?.intake,
      "Untrusted approval-response route call must not include the intake chain."
    )
    console.log("  approval-response route: PASS")

    logSection("RUNTIME BRIDGE HTTP VERIFY")
    console.log("  overall: PASS")
  } finally {
    devServer.kill("SIGTERM")
    await webhookCapture.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
