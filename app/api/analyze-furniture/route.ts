export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/server/openai"
import { analyzeFurnitureImage } from "@/lib/server/furniture-vector-analysis"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

type AnalyzeFurnitureRequest = {
  name?: string
  brand?: string
  category?: string
  price?: number | null
  imageUrl: string
}

function makeProductKey(input: {
  name?: string
  brand?: string
  category?: string
}) {
  const norm = (v?: string) =>
    (v ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")

  return `${norm(input.brand)}|${norm(input.name)}|${norm(input.category)}`
}

function makeManualPublishedSourceUrl(productKey: string) {
  return `manual://${encodeURIComponent(productKey)}`
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token")
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const openai = getOpenAIClient()
    const supabase = getSupabaseAdminClient()

    const body = (await req.json()) as AnalyzeFurnitureRequest
    const { name, brand, category, price, imageUrl } = body

    const analysis = await analyzeFurnitureImage({
      openai,
      imageUrl,
      productName: name,
      brand,
      category,
    })

    const product_key = makeProductKey({ name, brand, category })

    const manualSourceUrl = makeManualPublishedSourceUrl(product_key)

    const { data: furniture, error: upsertError } = await supabase
      .from("furniture_products")
      .upsert(
        {
          source_site: "manual_admin",
          source_url: manualSourceUrl,
          product_name: name ?? "상품명 미정",
          brand,
          category,
          price,
          image_url: imageUrl,
          product_url: manualSourceUrl,
          status: "active",
        },
        { onConflict: "source_url" }
      )
      .select()
      .single()

if (upsertError) throw upsertError

    await supabase.from("furniture_vectors").upsert(
      {
        furniture_id: furniture.id,
        brightness_compatibility: analysis.brightness_compatibility,
        color_temperature_score: analysis.color_temperature_score,
        spatial_footprint_score: analysis.spatial_footprint_score,
        minimalism_score: analysis.minimalism_score,
        contrast_score: analysis.contrast_score,
        colorfulness_score: analysis.colorfulness_score,
      },
      { onConflict: "furniture_id" }
    )

    return NextResponse.json({ success: true, analysis })
  } catch (err: unknown) {
    console.error("🔥 FULL ERROR:", err)

    const message = err instanceof Error ? err.message : "Analysis failed"
    const stack = err instanceof Error ? err.stack : undefined

    return NextResponse.json(
      {
        error: "Analysis failed",
        message,
        stack,
      },
      { status: 500 }
    )
  }
}
