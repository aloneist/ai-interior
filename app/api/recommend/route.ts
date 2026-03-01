export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { brightness, temperature, footprint, minimalism } =
      await req.json()

    // 1️⃣ 모든 가구 벡터 가져오기
    const { data: vectors, error } = await supabase
      .from("furniture_vectors")
      .select(`
        furniture_id,
        brightness_compatibility,
        color_temperature_score,
        spatial_footprint_score,
        minimalism_score,
        furniture:furniture_id (*)
      `)

    if (error) throw error

    // 2️⃣ 점수 계산
    const scored = vectors.map((item: any) => {
      const d =
        Math.abs(item.brightness_compatibility - brightness) +
        Math.abs(item.color_temperature_score - temperature) +
        Math.abs(item.spatial_footprint_score - footprint) +
        Math.abs(item.minimalism_score - minimalism)

      const score = 100 - d / 4

      return {
        ...item.furniture,
        recommendation_score: Math.round(score),
      }
    })

    // 3️⃣ 정렬
    scored.sort((a, b) => b.recommendation_score - a.recommendation_score)

    // 4️⃣ 상위 10개 반환
    return NextResponse.json({
      success: true,
      recommendations: scored.slice(0, 10),
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: "Recommendation failed", message: err.message },
      { status: 500 }
    )
  }
}