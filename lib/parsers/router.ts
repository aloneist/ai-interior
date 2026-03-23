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
  const snapshot = extractIkeaSnapshot(raw);
  const v2 =
    snapshot.category_hint === "chair"
      ? parseChairSnapshot(snapshot)
      : parseSofaSnapshot(snapshot);

  return {
    v2,
    snapshot,
    diff: {
      product_name: v2.product_name,
      price: v2.price,
      image_url: v2.image_url,
      category: v2.category,
      width_cm: v2.width_cm,
      depth_cm: v2.depth_cm,
      height_cm: v2.height_cm,
      raw_dimension_text_preview:
        v2.metadata_json?.raw_dimension_text_preview ?? null,
      snapshot_dimension_text_preview:
        snapshot.metadata_json?.debug?.raw_dimension_text_preview ?? null,
    },
  };
}