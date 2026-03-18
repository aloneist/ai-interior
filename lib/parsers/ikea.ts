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

type DimensionPair = {
  label: string;
  value: number;
};

function extractProductName(html: string): string | null {
  if (!html) return null;

  const metaDescriptionMatch = html.match(
    /<meta\s+name="description"\s+content="([^"]+)"/i
  );

  if (metaDescriptionMatch?.[1]) {
    const content = metaDescriptionMatch[1].trim();
    const firstChunk = content.split(',')[0]?.trim();
    if (firstChunk) return firstChunk;
  }

  return null;
}

function extractPrice(html: string): number | null {
  if (!html) return null;

  // 1순위: utag_data 안의 "price":["140000"] 패턴
  const utagPriceMatch = html.match(/"price"\s*:\s*\[\s*"(\d+)"\s*\]/i);
  if (utagPriceMatch?.[1]) {
    const numeric = Number(utagPriceMatch[1]);
    return Number.isNaN(numeric) ? null : numeric;
  }

  // 2순위: ₩199,000 형태
  const wonSymbolMatch = html.match(/₩\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
  if (wonSymbolMatch?.[1]) {
    const numeric = Number(wonSymbolMatch[1].replace(/,/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  }

  // 3순위: 199,000원 형태
  const wonTextMatch = html.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/i);
  if (wonTextMatch?.[1]) {
    const numeric = Number(wonTextMatch[1].replace(/,/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  }

  return null;
}

function extractImageUrl(html: string): string | null {
  if (!html) return null;

  // 1순위: og:image 메타 태그
  const ogImageMatch = html.match(
    /<meta\s+property="og:image"\s+content="([^"]+)"/i
  );

  if (ogImageMatch?.[1]) {
    return ogImageMatch[1].trim();
  }

  // 2순위: 일반 img 태그
  const imgSrcMatch = html.match(/<img[^>]+src="([^"]+)"/i);

  if (imgSrcMatch?.[1]) {
    return imgSrcMatch[1].trim();
  }

  return null;
}

function extractDescription(html: string): string | null {
  if (!html) return null;

  const metaDescriptionMatch = html.match(
    /<meta\s+name="description"\s+content="([^"]+)"/i
  );

  if (!metaDescriptionMatch?.[1]) return null;

  const content = metaDescriptionMatch[1].trim();
  if (!content) return null;

  const parts = content.split(',');

  if (parts.length >= 2) {
    const description = parts.slice(1).join(',').trim();
    return description || null;
  }

  return null;
}

function normalizeCategory(text: string): string {
  const value = text.toLowerCase();

  if (value.includes('sofa') || value.includes('소파')) {
    return 'sofa';
  }

  if (
    value.includes('chair') ||
    value.includes('의자') ||
    value.includes('암체어')
  ) {
    return 'chair';
  }

  if (value.includes('table') || value.includes('테이블')) {
    return 'table';
  }

  if (
    value.includes('storage') ||
    value.includes('수납') ||
    value.includes('선반') ||
    value.includes('서랍')
  ) {
    return 'storage';
  }

  if (value.includes('bed') || value.includes('침대')) {
    return 'bed';
  }

  if (value.includes('lamp') || value.includes('조명')) {
    return 'lighting';
  }

  if (value.includes('desk') || value.includes('책상')) {
    return 'desk';
  }

  if (value.includes('decor') || value.includes('장식')) {
    return 'decor';
  }

  return 'unknown';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function htmlToReadableText(html: string): string {
  if (!html) return '';

  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function normalizeDimensionLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .trim();
}

function toDimensionKey(label: string): string {
  return label
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/[^0-9A-Za-z가-힣_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function extractDimensionSectionText(html: string): string | null {
  const readableText = htmlToReadableText(html);
  if (!readableText) return null;

  const sectionMatch = readableText.match(
    /(?:^|\n)치수\s*\n([\s\S]*?)(?=\n(?:포장|상품설명|제품설명|상품정보|자주 묻는 질문|후기|리뷰|관련 제품|조립 및 문서)\s*(?:\n|$)|$)/i
  );

  if (sectionMatch?.[1]) {
    const sectionText = sectionMatch[1].trim();
    return sectionText || null;
  }

  return null;
}

function extractDimensionPairs(sectionText: string): DimensionPair[] {
  if (!sectionText) return [];

  const pairs: DimensionPair[] = [];
  const regex =
    /([가-힣A-Za-z0-9()\/\-\s]{1,40})\s*:\s*([0-9]+(?:\.[0-9]+)?)\s*cm\b/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(sectionText)) !== null) {
    const rawLabel = match[1]?.trim();
    const rawValue = match[2]?.trim();

    if (!rawLabel || !rawValue) continue;

    const numericValue = Number(rawValue);
    if (Number.isNaN(numericValue)) continue;

    pairs.push({
      label: rawLabel,
      value: numericValue,
    });
  }

  return pairs;
}

function findDimensionByLabels(
  pairs: DimensionPair[],
  labels: string[]
): DimensionPair | null {
  for (const targetLabel of labels) {
    const found = pairs.find(
      (pair) => normalizeDimensionLabel(pair.label) === targetLabel
    );

    if (found) return found;
  }

  return null;
}

function extractDimensionsFromHtml(html: string) {
  const sectionText = extractDimensionSectionText(html);

  if (!sectionText) {
    return {
      section_found: false,
      section_preview: null,
      width_cm: null as number | null,
      depth_cm: null as number | null,
      height_cm: null as number | null,
      overall_dimensions: {
        width: null,
        depth: null,
        height: null,
      },
      partial_dimensions: {} as Record<string, number>,
      all_dimension_pairs: [] as Array<{ label: string; value: number }>,
    };
  }

  const pairs = extractDimensionPairs(sectionText);

  const widthPair = findDimensionByLabels(pairs, [
    '폭',
    '전체폭',
    '총폭',
    '너비',
  ]);

  const depthPair = findDimensionByLabels(pairs, [
    '깊이',
    '전체깊이',
    '총깊이',
    '길이',
    '전체길이',
    '총길이',
  ]);

  const heightPair = findDimensionByLabels(pairs, [
    '높이',
    '전체높이',
    '총높이',
    '등받이h',
    '등받이높이',
  ]);

  const usedOverallLabels = new Set<string>(
    [widthPair?.label, depthPair?.label, heightPair?.label]
      .filter(Boolean)
      .map((label) => normalizeDimensionLabel(label as string))
  );

  const partialDimensions: Record<string, number> = {};

  for (const pair of pairs) {
    const normalizedLabel = normalizeDimensionLabel(pair.label);

    if (usedOverallLabels.has(normalizedLabel)) {
      continue;
    }

    const key = toDimensionKey(pair.label);
    if (!key) continue;

    partialDimensions[key] = pair.value;
  }

  return {
    section_found: true,
    section_preview: sectionText.slice(0, 500),
    width_cm: widthPair?.value ?? null,
    depth_cm: depthPair?.value ?? null,
    height_cm: heightPair?.value ?? null,
    overall_dimensions: {
      width: widthPair
        ? { label: widthPair.label, value_cm: widthPair.value }
        : null,
      depth: depthPair
        ? { label: depthPair.label, value_cm: depthPair.value }
        : null,
      height: heightPair
        ? { label: heightPair.label, value_cm: heightPair.value }
        : null,
    },
    partial_dimensions: partialDimensions,
    all_dimension_pairs: pairs.map((pair) => ({
      label: pair.label,
      value: pair.value,
    })),
  };
}

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const html =
    typeof raw?.html === "string"
      ? raw.html
      : typeof raw?.html_snippet === "string"
      ? raw.html_snippet
      : "";

  const htmlSnippet =
    typeof raw?.html_snippet === "string"
      ? raw.html_snippet
      : html.slice(0, 40000);

  const productName = extractProductName(html);
  const price = extractPrice(html);
  const imageUrl = extractImageUrl(html);
  const description = extractDescription(html);

  const categorySource = [productName, description]
    .filter(Boolean)
    .join(" ");

  const category = normalizeCategory(categorySource);

  const parserVersion = "ikea-v2026-03-16-full-html-debug";

  const hasDimensionKeyword =
    /치수|제품\s*크기|폭\s*:|깊이\s*:|높이\s*:|길이\s*:|시트\s*깊이|시트\s*높이|시트\s*폭|등받이H|팔걸이\s*높이|팔걸이\s*너비/i.test(
      html
    );

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

    // 네가 이미 width/depth/height 추출 함수 붙여놨으면
    // 여기만 그 함수 호출로 바꿔주면 됨.
    width_cm: null,
    depth_cm: null,
    height_cm: null,

    metadata_json: {
      raw_preview: typeof htmlSnippet === "string" ? htmlSnippet.slice(0, 300) : "",
      parser_price: price,
      parser_version: parserVersion,
      html_length: typeof html === "string" ? html.length : 0,
      has_dimension_keyword: hasDimensionKeyword,
    },
  };
}