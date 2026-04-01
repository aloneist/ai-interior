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
  "팔걸이",
  "다리",
  "내부",
  "서랍내부",
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
  "폭",
  "가로",
  "너비",
  "길이",
  "깊이",
  "세로",
  "높이",
  "총높이",
  "전체 높이",
  "등받이 높이",
  "등받이H",
  "시트 높이",
  "좌면 높이",
  "좌석 높이",
  "시트 깊이",
  "좌면 깊이",
  "좌석 깊이",
  "시트 폭",
  "좌면 폭",
  "좌석 폭",
  "지름",
  "diameter",
  "ø",
  "H(쿠션포함)",
  "높이(쿠션포함)",
];

  for (const label of boundaryLabels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*${escaped}\\s*:`, "gi"), `\n${label}:`);
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

function collectDimensionCandidatesFromLines(params: {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
}): number[] {
  const {
    text,
    labels,
    excludeIfLineHas = [
      "포장",
      "배송",
      "패키지",
      "팔걸이",
      "다리",
      "헤드레스트",
      "받침",
      "내부",
    ],
  } = params;

  return collectLabeledDimensionCandidates({
    text,
    labels,
    excludeIfLineHas,
  });
}

function collectHeightCandidatesFromLines(params: {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
}): number[] {
  const {
    text,
    labels,
    excludeIfLineHas = [
      "포장",
      "배송",
      "패키지",
      "팔걸이",
      "다리",
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

function extractHeightFromLines(text: string): number | null {
  const primaryHeightCandidates = collectHeightCandidatesFromLines({
    text,
    labels: [
      "전체 높이",
      "총높이",
      "높이",
      "height",
      "H",
      "H(쿠션포함)",
      "높이(쿠션포함)",
      "등받이 높이",
      "등받이H",
    ],
  });

  if (primaryHeightCandidates.length > 0) {
    return maxOrNull(primaryHeightCandidates);
  }

  return null;
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

function extractDiameterFromLines(text: string): number | null {
  const diameterCandidates = collectDimensionCandidatesFromLines({
    text,
    labels: ["지름", "diameter", "ø"],
  });

  return maxOrNull(diameterCandidates);
}

function extractDimensions(sectionText: string | null): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  diameter_cm: number | null;
  derived_width_from_diameter: boolean;
  derived_depth_from_diameter: boolean;
  raw_dimension_text: string | null;
} {
  if (!sectionText) {
    return {
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      diameter_cm: null,
      derived_width_from_diameter: false,
      derived_depth_from_diameter: false,
      raw_dimension_text: null,
    };
  }

  const normalizedSectionText = normalizeDimensionSectionForParsing(sectionText);

  const primaryWidthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["폭", "가로", "width", "너비"],
  });

  let width_cm = maxOrNull(primaryWidthCandidates);

  const primaryDepthCandidates = collectDimensionCandidatesFromLines({
  text: normalizedSectionText,
  labels: ["깊이", "depth", "세로"],
});

let depth_cm = maxOrNull(primaryDepthCandidates);

const primaryLengthCandidates = collectDimensionCandidatesFromLines({
  text: normalizedSectionText,
  labels: ["길이", "length"],
});

const length_cm = maxOrNull(primaryLengthCandidates);

// 벤치처럼 "폭 / 길이 / 높이" 표기를 쓰는 chair 계열 fallback
if (depth_cm == null && length_cm != null) {
  depth_cm = length_cm;
}

let height_cm = extractHeightFromLines(normalizedSectionText);  

  const diameter_cm = extractDiameterFromLines(normalizedSectionText);

  let derived_width_from_diameter = false;
  let derived_depth_from_diameter = false;

  if (width_cm == null || depth_cm == null || height_cm == null) {
  const compact = extractCompactDimensions(normalizedSectionText);

  width_cm = width_cm ?? compact.width_cm;
  depth_cm = depth_cm ?? compact.depth_cm;
  height_cm = height_cm ?? compact.height_cm;
}

// compact fallback 이후에도 벤치류 길이 표기를 depth로 보정
if (depth_cm == null && length_cm != null) {
  depth_cm = length_cm;
}

if (diameter_cm != null) {
    if (width_cm == null) {
      width_cm = diameter_cm;
      derived_width_from_diameter = true;
    }
    if (depth_cm == null) {
      depth_cm = diameter_cm;
      derived_depth_from_diameter = true;
    }
  }

  return {
    width_cm,
    depth_cm,
    height_cm,
    diameter_cm,
    derived_width_from_diameter,
    derived_depth_from_diameter,
    raw_dimension_text: normalizedSectionText || null,
  };
}

export function parseChairSnapshot(
  snapshot: RawProductSnapshot
): ParsedFurnitureProduct {
  const dims = extractDimensions(snapshot.dimension_section_text);

  return {
    product_name: snapshot.title,
    brand: snapshot.source_site === "ikea" ? "IKEA" : null,
    category: "chair",
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
      parser_version: "chair-category-v2",
      source_site: snapshot.source_site,
      source_url: snapshot.source_url,
      category_hint: snapshot.category_hint,
      raw_dimension_text_preview:
        dims.raw_dimension_text?.slice(0, 1000) ?? null,
      diameter_cm: dims.diameter_cm,
      derived_width_from_diameter: dims.derived_width_from_diameter,
      derived_depth_from_diameter: dims.derived_depth_from_diameter,
      site_metadata: snapshot.metadata_json ?? {},
    },
  };
}
