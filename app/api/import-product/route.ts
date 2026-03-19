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

function parseNumberOrNull(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];

  return v
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
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
    full_html?: string;
    html_snippet: string;
    source_url: string;
    source_site: string;
    raw_payload?: {
      full_html?: string;
      html_snippet?: string;
    };
  }
): ParsedFurnitureProduct | null {
  if (sourceSite === "ikea") {
    return parseIkeaPayload(raw);
  }

  return null;
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

    const html = await pageRes.text();
    const htmlSnippet = html.slice(0, 40000);
    const htmlLength = html.length;
    const hasDimensionKeyword = detectDimensionKeyword(html);

    const parsed: ParsedFurnitureProduct | null = parseSourcePayload(
      sourceSite,
      {
        html,
        full_html: html,
        html_snippet: htmlSnippet,
        source_url: normalizedUrl,
        source_site: sourceSite,
        raw_payload: {
          full_html: html,
          html_snippet: htmlSnippet,
        },
      }
    );

    const parserVersion =
      parsed?.metadata_json?.dimension_debug?.parser_version ??
      parsed?.metadata_json?.parser_version ??
      null;

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

    const importPayload = {
      source_site: sourceSite,
      source_url: normalizedUrl,
      raw_payload: {
        full_html: html,
        html_snippet: htmlSnippet,
        html_length: htmlLength,
        has_dimension_keyword: hasDimensionKeyword,
        parser_version: parserVersion,
      },

      extracted_name: extracted.extracted_name ?? parsed?.product_name ?? null,
      extracted_brand: extracted.extracted_brand ?? parsed?.brand ?? null,
      extracted_category:
        extracted.extracted_category ?? parsed?.category ?? null,
      extracted_price:
        parseNumberOrNull(extracted.extracted_price) ??
        parseNumberOrNull(parsed?.price),
      extracted_material:
        extracted.extracted_material ?? parsed?.material ?? null,

      extracted_width_cm:
        parseNumberOrNull(parsed?.width_cm) ??
        parseNumberOrNull(extracted.extracted_width_cm),
      extracted_depth_cm:
        parseNumberOrNull(parsed?.depth_cm) ??
        parseNumberOrNull(extracted.extracted_depth_cm),
      extracted_height_cm:
        parseNumberOrNull(parsed?.height_cm) ??
        parseNumberOrNull(extracted.extracted_height_cm),

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

      extraction_notes:
        parsed?.metadata_json?.dimension_debug
          ? JSON.stringify({
              ai_notes: extracted.extraction_notes ?? null,
              parser_debug: parsed.metadata_json.dimension_debug,
            })
          : (extracted.extraction_notes ?? null),

      status: "pending_review",
    };

    const { data: importJob, error: importError } = await supabase
      .from("import_jobs")
      .upsert(importPayload, { onConflict: "source_url" })
      .select()
      .single();

    if (importError) throw importError;

    return NextResponse.json({
      success: true,
      import_job: importJob,
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