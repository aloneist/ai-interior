import {
  startRuntimeBridgeLocalServer,
  stopRuntimeBridgeLocalServer,
} from "./runtime-bridge-local.mjs"

function printHeading(title) {
  console.log("")
  console.log(title)
}

async function main() {
  const runtimeBridgeServer = await startRuntimeBridgeLocalServer()
  const { baseUrl } = runtimeBridgeServer

  try {
    const response = await fetch(`${baseUrl}/api/automation/approval-boundary-test`, {
      method: "POST",
    })
    const json = await response.json()

    printHeading("APPROVAL BOUNDARY TEST")
    console.log(`baseUrl: ${baseUrl}`)
    console.log(`route: ${json.route}`)
    console.log(`httpStatus: ${response.status}`)

    printHeading("SIMULATION SUMMARY")
    console.log(`capability: ${json.simulation?.capabilityId ?? "missing"}`)
    console.log(
      `acceptsArbitraryCapabilityIds: ${
        json.simulation?.acceptsArbitraryCapabilityIds === true ? "yes" : "no"
      }`
    )
    console.log(`executionMode: ${json.execution?.selection?.executionMode ?? "missing"}`)
    console.log(`errorCode: ${json.execution?.result?.error?.code ?? "missing"}`)

    printHeading("SAFETY")
    console.log(
      `approvalBoundaryTriggered: ${
        json.verification?.approvalBoundaryTriggered === true ? "yes" : "no"
      }`
    )
    console.log(
      `executesRiskyWork: ${json.verification?.executesRiskyWork === true ? "yes" : "no"}`
    )
    console.log(
      `resumesBlockedExecution: ${
        json.verification?.resumesBlockedExecution === true ? "yes" : "no"
      }`
    )
    console.log("fixed-scope simulation only")
  } finally {
    await stopRuntimeBridgeLocalServer(runtimeBridgeServer)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
