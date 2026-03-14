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

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const html = raw?.html_snippet ?? '';
  const productName = extractProductName(html);
  const price = extractPrice(html);

  return {
    product_name: productName,
    brand: 'IKEA',
    category: null,
    price,
    currency: 'KRW',
    image_url: null,
    description: null,
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