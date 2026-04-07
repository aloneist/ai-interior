import overlayData from "@/data/catalog/product-metadata-overlay-v1.json"
import type { RuntimeFurnitureRecord } from "@/lib/server/furniture-catalog"

export type CatalogMetadataOverlay = {
  source: string
  style_labels: string[]
  style_confidence: Record<string, "high" | "medium" | "low">
  category_aliases: string[]
  room_affinity: {
    strong: string[]
    medium: string[]
    weak: string[]
  }
  description: string
  color: string
  material: string
  evidence: string[]
}

const overlayProducts = overlayData.products as Record<string, CatalogMetadataOverlay>

export function getCatalogMetadataOverlay(productKey: string | null | undefined) {
  if (!productKey) return null

  return overlayProducts[productKey] ?? null
}

export function applyCatalogMetadataOverlay(
  record: RuntimeFurnitureRecord
): RuntimeFurnitureRecord {
  const overlay = getCatalogMetadataOverlay(record.product_key)

  if (!overlay) return record

  return {
    ...record,
    description: record.description ?? overlay.description,
    color: record.color ?? overlay.color,
    material: record.material ?? overlay.material,
    catalog_metadata: overlay,
  }
}
