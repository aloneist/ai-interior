export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

type LogClickRequest = {
  request_id: string
  furniture_id: string
}

export async function POST(req: Request) {
  try {
    const { request_id, furniture_id } = (await req.json()) as LogClickRequest

    if (!request_id || !furniture_id) {
      return NextResponse.json(
        { error: "request_id and furniture_id are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // 최근 노출 로그 1개를 clicked=true로 업데이트
    const { data, error } = await supabase
      .from("recommendations")
      .update({ clicked: true })
      .eq("request_id", request_id)
      .eq("furniture_id", furniture_id)
      .select()
      .single()

      if (error) throw error

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
