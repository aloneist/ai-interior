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
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
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
  if (value.includes("chair") || value.includes("의자") || value.includes("암체어")) return "chair";
  if (value.includes("table") || value.includes("테이블")) return "table";
  if (
    value.includes("storage") ||
    value.includes("수납") ||
    value.includes("선반") ||
    value.includes("서랍")
  ) return "storage";
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

function extractDimensionValue(text: string, labels: string[]): number | null {
  const escaped = labels.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

  const patterns = [
    new RegExp(`(?:${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?`, "i"),
    new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?\\s*(?:${escaped})`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const value = Number(match[1].replace(",", "."));
    const unit = match[2];

    if (Number.isFinite(value)) {
      return toCm(value, unit);
    }
  }

  return null;
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
      const start = Math.max(0, idx - 200);
      const end = Math.min(text.length, idx + 2500);
      sectionText = text.slice(start, end);
      break;
    }
  }

  let width_cm = extractDimensionValue(sectionText, ["폭", "가로", "너비", "width", "w"]);
  let depth_cm = extractDimensionValue(sectionText, ["깊이", "세로", "depth", "d"]);
  let height_cm = extractDimensionValue(sectionText, ["높이", "총높이", "height", "h"]);

  // 121 x 78 x 78 cm 형태 보조 추출
  if (width_cm == null || depth_cm == null || height_cm == null) {
    const compact = sectionText.match(
      /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)/i
    );

    if (compact) {
      const a = Number(compact[1].replace(",", "."));
      const b = Number(compact[2].replace(",", "."));
      const c = Number(compact[3].replace(",", "."));
      const unit = compact[4];

      if (width_cm == null && Number.isFinite(a)) width_cm = toCm(a, unit);
      if (depth_cm == null && Number.isFinite(b)) depth_cm = toCm(b, unit);
      if (height_cm == null && Number.isFinite(c)) height_cm = toCm(c, unit);
    }
  }

  return {
    width_cm,
    depth_cm,
    height_cm,
    raw_dimension_text: sectionText || null,
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
        parser_version: "ikea-dim-v2",
      },
    },
  };
}