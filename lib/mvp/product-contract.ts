export type CanonicalProductId = string

export const MAX_COMPARE_PRODUCTS = 2

export type ProductDetailSource = "recommendation_payload"

export const PRODUCT_DETAIL_SOURCE: ProductDetailSource = "recommendation_payload"

export type OutboundProductUrlInput = {
  affiliate_url?: string | null
  external_url?: string | null
  product_key?: string | null
  brand?: string | null
  name?: string | null
}

function cleanUrl(value: string | null | undefined) {
  const url = value?.trim() ?? ""
  return /^https?:\/\//i.test(url) ? url : null
}

export function resolveOutboundProductUrl(item: OutboundProductUrlInput) {
  const affiliateUrl = cleanUrl(item.affiliate_url)
  if (affiliateUrl) return affiliateUrl

  const externalUrl = cleanUrl(item.external_url)
  if (externalUrl) return externalUrl

  const productKeyUrl = cleanUrl(item.product_key)
  if (productKeyUrl) return productKeyUrl

  const query = [item.brand, item.name].filter(Boolean).join(" ").trim()
  if (!query) return undefined

  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
    query
  )}`
}
