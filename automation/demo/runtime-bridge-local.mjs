import { createServer } from "node:http"
import { once } from "node:events"
import { spawn } from "node:child_process"
import { createServer as createNetServer } from "node:net"

export const DEV_HOST = "127.0.0.1"
export const WEBHOOK_CAPTURE_HOST = "127.0.0.1"
export const WEBHOOK_SECRET = "runtime-bridge-http-secret"
const DEV_SERVER_START_TIMEOUT_MS = 45000
const HTTP_POLL_INTERVAL_MS = 500
const RECENT_LOG_LIMIT = 80

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getAvailablePort(host) {
  const server = createNetServer()

  server.listen(0, host)
  await once(server, "listening")

  const address = server.address()

  if (!address || typeof address === "string") {
    server.close()
    throw new Error(`Failed to acquire an available port on ${host}.`)
  }

  const { port } = address
  server.close()
  await once(server, "close")
  return port
}

function createRecentLogBuffer() {
  const entries = []

  return {
    push(chunk) {
      const lines = String(chunk)
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter(Boolean)

      for (const line of lines) {
        entries.push(line)
      }

      if (entries.length > RECENT_LOG_LIMIT) {
        entries.splice(0, entries.length - RECENT_LOG_LIMIT)
      }
    },
    format() {
      return entries.length > 0 ? entries.join("\n") : "No recent dev server logs captured."
    },
  }
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

  try {
    server.listen(0, WEBHOOK_CAPTURE_HOST)
    await once(server, "listening")
  } catch (error) {
    throw new Error(
      `Failed to start the local webhook capture server on ${WEBHOOK_CAPTURE_HOST}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  const address = server.address()

  if (!address || typeof address === "string") {
    server.close()
    await once(server, "close")
    throw new Error("Webhook capture server did not expose a usable local address.")
  }

  return {
    requests,
    url: `http://${WEBHOOK_CAPTURE_HOST}:${address.port}/n8n-approval`,
    close: async () => {
      server.close()
      await once(server, "close")
    },
  }
}

async function waitForDevServer(baseUrl, devServer, recentLogs) {
  const deadline = Date.now() + DEV_SERVER_START_TIMEOUT_MS

  while (Date.now() < deadline) {
    if (devServer.exitCode !== null) {
      throw new Error(
        `Local Next runtime bridge server exited before readiness check completed with code ${devServer.exitCode}.\nRecent logs:\n${recentLogs.format()}`
      )
    }

    if (devServer.signalCode) {
      throw new Error(
        `Local Next runtime bridge server exited before readiness check completed with signal ${devServer.signalCode}.\nRecent logs:\n${recentLogs.format()}`
      )
    }

    try {
      const response = await fetch(`${baseUrl}/api/automation/readiness`)

      if (response.ok) {
        return
      }
    } catch {}

    await wait(HTTP_POLL_INTERVAL_MS)
  }

  throw new Error(
    `Timed out waiting for the local Next runtime bridge server at ${baseUrl}.\nRecent logs:\n${recentLogs.format()}`
  )
}

export async function startRuntimeBridgeLocalServer() {
  const webhookCapture = await startWebhookCaptureServer()
  const devPort = await getAvailablePort(DEV_HOST)
  const baseUrl = `http://${DEV_HOST}:${devPort}`
  const recentLogs = createRecentLogBuffer()
  const nextBin = new URL("../../node_modules/next/dist/bin/next", import.meta.url)

  const devServer = spawn(
    process.execPath,
    [nextBin.pathname, "dev", "--hostname", DEV_HOST, "--port", String(devPort)],
    {
      cwd: process.cwd(),
      stdio: "pipe",
      env: {
        ...process.env,
        AUTOMATION_APPROVAL_WEBHOOK_URL: webhookCapture.url,
        AUTOMATION_APPROVAL_WEBHOOK_SECRET: WEBHOOK_SECRET,
      },
    }
  )

  devServer.stdout.on("data", (chunk) => {
    recentLogs.push(chunk)
    process.stdout.write(chunk)
  })

  devServer.stderr.on("data", (chunk) => {
    recentLogs.push(chunk)
    process.stderr.write(chunk)
  })

  await waitForDevServer(baseUrl, devServer, recentLogs)

  return {
    baseUrl,
    webhookCapture,
    devServer,
    recentLogs,
  }
}

export async function stopRuntimeBridgeLocalServer(runtimeBridgeServer) {
  if (
    runtimeBridgeServer.devServer.exitCode === null &&
    !runtimeBridgeServer.devServer.killed
  ) {
    runtimeBridgeServer.devServer.kill("SIGTERM")
    await once(runtimeBridgeServer.devServer, "exit")
  }

  await runtimeBridgeServer.webhookCapture.close()
}
