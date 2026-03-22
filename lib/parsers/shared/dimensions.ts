import {
  normalizeText,
  splitLines,
} from "@/lib/parsers/shared/text";
import type { CollectLabeledDimensionCandidatesParams } from "@/lib/parsers/shared/types";

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
    `(${escaped})\\s*[:：]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(cm|mm|m)?`,
    "i"
  );
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

    const value = Number(rawValue.replace(",", "."));
    if (Number.isFinite(value)) {
      values.push(toCm(value, unit));
    }
  }

  return values;
}

export function maxOrNull(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}