import type { SupabaseClient } from "@supabase/supabase-js"

export type RecommendationActionRequest = {
  request_id: string
  /** Legacy API name; value is canonical public.furniture_products.id. */
  furniture_id: string
}

export type RecommendationActionPayload = {
  request_id?: string
  /** Preferred explicit name for new callers. */
  canonical_product_id?: string
  /** Legacy API name retained for current clients and DB column naming. */
  furniture_id?: string
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export function validateRecommendationActionRequest(
  input: RecommendationActionRequest
) {
  if (!input.request_id || !input.furniture_id) {
    return {
      ok: false as const,
      status: 400,
      error:
        "request_id and canonical_product_id (or legacy furniture_id) are required",
    }
  }

  if (!isUuid(input.request_id) || !isUuid(input.furniture_id)) {
    return {
      ok: false as const,
      status: 400,
      error:
        "request_id and canonical_product_id (or legacy furniture_id) must be UUIDs",
    }
  }

  return { ok: true as const }
}

export function normalizeRecommendationActionPayload(
  input: RecommendationActionPayload
): RecommendationActionRequest {
  return {
    request_id: input.request_id ?? "",
    furniture_id: input.canonical_product_id ?? input.furniture_id ?? "",
  }
}

export async function updateRecommendationAction(params: {
  supabase: SupabaseClient
  request_id: string
  canonicalProductId: string
  patch: Record<string, boolean>
}) {
  const { supabase, request_id, canonicalProductId, patch } = params

  const { data, error } = await supabase
    .from("recommendations")
    .update(patch)
    .eq("request_id", request_id)
    .eq("furniture_id", canonicalProductId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}
