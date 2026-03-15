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

  if (
    value.includes('sofa') ||
    value.includes('소파')
  ) {
    return 'sofa';
  }

  if (
    value.includes('chair') ||
    value.includes('의자') ||
    value.includes('암체어')
  ) {
    return 'chair';
  }

  if (
    value.includes('table') ||
    value.includes('테이블')
  ) {
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

  if (
    value.includes('bed') ||
    value.includes('침대')
  ) {
    return 'bed';
  }

  if (
    value.includes('lamp') ||
    value.includes('조명')
  ) {
    return 'lighting';
  }

  if (
    value.includes('desk') ||
    value.includes('책상')
  ) {
    return 'desk';
  }

  if (
    value.includes('decor') ||
    value.includes('장식')
  ) {
    return 'decor';
  }

  return 'unknown';
}

function extractDimensionByLabel(
  html: string,
  labels: string[]
): number | null {
  if (!html) return null;

  for (const label of labels) {
    const pattern = new RegExp(
      `${label}\\s*[:：]?\\s*(\\d{1,3}(?:[.,]\\d+)?)\\s*cm`,
      'i'
    );

    const match = html.match(pattern);

    if (match?.[1]) {
      const numeric = Number(match[1].replace(',', '.'));
      if (!Number.isNaN(numeric)) return numeric;
    }
  }

  return null;
}

function extractDimensions(html: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
} {
  const width_cm = extractDimensionByLabel(html, [
    '너비',
    '가로',
    '폭',
    'Width',
  ]);

  const depth_cm = extractDimensionByLabel(html, [
    '깊이',
    '세로',
    'Depth',
  ]);

  const height_cm = extractDimensionByLabel(html, [
    '높이',
    'Height',
  ]);

  return {
    width_cm,
    depth_cm,
    height_cm,
  };
} 

function collectDimensionDebugHints(html: string): Record<string, any> {
  if (!html) {
    return {
      dimension_matches: [],
    };
  }

  const keywords = [
    '너비',
    '폭',
    '가로',
    '깊이',
    '세로',
    '높이',
    'cm',
    'Width',
    'Depth',
    'Height',
    'measure',
    'dimension',
    'product measurements',
  ];

  const matches: Array<{ keyword: string; snippet: string }> = [];

  for (const keyword of keywords) {
    const index = html.toLowerCase().indexOf(keyword.toLowerCase());

    if (index !== -1) {
      const start = Math.max(0, index - 120);
      const end = Math.min(html.length, index + 220);

      matches.push({
        keyword,
        snippet: html.slice(start, end),
      });
    }
  }

  return {
    dimension_matches: matches,
  };
}

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const html = raw?.html_snippet ?? '';
  const productName = extractProductName(html);
  const price = extractPrice(html);
  const imageUrl = extractImageUrl(html);
  const description = extractDescription(html);
  const dimensions = extractDimensions(html);
  const dimensionDebug = collectDimensionDebugHints(html);

  const categorySource = [productName, description]
    .filter(Boolean)
    .join(' ');

  const category = normalizeCategory(categorySource);

  return {
    product_name: productName,
    brand: 'IKEA',
    category,
    price,
    currency: 'KRW',
    image_url: imageUrl,
    description,
    color: null,
    material: null,
    width_cm: dimensions.width_cm,
    depth_cm: dimensions.depth_cm,
    height_cm: dimensions.height_cm,
    metadata_json: {
      raw_preview: typeof html === 'string' ? html.slice(0, 300) : '',
      parser_price: price,
      ...dimensionDebug,
    },
  };
}

