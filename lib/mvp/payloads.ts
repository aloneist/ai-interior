import type { RoomLabels } from "@/lib/mvp/room-analysis"

type ExplainItem = {
  product_key: string | null | undefined
  name: string
  category: string | null
  price: number | null
  score: number
  description?: string | null
  color?: string | null
  material?: string | null
  metadata?: {
    style_labels?: string[]
    category_aliases?: string[]
    room_affinity?: {
      strong?: string[]
      medium?: string[]
      weak?: string[]
    }
  } | null
  ranking_context?: {
    category_fit?: string | null
    room_fit?: string | null
    style_fit?: string | null
    budget_fit?: string | null
    weak_match_reasons?: string[]
  }
}

type ExplainPayloadParams = {
  room: {
    brightness: number
    temperature: number
    density: number
    minimalism: number
    contrast: number
    colorfulness: number
    trust_score: number
    labels: RoomLabels
  }
  userInput: {
    roomType?: string | null
    styles?: string[]
    budget?: string | null
    furniture?: string[]
    requestText?: string
  }
  items: ExplainItem[]
}

export function buildRecommendationExplainPayload(params: ExplainPayloadParams) {
  const { room, userInput, items } = params

  return {
    room: {
      scores: {
        brightness: room.brightness,
        temperature: room.temperature,
        density: room.density,
        minimalism: room.minimalism,
        contrast: room.contrast,
        colorfulness: room.colorfulness,
      },
      labels: room.labels,
      trust_score: room.trust_score,
    },
    user_input: userInput,
    items: items.map((x) => ({
      product_key: x.product_key,
      name: x.name,
      category: x.category,
      price: x.price,
      score: x.score,
      description: x.description,
      color: x.color,
      material: x.material,
      metadata: x.metadata,
      ranking_context: x.ranking_context,
    })),
  }
}
