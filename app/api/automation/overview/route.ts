export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  automationRuntimeBridgeSafety,
  buildAutomationRuntimeOverview,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/overview",
    routeVersion: "v1",
    target: "automation-runtime-bridge-overview",
    overview: buildAutomationRuntimeOverview(),
    safety: automationRuntimeBridgeSafety,
  })
}
