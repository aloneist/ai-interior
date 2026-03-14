import { NextResponse } from 'next/server';
import { parseIkeaPayload } from '@/lib/parsers/ikea';

export async function GET() {
  const raw = {
    html_snippet: `
      <!DOCTYPE html>
      <html lang="ko-KR">
        <head>
          <meta
            name="description"
            content="GLOSTAD 글로스타드 2인용소파, 크니사 다크그레이 GLOSTAD 글로스타드 소파는 구매하고 운반하여 조립하면 바로 사용할 수 있어요."
          />
        </head>
        <body>
          <div>₩199,000</div>
        </body>
      </html>
    `,
  };

  const parsed = parseIkeaPayload(raw);

  console.log('parsed result:', parsed);

  return NextResponse.json({
    success: true,
    parsed,
  });
}