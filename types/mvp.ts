export type Step = "intro" | "input" | "preference" | "loading" | "result"

export type RoomType = "living" | "bedroom" | "workspace" | "dining"

export type BudgetLevel = "low" | "medium" | "high"

export type FurnitureType = "sofa" | "chair" | "table"

export type StyleTag =
  | "modern"
  | "minimal"
  | "warm-wood"
  | "bright"
  | "calm"
  | "hotel"

export type BaseRecommendationProduct = {
  id: string
  name: string
  brand: string | null
  category: string | null
  price: number | null
  image_url: string | null
  recommendation_score: number
  reason_short: string
  external_url?: string
  ranking_context?: {
    base_score: number
    final_score: number
    category_fit: "preferred" | "room_match" | "mismatch" | "neutral"
    budget_fit: "within" | "over" | "under" | "unknown" | "neutral"
    metadata_quality: "complete" | "partial" | "weak"
    weak_match_reasons: string[]
  }
}

export type RecommendationProduct = BaseRecommendationProduct & {
  request_id: string
  price_text?: string
}

export type GroupedRecommendationProduct = BaseRecommendationProduct & {
  price_text?: string
}

export type GroupedRecommendation = {
  id: "balanced" | "budget" | "mood"
  title: string
  concept_tag: string
  total_price_text: string
  summary_text: string
  products: GroupedRecommendationProduct[]
}

export type MVPResponse = {
  success: boolean
  request_id?: string
  analysis: {
    image_url: string
    brightness_score: number
    color_temperature_score: number
    spatial_density_score: number
    minimalism_score: number
    contrast_score: number
    colorfulness_score: number
    dominant_color_hex: string
  }
  trust_score: number
  trust_note: string | null
  recommendations: RecommendationProduct[]
  grouped_recommendations?: GroupedRecommendation[]
  quality_summary?: {
    candidate_count: number
    deduped_candidate_count: number
    returned_count: number
    weak_result: boolean
    weak_reasons: string[]
    preferred_category_in_top3: number | null
    within_budget_in_top3: number | null
  }
  error?: string
  message?: string
}

export type MvpRequestInput = {
  imageUrl: string
  roomType: RoomType | null
  styles: StyleTag[]
  budget: BudgetLevel | null
  furniture: FurnitureType[]
  requestText: string
}

export type UploadImageResponse = {
  success: boolean
  imageUrl?: string
  publicId?: string
  error?: string
  message?: string
}

export type ProductLike =
  | RecommendationProduct
  | GroupedRecommendationProduct

export type CompareSummary = {
  left: ProductLike
  right: ProductLike
  cheaperItem: ProductLike | null
  higherScoreItem: ProductLike | null
  recommendationText: string
}
