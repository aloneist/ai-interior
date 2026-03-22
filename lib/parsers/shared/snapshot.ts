export type RawProductSnapshot = {
  source_site: string;
  source_url: string | null;
  html: string;

  title: string | null;
  price_text: string | null;
  image_url: string | null;
  description: string | null;

  category_hint: string | null;
  dimension_section_text: string | null;

  metadata_json: Record<string, any>;
};
