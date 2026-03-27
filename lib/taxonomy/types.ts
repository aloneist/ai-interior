export type CanonicalCategory =
  | "sofa"
  | "chair"
  | "table"
  | "desk"
  | "storage"
  | "bed"
  | "lighting"
  | "decor"
  | "textile";

export type CanonicalSubcategory =
  | "sectional_sofa"
  | "loveseat"
  | "sofa_bed"
  | "recliner_sofa"
  | "modular_sofa"
  | "accent_chair"
  | "armchair"
  | "dining_chair"
  | "office_chair"
  | "stool"
  | "bench"
  | "coffee_table"
  | "side_table"
  | "dining_table"
  | "console_table"
  | "tv_stand"
  | "cabinet"
  | "bookshelf"
  | "drawer"
  | "wardrobe"
  | "bed_frame"
  | "mattress"
  | "floor_lamp"
  | "table_lamp"
  | "pendant_light"
  | "wall_light"
  | "mirror"
  | "rug"
  | "curtain"
  | "cushion";

export type CanonicalMaterial =
  | "fabric"
  | "leather"
  | "faux_leather"
  | "wood"
  | "engineered_wood"
  | "metal"
  | "glass"
  | "stone"
  | "marble"
  | "plastic"
  | "rattan"
  | "bamboo"
  | "linen"
  | "cotton"
  | "velvet"
  | "boucle"
  | "wool"
  | "foam"
  | "ceramic";

export type CanonicalColorFamily =
  | "white"
  | "black"
  | "gray"
  | "beige"
  | "brown"
  | "cream"
  | "green"
  | "blue"
  | "navy"
  | "yellow"
  | "orange"
  | "red"
  | "pink"
  | "purple"
  | "silver"
  | "gold"
  | "transparent"
  | "multicolor";

export type CanonicalStyleTag =
  | "modern"
  | "minimal"
  | "scandinavian"
  | "mid_century_modern"
  | "industrial"
  | "natural"
  | "classic"
  | "contemporary"
  | "rustic"
  | "luxury"
  | "soft_modern"
  | "japandi"
  | "bohemian";

export type CanonicalShape =
  | "round"
  | "oval"
  | "square"
  | "rectangular"
  | "curved"
  | "linear"
  | "l_shaped"
  | "u_shaped";

export type CanonicalRoomType =
  | "living_room"
  | "bedroom"
  | "dining_room"
  | "home_office"
  | "entryway"
  | "kids_room"
  | "outdoor";

export type ProductCanonicalRecord = {
  source_site: string;
  source_url: string;

  raw_title: string | null;
  raw_description: string | null;
  raw_category_text: string | null;
  raw_dimension_text: string | null;
  raw_material_text: string | null;
  raw_color_text: string | null;

  canonical_category: CanonicalCategory | null;
  canonical_subcategory: CanonicalSubcategory | null;
  canonical_room_types: CanonicalRoomType[];
  canonical_materials: CanonicalMaterial[];
  canonical_color_family: CanonicalColorFamily | null;
  canonical_style_tags: CanonicalStyleTag[];
  canonical_shape: CanonicalShape | null;
  canonical_seat_capacity: number | null;

  display_name_ko: string | null;
  display_category_ko: string | null;
  display_subcategory_ko: string | null;
  display_materials_ko: string[];
  display_color_family_ko: string | null;
  display_style_tags_ko: string[];

  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  diameter_cm: number | null;

  metadata_json: Record<string, unknown> | null;
};