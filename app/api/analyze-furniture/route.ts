export const runtime = "nodejs"

import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

function clampScore(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
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

    const analysis = JSON.parse(response.choices[0].message.content!)

    const product_key = makeProductKey({ name, brand, category })

    const { data: furniture, error: upsertError } = await supabase
      .from("furniture")
      .upsert(
        {
          product_key,
          name,
          brand,
          category,
          price,
          image_url: imageUrl,
        },
        { onConflict: "product_key" }
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
    vector_version: "v1",
    brightness_compatibility: normalized.brightness_compatibility,
    color_temperature_score: normalized.color_temperature_score,
    spatial_footprint_score: normalized.spatial_footprint_score,
    minimalism_score: normalized.minimalism_score,
    contrast_score: normalized.contrast_score,
    colorfulness_score: normalized.colorfulness_score,
    dominant_color_hex: normalized.dominant_color_hex,
  },
  { onConflict: "furniture_id,vector_version" }
)

    return NextResponse.json({ success: true, analysis })
  } catch (err: any) {
  console.error("🔥 FULL ERROR:", err)

  return NextResponse.json(
    { 
      error: "Analysis failed",
      message: err.message,
      stack: err.stack
    },
    { status: 500 }
  )
}
}