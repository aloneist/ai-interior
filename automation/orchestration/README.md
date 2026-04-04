# Orchestration

This folder reserves space for the layer that coordinates automation steps.

Expected future responsibilities:
- approval routing
- scheduling
- notifications
- multi-step workflow handoff

This layer should coordinate automation work.
It should not own product logic or direct provider implementation details.

Current scaffold note:
- approval-required execution results may expose a typed handoff payload for future orchestration use
- no real orchestration network execution is included yet
