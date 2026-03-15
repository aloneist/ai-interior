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

  // 1순위: ₩199,000 형태
  const wonSymbolMatch = html.match(/₩\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
  if (wonSymbolMatch?.[1]) {
    const numeric = Number(wonSymbolMatch[1].replace(/,/g, ''));
    return Number.isNaN(numeric) ? null : numeric;
  }

  // 2순위: 199,000원 형태
  const wonTextMatch = html.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/i);
  if (wonTextMatch?.[1]) {
    const numeric = Number(wonTextMatch[1].replace(/,/g, ''));
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

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const html = raw?.html_snippet ?? '';
  const productName = extractProductName(html);
  const price = extractPrice(html);
  const imageUrl = extractImageUrl(html);
  const description = extractDescription(html);

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
    width_cm: null,
    depth_cm: null,
    height_cm: null,
    metadata_json: {
      raw_preview: typeof html === 'string' ? html.slice(0, 300) : '',
    },
  };
}

