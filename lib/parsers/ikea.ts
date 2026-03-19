export type ParsedFurnitureProduct = {
  product_name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  description: string | null;
  color: string | null;
  material: string | null;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  metadata_json: Record<string, any>;
};

const STRONGLY_EXCLUDED_DIMENSION_CONTEXTS = [
  "포장",
  "포장높이",
  "포장 높이",
  "포장치수",
  "포장 치수",
  "패키지",
  "패키지 높이",
  "박스",
  "상자",
  "배송",
  "배송치수",
  "배송 치수",
];

const WEAKLY_EXCLUDED_DIMENSION_CONTEXTS = [
  "시트",
  "좌석",
  "팔걸이",
  "등판",
  "매트리스",
  "서랍내부",
  "내부",
  "쿠션",
  "다리",
  "프레임 내부",
  "헤드레스트",
  "받침",
];

function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html: string): string {
  if (!html) return "";

  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
      .replace(
        /<\/(p|div|li|tr|td|th|section|article|h1|h2|h3|h4|h5|h6)>/gi,
        "\n"
      )
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function extractProductName(html: string): string | null {
  if (!html) return null;

  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogTitleMatch?.[1]) return ogTitleMatch[1].trim();

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return decodeHtml(titleMatch[1]).trim();
  }

  const metaDescriptionMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  if (metaDescriptionMatch?.[1]) {
    const firstChunk = metaDescriptionMatch[1].split(",")[0]?.trim();
    return firstChunk || null;
  }

  return null;
}

function extractPrice(html: string): number | null {
  if (!html) return null;

  const patterns = [
    /"price"\s*:\s*"?(\d[\d,]*)"?/i,
    /₩\s*(\d[\d,]*)/i,
    /KRW\s*(\d[\d,]*)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const raw = match?.[1];
    if (!raw) continue;

    const value = Number(raw.replace(/[^\d]/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }

  return null;
}

function extractImageUrl(html: string): string | null {
  if (!html) return null;

  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImageMatch?.[1]) return ogImageMatch[1].trim();

  const imgSrcMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgSrcMatch?.[1]) return imgSrcMatch[1].trim();

  return null;
}

function extractDescription(html: string): string | null {
  if (!html) return null;

  const metaDescriptionMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  if (metaDescriptionMatch?.[1]) {
    return metaDescriptionMatch[1].trim();
  }

  return null;
}

function normalizeCategory(text: string): string {
  const value = text.toLowerCase();

  if (value.includes("sofa") || value.includes("소파")) return "sofa";
  if (
    value.includes("chair") ||
    value.includes("의자") ||
    value.includes("암체어")
  ) {
    return "chair";
  }
  if (value.includes("table") || value.includes("테이블")) return "table";
  if (
    value.includes("storage") ||
    value.includes("수납") ||
    value.includes("선반") ||
    value.includes("서랍")
  ) {
    return "storage";
  }
  if (value.includes("bed") || value.includes("침대")) return "bed";
  if (value.includes("lamp") || value.includes("조명")) return "lighting";
  if (value.includes("desk") || value.includes("책상")) return "desk";
  if (value.includes("decor") || value.includes("장식")) return "decor";

  return "unknown";
}

function toCm(value: number, unit?: string): number {
  const u = (unit || "cm").toLowerCase();

  if (u === "mm") return Math.round((value / 10) * 10) / 10;
  if (u === "m") return Math.round(value * 100 * 10) / 10;

  return Math.round(value * 10) / 10;
}

function hasStronglyExcludedDimensionContext(line: string): boolean {
  return STRONGLY_EXCLUDED_DIMENSION_CONTEXTS.some((keyword) =>
    line.includes(keyword)
  );
}

function hasWeaklyExcludedDimensionContext(line: string): boolean {
  return WEAKLY_EXCLUDED_DIMENSION_CONTEXTS.some((keyword) =>
    line.includes(keyword)
  );
}

function extractDimensionValue(text: string, labels: string[]): number | null {
  const escaped = labels
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const patterns = [
    new RegExp(
      `(?:^|\\s)(?:${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?(?:\\s|$)`,
      "i"
    ),
    new RegExp(
      `(?:^|\\s)(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?\\s*(?:${escaped})(?:\\s|$)`,
      "i"
    ),
  ];

  const lines = text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (hasStronglyExcludedDimensionContext(line)) continue;
    if (hasWeaklyExcludedDimensionContext(line)) continue;

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (!match) continue;

      const value = Number(match[1].replace(",", "."));
      const unit = match[2];

      if (Number.isFinite(value)) {
        return toCm(value, unit);
      }
    }
  }

  return null;
}

function extractHeightValue(text: string): number | null {
  const lines = text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const primaryLabels = ["높이", "총높이", "height"];
  const secondaryLabels = ["등받이H", "등받이 높이"];

  const tryExtract = (line: string, labels: string[]): number | null => {
    const escaped = labels
      .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");

    const patterns = [
      new RegExp(
        `(?:^|\\s)(?:${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?(?:\\s|$)`,
        "i"
      ),
      new RegExp(
        `(?:^|\\s)(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?\\s*(?:${escaped})(?:\\s|$)`,
        "i"
      ),
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (!match) continue;

      const value = Number(match[1].replace(",", "."));
      const unit = match[2];

      if (Number.isFinite(value)) {
        return toCm(value, unit);
      }
    }

    return null;
  };

  for (const line of lines) {
    if (hasStronglyExcludedDimensionContext(line)) continue;
    if (hasWeaklyExcludedDimensionContext(line)) continue;

    const value = tryExtract(line, primaryLabels);
    if (value != null) return value;
  }

  for (const line of lines) {
    if (hasStronglyExcludedDimensionContext(line)) continue;
    if (line.includes("시트") || line.includes("팔걸이")) continue;

    const value = tryExtract(line, secondaryLabels);
    if (value != null) return value;
  }

  return null;
}

function extractCompactDimensions(text: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
} {
  const lines = text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (hasStronglyExcludedDimensionContext(line)) continue;
    if (hasWeaklyExcludedDimensionContext(line)) continue;

    const compact = line.match(
      /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)/i
    );

    if (!compact) continue;

    const a = Number(compact[1].replace(",", "."));
    const b = Number(compact[2].replace(",", "."));
    const c = Number(compact[3].replace(",", "."));
    const unit = compact[4];

    if ([a, b, c].every(Number.isFinite)) {
      return {
        width_cm: toCm(a, unit),
        depth_cm: toCm(b, unit),
        height_cm: toCm(c, unit),
      };
    }
  }

  return {
    width_cm: null,
    depth_cm: null,
    height_cm: null,
  };
}

function extractDimensions(html: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  raw_dimension_text: string | null;
} {
  if (!html) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      raw_dimension_text: null,
    };
  }

  const text = stripHtml(html);

  const keywordCandidates = [
    "치수",
    "제품 크기",
    "제품크기",
    "사이즈",
    "규격",
    "dimensions",
    "size",
  ];

  let sectionText = text;

  for (const keyword of keywordCandidates) {
    const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - 100);
      const end = Math.min(text.length, idx + 1800);
      sectionText = text.slice(start, end);
      break;
    }
  }

  const lines = sectionText
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const priorityLines = lines.slice(0, 12).join("\n");
  const fullSection = lines.join("\n");

  let width_cm = extractDimensionValue(priorityLines, [
    "폭",
    "가로",
    "너비",
    "width",
  ]);
  let depth_cm = extractDimensionValue(priorityLines, [
    "깊이",
    "세로",
    "depth",
  ]);
  let height_cm = extractHeightValue(priorityLines);

  if (width_cm == null) {
    width_cm = extractDimensionValue(fullSection, ["폭", "가로", "너비", "width"]);
  }
  if (depth_cm == null) {
    depth_cm = extractDimensionValue(fullSection, ["깊이", "세로", "depth"]);
  }
  if (height_cm == null) {
    height_cm = extractHeightValue(fullSection);
  }

  if (width_cm == null || depth_cm == null || height_cm == null) {
    const compact = extractCompactDimensions(priorityLines || fullSection);

    if (width_cm == null) width_cm = compact.width_cm;
    if (depth_cm == null) depth_cm = compact.depth_cm;
    if (height_cm == null) height_cm = compact.height_cm;
  }

  return {
    width_cm,
    depth_cm,
    height_cm,
    raw_dimension_text: fullSection || null,
  };
}

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const html =
    raw?.full_html ??
    raw?.html ??
    raw?.raw_html ??
    raw?.raw_payload?.full_html ??
    raw?.raw_payload?.html ??
    raw?.html_snippet ??
    raw?.raw_payload?.html_snippet ??
    "";

  const productName = extractProductName(html);
  const price = extractPrice(html);
  const imageUrl = extractImageUrl(html);
  const description = extractDescription(html);

  const categorySource = [productName, description].filter(Boolean).join(" ");
  const category = normalizeCategory(categorySource);

  const dims = extractDimensions(html);

  return {
    product_name: productName,
    brand: "IKEA",
    category,
    price,
    currency: "KRW",
    image_url: imageUrl,
    description,
    color: null,
    material: null,
    width_cm: dims.width_cm,
    depth_cm: dims.depth_cm,
    height_cm: dims.height_cm,
    metadata_json: {
      raw_preview: typeof html === "string" ? html.slice(0, 300) : "",
      dimension_debug: {
        html_length: typeof html === "string" ? html.length : 0,
        has_dimension_keyword:
          typeof html === "string"
            ? html.includes("치수") ||
              html.includes("제품 크기") ||
              html.toLowerCase().includes("dimensions")
            : false,
        width_cm: dims.width_cm,
        depth_cm: dims.depth_cm,
        height_cm: dims.height_cm,
        raw_dimension_text_preview:
          dims.raw_dimension_text?.slice(0, 1000) ?? null,
        parser_version: "ikea-dim-v4",
      },
    },
  };
}