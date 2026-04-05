export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import { loadRuntimeFurnitureRecordsByIds } from "@/lib/server/furniture-catalog"
import { rankFurnitureForRecommendations } from "@/lib/server/recommendation-ranking"
import type { UserPreferenceInput } from "@/lib/mvp/scoring"

type FurnitureVectorRow = {
  furniture_id: string
  brightness_compatibility: number | null
  color_temperature_score: number | null
  spatial_footprint_score: number | null
  minimalism_score: number
  contrast_score: number | null
  colorfulness_score: number | null
}

type RecommendationRequest = UserPreferenceInput & {
  brightness: number
  temperature: number
  footprint: number
  minimalism: number
  contrast: number
  colorfulness: number
}

export async function POST(req: Request) {
  try {
    const {
      brightness,
      temperature,
      footprint,
      minimalism,
      contrast,
      colorfulness,
      roomType,
      styles,
      budget,
      furniture,
      requestText,
    } = (await req.json()) as RecommendationRequest

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
        colorfulness_score
      `)

    if (error) throw error

    const furnitureById = await loadRuntimeFurnitureRecordsByIds(
      supabase,
      ((vectors ?? []) as FurnitureVectorRow[]).map((item) => item.furniture_id)
    )

    const ranked = rankFurnitureForRecommendations({
      vectors: (vectors ?? []) as FurnitureVectorRow[],
      furnitureById,
      targets: {
        brightness,
        temperature,
        footprint,
        minimalism,
        contrast,
        colorfulness,
      },
      userInput: {
        roomType,
        styles,
        budget,
        furniture,
        requestText,
      },
      limit: 10,
    })

    return NextResponse.json({
      success: true,
      recommendations: ranked.items,
      quality_summary: ranked.qualitySummary,
    })
  } catch (err: unknown) {
    console.error(err)

    const message = err instanceof Error ? err.message : "Recommendation failed"

    return NextResponse.json(
      { error: "Recommendation failed", message },
      { status: 500 }
    )
  }
}
