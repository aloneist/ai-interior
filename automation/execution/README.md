# Execution

This folder contains automation-internal execution helpers.

Current scope:
- accept typed capability requests
- resolve ready providers
- select one provider deterministically
- execute the selected provider
- return typed results plus lightweight selection metadata

Not included:
- product runtime wiring
- real network access
- environment-variable reads
- hidden fallback behavior
