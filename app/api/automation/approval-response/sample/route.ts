export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  buildAutomationApprovalResponseSampleReference,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/approval-response/sample",
    routeVersion: "v1",
    target: "approval-response-request-shape",
    ...buildAutomationApprovalResponseSampleReference(),
  })
}
