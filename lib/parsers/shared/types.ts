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
  metadata_json: Record<string, any>;
};

export type CollectLabeledDimensionCandidatesParams = {
  text: string;
  labels: string[];
  excludeIfLineHas?: string[];
};

export type ParserDebugMeta = {
  html_length: number;
  has_dimension_keyword: boolean;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  raw_dimension_text_preview: string | null;
  parser_version: string;
};