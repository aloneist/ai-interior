import OpenAI from "openai"

export type FurnitureVectorAnalysis = {
  brightness_compatibility: number
  color_temperature_score: number
  spatial_footprint_score: number
  minimalism_score: number
  contrast_score: number
  colorfulness_score: number
  dominant_color_hex: string | null
}

type FurnitureVectorAnalysisResult = {
  brightness_compatibility?: unknown
  color_temperature_score?: unknown
  spatial_footprint_score?: unknown
  minimalism_score?: unknown
  contrast_score?: unknown
  colorfulness_score?: unknown
  dominant_color_hex?: string | null
}

function parseOpenAiJson(content: string): FurnitureVectorAnalysisResult {
  return JSON.parse(content) as FurnitureVectorAnalysisResult
}

function clampScore(v: unknown) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalizeHex(value: string | null | undefined) {
  if (typeof value !== "string") return null
  const normalized = value.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : null
}

export function normalizeFurnitureVectorAnalysis(
  analysis: FurnitureVectorAnalysisResult
): FurnitureVectorAnalysis {
  return {
    brightness_compatibility: clampScore(analysis.brightness_compatibility),
    color_temperature_score: clampScore(analysis.color_temperature_score),
    spatial_footprint_score: clampScore(analysis.spatial_footprint_score),
    minimalism_score: clampScore(analysis.minimalism_score),
    contrast_score: clampScore(analysis.contrast_score),
    colorfulness_score: clampScore(analysis.colorfulness_score),
    dominant_color_hex: normalizeHex(analysis.dominant_color_hex),
  }
}

export async function analyzeFurnitureImage(params: {
  openai: OpenAI
  imageUrl: string
  productName?: string | null
  brand?: string | null
  category?: string | null
}): Promise<FurnitureVectorAnalysis> {
  const { openai, imageUrl, productName, brand, category } = params

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
- Judge from the product image only. Do not infer room fit from seller or geometry metadata.
`.trim(),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify({
              task: "Analyze this furniture product image for runtime scoring.",
              product_name: productName ?? null,
              brand: brand ?? null,
              category: category ?? null,
            }),
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  })

  return normalizeFurnitureVectorAnalysis(
    parseOpenAiJson(response.choices[0].message.content ?? "{}")
  )
}
