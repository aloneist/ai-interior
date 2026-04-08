export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  normalizeRecommendationActionPayload,
  updateRecommendationAction,
  validateRecommendationActionRequest,
} from "@/lib/server/recommendation-actions"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

type LogClickRequest = {
  request_id?: string
  canonical_product_id?: string
  furniture_id?: string
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as LogClickRequest
    const { request_id, furniture_id } =
      normalizeRecommendationActionPayload(payload)

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

    const supabase = getSupabaseAdminClient()

    const data = await updateRecommendationAction({
      supabase,
      request_id,
      canonicalProductId: furniture_id,
      patch: { clicked: true },
    })

    if (!data) {
      return NextResponse.json(
        { error: "Recommendation exposure not found", request_id, furniture_id },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, updated: data })
  } catch (err: unknown) {
    console.error("LOG CLICK ERROR:", err)

    const message =
      err instanceof Error ? err.message : "Log click failed"

    return NextResponse.json(
      { error: "Log click failed", message },
      { status: 500 }
    )
  }
}
