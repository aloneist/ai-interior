# Supabase Direct Readiness Summary

- Generated: 2026-04-05T11:44:18.776Z
- Command: `npm run supabase:readiness:snapshot`
- Conclusion: partial - Direct schema reads work, but critical tables are empty: furniture_products.

## Table Readiness
- `furniture_products`: present, total=0, active=0, columns=20, sample_row=empty
  columns: id, source_site, source_url, product_name, brand, category, price, currency
  purpose: Catalog product ingest and save path.
- `furniture_vectors`: present, total=28, columns=7, sample_row=present
  columns: furniture_id, brightness_compatibility, color_temperature_score, spatial_footprint_score, minimalism_score, contrast_score, colorfulness_score
  purpose: Recommendation scoring vector surface.
- `furniture`: present, total=28, columns=16, sample_row=present
  columns: id, name, brand, category, price, image_url, product_key, created_at
  purpose: Furniture record joined from recommendation vectors.
- `spaces`: present, total=27, columns=10, sample_row=present
  columns: id, image_url, brightness_score, color_temperature_score, spatial_density_score, minimalism_score, dominant_color_hex, created_at
  purpose: Room analysis persistence before recommendation.
- `recommendations`: present, total=0, columns=10, sample_row=empty
  columns: id, space_id, furniture_id, compatibility_score, clicked, saved, purchased, created_at
  purpose: Recommendation click logging and result persistence.
- `import_jobs`: present, total=28, columns=26, sample_row=present
  columns: id, source_site, source_url, raw_payload, extracted_name, extracted_brand, extracted_category, extracted_price
  purpose: Imported product normalization and review queue.

## Blockers
- furniture_products currently has 0 active rows, so the catalog read path has no live active inventory.

## Non-Blockers
- furniture_vectors is reachable with 28 rows.
