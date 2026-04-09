import * as cheerio from "cheerio";
import {
  resolveCategory,
  type CategoryResolution,
} from "@/lib/parsers/shared/category";
import { parseDimensionValueToCm } from "@/lib/parsers/shared/dimensions";
import { buildParserDebug } from "@/lib/parsers/shared/debug";
import {
  decodeHtml,
  htmlToVisibleText,
  normalizeText,
  splitLines,
} from "@/lib/parsers/shared/text";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";

type LivartRawInput = {
  full_html?: string;
  html?: string;
  raw_html?: string;
  html_snippet?: string;
  url?: string | null;
  source_url?: string | null;
  raw_payload?: {
    full_html?: string;
    html?: string;
    html_snippet?: string;
  } | null;
};

type LivartDimensionSelection = {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  rawDimensionText: string | null;
  selectedLine: string | null;
  selectedUnit: string | null;
  rangePolicyApplied: "max" | null;
};

const LIVART_PARSER_VERSION = "livart-meta-v2";
const LIVART_DIMENSION_CONTEXT_EXCLUDE_PATTERN =
  /closet-calculation|section__show-calculation|selfWidth|selfDepth|selfHeight|붙박이장이 들어갈 벽의 치수를 기입해 주세요|계산하기/i;
const LIVART_DIMENSION_LINE_EXCLUDE_PATTERN =
  /(좌방석|좌석|시트|등받이|팔걸이|헤드레스트|쿠션|오토만|스툴|발받침|내경|외경|자가실측)/i;

function getHtml(raw: LivartRawInput | null | undefined) {
  return (
    raw?.full_html ??
    raw?.html ??
    raw?.raw_html ??
    raw?.raw_payload?.full_html ??
    raw?.raw_payload?.html ??
    raw?.html_snippet ??
    raw?.raw_payload?.html_snippet ??
    ""
  );
}

function getSourceUrl(raw: LivartRawInput | null | undefined) {
  return normalizeText(raw?.source_url ?? raw?.url ?? "") || null;
}

function extractMetaContent(html: string, selector: string) {
  const $ = cheerio.load(html);
  const content = $(selector).attr("content");
  return content ? normalizeText(content) : null;
}

function extractTitle(html: string) {
  const ogTitle = extractMetaContent(html, 'meta[property="og:title"]');
  if (ogTitle) return ogTitle;

  const twitterTitle = extractMetaContent(html, 'meta[name="twitter:title"]');
  if (twitterTitle) return twitterTitle;

  const description = extractMetaContent(html, 'meta[name="description"]');
  if (description) return description;

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return normalizeText(decodeHtml(titleMatch[1]));
  }

  return null;
}

function extractImageUrl(html: string) {
  return (
    extractMetaContent(html, 'meta[property="og:image"]') ??
    extractMetaContent(html, 'meta[name="twitter:image"]') ??
    null
  );
}

function extractDescription(html: string) {
  return (
    extractMetaContent(html, 'meta[name="description"]') ??
    extractMetaContent(html, 'meta[property="og:description"]') ??
    null
  );
}

function parsePriceNumber(value: string | null) {
  if (!value) return null;

  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;

  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function extractPriceSignals(html: string) {
  const $ = cheerio.load(html);
  const visiblePriceText = normalizeText(
    $(".pitem-header-section-v2__price").first().text() || ""
  );
  const visiblePrice = parsePriceNumber(visiblePriceText);
  const startPrice = parsePriceNumber($('#startPrice').attr("value") ?? null);

  const optionFooterPriceText = normalizeText(
    $(".pitem-option-selected__footer--price strong").first().text() || ""
  );
  const optionFooterPrice = parsePriceNumber(optionFooterPriceText);

  const visibleText = htmlToVisibleText(html);
  const visibleFallback =
    parsePriceNumber(
      visibleText.match(/(?:판매가|할인가|회원가)\s*([\d,]+)\s*원/i)?.[1] ?? null
    ) ??
    parsePriceNumber(visibleText.match(/\b([\d,]{4,})\s*원\b/i)?.[1] ?? null);

  const selectedPrice =
    visiblePrice ?? startPrice ?? optionFooterPrice ?? visibleFallback ?? null;

  return {
    selectedPrice,
    selectedPriceSource: visiblePrice
      ? "visible_sale_or_current_price"
      : startPrice
      ? "start_price"
      : optionFooterPrice
      ? "option_footer_price"
      : visibleFallback
      ? "visible_text_fallback"
      : null,
    visiblePrice,
    startPrice,
    optionFooterPrice,
  };
}

function resolveLivartCategoryHint(params: {
  title: string | null;
  description: string | null;
  sourceUrl: string | null;
}): CategoryResolution {
  const joined = normalizeText(
    [params.title, params.description, params.sourceUrl].filter(Boolean).join(" ")
  );

  if (/(거실장|TV장|티비장)/i.test(joined)) {
    return {
      category: "storage",
      confidence: "high",
      scores: [
        {
          category: "storage",
          score: 20,
          matched_keywords: ["거실장"],
        },
      ],
    };
  }

  return resolveCategory(joined);
}

function looksLikeTrustedLivartOverallDimensionLine(line: string) {
  const normalizedLine = normalizeText(line);

  if (!normalizedLine) return false;
  if (LIVART_DIMENSION_LINE_EXCLUDE_PATTERN.test(normalizedLine)) return false;

  return /(가로|폭|너비)\s*\d+(?:[.,]\d+)?(?:\s*(?:cm|mm|m))?\s*[x×]\s*(세로|깊이|길이)\s*\d+(?:[.,]\d+)?(?:\s*(?:cm|mm|m))?\s*[x×]\s*높이\s*\d+(?:[.,]\d+)?(?:\s*~\s*\d+(?:[.,]\d+)?)?(?:\s*(?:cm|mm|m))?/i.test(
    normalizedLine
  );
}

function parseLivartLabeledDimension(params: {
  line: string;
  labels: string[];
  defaultUnit: string | null;
}) {
  const labelGroup = params.labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const match = params.line.match(
    new RegExp(
      `(?:${labelGroup})\\s*([0-9]+(?:[.,][0-9]+)?(?:\\s*~\\s*[0-9]+(?:[.,][0-9]+)?)?)\\s*(cm|mm|m)?`,
      "i"
    )
  );

  if (!match) {
    return {
      value_cm: null,
      unit: params.defaultUnit,
      range_policy_applied: null as "max" | null,
    };
  }

  const rawValue = normalizeText(match[1] ?? "");
  const unit = normalizeText(match[2] ?? "") || params.defaultUnit;
  const parsed = parseDimensionValueToCm(rawValue, unit ?? undefined);

  return {
    value_cm: parsed.value_cm,
    unit,
    range_policy_applied: parsed.range_policy_applied,
  };
}

function extractLivartDimensionSelection(params: {
  html: string;
  title: string | null;
}): LivartDimensionSelection {
  const $ = cheerio.load(params.html);
  const candidates: Array<{
    line: string;
    blockText: string;
    score: number;
  }> = [];

  $(".pitem-section-info .txtarea").each((_, el) => {
    const block = $(el);
    const blockText = normalizeText(block.text() || "");
    const blockHtml = String(block.html() || "");

    if (!blockText) return;
    if (
      LIVART_DIMENSION_CONTEXT_EXCLUDE_PATTERN.test(blockText) ||
      LIVART_DIMENSION_CONTEXT_EXCLUDE_PATTERN.test(blockHtml)
    ) {
      return;
    }

    const blockTitle = normalizeText(
      block.find(".pitem-info__subtitle, .pitem-info__title").first().text() || ""
    );
    const candidateLines = [...new Set([...splitLines(blockText), blockText])];

    for (const line of candidateLines) {
      if (!looksLikeTrustedLivartOverallDimensionLine(line)) continue;

      let score = 0;
      if (params.title && blockText.includes(params.title)) score += 20;
      if (
        params.title &&
        blockTitle &&
        (blockTitle === params.title ||
          params.title.includes(blockTitle) ||
          blockTitle.includes(params.title))
      ) {
        score += 10;
      }
      if (/pitem-info__text/i.test(blockHtml)) score += 4;
      if (/(mm|cm|m)/i.test(line)) score += 2;

      candidates.push({
        line,
        blockText,
        score,
      });
    }
  });

  if (candidates.length === 0) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      rawDimensionText: null,
      selectedLine: null,
      selectedUnit: null,
      rangePolicyApplied: null,
    };
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates[0];
  const selectedUnit =
    selected.line.match(/(mm|cm|m)/i)?.[1]?.toLowerCase() ?? null;

  const width = parseLivartLabeledDimension({
    line: selected.line,
    labels: ["가로", "폭", "너비"],
    defaultUnit: selectedUnit,
  });
  const depth = parseLivartLabeledDimension({
    line: selected.line,
    labels: ["세로", "깊이", "길이"],
    defaultUnit: selectedUnit,
  });
  const height = parseLivartLabeledDimension({
    line: selected.line,
    labels: ["높이"],
    defaultUnit: selectedUnit,
  });

  return {
    width_cm: width.value_cm,
    depth_cm: depth.value_cm,
    height_cm: height.value_cm,
    rawDimensionText: selected.blockText,
    selectedLine: selected.line,
    selectedUnit,
    rangePolicyApplied:
      width.range_policy_applied ??
      depth.range_policy_applied ??
      height.range_policy_applied,
  };
}

function extractCategoryHint(params: {
  title: string | null;
  description: string | null;
  sourceUrl: string | null;
}) {
  const resolution = resolveLivartCategoryHint(params);

  return {
    category: resolution.category,
    confidence: resolution.confidence,
    scores: resolution.scores,
  };
}

export function parseLivartPayload(raw: unknown): ParsedFurnitureProduct {
  const input = (raw ?? {}) as LivartRawInput;
  const html = getHtml(input);
  const sourceUrl = getSourceUrl(input);
  const title = extractTitle(html);
  const imageUrl = extractImageUrl(html);
  const description = extractDescription(html);
  const priceSignals = extractPriceSignals(html);
  const price = priceSignals.selectedPrice;
  const dimensions = extractLivartDimensionSelection({
    html,
    title,
  });
  const categoryResolution = extractCategoryHint({
    title,
    description,
    sourceUrl,
  });

  return {
    product_name: title,
    brand: "LIVART",
    category: categoryResolution.category,
    price,
    currency: price ? "KRW" : null,
    image_url: imageUrl,
    description,
    color: null,
    material: null,
    width_cm: dimensions.width_cm,
    depth_cm: dimensions.depth_cm,
    height_cm: dimensions.height_cm,
    metadata_json: {
      parser_version: LIVART_PARSER_VERSION,
      source_site: "livart",
      source_url: sourceUrl,
      category_hint: categoryResolution.category,
      raw_dimension_text_preview: dimensions.rawDimensionText?.slice(0, 1000) ?? null,
      selected_dimension_line: dimensions.selectedLine,
      selected_dimension_unit: dimensions.selectedUnit,
      range_policy_applied: dimensions.rangePolicyApplied,
      site_metadata: {
        parser_version: LIVART_PARSER_VERSION,
        selected_dimension_line: dimensions.selectedLine,
        selected_dimension_unit: dimensions.selectedUnit,
        range_policy_applied: dimensions.rangePolicyApplied,
        debug: buildParserDebug({
          html_length: html.length,
          has_dimension_keyword: /사이즈|규격|스펙|가로|세로|높이|폭|깊이/i.test(html),
          width_cm: dimensions.width_cm,
          depth_cm: dimensions.depth_cm,
          height_cm: dimensions.height_cm,
          raw_dimension_text_preview:
            dimensions.rawDimensionText?.slice(0, 1000) ?? null,
          selected_dimension_line: dimensions.selectedLine,
          selected_dimension_unit: dimensions.selectedUnit,
          range_policy_applied: dimensions.rangePolicyApplied,
          parser_version: LIVART_PARSER_VERSION,
          category_hint: categoryResolution.category,
          category_hint_source_preview: normalizeText(
            [title, description, sourceUrl].filter(Boolean).join(" ")
          ).slice(0, 500),
          category_confidence: categoryResolution.confidence,
          category_scores: categoryResolution.scores,
        }),
        selected_price_source: priceSignals.selectedPriceSource,
        visible_price: priceSignals.visiblePrice,
        start_price: priceSignals.startPrice,
        option_footer_price: priceSignals.optionFooterPrice,
      },
    },
  };
}
