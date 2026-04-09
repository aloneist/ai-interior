import type { ParserDebugMeta } from "@/lib/parsers/shared/types";

export function buildParserDebug(params: ParserDebugMeta) {
  return {
    html_length: params.html_length,
    has_dimension_keyword: params.has_dimension_keyword,
    width_cm: params.width_cm,
    depth_cm: params.depth_cm,
    height_cm: params.height_cm,
    raw_dimension_text_preview: params.raw_dimension_text_preview,
    selected_dimension_line: params.selected_dimension_line ?? null,
    selected_dimension_unit: params.selected_dimension_unit ?? null,
    range_policy_applied: params.range_policy_applied ?? null,
    parser_version: params.parser_version,
    category_hint: params.category_hint ?? null,
    category_hint_source_preview: params.category_hint_source_preview ?? null,
    category_confidence: params.category_confidence ?? null,
    category_scores: params.category_scores ?? null,
  };
}
