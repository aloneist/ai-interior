export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  updateRecommendationAction,
  validateRecommendationActionRequest,
} from "@/lib/server/recommendation-actions"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

type LogSaveRequest = {
  request_id: string
  furniture_id: string
  saved: boolean
}

export async function POST(req: Request) {
  try {
    const { request_id, furniture_id, saved } =
      (await req.json()) as LogSaveRequest

    const validation = validateRecommendationActionRequest({
      request_id,
      furniture_id,
    })

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    if (typeof saved !== "boolean") {
      return NextResponse.json(
        { error: "saved must be a boolean" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const data = await updateRecommendationAction({
      supabase,
      request_id,
      furniture_id,
      patch: { saved },
    })

    if (!data) {
      return NextResponse.json(
        { error: "Recommendation exposure not found", request_id, furniture_id },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, updated: data })
  } catch (err: unknown) {
    console.error("LOG SAVE ERROR:", err)

    const message = err instanceof Error ? err.message : "Log save failed"

    return NextResponse.json(
      { error: "Log save failed", message },
      { status: 500 }
    )
  }
}
