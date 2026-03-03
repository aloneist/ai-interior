export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { request_id, furniture_id } = await req.json()

    if (!request_id || !furniture_id) {
      return NextResponse.json(
        { error: "request_id and furniture_id are required" },
        { status: 400 }
      )
    }

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
  } catch (err: any) {
    console.error("LOG CLICK ERROR:", err)
    return NextResponse.json(
      { error: "Log click failed", message: err.message },
      { status: 500 }
    )
  }
}