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

function clampScore(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalizeHex(hex: any) {
  if (typeof hex !== "string") return "#808080"
  const h = hex.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(h) ? h : "#808080"
}

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an interior room analysis engine.
Return ONLY valid JSON. No explanation.

Return this exact structure with integers 0-100:

{
  "brightness_score": integer,
  "color_temperature_score": integer,
  "spatial_density_score": integer,
  "minimalism_score": integer,
  "contrast_score": integer,
  "colorfulness_score": integer,
  "dominant_color_hex": "#RRGGBB"
}

Definitions:
- brightness_score: perceived brightness of the room (0=very dark, 100=very bright)
- color_temperature_score: 0=cool/blue, 100=warm/yellow
- spatial_density_score: clutter/furniture density (0=very empty, 100=very cluttered)
- minimalism_score: 0=maximal/ornate, 100=minimal
- contrast_score: 0=soft/low contrast, 100=high contrast
- colorfulness_score: 0=neutral/monochrome, 100=very colorful
- dominant_color_hex: dominant overall tone color in the room

Rules:
- All scores must be integers 0..100
- dominant_color_hex must be valid #RRGGBB
`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this room photo." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    })

    const raw = response.choices[0].message.content!
    const analysis = JSON.parse(raw)

    const normalized = {
      image_url: imageUrl,
      brightness_score: clampScore(analysis.brightness_score),
      color_temperature_score: clampScore(analysis.color_temperature_score),
      spatial_density_score: clampScore(analysis.spatial_density_score),
      minimalism_score: clampScore(analysis.minimalism_score),
      contrast_score: clampScore(analysis.contrast_score),
      colorfulness_score: clampScore(analysis.colorfulness_score),
      dominant_color_hex: normalizeHex(analysis.dominant_color_hex),
    }

    const { data: space, error } = await supabase
      .from("spaces")
      .insert(normalized)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, space, analysis: normalized })
  } catch (err: any) {
    console.error("ANALYZE SPACE ERROR:", err)
    return NextResponse.json(
      { error: "Analyze space failed", message: err.message },
      { status: 500 }
    )
  }
}