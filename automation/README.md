# Automation

This directory holds the non-product automation scaffold for `AI-INTERIOR`.

Current goals:
- keep automation structure separate from product logic
- separate capability definitions from provider implementations
- reserve space for orchestration and CI
- stay safe to extend later without changing app behavior

Current status:
- structure only
- no real external integrations
- no product runtime usage

Top-level folders:
- `capabilities/`: automation-facing contracts and registry placeholders
- `providers/`: provider-specific placeholder areas
- `orchestration/`: future workflow and approval routing structure
- `ci/`: future repository quality gate structure
