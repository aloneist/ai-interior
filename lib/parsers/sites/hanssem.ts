import * as cheerio from "cheerio";
import {
  resolveCategory,
  type CategoryResolution,
} from "@/lib/parsers/shared/category";
import { buildParserDebug } from "@/lib/parsers/shared/debug";
import { parseDimensionValueToCm } from "@/lib/parsers/shared/dimensions";
import { normalizeText } from "@/lib/parsers/shared/text";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";

type HanssemRawInput = {
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

type HanssemJsonLdProduct = {
  "@type"?: string | string[];
  name?: string;
  image?: string | string[];
  description?: string;
  brand?: string | { name?: string | null } | null;
  offers?: {
    price?: string | number | null;
    priceCurrency?: string | null;
  } | Array<{
    price?: string | number | null;
    priceCurrency?: string | null;
  }> | null;
};

type HanssemNameSelection = {
  value: string | null;
  source: string | null;
};

type HanssemPriceSelection = {
  value: number | null;
  source: string | null;
  egSalePrice: number | null;
  egPrice: number | null;
  couponPrice: number | null;
  displayedSalePrice: number | null;
};

type HanssemImageSelection = {
  value: string | null;
  source: string | null;
};

type HanssemDimensionSelection = {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  rawDimensionText: string | null;
  selectedLine: string | null;
  selectedUnit: string | null;
  rangePolicyApplied: "max" | null;
  source: string | null;
};

const HANSSEM_PARSER_VERSION = "hanssem-meta-v1";
const HANSSEM_DIMENSION_KEYWORD_PATTERN =
  /사이즈|규격|치수|가로|세로|높이|폭|깊이|\d+\s*x\s*\d+(?:\s*x\s*\d+)?\s*(?:cm|mm|m)/i;
const HANSSEM_WIDTH_CLASS_NOUN_PATTERN =
  /(거실장|책장|수납장|선반|랙|렌지대|장식장|캐비닛)/i;
const HANSSEM_SINGLE_DIMENSION_EXCLUDE_PATTERN =
  /(높이|깊이|세로|지름|직경|반지름|좌면|등받이|팔걸이|헤드|매트|프레임 내부|내부)/i;

function getHtml(raw: HanssemRawInput | null | undefined) {
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

function getSourceUrl(raw: HanssemRawInput | null | undefined) {
  return normalizeText(raw?.source_url ?? raw?.url ?? "") || null;
}

function extractMetaContent($: cheerio.CheerioAPI, selector: string) {
  return normalizeText($(selector).attr("content") ?? "") || null;
}

function normalizeHanssemName(value: string | null) {
  const normalized = normalizeText(value ?? "");
  if (!normalized) return null;

  return normalizeText(
    normalized
      .replace(/\s*\|\s*한샘몰$/i, "")
      .replace(/^\[[^\]]+\]\s*/g, "")
      .replace(/\((?:\d+\s*종\s*\/\s*택1|(?:옵션|컬러|색상|사이즈|구성)\s*택1)\)\s*$/i, "")
  );
}

function parseNumericPrice(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const text = normalizeText(String(value ?? ""));
  if (!text) return null;

  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return null;

  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function flattenJsonLd(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenJsonLd(item));
  }

  if (!input || typeof input !== "object") {
    return [];
  }

  const record = input as Record<string, unknown>;
  const items = [record];

  if (Array.isArray(record["@graph"])) {
    items.push(...flattenJsonLd(record["@graph"]));
  }

  return items;
}

function collectJsonLdProducts($: cheerio.CheerioAPI): HanssemJsonLdProduct[] {
  const items: HanssemJsonLdProduct[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).contents().text().trim();
    if (!text) return;

    try {
      const parsed = JSON.parse(text);
      for (const item of flattenJsonLd(parsed)) {
        const typeValue = item["@type"];
        const types = Array.isArray(typeValue) ? typeValue : [typeValue];
        if (!types.some((type) => type === "Product")) continue;
        items.push(item as HanssemJsonLdProduct);
      }
    } catch {
      return;
    }
  });

  return items;
}

function extractHanssemName(params: {
  product: HanssemJsonLdProduct | null;
  $: cheerio.CheerioAPI;
}) : HanssemNameSelection {
  const jsonLdName = normalizeHanssemName(params.product?.name ?? null);
  if (jsonLdName) {
    return {
      value: jsonLdName,
      source: "json_ld_product_name",
    };
  }

  const ogTitle = normalizeHanssemName(
    extractMetaContent(params.$, 'meta[property="og:title"]')
  );
  if (ogTitle) {
    return {
      value: ogTitle,
      source: "og_title",
    };
  }

  const title = normalizeHanssemName(params.$("title").first().text());
  if (title) {
    return {
      value: title,
      source: "document_title",
    };
  }

  return {
    value: null,
    source: null,
  };
}

function extractHanssemDescription(params: {
  product: HanssemJsonLdProduct | null;
  $: cheerio.CheerioAPI;
}) {
  const jsonLdDescription = normalizeText(params.product?.description ?? "");
  if (jsonLdDescription) {
    return jsonLdDescription.replace(/\s*-\s*한샘몰$/i, "");
  }

  return (
    extractMetaContent(params.$, 'meta[name="description"]') ??
    extractMetaContent(params.$, 'meta[property="og:description"]') ??
    null
  );
}

function extractHanssemBrand(product: HanssemJsonLdProduct | null) {
  const brand = product?.brand;

  if (typeof brand === "string" && normalizeText(brand)) {
    return normalizeText(brand);
  }

  if (
    brand &&
    typeof brand === "object" &&
    typeof brand.name === "string" &&
    normalizeText(brand.name)
  ) {
    return normalizeText(brand.name);
  }

  return "한샘";
}

function extractHanssemImage(params: {
  product: HanssemJsonLdProduct | null;
  $: cheerio.CheerioAPI;
}) : HanssemImageSelection {
  const jsonLdImage = params.product?.image;
  const candidate =
    (Array.isArray(jsonLdImage) ? jsonLdImage[0] : jsonLdImage) ?? null;
  const normalizedJsonLdImage = normalizeText(candidate ?? "");

  if (normalizedJsonLdImage) {
    return {
      value: normalizedJsonLdImage,
      source: "json_ld_product_image",
    };
  }

  const ogImage = extractMetaContent(params.$, 'meta[property="og:image"]');
  if (ogImage) {
    return {
      value: ogImage,
      source: "og_image",
    };
  }

  return {
    value: null,
    source: null,
  };
}

function extractHanssemPrice(params: {
  product: HanssemJsonLdProduct | null;
  $: cheerio.CheerioAPI;
  html: string;
}) : HanssemPriceSelection {
  const egSalePrice = parseNumericPrice(
    extractMetaContent(params.$, 'meta[property="eg:salePrice"]')
  );
  const egPrice = parseNumericPrice(
    extractMetaContent(params.$, 'meta[property="eg:price"]')
  );
  const displayedSalePrice = parseNumericPrice(
    extractMetaContent(params.$, 'meta[property="product:sale_price:amount"]')
  );

  const couponPrice = parseNumericPrice(
    params.html.match(/"couponPrc"\s*:\s*(\d+)/i)?.[1] ??
      params.html.match(/"dcPrc"\s*:\s*(\d+)/i)?.[1] ??
      null
  );

  const offerPrice = (() => {
    const offers = params.product?.offers;
    const selectedOffer = Array.isArray(offers) ? offers[0] : offers;
    return parseNumericPrice(selectedOffer?.price ?? null);
  })();

  const value =
    egSalePrice ??
    displayedSalePrice ??
    couponPrice ??
    egPrice ??
    offerPrice ??
    null;

  return {
    value,
    source: egSalePrice
      ? "meta_eg_sale_price"
      : displayedSalePrice
      ? "meta_product_sale_price_amount"
      : couponPrice
      ? "script_coupon_or_discount_price"
      : egPrice
      ? "meta_eg_price"
      : offerPrice
      ? "json_ld_offer_price"
      : null,
    egSalePrice,
    egPrice,
    couponPrice,
    displayedSalePrice,
  };
}

function extractHanssemCategoryHint(params: {
  name: string | null;
  description: string | null;
  sourceUrl: string | null;
}): CategoryResolution {
  const joined = normalizeText(
    [params.name, params.description, params.sourceUrl].filter(Boolean).join(" ")
  );

  if (/(수납침대|침대\s*프레임|침대)/i.test(joined)) {
    return {
      category: "bed",
      confidence: "high",
      scores: [
        {
          category: "bed",
          score: 20,
          matched_keywords: ["침대"],
        },
      ],
    };
  }

  return resolveCategory(
    joined
  );
}

function parseHanssemDimensionSelection(params: {
  name: string | null;
  category: string | null;
}): HanssemDimensionSelection {
  const productName = normalizeText(params.name ?? "");

  if (!productName) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      rawDimensionText: null,
      selectedLine: null,
      selectedUnit: null,
      rangePolicyApplied: null,
      source: null,
    };
  }

  const threeDimensionMatch = productName.match(
    /(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*[x×]\s*(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*[x×]\s*(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*(cm|mm|m)\b/i
  );

  if (threeDimensionMatch) {
    const unit = threeDimensionMatch[4]?.toLowerCase() ?? null;
    const width = parseDimensionValueToCm(
      threeDimensionMatch[1],
      unit ?? undefined
    );
    const depth = parseDimensionValueToCm(
      threeDimensionMatch[2],
      unit ?? undefined
    );
    const height = parseDimensionValueToCm(
      threeDimensionMatch[3],
      unit ?? undefined
    );

    return {
      width_cm: width.value_cm,
      depth_cm: depth.value_cm,
      height_cm: height.value_cm,
      rawDimensionText: productName,
      selectedLine: threeDimensionMatch[0],
      selectedUnit: unit,
      rangePolicyApplied:
        width.range_policy_applied ??
        depth.range_policy_applied ??
        height.range_policy_applied,
      source: "product_name_explicit_3d_dimensions",
    };
  }

  const allowTwoDimensionPattern =
    params.category === "desk" || params.category === "table";

  const twoDimensionMatch =
    allowTwoDimensionPattern
      ? productName.match(
          /(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*[x×]\s*(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*(cm|mm|m)\b/i
        )
      : null;

  if (twoDimensionMatch) {
    const unit = twoDimensionMatch[3]?.toLowerCase() ?? null;
    const width = parseDimensionValueToCm(
      twoDimensionMatch[1],
      unit ?? undefined
    );
    const depth = parseDimensionValueToCm(
      twoDimensionMatch[2],
      unit ?? undefined
    );

    return {
      width_cm: width.value_cm,
      depth_cm: depth.value_cm,
      height_cm: null,
      rawDimensionText: productName,
      selectedLine: twoDimensionMatch[0],
      selectedUnit: unit,
      rangePolicyApplied:
        width.range_policy_applied ?? depth.range_policy_applied,
      source: "product_name_explicit_2d_dimensions",
    };
  }

  const allowSingleDimensionWidthClass = params.category === "storage";
  const singleDimensionMatches = allowSingleDimensionWidthClass
    ? Array.from(
        productName.matchAll(
          /(?<![x×])(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*(cm|mm|m)\b/gi
        )
      )
    : [];

  if (
    allowSingleDimensionWidthClass &&
    singleDimensionMatches.length === 1 &&
    HANSSEM_WIDTH_CLASS_NOUN_PATTERN.test(productName) &&
    !HANSSEM_SINGLE_DIMENSION_EXCLUDE_PATTERN.test(productName)
  ) {
    const match = singleDimensionMatches[0];
    const unit = normalizeText(match[2] ?? "").toLowerCase() || null;
    const width = parseDimensionValueToCm(match[1], unit ?? undefined);

    return {
      width_cm: width.value_cm,
      depth_cm: null,
      height_cm: null,
      rawDimensionText: productName,
      selectedLine: match[0],
      selectedUnit: unit,
      rangePolicyApplied: width.range_policy_applied,
      source: "product_name_storage_width_class",
    };
  }

  return {
    width_cm: null,
    depth_cm: null,
    height_cm: null,
    rawDimensionText: null,
    selectedLine: null,
    selectedUnit: null,
    rangePolicyApplied: null,
    source: null,
  };
}

export function parseHanssemPayload(raw: unknown): ParsedFurnitureProduct {
  const input = (raw ?? {}) as HanssemRawInput;
  const html = getHtml(input);
  const sourceUrl = getSourceUrl(input);
  const $ = cheerio.load(html);
  const products = collectJsonLdProducts($);
  const product = products[0] ?? null;

  const nameSelection = extractHanssemName({
    product,
    $,
  });
  const description = extractHanssemDescription({
    product,
    $,
  });
  const imageSelection = extractHanssemImage({
    product,
    $,
  });
  const priceSelection = extractHanssemPrice({
    product,
    $,
    html,
  });
  const categoryResolution = extractHanssemCategoryHint({
    name: nameSelection.value,
    description,
    sourceUrl,
  });
  const dimensions = parseHanssemDimensionSelection({
    name: nameSelection.value,
    category: categoryResolution.category,
  });
  const brand = extractHanssemBrand(product);

  return {
    product_name: nameSelection.value,
    brand,
    category: categoryResolution.category,
    price: priceSelection.value,
    currency: priceSelection.value ? "KRW" : null,
    image_url: imageSelection.value,
    description,
    color: null,
    material: null,
    width_cm: dimensions.width_cm,
    depth_cm: dimensions.depth_cm,
    height_cm: dimensions.height_cm,
    metadata_json: {
      parser_version: HANSSEM_PARSER_VERSION,
      source_site: "hanssem",
      source_url: sourceUrl,
      category_hint: categoryResolution.category,
      raw_dimension_text_preview:
        dimensions.rawDimensionText?.slice(0, 1000) ?? null,
      selected_dimension_line: dimensions.selectedLine,
      selected_dimension_unit: dimensions.selectedUnit,
      range_policy_applied: dimensions.rangePolicyApplied,
      site_metadata: {
        parser_version: HANSSEM_PARSER_VERSION,
        name_source: nameSelection.source,
        image_source: imageSelection.source,
        selected_price_source: priceSelection.source,
        dimension_source: dimensions.source,
        eg_sale_price: priceSelection.egSalePrice,
        eg_price: priceSelection.egPrice,
        coupon_price: priceSelection.couponPrice,
        displayed_sale_price: priceSelection.displayedSalePrice,
        json_ld_product_count: products.length,
        debug: buildParserDebug({
          html_length: html.length,
          has_dimension_keyword: HANSSEM_DIMENSION_KEYWORD_PATTERN.test(html),
          width_cm: dimensions.width_cm,
          depth_cm: dimensions.depth_cm,
          height_cm: dimensions.height_cm,
          raw_dimension_text_preview:
            dimensions.rawDimensionText?.slice(0, 1000) ?? null,
          selected_dimension_line: dimensions.selectedLine,
          selected_dimension_unit: dimensions.selectedUnit,
          range_policy_applied: dimensions.rangePolicyApplied,
          parser_version: HANSSEM_PARSER_VERSION,
          category_hint: categoryResolution.category,
          category_hint_source_preview: normalizeText(
            [nameSelection.value, description, sourceUrl].filter(Boolean).join(" ")
          ).slice(0, 500),
          category_confidence: categoryResolution.confidence,
          category_scores: categoryResolution.scores,
        }),
      },
    },
  };
}
