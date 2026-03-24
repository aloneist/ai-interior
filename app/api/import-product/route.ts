export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { parseIkeaPayload } from "@/lib/parsers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type EnrichedAiResult = {
  extracted_material?: string | null;
  extracted_color_options?: string[];
  extracted_size_label?: string | null;
  extracted_capacity_label?: string | null;
  extracted_source_variant_ids?: string[];
  extracted_option_summaries?: string[];
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

function normalizeCategory(value: string): string | null {
  const text = value.toLowerCase().replace(/\s+/g, " ").trim();

  if (
    text.includes("sofa") ||
    text.includes("소파") ||
    text.includes("2인용 소파") ||
    text.includes("3인용 소파") ||
    text.includes("1인용 소파") ||
    text.includes("4인용 소파") ||
    text.includes("소파베드") ||
    text.includes("코너 소파") ||
    text.includes("카우치 소파") ||
    text.includes("모듈형 소파")
  ) {
    return "sofa";
  }

  if (
    text.includes("chair") ||
    text.includes("의자") ||
    text.includes("암체어") ||
    text.includes("식탁의자") ||
    text.includes("라운지체어")
  ) {
    return "chair";
  }

  if (
    text.includes("table") ||
    text.includes("테이블") ||
    text.includes("식탁") ||
    text.includes("커피테이블") ||
    text.includes("사이드테이블")
  ) {
    return "table";
  }

  if (
    text.includes("storage") ||
    text.includes("수납") ||
    text.includes("선반") ||
    text.includes("서랍") ||
    text.includes("수납장") ||
    text.includes("캐비닛")
  ) {
    return "storage";
  }

  if (text.includes("bed") || text.includes("침대")) {
    return "bed";
  }

  if (text.includes("lamp") || text.includes("조명")) {
    return "lighting";
  }

  if (text.includes("desk") || text.includes("책상")) {
    return "desk";
  }

  if (text.includes("decor") || text.includes("장식")) {
    return "decor";
  }

  return null;
}

function mergeImageUrls(
  parserImageUrl: string | null | undefined,
  aiImageUrls: unknown
): string[] {
  const aiUrls = toStringArray(aiImageUrls);
  const merged = [
    ...(parserImageUrl ? [parserImageUrl] : []),
    ...aiUrls,
  ].filter(Boolean);

  return merged.filter((url, index, arr) => arr.indexOf(url) === index);
}

function buildExtractionNotes(params: {
  parserResult: any | null;
  aiResult: EnrichedAiResult | null;
}) {
  const { parserResult, aiResult } = params;

  return JSON.stringify(
    {
      parser_debug: {
        parser_version: parserResult?.metadata_json?.parser_version ?? null,
        source_site: parserResult?.metadata_json?.source_site ?? null,
        source_url: parserResult?.metadata_json?.source_url ?? null,
        category_hint: parserResult?.metadata_json?.category_hint ?? null,
        raw_dimension_text_preview:
          parserResult?.metadata_json?.raw_dimension_text_preview ?? null,
        diameter_cm: parserResult?.metadata_json?.diameter_cm ?? null,
        derived_width_from_diameter:
          parserResult?.metadata_json?.derived_width_from_diameter ?? false,
        derived_depth_from_diameter:
          parserResult?.metadata_json?.derived_depth_from_diameter ?? false,
        site_metadata: parserResult?.metadata_json?.site_metadata ?? null,
      },
      ai_enrichment: {
        material: aiResult?.extracted_material ?? null,
        color_options: aiResult?.extracted_color_options ?? [],
        size_label: aiResult?.extracted_size_label ?? null,
        capacity_label: aiResult?.extracted_capacity_label ?? null,
        source_variant_ids: aiResult?.extracted_source_variant_ids ?? [],
        option_summaries: aiResult?.extracted_option_summaries ?? [],
        confidence: aiResult?.extracted_confidence ?? null,
        notes: aiResult?.extraction_notes ?? null,
      },
    },
    null,
    2
  );
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

const raw = {
  url: normalizedUrl,
  full_html: html,
};

const parserResult =
  sourceSite === "ikea" ? parseIkeaPayload(raw) : null;

const aiRes = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: `
You are a commerce product enrichment engine.
A deterministic parser has already extracted the core product fields.
Your job is ONLY to enrich missing or weakly-structured fields.

Return ONLY valid JSON in this exact structure:
{
  "extracted_material": string | null,
  "extracted_color_options": string[],
  "extracted_size_label": string | null,
  "extracted_capacity_label": string | null,
  "extracted_source_variant_ids": string[],
  "extracted_option_summaries": string[],
  "extracted_confidence": number | null,
  "extraction_notes": string | null
}

Rules:
- Do NOT re-infer or overwrite product name, category, price, image, width, depth, or height.
- Use null or [] if unknown.
- extracted_confidence must be 0..100.
- extracted_color_options should contain color names only.
- extracted_option_summaries should be short human-readable option summaries.
- extracted_source_variant_ids should contain only source-side variant identifiers if clearly present.
- extraction_notes should briefly explain uncertainty or useful enrichment context.
- Do not invent data.
`.trim(),
    },
    {
      role: "user",
      content: JSON.stringify({
        source_url: normalizedUrl,
        source_site: sourceSite,
        parser_result: parserResult,
        html: htmlSnippet,
      }),
    },
  ],
});

    const enriched: EnrichedAiResult = JSON.parse(
      aiRes.choices[0].message.content || "{}"
      );

    const finalCategory =
      parserResult?.category ??
      normalizeCategory(
        [
          parserResult?.product_name,
          sourceSite,
        ]
          .filter(Boolean)
          .join(" ")
      ) ??
      null;

    const importPayload = {
  source_site: sourceSite,
  source_url: normalizedUrl,
  raw_payload: {
    full_html: html,
    html_snippet: htmlSnippet,
    html_length: htmlLength,
    has_dimension_keyword: hasDimensionKeyword,
    parser_version: parserResult?.metadata_json?.parser_version ?? null,
    parser_result: parserResult,
  },

  extracted_name: parserResult?.product_name ?? null,
  extracted_brand: parserResult?.brand ?? null,
  extracted_category: finalCategory,
  extracted_price: parseNumberOrNull(parserResult?.price),
  extracted_material: enriched.extracted_material ?? null,
  extracted_width_cm: parseNumberOrNull(parserResult?.width_cm),
  extracted_depth_cm: parseNumberOrNull(parserResult?.depth_cm),
  extracted_height_cm: parseNumberOrNull(parserResult?.height_cm),
  extraction_notes: buildExtractionNotes({
    parserResult,
    aiResult: enriched,
  }),

  extracted_color_options: toStringArray(enriched.extracted_color_options),
  extracted_size_label: enriched.extracted_size_label ?? null,
  extracted_capacity_label: enriched.extracted_capacity_label ?? null,
  extracted_image_urls: parserResult?.image_url ? [parserResult.image_url] : [],
  extracted_source_variant_ids: toStringArray(
    enriched.extracted_source_variant_ids
  ),
  extracted_option_summaries: toStringArray(
    enriched.extracted_option_summaries
  ),
  extracted_source_site: sourceSite,
  extracted_affiliate_url: normalizedUrl,
  extracted_confidence: parseNumberOrNull(enriched.extracted_confidence),

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