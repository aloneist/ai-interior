type RawAnalysisInput = {
  brightness_score?: number
  color_temperature_score?: number
  spatial_density_score?: number
  minimalism_score?: number
  contrast_score?: number
  colorfulness_score?: number
  dominant_color_hex?: string
}

export type NormalizedRoomAnalysis = {
  brightness: number
  temperature: number
  density: number
  minimalism: number
  contrast: number
  colorfulness: number
  dominant_color_hex: string
}

export type RoomLabels = {
  brightness: string
  temperature: string
  density: string
  minimalism: string
  contrast: string
  colorfulness: string
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function normalizeScore(value: unknown, fallback = 50) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback
  return clamp(Math.round(value))
}

function normalizeHex(value: unknown) {
  if (typeof value !== "string") return "#808080"
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#808080"
}

export function normalizeRoomAnalysis(raw: RawAnalysisInput): NormalizedRoomAnalysis {
  return {
    brightness: normalizeScore(raw.brightness_score),
    temperature: normalizeScore(raw.color_temperature_score),
    density: normalizeScore(raw.spatial_density_score),
    minimalism: normalizeScore(raw.minimalism_score),
    contrast: normalizeScore(raw.contrast_score),
    colorfulness: normalizeScore(raw.colorfulness_score),
    dominant_color_hex: normalizeHex(raw.dominant_color_hex),
  }
}

export function calcTrustScore(params: {
  brightness: number
  density: number
  contrast: number
  colorfulness: number
}) {
  const { brightness, density, contrast, colorfulness } = params

  let score = 100

  if (brightness < 8 || brightness > 97) score -= 12
  if (density < 4 || density > 96) score -= 10
  if (contrast < 3 || contrast > 97) score -= 8
  if (colorfulness < 2 || colorfulness > 98) score -= 8

  return clamp(score)
}

export function trustNote(trustScore: number) {
  if (trustScore >= 85) return null
  if (trustScore >= 70) {
    return "이미지 특성상 일부 점수는 보수적으로 해석되었어요."
  }
  return "사진 품질이나 구도 영향으로 추천 신뢰도가 다소 낮을 수 있어요."
}

export function labelRoom(params: {
  brightness: number
  temperature: number
  density: number
  minimalism: number
  contrast: number
  colorfulness: number
}): RoomLabels {
  const { brightness, temperature, density, minimalism, contrast, colorfulness } =
    params

  return {
    brightness:
      brightness >= 67 ? "밝은" : brightness <= 33 ? "어두운" : "중간 밝기의",
    temperature:
      temperature >= 67 ? "웜톤" : temperature <= 33 ? "쿨톤" : "중성 톤",
    density:
      density >= 67 ? "밀도 높은" : density <= 33 ? "여유 있는" : "적당한 밀도의",
    minimalism:
      minimalism >= 67 ? "미니멀한" : minimalism <= 33 ? "장식 요소가 있는" : "균형 잡힌",
    contrast:
      contrast >= 67 ? "대비감 있는" : contrast <= 33 ? "부드러운 대비의" : "중간 대비의",
    colorfulness:
      colorfulness >= 67 ? "컬러감 있는" : colorfulness <= 33 ? "차분한 색감의" : "적당한 색감의",
  }
}