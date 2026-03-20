import * as cheerio from "cheerio";

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

const STOP_SECTION_KEYWORDS = [
  "포장",
  "상품평",
  "고시 정보",
  "안전 및 규정 준수",
  "제품 설명",
  "소재 및 관리",
  "관련 상품",
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

function normalizeText(input: string): string {
  return decodeHtml(input)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textOf($: cheerio.CheerioAPI, el: any): string {
  return normalizeText($(el).text() || "");
}

function htmlToVisibleText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  const blockTags = new Set([
    "div",
    "section",
    "article",
    "main",
    "aside",
    "nav",
    "header",
    "footer",
    "p",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "br",
    "button",
    "summary",
    "details",
  ]);

  const chunks: string[] = [];

  function walk(node: any) {
    if (!node) return;

    if (node.type === "text") {
      const text = node.data?.trim();
      if (text) chunks.push(text);
      return;
    }

    if (node.type === "tag") {
      const tag = node.name?.toLowerCase();
      if (blockTags.has(tag)) chunks.push("\n");
      if (node.children?.length) {
        for (const child of node.children) walk(child);
      }
      if (blockTags.has(tag)) chunks.push("\n");
    }
  }

  const rootChildren = $.root().children().toArray();
  for (const child of rootChildren) walk(child);

  return normalizeText(chunks.join(" "));
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

function makeLabelPattern(labels: string[]): RegExp {
  const escaped = labels
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  return new RegExp(
    `(${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?`,
    "i"
  );
}

function extractDimensionSection(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  const candidates: string[] = [];

  $("h1, h2, h3, h4, h5, h6, button, summary, span, div").each((_, el) => {
    const t = textOf($, el);
    if (!t) return;

    const isDimensionHeading =
      t === "치수" ||
      t.startsWith("치수") ||
      t === "제품 크기" ||
      t === "제품크기";

    if (!isDimensionHeading) return;

    const parent = $(el).parent();
    const parentText = normalizeText(parent.text());
    if (parentText) candidates.push(parentText);

    let current = parent.next();
    const chunks: string[] = [t];

    while (current.length) {
      const currentText = normalizeText(current.text());
      if (STOP_SECTION_KEYWORDS.some((kw) => currentText.includes(kw))) break;
      if (currentText) chunks.push(currentText);
      current = current.next();
    }

    const joined = normalizeText(chunks.join("\n"));
    if (joined) candidates.push(joined);
  });

  if (candidates.length === 0) {
    $("section, article, div, li, details").each((_, el) => {
      const t = textOf($, el);
      if (!t) return;

      const hasDimensionLabels =
        t.includes("폭") ||
        t.includes("깊이") ||
        t.includes("등받이H") ||
        t.includes("등받이 높이") ||
        t.includes("높이");

      if (t.includes("치수") && hasDimensionLabels) {
        candidates.push(t);
      }
    });
  }

  if (candidates.length === 0) {
    const text = htmlToVisibleText(html);
    const idx = text.indexOf("치수");
    if (idx >= 0) {
      return text.slice(idx, Math.min(text.length, idx + 1200)).trim();
    }
    return text.slice(0, 1200).trim();
  }

  const scored = candidates
    .map((section) => {
      let score = 0;

      const labelCount =
        section.match(
          /(폭|깊이|높이|등받이H|등받이 높이)\s*[:：]?\s*\d/gi
        )?.length ?? 0;
      const unitCount =
        section.match(/\d+(?:[.,]\d+)?\s*(cm|mm|m)\b/gi)?.length ?? 0;

      score += labelCount * 12;
      score += unitCount * 6;

      if (section.includes("치수")) score += 10;
      if (section.includes("등받이H")) score += 12;
      if (section.includes("깊이")) score += 8;
      if (section.includes("폭")) score += 8;

      for (const kw of STOP_SECTION_KEYWORDS) {
        if (kw !== "포장" && section.includes(kw)) score -= 8;
      }
      if (section.includes("제품 설명")) score -= 20;

      return { section, score };
    })
    .sort((a, b) => b.score - a.score);

  let best = scored[0].section.trim();

  const packagingKeywords = ["포장", "패키지", "배송"];
  let cutIndex = best.length;

  for (const keyword of packagingKeywords) {
    const idx = best.indexOf(keyword);
    if (idx > 0 && idx < cutIndex) {
      cutIndex = idx;
    }
  }

  best = best.slice(0, cutIndex).trim();
  return best;
}

function normalizeDimensionSectionForParsing(sectionText: string): string {
  let text = normalizeText(sectionText);

  const boundaryLabels = [
    "치수",
    "팔걸이 높이",
    "팔걸이 너비",
    "깊이",
    "가구 밑 여유공간",
    "등받이H",
    "등받이 높이",
    "시트 깊이",
    "시트 높이",
    "시트 폭",
    "폭",
    "가로",
    "너비",
    "높이",
    "총높이",
  ];

  for (const label of boundaryLabels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*${escaped}\\s*:`, "g"), `\n${label}:`);
  }

  text = text
    .replace(/등받이H:\s*([0-9]+(?:[.,][0-9]+)?)\s*(cm|mm|m)?시트/g, "등받이H: $1 $2\n시트")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return text;
}

function buildContextLine(lines: string[], index: number): string {
  const prev = lines[index - 1] ?? "";
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return `${prev} ${current} ${next}`.trim();
}

function extractFromLines(params: {
  text: string;
  labels: string[];
  strongExclude?: string[];
  weakExclude?: string[];
  allowWeakFor?: string[];
}): number | null {
  const {
    text,
    labels,
    strongExclude = STRONGLY_EXCLUDED_DIMENSION_CONTEXTS,
    weakExclude = WEAKLY_EXCLUDED_DIMENSION_CONTEXTS,
    allowWeakFor = [],
  } = params;

  const pattern = makeLabelPattern(labels);
  const allowedWeakSet = new Set(allowWeakFor);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const contextLine = buildContextLine(lines, i);

    const match = line.match(pattern);
    if (!match) continue;

    const matchedLabel = match[1];
    const rawValue = match[2];
    const unit = match[3];

    const hasStrong = strongExclude.some((kw) => contextLine.includes(kw));
    if (hasStrong) continue;

    const shouldApplyWeak = !allowedWeakSet.has(matchedLabel);
    const hasWeak = weakExclude.some((kw) => contextLine.includes(kw));
    if (shouldApplyWeak && hasWeak) continue;

    const value = Number(rawValue.replace(",", "."));
    if (Number.isFinite(value)) {
      return toCm(value, unit);
    }
  }

  return null;
}

function extractCompactDimensions(text: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
} {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const contextLine = buildContextLine(lines, i);

    const hasStrong = STRONGLY_EXCLUDED_DIMENSION_CONTEXTS.some((kw) =>
      contextLine.includes(kw)
    );
    const hasWeak = WEAKLY_EXCLUDED_DIMENSION_CONTEXTS.some((kw) =>
      contextLine.includes(kw)
    );

    if (hasStrong || hasWeak) continue;

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

  const rawSectionText = extractDimensionSection(html);
  const sectionText = normalizeDimensionSectionForParsing(rawSectionText);

  // width: 폭 우선, 너비는 fallback
  let width_cm = extractFromLines({
    text: sectionText,
    labels: ["폭", "가로", "width"],
  });

  if (width_cm == null) {
    width_cm = extractFromLines({
      text: sectionText,
      labels: ["너비"],
    });
  }

  // depth: 깊이 우선
  let depth_cm = extractFromLines({
    text: sectionText,
    labels: ["깊이", "depth"],
  });

  if (depth_cm == null) {
    depth_cm = extractFromLines({
      text: sectionText,
      labels: ["세로"],
    });
  }

  // height: 등받이H 우선, 일반 높이는 fallback
  let height_cm = extractFromLines({
    text: sectionText,
    labels: ["등받이H", "등받이 높이"],
    allowWeakFor: ["등받이H", "등받이 높이"],
  });

  if (height_cm == null) {
    height_cm = extractFromLines({
      text: sectionText,
      labels: ["높이", "총높이", "height"],
    });
  }

  if (width_cm == null || depth_cm == null || height_cm == null) {
    const compact = extractCompactDimensions(sectionText);

    return {
      width_cm: width_cm ?? compact.width_cm,
      depth_cm: depth_cm ?? compact.depth_cm,
      height_cm: height_cm ?? compact.height_cm,
      raw_dimension_text: sectionText || null,
    };
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
        parser_version: "ikea-dim-v13",
      },
    },
  };
}