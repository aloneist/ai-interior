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
    $("section, article, div, li, details").each((_, el) => {
      const t = textOf($, el);
      if (!t) return;

      const hasDimensionLabels =
        t.includes("폭") ||
        t.includes("깊이") ||
        t.includes("등받이H") ||
        t.includes("등받이 높이") ||
        t.includes("높이") ||
        t.includes("총높이") ||
        t.includes("H(등쿠션포함)") ||
        t.includes("H(쿠션포함)");

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
          /(폭|깊이|높이|총높이|등받이H|등받이 높이|H\(등쿠션포함\)|H\(쿠션포함\))\s*[:：]?\s*\d/gi
        )?.length ?? 0;

      const unitCount =
        section.match(/\d+(?:[.,]\d+)?\s*(cm|mm|m)\b/gi)?.length ?? 0;

      score += labelCount * 12;
      score += unitCount * 6;

      if (section.includes("치수")) score += 10;
      if (section.includes("등받이H")) score += 6;
      if (section.includes("높이")) score += 8;
      if (section.includes("총높이")) score += 8;
      if (section.includes("H(등쿠션포함)")) score += 14;
      if (section.includes("H(쿠션포함)")) score += 12;
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
  return best || null;
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
