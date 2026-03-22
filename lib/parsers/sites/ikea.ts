import * as cheerio from "cheerio";
import { normalizeCategory } from "@/lib/parsers/shared/category";
import { buildParserDebug } from "@/lib/parsers/shared/debug";
import {
  decodeHtml,
  htmlToVisibleText,
  normalizeText,
} from "@/lib/parsers/shared/text";
import type { RawProductSnapshot } from "@/lib/parsers/shared/snapshot";

const STOP_SECTION_KEYWORDS = [
  "포장",
  "상품평",
  "고시 정보",
  "안전 및 규정 준수",
  "제품 설명",
  "소재 및 관리",
  "관련 상품",
];

function textOf($: cheerio.CheerioAPI, el: any): string {
  return normalizeText($(el).text() || "");
}

function extractProductName(html: string): string | null {
  if (!html) return null;

  const ogTitleMatch = html.match(
    /<meta[^>]+property=[\"']og:title[\"'][^>]+content=[\"']([^\"']+)[\"']/i
  );
  if (ogTitleMatch?.[1]) return ogTitleMatch[1].trim();

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return decodeHtml(titleMatch[1]).trim();
  }

  const metaDescriptionMatch = html.match(
    /<meta[^>]+name=[\"']description[\"'][^>]+content=[\"']([^\"']+)[\"']/i
  );
  if (metaDescriptionMatch?.[1]) {
    const firstChunk = metaDescriptionMatch[1].split(",")[0]?.trim();
    return firstChunk || null;
  }

  return null;
}

function extractPriceText(html: string): string | null {
  if (!html) return null;

  const patterns = [
    /\"price\"\s*:\s*\"?(\d[\d,]*)\"?/i,
    /₩\s*(\d[\d,]*)/i,
    /KRW\s*(\d[\d,]*)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const raw = match?.[1];
    if (!raw) continue;
    return raw;
  }

  return null;
}

function extractImageUrl(html: string): string | null {
  if (!html) return null;

  const ogImageMatch = html.match(
    /<meta[^>]+property=[\"']og:image[\"'][^>]+content=[\"']([^\"']+)[\"']/i
  );
  if (ogImageMatch?.[1]) return ogImageMatch[1].trim();

  const imgSrcMatch = html.match(/<img[^>]+src=[\"']([^\"']+)[\"']/i);
  if (imgSrcMatch?.[1]) return imgSrcMatch[1].trim();

  return null;
}

function extractDescription(html: string): string | null {
  if (!html) return null;

  const metaDescriptionMatch = html.match(
    /<meta[^>]+name=[\"']description[\"'][^>]+content=[\"']([^\"']+)[\"']/i
  );
  if (metaDescriptionMatch?.[1]) {
    return metaDescriptionMatch[1].trim();
  }

  return null;
}

function extractDimensionSection(html: string): string | null {
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
    const text = htmlToVisibleText(html);
    const idx = text.indexOf("치수");
    if (idx >= 0) {
      return text.slice(idx, Math.min(text.length, idx + 1200)).trim();
    }
    return text.slice(0, 1200).trim();
  }

  return candidates[0]?.trim() || null;
}

export function extractIkeaSnapshot(raw: any): RawProductSnapshot {
  const html =
    raw?.full_html ??
    raw?.html ??
    raw?.raw_html ??
    raw?.raw_payload?.full_html ??
    raw?.raw_payload?.html ??
    raw?.html_snippet ??
    raw?.raw_payload?.html_snippet ??
    "";

  const title = extractProductName(html);
  const description = extractDescription(html);
  const categoryHint = normalizeCategory(
    [title, description].filter(Boolean).join(" ")
  );
  const dimensionSectionText = extractDimensionSection(html);

  return {
    source_site: "ikea",
    source_url: raw?.url ?? raw?.source_url ?? null,
    html,
    title,
    price_text: extractPriceText(html),
    image_url: extractImageUrl(html),
    description,
    category_hint: categoryHint,
    dimension_section_text: dimensionSectionText,
    metadata_json: {
      parser_version: "ikea-site-snapshot-v1",
      debug: buildParserDebug({
        html_length: typeof html === "string" ? html.length : 0,
        has_dimension_keyword:
          typeof html === "string"
            ? html.includes("치수") ||
              html.includes("제품 크기") ||
              html.toLowerCase().includes("dimensions")
            : false,
        width_cm: null,
        depth_cm: null,
        height_cm: null,
        raw_dimension_text_preview: dimensionSectionText?.slice(0, 1000) ?? null,
        parser_version: "ikea-site-snapshot-v1",
      }),
    },
  };
}
