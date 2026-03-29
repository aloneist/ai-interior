import type {
  BudgetLevel,
  FurnitureType,
  RoomType,
  StyleTag,
} from "@/types/mvp"

export function toRoomTypeLabel(roomType?: string | RoomType | null) {
  if (roomType === "living") return "거실"
  if (roomType === "bedroom") return "침실"
  if (roomType === "workspace") return "작업 공간"
  if (roomType === "dining") return "다이닝 공간"
  return null
}

export function toBudgetLabel(budget?: string | BudgetLevel | null) {
  if (budget === "low") return "낮은 예산"
  if (budget === "medium") return "보통 예산"
  if (budget === "high") return "여유 있는 예산"
  return null
}

export function toStyleLabel(style: string | StyleTag) {
  if (style === "modern") return "모던"
  if (style === "minimal") return "미니멀"
  if (style === "warm-wood") return "따뜻한 우드톤"
  if (style === "bright") return "밝고 화사한"
  if (style === "calm") return "차분한"
  if (style === "hotel") return "호텔 같은 느낌"
  return style
}

export function toFurnitureLabel(furniture: string | FurnitureType) {
  if (furniture === "sofa") return "소파"
  if (furniture === "chair") return "의자"
  if (furniture === "table") return "테이블"
  return furniture
}