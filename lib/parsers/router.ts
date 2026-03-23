import { parseChairSnapshot } from "@/lib/parsers/categories/chair";
import { parseSofaSnapshot } from "@/lib/parsers/categories/sofa";
import { extractIkeaSnapshot } from "@/lib/parsers/sites/ikea";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";

export function parseIkeaPayload(raw: any): ParsedFurnitureProduct {
  const snapshot = extractIkeaSnapshot(raw);

  if (snapshot.category_hint === "chair") {
    return parseChairSnapshot(snapshot);
  }

  return parseSofaSnapshot(snapshot);
}

export function compareIkeaParsers(raw: any) {
  const result = parseIkeaPayload(raw);

  return {
    parsed: result,
    snapshot: extractIkeaSnapshot(raw),
  };
}