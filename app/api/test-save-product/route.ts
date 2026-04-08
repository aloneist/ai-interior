import { NextResponse } from 'next/server';
import { parseIkeaPayload } from '@/lib/parsers/router';
import { normalizeMaterialForPersistence } from '@/lib/server/furniture-catalog';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const raw = {
      html_snippet: `
        <!DOCTYPE html>
        <html lang="ko-KR">
          <head>
            <meta
              name="description"
              content="GLOSTAD 글로스타드 2인용소파, 크니사 다크그레이 GLOSTAD 글로스타드 소파는 구매하고 운반하여 조립하면 바로 사용할 수 있어요."
            />
            <meta
              property="og:image"
              content="https://www.ikea.com/kr/ko/images/products/glostad-sofa-dark-grey.jpg"
            />
          </head>
          <body>
            <div>₩199,000</div>
          </body>
        </html>
      `,
    };

    const parsed = parseIkeaPayload(raw);
    const supabase = createClient();

    const payload = {
      source_site: 'ikea',
      source_url: 'https://test.example.com/ikea/glostad-2-seat-sofa',
      product_name: parsed.product_name ?? 'unknown product',
      brand: parsed.brand,
      category: parsed.category,
      price: parsed.price,
      currency: parsed.currency,
      image_url: parsed.image_url,
      product_url: 'https://test.example.com/ikea/glostad-2-seat-sofa',
      description: parsed.description,
      color: parsed.color,
      material: normalizeMaterialForPersistence(parsed.material),
      width_cm: parsed.width_cm,
      depth_cm: parsed.depth_cm,
      height_cm: parsed.height_cm,
      metadata_json: parsed.metadata_json,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('furniture_products')
      .upsert(payload, { onConflict: 'source_url' })
      .select()
      .single();

    if (error) {
      console.error('save error:', error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    console.log('saved product:', data);

    return NextResponse.json({
      success: true,
      saved: data,
    });
  } catch (error) {
    console.error('unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
