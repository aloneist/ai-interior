export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import {
  parseIkeaPayload,
  type ParsedFurnitureProduct,
} from "@/lib/parsers/ikea";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ExtractedAiResult = {
  extracted_name?: string | null;
  extracted_brand?: string | null;
  extracted_category?: string | null;
  extracted_price?: number | null;
  extracted_material?: string | null;
  extracted_width_cm?: number | null;
  extracted_depth_cm?: number | null;
  extracted_height_cm?: number | null;
  extracted_color_options?: string[];
  extracted_size_label?: string | null;
  extracted_capacity_label?: string | null;
  extracted_image_urls?: string[];
  extracted_source_variant_ids?: string[];
  extracted_option_summaries?: string[];
  extracted_source_site?: string | null;
  extracted_affiliate_url?: string | null;
  extracted_confidence?: number | null;
  extraction_notes?: string | null;
};

function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return url;
  }
}

function detectSourceSite(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();

    if (host.includes("ikea")) return "ikea";
    if (host.includes("todayhouse")) return "todayhouse";
    if (host.includes("hanssem")) return "hanssem";
    if (host.includes("livart")) return "livart";

    return host;
  } catch {
    return "unknown";
  }
}

function parseNumberOrNull(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toStringArray(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function pickFirstString(v: any): string | null {
  const arr = toStringArray(v);
  return arr[0] ?? null;
}

function detectDimensionKeyword(html: string) {
  if (!html) return false;

  return /치수|제품\s*크기|폭\s*:|깊이\s*:|높이\s*:|길이\s*:|시트\s*깊이|시트\s*높이|시트\s*폭|등받이H|팔걸이\s*높이|팔걸이\s*너비/i.test(
    html
  );
}

function parseSourcePayload(
  sourceSite: string,
  raw: {
    html: string;
    html_snippet: string;
    source_url: string;
    source_site: string;
  }
): ParsedFurnitureProduct | null {
  if (sourceSite === "ikea") {
    return parseIkeaPayload(raw);
  }

  return null;
}

function buildParsedProductPayload(params: {
  sourceSite: string;
  normalizedUrl: string;
  parserResult: ParsedFurnitureProduct | null;
  extracted: ExtractedAiResult;
  importJobId: string;
}) {
  const { sourceSite, normalizedUrl, parserResult, extracted, importJobId } =
    params;

  return {
    source_site: sourceSite,
    source_url: normalizedUrl,
    product_name: parserResult?.product_name ?? extracted.extracted_name ?? null,
    brand: parserResult?.brand ?? extracted.extracted_brand ?? null,
    category: parserResult?.category ?? extracted.extracted_category ?? "unknown",
    price:
      parserResult?.price ?? parseNumberOrNull(extracted.extracted_price),
    currency: parserResult?.currency ?? "KRW",
    image_url:
      parserResult?.image_url ?? pickFirstString(extracted.extracted_image_urls),
    product_url: normalizedUrl,
    description: parserResult?.description ?? null,
    color: parserResult?.color ?? null,
    material:
      parserResult?.material ?? extracted.extracted_material ?? null,
    width_cm:
      parserResult?.width_cm ?? parseNumberOrNull(extracted.extracted_width_cm),
    depth_cm:
      parserResult?.depth_cm ?? parseNumberOrNull(extracted.extracted_depth_cm),
    height_cm:
      parserResult?.height_cm ?? parseNumberOrNull(extracted.extracted_height_cm),
    metadata_json: {
      ...(parserResult?.metadata_json ?? {}),
      import_job_id: importJobId,
      extracted_price: parseNumberOrNull(extracted.extracted_price),
      extraction_notes: extracted.extraction_notes ?? null,
      extracted_confidence: parseNumberOrNull(extracted.extracted_confidence),
      extracted_image_urls: toStringArray(extracted.extracted_image_urls),
      extracted_color_options: toStringArray(extracted.extracted_color_options),
      extracted_option_summaries: toStringArray(
        extracted.extracted_option_summaries
      ),
    },
    status: "active",
  };
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");

    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceUrl } = await req.json();

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "sourceUrl is required" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(sourceUrl);
    const sourceSite = detectSourceSite(normalizedUrl);

    // 1) 원본 페이지 HTML 가져오기
    const pageRes = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      },
    });

    if (!pageRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${pageRes.status}` },
        { status: 400 }
      );
    }

    const fullHtml = await pageRes.text();
    const htmlSnippet = fullHtml.slice(0, 40000);
    const htmlLength = fullHtml.length;
    const hasDimensionKeyword = detectDimensionKeyword(fullHtml);

    // 2) 사이트 파서에는 full html 전달
    const parserResult = parseSourcePayload(sourceSite, {
      html: fullHtml,
      html_snippet: htmlSnippet,
      source_url: normalizedUrl,
      source_site: sourceSite,
    });

    const parserVersion =
      parserResult?.metadata_json?.parser_version ?? null;

    // 3) OpenAI에는 기존처럼 snippet만 전달
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a commerce product extraction engine.
Extract structured product data from the given product page HTML.
Return ONLY valid JSON. No explanation.

Return this exact structure:
{
  "extracted_name": string | null,
  "extracted_brand": string | null,
  "extracted_category": string | null,
  "extracted_price": number | null,
  "extracted_material": string | null,
  "extracted_width_cm": number | null,
  "extracted_depth_cm": number | null,
  "extracted_height_cm": number | null,
  "extracted_color_options": string[],
  "extracted_size_label": string | null,
  "extracted_capacity_label": string | null,
  "extracted_image_urls": string[],
  "extracted_source_variant_ids": string[],
  "extracted_option_summaries": string[],
  "extracted_source_site": string | null,
  "extracted_affiliate_url": string | null,
  "extracted_confidence": number | null,
  "extraction_notes": string | null
}

Rules:
- Use null if unknown.
- Width/depth/height must be in cm if possible.
- extracted_confidence must be 0..100.
- extracted_image_urls should contain likely product image URLs only.
- extracted_color_options should contain color names only.
- extracted_option_summaries should be short human-readable option summaries.
- Do not invent data. If unsure, return null or [].
`.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({
            source_url: normalizedUrl,
            source_site: sourceSite,
            html: htmlSnippet,
          }),
        },
      ],
    });

    const extracted: ExtractedAiResult = JSON.parse(
      aiRes.choices[0].message.content || "{}"
    );

    // 4) import_jobs 저장
    const importPayload = {
      source_site: sourceSite,
      source_url: normalizedUrl,
      raw_payload: {
        html_snippet: htmlSnippet,
        html_length: htmlLength,
        has_dimension_keyword: hasDimensionKeyword,
        parser_version: parserVersion,
      },
      extracted_name: extracted.extracted_name ?? null,
      extracted_brand: extracted.extracted_brand ?? null,
      extracted_category: extracted.extracted_category ?? null,
      extracted_price: parseNumberOrNull(extracted.extracted_price),
      extracted_material: extracted.extracted_material ?? null,
      extracted_width_cm: parseNumberOrNull(extracted.extracted_width_cm),
      extracted_depth_cm: parseNumberOrNull(extracted.extracted_depth_cm),
      extracted_height_cm: parseNumberOrNull(extracted.extracted_height_cm),
      extracted_color_options: toStringArray(extracted.extracted_color_options),
      extracted_size_label: extracted.extracted_size_label ?? null,
      extracted_capacity_label: extracted.extracted_capacity_label ?? null,
      extracted_image_urls: toStringArray(extracted.extracted_image_urls),
      extracted_source_variant_ids: toStringArray(
        extracted.extracted_source_variant_ids
      ),
      extracted_option_summaries: toStringArray(
        extracted.extracted_option_summaries
      ),
      extracted_source_site: extracted.extracted_source_site ?? sourceSite,
      extracted_affiliate_url:
        extracted.extracted_affiliate_url ?? normalizedUrl,
      extracted_confidence: parseNumberOrNull(extracted.extracted_confidence),
      extraction_notes: extracted.extraction_notes ?? null,
      status: "completed",
    };

    const { data: importJob, error: importError } = await supabase
      .from("import_jobs")
      .upsert(importPayload, { onConflict: "source_url" })
      .select()
      .single();

    if (importError) throw importError;

    // 5) parsed_products 저장
    const parsedProductPayload = buildParsedProductPayload({
      sourceSite,
      normalizedUrl,
      parserResult,
      extracted,
      importJobId: importJob.id,
    });

    const { data: parsedProduct, error: parsedError } = await supabase
      .from("parsed_products")
      .upsert(parsedProductPayload, { onConflict: "source_url" })
      .select()
      .single();

    if (parsedError) throw parsedError;

    return NextResponse.json({
      success: true,
      import_job: importJob,
      parsed_product: parsedProduct,
    });
  } catch (err: any) {
    console.error("IMPORT PRODUCT ERROR:", err);

    return NextResponse.json(
      {
        error: "Import product failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}