export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  automationRuntimeBridgeRoutes,
  automationRuntimeBridgeSafety,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/routes",
    routeVersion: "v1",
    target: "automation-runtime-bridge-inventory",
    routes: automationRuntimeBridgeRoutes,
    safety: automationRuntimeBridgeSafety,
  })
}
