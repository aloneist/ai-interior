import {
  normalizeText,
  splitLines,
} from "@/lib/parsers/shared/text";
import type {
  CollectLabeledDimensionCandidatesParams,
  DimensionRangePolicy,
} from "@/lib/parsers/shared/types";

export type DimensionValueParse = {
  value_cm: number | null;
  range_policy_applied: DimensionRangePolicy;
};

export type CompactDimensionParse = {
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  selected_dimension_unit: string | null;
  range_policy_applied: DimensionRangePolicy;
};

export type DimensionDebugSelection = {
  selected_dimension_line: string | null;
  selected_dimension_unit: string | null;
  range_policy_applied: DimensionRangePolicy;
};

export function toCm(value: number, unit?: string): number {
  const u = (unit || "cm").toLowerCase();

  if (u === "mm") return Math.round((value / 10) * 10) / 10;
  if (u === "m") return Math.round(value * 100 * 10) / 10;

  return Math.round(value * 10) / 10;
}

export function makeLabelPattern(labels: string[]): RegExp {
  const escaped = labels
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  return new RegExp(
    `(${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?(?:\\s*[~\\-]\\s*\\d+(?:[.,]\\d+)?)?)\\s*(cm|mm|m)?`,
    "i"
  );
}

export function parseDimensionValueToCm(
  rawValue: string,
  unit?: string
): DimensionValueParse {
  const values = rawValue
    .split(/\s*[~\-]\s*/)
    .map((part) => Number(part.replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return {
      value_cm: null,
      range_policy_applied: null,
    };
  }

  const selectedValue = Math.max(...values);

  return {
    value_cm: toCm(selectedValue, unit),
    range_policy_applied: values.length > 1 ? "max" : null,
  };
}

export function normalizeJoinedDimensionLabels(text: string): string {
  return normalizeText(text)
    .replace(
      /(\d+(?:[.,]\d+)?\s*(?:cm|mm|m))(?=[가-힣A-Za-z])/g,
      "$1\n"
    )
    .replace(/\n{2,}/g, "\n");
}

export function collectLabeledDimensionCandidates(
  params: CollectLabeledDimensionCandidatesParams
): number[] {
  const {
    text,
    labels,
    excludeIfLineHas = [],
  } = params;

  const pattern = makeLabelPattern(labels);
  const lines = splitLines(text);

  const values: number[] = [];

  for (const line of lines) {
    const match = line.match(pattern);
    if (!match) continue;

    const rawValue = match[2];
    const unit = match[3];

    const shouldExclude = excludeIfLineHas.some((kw) => line.includes(kw));
    if (shouldExclude) continue;

    const parsed = parseDimensionValueToCm(rawValue, unit);
    if (parsed.value_cm != null) {
      values.push(parsed.value_cm);
    }
  }

  return values;
}

export function parseCompactDimensionLine(
  line: string
): CompactDimensionParse | null {
  const compact = line.match(
    /(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*[x×]\s*(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*[x×]\s*(\d+(?:[.,]\d+)?(?:\s*[~\-]\s*\d+(?:[.,]\d+)?)?)\s*(cm|mm|m)/i
  );

  if (!compact) return null;

  const unit = compact[4]?.toLowerCase() ?? null;
  const width = parseDimensionValueToCm(compact[1], unit ?? undefined);
  const depth = parseDimensionValueToCm(compact[2], unit ?? undefined);
  const height = parseDimensionValueToCm(compact[3], unit ?? undefined);

  return {
    width_cm: width.value_cm,
    depth_cm: depth.value_cm,
    height_cm: height.value_cm,
    selected_dimension_unit: unit,
    range_policy_applied:
      width.range_policy_applied ??
      depth.range_policy_applied ??
      height.range_policy_applied,
  };
}

export function selectDimensionDebugSelection(params: {
  text: string;
  excludeIfLineHas?: string[];
}): DimensionDebugSelection {
  const {
    text,
    excludeIfLineHas = [],
  } = params;

  const lines = splitLines(text);
  const candidates: Array<{
    line: string;
    score: number;
    unit: string | null;
    rangePolicy: DimensionRangePolicy;
  }> = [];

  for (const line of lines) {
    const shouldExclude = excludeIfLineHas.some((kw) => line.includes(kw));
    if (shouldExclude) continue;

    const unit = line.match(/\b(cm|mm|m)\b/i)?.[1]?.toLowerCase() ?? null;
    const rangePolicy = /\d+(?:[.,]\d+)?\s*[~\-]\s*\d+(?:[.,]\d+)?/.test(line)
      ? "max"
      : null;

    let score = 0;
    score += (line.match(/(폭|가로|너비|width)/gi)?.length ?? 0) * 3;
    score += (line.match(/(깊이|세로|길이|depth|length)/gi)?.length ?? 0) * 3;
    score += (line.match(/(높이|총높이|전체 높이|height|\bH\b)/gi)?.length ?? 0) * 3;
    score += (line.match(/(지름|diameter|ø)/gi)?.length ?? 0) * 2;
    if (unit) score += 2;
    if (rangePolicy) score += 1;
    if (/[x×]/.test(line)) score += 4;

    if (score <= 0) continue;

    candidates.push({
      line,
      score,
      unit,
      rangePolicy,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates[0];

  return {
    selected_dimension_line: selected?.line ?? null,
    selected_dimension_unit: selected?.unit ?? null,
    range_policy_applied: selected?.rangePolicy ?? null,
  };
}

export function maxOrNull(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}
