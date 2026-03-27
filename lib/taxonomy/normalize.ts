import type {
  CanonicalCategory,
  CanonicalSubcategory,
  CanonicalMaterial,
  CanonicalColorFamily,
} from "./types";
import {
  CATEGORY_SYNONYMS,
  SUBCATEGORY_SYNONYMS,
  MATERIAL_SYNONYMS,
  COLOR_FAMILY_SYNONYMS,
} from "./synonyms";
import {
  CATEGORY_DISPLAY_KO,
  SUBCATEGORY_DISPLAY_KO,
  MATERIAL_DISPLAY_KO,
  COLOR_FAMILY_DISPLAY_KO,
} from "./display-ko";

function normalizeText(input: string | null | undefined): string {
  return String(input ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function sortKeysByLengthDesc<T extends string>(
  dict: Record<string, T>
): Array<[string, T]> {
  return Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
}

function matchSingle<T extends string>(
  text: string,
  dict: Record<string, T>
): T | null {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  for (const [key, value] of sortKeysByLengthDesc(dict)) {
    if (normalized.includes(normalizeText(key))) {
      return value;
    }
  }

  return null;
}

function matchMultiple<T extends string>(
  text: string,
  dict: Record<string, T>
): T[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const hits: T[] = [];

  for (const [key, value] of sortKeysByLengthDesc(dict)) {
    if (normalized.includes(normalizeText(key))) {
      hits.push(value);
    }
  }

  return uniq(hits);
}

export function normalizeCategoryText(
  ...parts: Array<string | null | undefined>
): CanonicalCategory | null {
  return matchSingle(parts.filter(Boolean).join(" "), CATEGORY_SYNONYMS);
}

export function normalizeSubcategoryText(
  ...parts: Array<string | null | undefined>
): CanonicalSubcategory | null {
  return matchSingle(parts.filter(Boolean).join(" "), SUBCATEGORY_SYNONYMS);
}

export function normalizeMaterialsText(
  ...parts: Array<string | null | undefined>
): CanonicalMaterial[] {
  return matchMultiple(parts.filter(Boolean).join(" "), MATERIAL_SYNONYMS);
}

export function normalizeColorFamilyText(
  ...parts: Array<string | null | undefined>
): CanonicalColorFamily | null {
  return matchSingle(parts.filter(Boolean).join(" "), COLOR_FAMILY_SYNONYMS);
}

export function toCategoryDisplayKo(
  value: CanonicalCategory | null
): string | null {
  return value ? CATEGORY_DISPLAY_KO[value] : null;
}

export function toSubcategoryDisplayKo(
  value: CanonicalSubcategory | null
): string | null {
  return value ? SUBCATEGORY_DISPLAY_KO[value] : null;
}

export function toMaterialDisplaysKo(values: CanonicalMaterial[]): string[] {
  return uniq(values.map((value) => MATERIAL_DISPLAY_KO[value]));
}

export function toColorFamilyDisplayKo(
  value: CanonicalColorFamily | null
): string | null {
  return value ? COLOR_FAMILY_DISPLAY_KO[value] : null;
}