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
    const { name, brand, category, price, imageUrl } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an interior furniture analysis engine.

Analyze the furniture image and return ONLY valid JSON.

Return this exact structure:

{
  "brightness_compatibility": integer (0-100),
  "color_temperature_score": integer (0-100),
  "spatial_footprint_score": integer (0-100),
  "minimalism_score": integer (0-100),
  "dominant_color_hex": "#RRGGBB"
}

Rules:
- brightness_compatibility: how well it fits bright spaces
- color_temperature_score: 0=cool, 100=warm
- spatial_footprint_score: 0=small/light, 100=large/heavy
- minimalism_score: 0=ornate/maximal, 100=minimal
- dominant_color_hex must be valid hex
- Return JSON only. No explanation.
`curl -X POST http://localhost:3000/api/analyze-furniture \
-H "Content-Type: application/json" \
-d '{
  "name": "테스트 소파",
  "brand": "TestBrand",
  "category": "sofa",
  "price": 500000,
  "imageUrl": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc"
}',
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
      response_format: { type: "json_object" },
    })

    const analysis = JSON.parse(response.choices[0].message.content!)

    // 1️⃣ furniture insert
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

    // 2️⃣ vector insert
    await supabase.from("furniture_vectors").insert({
      furniture_id: furniture.id,
      brightness_compatibility: analysis.brightness_compatibility,
      color_temperature_score: analysis.color_temperature_score,
      spatial_footprint_score: analysis.spatial_footprint_score,
      minimalism_score: analysis.minimalism_score,
      dominant_color_hex: analysis.dominant_color_hex,
    })

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}