import type { ParsedFurnitureProduct } from "@/lib/parsers/shared/types";
import type { RawProductSnapshot } from "@/lib/parsers/shared/snapshot";

export function parseChairSnapshot(
  snapshot: RawProductSnapshot
): ParsedFurnitureProduct {
  return {
    product_name: snapshot.title,
    brand: snapshot.source_site === "ikea" ? "IKEA" : null,
    category: "chair",
    price: null,
    currency: "KRW",
    image_url: snapshot.image_url,
    description: snapshot.description,
    color: null,
    material: null,
    width_cm: null,
    depth_cm: null,
    height_cm: null,
    metadata_json: {
      parser_version: "chair-category-scaffold-v1",
      source_site: snapshot.source_site,
      source_url: snapshot.source_url,
      category_hint: snapshot.category_hint,
      dimension_section_text_preview:
        snapshot.dimension_section_text?.slice(0, 1000) ?? null,
    },
  };
}
