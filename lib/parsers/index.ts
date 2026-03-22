import { parseChairSnapshot } from "@/lib/parsers/categories/chair";
import { parseSofaSnapshot } from "@/lib/parsers/categories/sofa";
import { extractIkeaSnapshot } from "@/lib/parsers/sites/ikea";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";

export function parseIkeaPayloadV2(raw: any): ParsedFurnitureProduct {
  const snapshot = extractIkeaSnapshot(raw);

  if (snapshot.category_hint === "chair") {
    return parseChairSnapshot(snapshot);
  }

  return parseSofaSnapshot(snapshot);
}
