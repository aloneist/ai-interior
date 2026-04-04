# Supabase Provider

This folder contains the first restricted Supabase automation path.

Current responsibilities:
- explicit read-only catalog gateway for `catalog.read`
- one allowed operation: `list_active_furniture_products`
- reads from `furniture_products` only
- filters to `status = active`
- optional category filter and bounded limit

Current scaffold status:
- keeps the provider boundary inside automation
- uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only
- falls back to demo-only in-memory data when Supabase env is absent
- does not expose arbitrary SQL or arbitrary table execution

Not included yet:
- schema operations
- runtime product coupling
- write or admin operations
- general-purpose database execution
