export const runtime = "nodejs"

import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { parseIkeaPayload } from "@/lib/parsers/ikea"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeUrl(url: string) {
  try {
    const u = new URL(url)
    return u.toString()
  } catch {
    return url
  }
}

function detectSourceSite(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()

    if (host.includes("ikea")) return "ikea"
    if (host.includes("todayhouse")) return "todayhouse"
    if (host.includes("hanssem")) return "hanssem"
    if (host.includes("livart")) return "livart"

    return host
  } catch {
    return "unknown"
  }
}

function parseNumberOrNull(v: any) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function POST(req: Request) {
  let importJobId: string | null = null

  try {
    const token = req.headers.get("x-admin-token")

    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sourceUrl } = await req.json()

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "sourceUrl is required" },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(sourceUrl)
    const sourceSite = detectSourceSite(normalizedUrl)

    // 1) 원본 페이지 HTML 가져오기
    const pageRes = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      },
    })

    if (!pageRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${pageRes.status}` },
        { status: 400 }
      )
    }

    const html = await pageRes.text()

    // 너무 길면 잘라서 보냄
    const htmlSnippet = html.slice(0, 40000)

    // 2) OpenAI로 구조화 추출
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
          `,
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
    })

    const extracted = JSON.parse(aiRes.choices[0].message.content || "{}")

    // 3) import_jobs 저장
    const payload = {
      source_site: sourceSite,
      source_url: normalizedUrl,
      raw_payload: {
        html_snippet: htmlSnippet,
      },
      extracted_name: extracted.extracted_name ?? null,
      extracted_brand: extracted.extracted_brand ?? null,
      extracted_category: extracted.extracted_category ?? null,
      extracted_price: parseNumberOrNull(extracted.extracted_price),
      extracted_material: extracted.extracted_material ?? null,
      extracted_width_cm: parseNumberOrNull(extracted.extracted_width_cm),
      extracted_depth_cm: parseNumberOrNull(extracted.extracted_depth_cm),
      extracted_height_cm: parseNumberOrNull(extracted.extracted_height_cm),
      extracted_color_options: extracted.extracted_color_options ?? [],
      extracted_size_label: extracted.extracted_size_label ?? null,
      extracted_capacity_label: extracted.extracted_capacity_label ?? null,
      extracted_image_urls: extracted.extracted_image_urls ?? [],
      extracted_source_variant_ids:
        extracted.extracted_source_variant_ids ?? [],
      extracted_option_summaries: extracted.extracted_option_summaries ?? [],
      extracted_source_site: extracted.extracted_source_site ?? sourceSite,
      extracted_affiliate_url:
        extracted.extracted_affiliate_url ?? normalizedUrl,
      extracted_confidence: parseNumberOrNull(extracted.extracted_confidence),
      extraction_notes: extracted.extraction_notes ?? null,
      status: "pending",
    }

    const { data, error } = await supabase
      .from("import_jobs")
      .upsert(payload, { onConflict: "source_url" })
      .select()
      .single()

    if (error) throw error

    importJobId = data.id

    // 4) parser + furniture_products 저장
    const parsed = parseIkeaPayload(data.raw_payload)

    const productPayload = {
      source_site: data.source_site,
      source_url: data.source_url,
      product_name: parsed.product_name ?? data.extracted_name ?? "unknown product",
      brand: parsed.brand ?? data.extracted_brand ?? null,
      category: parsed.category ?? data.extracted_category ?? "unknown",
      price: parsed.price ?? data.extracted_price ?? null,
      currency: parsed.currency ?? "KRW",
      image_url: parsed.image_url ?? data.extracted_image_urls?.[0] ?? null,
      product_url: data.source_url,
      description: parsed.description ?? null,
      color: parsed.color ?? null,
      material: parsed.material ?? data.extracted_material ?? null,
      width_cm: parsed.width_cm ?? data.extracted_width_cm ?? null,
      depth_cm: parsed.depth_cm ?? data.extracted_depth_cm ?? null,
      height_cm: parsed.height_cm ?? data.extracted_height_cm ?? null,
      metadata_json: {
        import_job_id: data.id,
        raw_preview: data.raw_payload?.html_snippet?.slice(0, 300) ?? "",
        parser_price: parsed.price ?? null,
        extracted_price: data.extracted_price ?? null,
        extracted_image_urls: data.extracted_image_urls ?? [],
        extracted_color_options: data.extracted_color_options ?? [],
        extracted_option_summaries: data.extracted_option_summaries ?? [],
        extracted_confidence: data.extracted_confidence ?? null,
        extraction_notes: data.extraction_notes ?? null,
      },
      status: "active",
      updated_at: new Date().toISOString(), 
    }

    const { data: savedProduct, error: saveError } = await supabase
      .from("furniture_products")
      .upsert(productPayload, { onConflict: "source_url" })
      .select()
      .single()

    if (saveError) throw saveError

    // 5) import_jobs 상태 완료 처리
    const { error: statusUpdateError } = await supabase
      .from("import_jobs")
      .update({
        status: "completed",
        review_note: null,
      })
      .eq("id", data.id)

    if (statusUpdateError) throw statusUpdateError

    return NextResponse.json({
      success: true,
      import_job: {
        ...data,
        status: "completed",
        review_note: null,
      },
      parsed_product: savedProduct,
    })
  } catch (err: any) {
    console.error("IMPORT PRODUCT ERROR:", err)

    if (importJobId) {
      try {
        await supabase
          .from("import_jobs")
          .update({
            status: "failed",
            review_note: err?.message ?? "Unknown import error",
          })
          .eq("id", importJobId)
      } catch (statusErr) {
        console.error("FAILED TO UPDATE import_jobs STATUS:", statusErr)
      }
    }

    return NextResponse.json(
      { error: "Import product failed", message: err.message },
      { status: 500 }
    )
  }
}