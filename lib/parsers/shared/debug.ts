import type { ParserDebugMeta } from "@/lib/parsers/shared/types";

export function buildParserDebug(params: ParserDebugMeta) {
  return {
    html_length: params.html_length,
    has_dimension_keyword: params.has_dimension_keyword,
    width_cm: params.width_cm,
    depth_cm: params.depth_cm,
    height_cm: params.height_cm,
    raw_dimension_text_preview: params.raw_dimension_text_preview,
    parser_version: params.parser_version,
  };
}
