import http from "node:http";
import https from "node:https";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import process from "node:process";

import { chromium } from "@playwright/test";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = (process.env.APP_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
const timeoutMs = Number(process.env.BROWSER_CAPABILITY_TIMEOUT_MS || 120000);
const screenshotPath =
  process.env.BROWSER_CAPABILITY_SCREENSHOT_PATH ||
  `/tmp/mvp-browser-capability-${Date.now()}.png`;

let serverProcess = null;

function prefixStream(stream, label) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = chunk.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      console.log(`${label} ${line}`);
    }
  });
}

function terminateServer() {
  if (!serverProcess?.pid) return;
  try {
    process.kill(-serverProcess.pid, "SIGTERM");
  } catch {}
}

async function waitForServer(url, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const status = await probe(url);
      if (status < 500) return status;
    } catch {}
    await delay(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function probe(url) {
  const transport = url.startsWith("https:") ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.get(
      url,
      {
        timeout: 5000,
        headers: {
          "user-agent": "ai-interior-browser-capability-check",
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode || 0);
      }
    );

    request.on("timeout", () => request.destroy(new Error("Request timeout")));
    request.on("error", reject);
  });
}

async function main() {
  const startedServer = !process.env.APP_BASE_URL;

  if (startedServer) {
    serverProcess = spawn("npm", ["run", "dev"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CI: "1",
      },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    prefixStream(serverProcess.stdout, "[dev]");
    prefixStream(serverProcess.stderr, "[dev]");
  }

  process.on("exit", terminateServer);
  process.on("SIGINT", () => {
    terminateServer();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    terminateServer();
    process.exit(143);
  });

  const probeStatus = await waitForServer(baseUrl, timeoutMs);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const response = await page.goto(baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    const title = await page.title();
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(
      JSON.stringify(
        {
          status: "ok",
          baseUrl,
          startedServer,
          probeStatus,
          pageStatus: response?.status() ?? null,
          title,
          screenshotPath,
          manualSmokePack: {
            checklist: "docs/qa/mvp-manual-browser-smoke-checklist.md",
            procedure: "docs/qa/mvp-manual-browser-smoke-execution-procedure.md",
            resultTemplate: "docs/qa/mvp-manual-browser-smoke-result-template.md",
          },
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
    terminateServer();
  }
}

main().catch((error) => {
  console.error("[browser-capability-check]", error instanceof Error ? error.message : error);
  terminateServer();
  process.exit(1);
});
