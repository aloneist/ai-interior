import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";
import type { RawProductSnapshot } from "@/lib/parsers/shared/snapshot";
import {
  maxOrNull,
  normalizeJoinedDimensionLabels,
  collectLabeledDimensionCandidates,
  parseCompactDimensionLine,
  selectDimensionDebugSelection,
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
  "좌면",
  "등받이",
  "등판",
  "팔걸이",
  "헤드레스트",
  "받침",
  "내부",
  "서랍내부",
  "프레임 내부",
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
    "깊이",
    "세로",
    "길이",
    "높이",
    "총높이",
    "전체 높이",
    "지름",
    "diameter",
    "ø",
    "H",
    "height",
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
      ...STRONGLY_EXCLUDED_DIMENSION_CONTEXTS,
      ...WEAKLY_EXCLUDED_DIMENSION_CONTEXTS,
    ],
  } = params;

  return collectLabeledDimensionCandidates({
    text,
    labels,
    excludeIfLineHas,
  });
}

function extractHeightFromLines(text: string): number | null {
  const primaryHeightCandidates = collectDimensionCandidatesFromLines({
    text,
    labels: ["전체 높이", "총높이", "높이", "height", "H"],
  });

  return maxOrNull(primaryHeightCandidates);
}

function extractCompactDimensions(text: string): {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  range_policy_applied: "max" | null;
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

    const compact = parseCompactDimensionLine(line);
    if (compact) {
      return {
        width_cm: compact.width_cm,
        depth_cm: compact.depth_cm,
        height_cm: compact.height_cm,
        range_policy_applied: compact.range_policy_applied,
      };
    }
  }

  return {
    width_cm: null,
    depth_cm: null,
    height_cm: null,
    range_policy_applied: null,
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
  selected_dimension_line: string | null;
  selected_dimension_unit: string | null;
  range_policy_applied: "max" | null;
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
      selected_dimension_line: null,
      selected_dimension_unit: null,
      range_policy_applied: null,
    };
  }

  const normalizedSectionText = normalizeDimensionSectionForParsing(sectionText);
  const dimensionDebug = selectDimensionDebugSelection({
    text: normalizedSectionText,
    excludeIfLineHas: [
      ...STRONGLY_EXCLUDED_DIMENSION_CONTEXTS,
      ...WEAKLY_EXCLUDED_DIMENSION_CONTEXTS,
    ],
  });

  const primaryWidthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["폭", "가로", "너비", "width"],
  });

  let width_cm = maxOrNull(primaryWidthCandidates);

  const primaryDepthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["깊이", "세로", "depth"],
  });

  let depth_cm = maxOrNull(primaryDepthCandidates);

  const primaryLengthCandidates = collectDimensionCandidatesFromLines({
    text: normalizedSectionText,
    labels: ["길이", "length"],
  });

  const length_cm = maxOrNull(primaryLengthCandidates);

  // 깊이가 없고 폭/길이만 있으면 table 규칙으로 보정
  if (depth_cm == null && width_cm != null && length_cm != null) {
    const larger = Math.max(width_cm, length_cm);
    const smaller = Math.min(width_cm, length_cm);

    width_cm = larger;
    depth_cm = smaller;
  } else if (width_cm == null && length_cm != null) {
    width_cm = length_cm;
  }

  let height_cm = extractHeightFromLines(normalizedSectionText);

  const diameter_cm = extractDiameterFromLines(normalizedSectionText);

  let derived_width_from_diameter = false;
  let derived_depth_from_diameter = false;
  let range_policy_applied = dimensionDebug.range_policy_applied;

  if (width_cm == null || depth_cm == null || height_cm == null) {
    const compact = extractCompactDimensions(normalizedSectionText);

    width_cm = width_cm ?? compact.width_cm;
    depth_cm = depth_cm ?? compact.depth_cm;
    height_cm = height_cm ?? compact.height_cm;
    range_policy_applied = range_policy_applied ?? compact.range_policy_applied;
  }

  // compact fallback 이후에도 한 번 더 보정
  if (depth_cm == null && width_cm != null && length_cm != null) {
    const larger = Math.max(width_cm, length_cm);
    const smaller = Math.min(width_cm, length_cm);

    width_cm = larger;
    depth_cm = smaller;
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
    selected_dimension_line: dimensionDebug.selected_dimension_line,
    selected_dimension_unit: dimensionDebug.selected_dimension_unit,
    range_policy_applied,
  };
}

export function parseTableSnapshot(
  snapshot: RawProductSnapshot
): ParsedFurnitureProduct {
  const dims = extractDimensions(snapshot.dimension_section_text);
  const footprint_shape =
    dims.diameter_cm != null &&
    dims.derived_width_from_diameter &&
    dims.derived_depth_from_diameter
      ? "round"
      : null;

  return {
    product_name: snapshot.title,
    brand: snapshot.source_site === "ikea" ? "IKEA" : null,
    category: "table",
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
      parser_version: "table-category-v1",
      source_site: snapshot.source_site,
      source_url: snapshot.source_url,
      category_hint: snapshot.category_hint,
      raw_dimension_text_preview:
        dims.raw_dimension_text?.slice(0, 1000) ?? null,
      selected_dimension_line: dims.selected_dimension_line,
      selected_dimension_unit: dims.selected_dimension_unit,
      range_policy_applied: dims.range_policy_applied,
      footprint_shape,
      diameter_cm: dims.diameter_cm,
      width_is_diameter: dims.derived_width_from_diameter,
      depth_is_diameter: dims.derived_depth_from_diameter,
      derived_width_from_diameter: dims.derived_width_from_diameter,
      derived_depth_from_diameter: dims.derived_depth_from_diameter,
      site_metadata: snapshot.metadata_json ?? {},
    },
  };
}
