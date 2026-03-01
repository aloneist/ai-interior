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
Return ONLY valid JSON.

{
  "brightness_compatibility": integer,
  "color_temperature_score": integer,
  "spatial_footprint_score": integer,
  "minimalism_score": integer,
  "dominant_color_hex": "#RRGGBB"
}
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

    const { data: furniture } = await supabase
      .from("furniture")
      .insert({
        name,
        brand,
        category,
        price,
        image_url: imageUrl,
      })
      .select()
      .single()

    await supabase.from("furniture_vectors").insert({
      furniture_id: furniture.id,
      brightness_compatibility: analysis.brightness_compatibility,
      color_temperature_score: analysis.color_temperature_score,
      spatial_footprint_score: analysis.spatial_footprint_score,
      minimalism_score: analysis.minimalism_score,
      dominant_color_hex: analysis.dominant_color_hex,
    })

    return NextResponse.json({ success: true, analysis })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}