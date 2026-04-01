import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";
import type { RawProductSnapshot } from "@/lib/parsers/shared/snapshot";
import {
  toCm,
  maxOrNull,
  normalizeJoinedDimensionLabels,
  collectLabeledDimensionCandidates,
} from "@/lib/parsers/shared/dimensions";
import { normalizeText } from "@/lib/parsers/shared/text";

const STRONGLY_EXCLUDED_DIMENSION_CONTEXTS = [
  "포장",
  "포장높이",
  "포장 높이",
  "포장치수",
  "포장 치수",
  "패키지",
  "패키지 높이",
  "박스",
  "상자",
  "배송",
  "배송치수",
  "배송 치수",
];

const WEAKLY_EXCLUDED_DIMENSION_CONTEXTS = [
  "시트",
  "좌석",
  "팔걸이",
  "등판",
  "매트리스",
  "서랍내부",
  "내부",
  "쿠션",
  "다리",
  "프레임 내부",
  "헤드레스트",
  "받침",
];

function parsePriceText(priceText: string | null): number | null {
  if (!priceText) return null;

  const value = Number(priceText.replace(/[^\d]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeDimensionSectionForParsing(sectionText: string): string {
  let text = normalizeText(sectionText);

  const boundaryLabels = [
    "치수",
    "팔걸이 높이",
    "팔걸이 너비",
    "깊이",
    "가구 밑 여유공간",
    "등받이H",
    "등받이 높이",
    "시트 깊이",
    "시트 높이",
    "시트 폭",
    "폭",
    "가로",
    "너비",
    "높이",
    "총높이",
    "전체 높이",
    "H(등쿠션포함)",
    "H(쿠션포함)",
    "높이(등쿠션포함)",
    "높이(쿠션포함)",
  ];

  for (const label of boundaryLabels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*${escaped}\\s*:`, "g"), `\n${label}:`);
  }

  text = normalizeJoinedDimensionLabels(text);

  return text
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function buildContextLine(lines: string[], index: number): string {
  const prev = lines[index - 1] ?? "";
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return `${prev} ${current} ${next}`.trim();
}

function collectHeightCandidatesFromLines(params: {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
}): number[] {
  const {
    text,
    labels,
    excludeIfLineHas = ["시트", "좌면", "좌석", "팔걸이", "다리", "포장", "배송", "패키지"],
  } = params;

  return collectLabeledDimensionCandidates({
    text,
    labels,
    excludeIfLineHas,
  });
}

function collectDimensionCandidatesFromLines(params: {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
}): number[] {
  const {
    text,
    labels,
    excludeIfLineHas = [
      "시트",
      "좌면",
      "좌석",
      "팔걸이",
      "내부",
      "서랍내부",
      "포장",
      "배송",
      "패키지",
      "헤드레스트",
      "받침",
    ],
  } = params;

  return collectLabeledDimensionCandidates({
    text,
    labels,
    excludeIfLineHas,
  });
}

function extractHeightCandidatesFromLines(text: string): {
  overall_height_cm: number | null;
  backrest_height_cm: number | null;
  resolved_height_cm: number | null;
} {
  const overallHeightCandidates = collectHeightCandidatesFromLines({
    text,
    labels: [
      "H(등쿠션포함)",
      "H(쿠션포함)",
      "높이(등쿠션포함)",
      "높이(쿠션포함)",
      "전체 높이",
      "총높이",
      "높이",
      "height",
      "H",
    ],
  });

  const backrestHeightCandidates = collectHeightCandidatesFromLines({
    text,
    labels: ["등받이H", "등받이 높이"],
  });

  const overall_height_cm = maxOrNull(overallHeightCandidates);
  const backrest_height_cm = maxOrNull(backrestHeightCandidates);

  return {
    overall_height_cm,
    backrest_height_cm,
    resolved_height_cm: overall_height_cm ?? backrest_height_cm,
  };
}

function extractCompactDimensions(text: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
} {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const contextLine = buildContextLine(lines, i);

    const hasStrong = STRONGLY_EXCLUDED_DIMENSION_CONTEXTS.some((kw) =>
      contextLine.includes(kw)
    );
    const hasWeak = WEAKLY_EXCLUDED_DIMENSION_CONTEXTS.some((kw) =>
      contextLine.includes(kw)
    );

    if (hasStrong || hasWeak) continue;

    const compact = line.match(
      /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)/i
    );

    if (!compact) continue;

    const a = Number(compact[1].replace(",", "."));
    const b = Number(compact[2].replace(",", "."));
    const c = Number(compact[3].replace(",", "."));
    const unit = compact[4];

    if ([a, b, c].every(Number.isFinite)) {
      return {
        width_cm: toCm(a, unit),
        depth_cm: toCm(b, unit),
        height_cm: toCm(c, unit),
      };
    }
  }

  return {
    width_cm: null,
    depth_cm: null,
    height_cm: null,
  };
}

function extractDimensions(sectionText: string | null): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  overall_height_cm: number | null;
  backrest_height_cm: number | null;
  raw_dimension_text: string | null;
} {
  if (!sectionText) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      overall_height_cm: null,
      backrest_height_cm: null,
      raw_dimension_text: null,
    };
  }

  const normalizedSectionText = normalizeDimensionSectionForParsing(sectionText);

  const primaryWidthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["폭", "가로", "width"],
  });

  let width_cm = maxOrNull(primaryWidthCandidates);

  if (width_cm == null) {
    const fallbackWidthCandidates = collectDimensionCandidatesFromLines({
      text: normalizedSectionText,
      labels: ["너비"],
    });
    width_cm = maxOrNull(fallbackWidthCandidates);
  }

  const primaryDepthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["깊이", "depth"],
  });

  let depth_cm = maxOrNull(primaryDepthCandidates);

  if (depth_cm == null) {
    const fallbackDepthCandidates = collectDimensionCandidatesFromLines({
      text: normalizedSectionText,
      labels: ["세로"],
    });
    depth_cm = maxOrNull(fallbackDepthCandidates);
  }

  const heightCandidates = extractHeightCandidatesFromLines(normalizedSectionText);

const height_cm = heightCandidates.resolved_height_cm;
const overall_height_cm = heightCandidates.overall_height_cm;
const backrest_height_cm = heightCandidates.backrest_height_cm;

if (width_cm == null || depth_cm == null || height_cm == null) {
  const compact = extractCompactDimensions(normalizedSectionText);

  return {
    width_cm: width_cm ?? compact.width_cm,
    depth_cm: depth_cm ?? compact.depth_cm,
    height_cm: height_cm ?? compact.height_cm,
    overall_height_cm,
    backrest_height_cm,
    raw_dimension_text: normalizedSectionText || null,
  };
}

return {
  width_cm,
  depth_cm,
  height_cm,
  overall_height_cm,
  backrest_height_cm,
  raw_dimension_text: normalizedSectionText || null,
};
}

export function parseSofaSnapshot(
  snapshot: RawProductSnapshot
): ParsedFurnitureProduct {
  const dims = extractDimensions(snapshot.dimension_section_text);

  return {
    product_name: snapshot.title,
    brand: snapshot.source_site === "ikea" ? "IKEA" : null,
    category: "sofa",
    price: parsePriceText(snapshot.price_text),
    currency: "KRW",
    image_url: snapshot.image_url,
    description: snapshot.description,
    color: null,
    material: null,
    width_cm: dims.width_cm,
    depth_cm: dims.depth_cm,
    height_cm: dims.height_cm,
    metadata_json: {
  parser_version: "sofa-category-v2",
  source_site: snapshot.source_site,
  source_url: snapshot.source_url,
  category_hint: snapshot.category_hint,
  raw_dimension_text_preview: dims.raw_dimension_text?.slice(0, 1000) ?? null,
  overall_height_cm: dims.overall_height_cm,
  backrest_height_cm: dims.backrest_height_cm,
  site_metadata: snapshot.metadata_json ?? {},
},
  };
}
