export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  buildAutomationApprovalBoundarySimulationRequest,
  getAutomationRuntimeBridgeRouteMetadata,
} from "@/app/api/automation/contracts"
import { executeCapability } from "@/automation/execution/execute-capability"

export async function POST() {
  const simulationRequest = buildAutomationApprovalBoundarySimulationRequest()
  const execution = await executeCapability(simulationRequest)
  const routeMetadata = getAutomationRuntimeBridgeRouteMetadata(
    "/api/automation/approval-boundary-test"
  )

  return NextResponse.json({
    route: "/api/automation/approval-boundary-test",
    routeVersion: "v1",
    target: routeMetadata?.purpose,
    simulation: {
      capabilityId: simulationRequest.capabilityId,
      requestId: simulationRequest.requestId,
      actorId: simulationRequest.actorId,
      payloadPreview: {
        operation: simulationRequest.payload.operation,
        recordCount: simulationRequest.payload.records.length,
        dryRun: simulationRequest.payload.dryRun ?? false,
      },
      acceptsArbitraryCapabilityIds: false,
    },
    verification: {
      executesRiskyWork: false,
      resumesBlockedExecution: false,
      approvalBoundaryTriggered:
        execution.selection.executionMode === "approval-required" &&
        execution.result.error?.code === "APPROVAL_REQUIRED",
      exposesSecrets: false,
    },
    execution,
  })
}
