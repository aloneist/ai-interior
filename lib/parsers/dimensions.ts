import * as cheerio from "cheerio";

export type ParsedDimensions = {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  raw_dimension_text: string | null;
};

type DimensionKey = "width_cm" | "depth_cm" | "height_cm";

const SECTION_KEYWORDS = [
  "치수",
  "제품 크기",
  "제품크기",
  "사이즈",
  "규격",
  "상품 정보 제공 고시",
  "상품정보",
  "제품정보",
  "상세정보",
  "dimensions",
  "size",
  "specification",
  "specifications",
];

const WIDTH_LABELS = [
  "폭",
  "가로",
  "너비",
  "width",
  "w",
];

const DEPTH_LABELS = [
  "깊이",
  "세로",
  "depth",
  "d",
];

const HEIGHT_LABELS = [
  "높이",
  "총높이",
  "height",
  "h",
];

function decodeHtmlEntitiesLite(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"');
}

function normalizeText(input: string): string {
  return decodeHtmlEntitiesLite(input)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToVisibleText(html: string): string {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg").remove();

  const text = $("body").text() || $.root().text() || "";
  return normalizeText(text);
}

function safeStringifyJsonScripts(html: string): string {
  const $ = cheerio.load(html);
  const chunks: string[] = [];

  $('script[type="application/ld+json"], script[type="application/json"], script#__NEXT_DATA__').each(
    (_, el) => {
      const txt = $(el).html();
      if (txt) chunks.push(txt);
    }
  );

  return normalizeText(chunks.join("\n"));
}

function toCm(value: number, unitRaw: string | undefined): number {
  const unit = (unitRaw || "cm").toLowerCase();

  if (unit === "cm") return round1(value);
  if (unit === "mm") return round1(value / 10);
  if (unit === "m") return round1(value * 100);

  return round1(value);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function findSectionAroundKeywords(fullText: string): string {
  const lower = fullText.toLowerCase();
  const matchedKeyword = SECTION_KEYWORDS.find((kw) => lower.includes(kw.toLowerCase()));

  if (!matchedKeyword) {
    return fullText.slice(0, 12000);
  }

  const idx = lower.indexOf(matchedKeyword.toLowerCase());
  const start = Math.max(0, idx - 500);
  const end = Math.min(fullText.length, idx + 4000);

  return fullText.slice(start, end);
}

function buildPatterns(labels: string[]): RegExp[] {
  const labelGroup = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  return [
    // 예: 폭 121 cm / width 121 cm
    new RegExp(`(?:^|\\b)(${labelGroup})\\s*[:：]?[ ]*([0-9]+(?:[.,][0-9]+)?)\\s*(cm|mm|m)?`, "i"),

    // 예: 폭: 121 / width: 121
    new RegExp(`(?:^|\\b)(${labelGroup})\\s*[:：]?[ ]*([0-9]+(?:[.,][0-9]+)?)`, "i"),

    // 예: 121 cm 폭 / 121 width
    new RegExp(`([0-9]+(?:[.,][0-9]+)?)\\s*(cm|mm|m)?\\s*(${labelGroup})(?:\\b|$)`, "i"),
  ];
}

function extractByLabel(sectionText: string, labels: string[]): number | null {
  const lines = sectionText
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);

  const patterns = buildPatterns(labels);

  for (const line of lines) {
    for (const pattern of patterns) {
      const m = line.match(pattern);
      if (!m) continue;

      // 패턴 1/2: label, value, unit
      if (m[1] && m[2]) {
        const rawValue = Number(String(m[2]).replace(",", "."));
        const unit = m[3];
        if (!Number.isNaN(rawValue)) return toCm(rawValue, unit);
      }

      // 패턴 3: value, unit, label
      if (m[1] && !Number.isNaN(Number(String(m[1]).replace(",", ".")))) {
        const rawValue = Number(String(m[1]).replace(",", "."));
        const unit = m[2];
        if (!Number.isNaN(rawValue)) return toCm(rawValue, unit);
      }
    }
  }

  return null;
}

function extractByCompactPattern(sectionText: string): Partial<ParsedDimensions> {
  const normalized = normalizeText(sectionText);

  // 예: 121x78x83 cm / 121 x 78 x 83 cm
  // 일반적으로 width x depth x height 순서로 많이 표기됨
  const compact = normalized.match(
    /([0-9]+(?:[.,][0-9]+)?)\s*[x×]\s*([0-9]+(?:[.,][0-9]+)?)\s*[x×]\s*([0-9]+(?:[.,][0-9]+)?)\s*(cm|mm|m)/i
  );

  if (!compact) return {};

  const a = Number(compact[1].replace(",", "."));
  const b = Number(compact[2].replace(",", "."));
  const c = Number(compact[3].replace(",", "."));
  const unit = compact[4];

  if ([a, b, c].some(Number.isNaN)) return {};

  return {
    width_cm: toCm(a, unit),
    depth_cm: toCm(b, unit),
    height_cm: toCm(c, unit),
  };
}

export function extractDimensionsFromHtml(html: string): ParsedDimensions {
  if (!html || !html.trim()) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      raw_dimension_text: null,
    };
  }

  const visibleText = htmlToVisibleText(html);
  const jsonText = safeStringifyJsonScripts(html);

  const fullText = normalizeText(`${visibleText}\n${jsonText}`);
  const sectionText = findSectionAroundKeywords(fullText);

  let width_cm = extractByLabel(sectionText, WIDTH_LABELS);
  let depth_cm = extractByLabel(sectionText, DEPTH_LABELS);
  let height_cm = extractByLabel(sectionText, HEIGHT_LABELS);

  // label 기반 추출 실패 시 compact 패턴 보조 사용
  if (width_cm == null || depth_cm == null || height_cm == null) {
    const compact = extractByCompactPattern(sectionText);

    width_cm ??= compact.width_cm ?? null;
    depth_cm ??= compact.depth_cm ?? null;
    height_cm ??= compact.height_cm ?? null;
  }

  return {
    width_cm,
    depth_cm,
    height_cm,
    raw_dimension_text: sectionText || null,
  };
}