export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compareIkeaParsers } from "@/lib/parsers";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";
import type { RawProductSnapshot } from "@/lib/parsers/shared/snapshot";

type TestParserRequest = {
  sourceUrl: string;
};

function normalizeUrl(url: string) {
  try {
    return new URL(url).toString();
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

function makeParserNotes(params: {
  parsed: ParsedFurnitureProduct | null;
  snapshot: RawProductSnapshot | null;
}) {
  const { parsed, snapshot } = params;

  const lines: string[] = [];

  lines.push(`parser_version: ${parsed?.metadata_json?.parser_version ?? "-"}`);
  lines.push(`source_site: ${snapshot?.source_site ?? "-"}`);
  lines.push(`category_hint: ${snapshot?.category_hint ?? "-"}`);
  lines.push(`final_category: ${parsed?.category ?? "-"}`);
  lines.push(`price: ${parsed?.price ?? "-"}`);

  lines.push(
    `dimensions: W ${parsed?.width_cm ?? "null"} / D ${parsed?.depth_cm ?? "null"} / H ${parsed?.height_cm ?? "null"}`
  );

  lines.push(`diameter_cm: ${parsed?.metadata_json?.diameter_cm ?? "-"}`);
  lines.push(
    `derived_width_from_diameter: ${parsed?.metadata_json?.derived_width_from_diameter ?? false}`
  );
  lines.push(
    `derived_depth_from_diameter: ${parsed?.metadata_json?.derived_depth_from_diameter ?? false}`
  );

  const rawPreview =
    parsed?.metadata_json?.raw_dimension_text_preview ??
    snapshot?.dimension_section_text ??
    snapshot?.metadata_json?.debug?.raw_dimension_text_preview ??
    null;

  lines.push("");
  lines.push("[dimension_section_preview]");
  lines.push(rawPreview || "-");

  return lines.join("\n");
} 

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");

    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceUrl } = (await req.json()) as TestParserRequest;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "sourceUrl is required" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(sourceUrl);
    const sourceSite = detectSourceSite(normalizedUrl);

    if (sourceSite !== "ikea") {
      return NextResponse.json(
        { error: "This test route currently supports IKEA only." },
        { status: 400 }
      );
    }

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

    const raw = {
      url: normalizedUrl,
      full_html: html,
    };

    const compared = compareIkeaParsers(raw);

    const parsed = compared?.v2 ?? null;
    const snapshot = compared?.snapshot ?? null;
    const diff = compared?.diff ?? null;

    const parserDebug = {
  parser_version: parsed?.metadata_json?.parser_version ?? "-",
  source_site: snapshot?.source_site ?? sourceSite,
  source_url: snapshot?.source_url ?? normalizedUrl,
  category_hint: snapshot?.category_hint ?? null,
  final_category: parsed?.category ?? null,
  html_length: html.length,
  raw_dimension_text_preview:
    parsed?.metadata_json?.raw_dimension_text_preview ??
    snapshot?.dimension_section_text ??
    snapshot?.metadata_json?.debug?.raw_dimension_text_preview ??
    null,
  diameter_cm: parsed?.metadata_json?.diameter_cm ?? null,
  derived_width_from_diameter:
    parsed?.metadata_json?.derived_width_from_diameter ?? false,
  derived_depth_from_diameter:
    parsed?.metadata_json?.derived_depth_from_diameter ?? false,
  snapshot_debug: snapshot?.metadata_json?.debug ?? null,
  diff: diff ?? null,
};

    const parserNotes = makeParserNotes({ parsed, snapshot });

    return NextResponse.json({
      success: true,
      source_url: normalizedUrl,
      source_site: sourceSite,
      html_length: html.length,
      result: {
        parsed,
        snapshot,
        diff,
        summary: {
  product_name: parsed?.product_name ?? null,
  brand: parsed?.brand ?? null,
  category: parsed?.category ?? null,
  price: parsed?.price ?? null,
  image_url: parsed?.image_url ?? null,
  width_cm: parsed?.width_cm ?? null,
  depth_cm: parsed?.depth_cm ?? null,
  height_cm: parsed?.height_cm ?? null,
  diameter_cm: parsed?.metadata_json?.diameter_cm ?? null,
  derived_width_from_diameter:
    parsed?.metadata_json?.derived_width_from_diameter ?? false,
  derived_depth_from_diameter:
    parsed?.metadata_json?.derived_depth_from_diameter ?? false,
},
        parser_debug: parserDebug,
        parser_notes: parserNotes,
      },
    });
  } catch (err: unknown) {
    console.error("TEST PARSER ERROR:", err);

    const message =
      err instanceof Error ? err.message : "Test parser failed";

    return NextResponse.json(
      {
        error: "Test parser failed",
        message,
      },
      { status: 500 }
    );
  }
}
