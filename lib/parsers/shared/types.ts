export type ParserMetadata = {
  parser_version?: string;
  source_site?: string;
  source_url?: string | null;
  category_hint?: string | null;
  raw_dimension_text_preview?: string | null;
  selected_dimension_line?: string | null;
  selected_dimension_unit?: string | null;
  range_policy_applied?: "max" | null;
  footprint_shape?: "round" | "oval" | "l_shaped" | "irregular" | null;
  diameter_cm?: number | null;
  width_is_diameter?: boolean;
  depth_is_diameter?: boolean;
  derived_width_from_diameter?: boolean;
  derived_depth_from_diameter?: boolean;
  overall_height_cm?: number | null;
  backrest_height_cm?: number | null;
  site_metadata?: ParserMetadata;
  debug?: ParserDebugMeta;
  [key: string]: unknown;
};

export type ParsedFurnitureProduct = {
  product_name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  description: string | null;
  color: string | null;
  material: string | null;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  metadata_json: ParserMetadata;
};

export type CollectLabeledDimensionCandidatesParams = {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
};

export type DimensionRangePolicy = "max" | null;

export type ParserDebugMeta = {
  html_length: number;
  has_dimension_keyword: boolean;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  raw_dimension_text_preview: string | null;
  selected_dimension_line?: string | null;
  selected_dimension_unit?: string | null;
  range_policy_applied?: DimensionRangePolicy;
  parser_version: string;
  category_hint?: string | null;
  category_hint_source_preview?: string | null;
  category_confidence?: "high" | "medium" | "low" | null;
  category_scores?: Array<{
    category: string;
    score: number;
    matched_keywords: string[];
  }> | null;
};
