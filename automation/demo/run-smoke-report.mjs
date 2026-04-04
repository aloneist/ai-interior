import { spawn } from "node:child_process"
import { tmpdir } from "node:os"
import { join } from "node:path"

const smokeReportPath =
  process.env.AUTOMATION_SMOKE_REPORT_PATH ||
  join(tmpdir(), "automation-smoke-report.json")

const child = spawn(process.execPath, ["automation/demo/run-smoke-test.cjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    AUTOMATION_SMOKE_REPORT_PATH: smokeReportPath,
  },
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on("error", (error) => {
  console.error(error)
  process.exit(1)
})
