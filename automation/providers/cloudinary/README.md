# Cloudinary Provider

This folder contains the first restricted Cloudinary automation path.

Current responsibilities:
- explicit read-only asset gateway for `asset.search`
- one allowed operation: `search_design_reference_assets`
- reads image assets only
- optional folder filter, bounded tags, and bounded result count

Current scaffold status:
- keeps the provider boundary inside automation
- uses `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET` only
- falls back to demo-only in-memory data when Cloudinary env is absent
- does not expose upload, delete, rename, or arbitrary admin operations

Not included yet:
- product upload flow changes
- generic admin search tooling
- write or cleanup operations
