export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compareIkeaParsers } from "@/lib/parsers";

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

    const result = compareIkeaParsers(raw);

    return NextResponse.json({
      success: true,
      source_url: normalizedUrl,
      source_site: sourceSite,
      html_length: html.length,
      result,
    });
  } catch (err: any) {
    console.error("TEST PARSER ERROR:", err);

    return NextResponse.json(
      {
        error: "Test parser failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}