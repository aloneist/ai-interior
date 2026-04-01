import { parseChairSnapshot } from "@/lib/parsers/categories/chair";
import { parseSofaSnapshot } from "@/lib/parsers/categories/sofa";
import { parseTableSnapshot } from "@/lib/parsers/categories/table";
import { extractIkeaSnapshot } from "@/lib/parsers/sites/ikea";
import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";

export function parseIkeaPayload(raw: unknown): ParsedFurnitureProduct {
  const snapshot = extractIkeaSnapshot(raw);

  if (snapshot.category_hint === "chair") {
    return parseChairSnapshot(snapshot);
  }

  if (snapshot.category_hint === "table") {
    return parseTableSnapshot(snapshot);
  }

  return parseSofaSnapshot(snapshot);
}

export function compareIkeaParsers(raw: unknown) {
  const snapshot = extractIkeaSnapshot(raw);

  let v2: ParsedFurnitureProduct;

  if (snapshot.category_hint === "chair") {
    v2 = parseChairSnapshot(snapshot);
  } else if (snapshot.category_hint === "table") {
    v2 = parseTableSnapshot(snapshot);
  } else {
    v2 = parseSofaSnapshot(snapshot);
  }

  return {
    v2,
    snapshot,
    diff: {
      product_name: v2.product_name,
      price: v2.price,
      image_url: v2.image_url,
      category_hint: snapshot.category_hint,
      category: v2.category,
      width_cm: v2.width_cm,
      depth_cm: v2.depth_cm,
      height_cm: v2.height_cm,
      diameter_cm: v2.metadata_json?.diameter_cm ?? null,
      derived_width_from_diameter:
        v2.metadata_json?.derived_width_from_diameter ?? null,
      derived_depth_from_diameter:
        v2.metadata_json?.derived_depth_from_diameter ?? null,
      raw_dimension_text_preview:
        v2.metadata_json?.raw_dimension_text_preview ?? null,
      snapshot_dimension_text_preview:
        snapshot.metadata_json?.debug?.raw_dimension_text_preview ?? null,
      category_confidence:
        snapshot.metadata_json?.debug?.category_confidence ?? null,
      category_scores:
        snapshot.metadata_json?.debug?.category_scores ?? null,
    },
  };
}
