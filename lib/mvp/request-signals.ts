export type RequestSignals = {
  wantsAiry: boolean
  wantsBright: boolean
  wantsCalm: boolean
  wantsMinimal: boolean
  wantsWarm: boolean
}

const REQUEST_KEYWORDS = {
  airy: ["답답", "좁", "넓", "가벼", "여유"],
  bright: ["밝", "화사", "환한"],
  calm: ["차분", "잔잔", "정돈"],
  minimal: ["미니멀", "깔끔", "단정", "심플"],
  warm: ["따뜻", "우드", "포근"],
} as const

export function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

export function includesAnyKeyword(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

export function parseRequestSignals(requestText?: string): RequestSignals {
  const text = normalizeText(requestText)

  return {
    wantsAiry: includesAnyKeyword(text, REQUEST_KEYWORDS.airy),
    wantsBright: includesAnyKeyword(text, REQUEST_KEYWORDS.bright),
    wantsCalm: includesAnyKeyword(text, REQUEST_KEYWORDS.calm),
    wantsMinimal: includesAnyKeyword(text, REQUEST_KEYWORDS.minimal),
    wantsWarm: includesAnyKeyword(text, REQUEST_KEYWORDS.warm),
  }
}