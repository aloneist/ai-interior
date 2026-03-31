export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

export async function POST(req: Request) {
  try {
    const {
      brightness,
      temperature,
      footprint,
      minimalism,
      contrast,
      colorfulness,
    } = await req.json()

    const weights = {
      brightness: 0.2,
      temperature: 0.2,
      footprint: 0.2,
      minimalism: 0.2,
      contrast: 0.1,
      colorfulness: 0.1,
    }

    const supabase = getSupabaseAdminClient()

    const { data: vectors, error } = await supabase
      .from("furniture_vectors")
      .select(`
        furniture_id,
        brightness_compatibility,
        color_temperature_score,
        spatial_footprint_score,
        minimalism_score,
        contrast_score,
        colorfulness_score,
        furniture:furniture_id (*)
      `)

    if (error) throw error

    const scored = vectors.map((item: any) => {
      const d =
        weights.brightness * Math.abs(item.brightness_compatibility - brightness) +
        weights.temperature * Math.abs(item.color_temperature_score - temperature) +
        weights.footprint * Math.abs(item.spatial_footprint_score - footprint) +
        weights.minimalism * Math.abs(item.minimalism_score - minimalism) +
        weights.contrast * Math.abs((item.contrast_score ?? 50) - contrast) +
        weights.colorfulness * Math.abs((item.colorfulness_score ?? 50) - colorfulness)

      const score = 100 - d

      return {
        ...item.furniture,
        recommendation_score: Math.round(score),
      }
    })

    scored.sort((a, b) => b.recommendation_score - a.recommendation_score)

    // ✅ Step 3: dedupe (같은 제품 1개만 남기기)
const seen = new Set<string>();
const deduped: any[] = [];

for (const item of scored) {
  // product_key가 있으면 최우선
  const key =
    item.product_key ||
    item.image_url ||
    `${(item.brand ?? "").toLowerCase()}|${(item.name ?? "").toLowerCase()}|${(item.category ?? "").toLowerCase()}`;

  if (seen.has(key)) continue;

  seen.add(key);
  deduped.push(item);
}

    return NextResponse.json({
      success: true,
      recommendations: deduped.slice(0, 10),
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: "Recommendation failed", message: err.message },
      { status: 500 }
    )
  }
}