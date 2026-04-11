export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import { loadRuntimeRecommendationCatalog } from "@/lib/server/furniture-catalog"
import { rankFurnitureForRecommendations } from "@/lib/server/recommendation-ranking"
import type { UserPreferenceInput } from "@/lib/mvp/scoring"

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
    const { vectors, furnitureById } = await loadRuntimeRecommendationCatalog(supabase)

    const ranked = rankFurnitureForRecommendations({
      vectors,
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
