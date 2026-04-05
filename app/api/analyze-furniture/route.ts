export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/server/openai"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"

type AnalyzeFurnitureRequest = {
  name?: string
  brand?: string
  category?: string
  price?: number | null
  imageUrl: string
}

type FurnitureAnalysisResult = {
  brightness_compatibility?: unknown
  color_temperature_score?: unknown
  spatial_footprint_score?: unknown
  minimalism_score?: unknown
  contrast_score?: unknown
  colorfulness_score?: unknown
  dominant_color_hex?: string | null
}

function parseOpenAiJson(content: string): FurnitureAnalysisResult {
  return JSON.parse(content) as FurnitureAnalysisResult
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

function clampScore(v: unknown) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an interior furniture analysis engine.
Return ONLY valid JSON. No explanation.

Return this exact structure with integers 0-100:

{
  "brightness_compatibility": integer,
  "color_temperature_score": integer,
  "spatial_footprint_score": integer,
  "minimalism_score": integer,
  "contrast_score": integer,
  "colorfulness_score": integer,
  "dominant_color_hex": "#RRGGBB"
}

Definitions:
- brightness_compatibility: fits bright rooms (0=only dark rooms, 100=great in bright rooms)
- color_temperature_score: 0=cool, 100=warm
- spatial_footprint_score: 0=small/light, 100=large/visually heavy
- minimalism_score: 0=ornate/maximal, 100=minimal
- contrast_score: 0=low contrast (soft), 100=high contrast (bold)
- colorfulness_score: 0=neutral/monochrome, 100=very colorful

Rules:
- All scores must be integers 0..100
- dominant_color_hex must be valid 7-char hex like #A1B2C3
`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this furniture image." },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    })

    const analysis = parseOpenAiJson(response.choices[0].message.content!)

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

    const normalized = {
      brightness_compatibility: clampScore(analysis.brightness_compatibility),
      color_temperature_score: clampScore(analysis.color_temperature_score),
      spatial_footprint_score: clampScore(analysis.spatial_footprint_score),
      minimalism_score: clampScore(analysis.minimalism_score),
      contrast_score: clampScore(analysis.contrast_score),
      colorfulness_score: clampScore(analysis.colorfulness_score),
      dominant_color_hex: analysis.dominant_color_hex,
    }

    await supabase.from("furniture_vectors").upsert(
      {
        furniture_id: furniture.id,
        brightness_compatibility: normalized.brightness_compatibility,
        color_temperature_score: normalized.color_temperature_score,
        spatial_footprint_score: normalized.spatial_footprint_score,
        minimalism_score: normalized.minimalism_score,
        contrast_score: normalized.contrast_score,
        colorfulness_score: normalized.colorfulness_score,
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
