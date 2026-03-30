# Automation Runbook

## Goal
This repository uses Codex as the execution engine, CI as the automatic gate, and human approval as the final release decision.

## Operating model
1. Human gives a task goal
2. Change plan is defined
3. Human approves direction
4. Codex applies the code change
5. CI runs
6. Result is reviewed
7. Human decides merge / reject / rollback

## What Codex should handle first
- component-level UI fixes
- layout consistency fixes
- small product flow fixes
- lint/build fixes
- low-risk refactors inside a single file or small area

## What should not be automated yet
- production database changes
- arbitrary SQL execution
- destructive data operations
- secret rotation
- deployment approval
- large recommendation-logic rewrites
- broad refactors across many folders

## Minimum review input
Every task should define:
- request summary
- target file
- expected result
- verification method
- risk note
- output format

## Minimum CI gate
The default minimum gate is:
- lint
- build

## Approval levels
### Safe
Can proceed after direction approval:
- UI spacing
- text alignment
- button position
- local component cleanup

### Caution
Needs explicit extra approval:
- API routes
- hooks shared by multiple screens
- saved/compare logic
- recommendation rendering logic

### Restricted
Do not automate without a separate safety plan:
- schema changes
- migrations
- external service admin operations
- production environment operations

## Future expansion
Second phase may add:
- Supabase read-only admin gateway
- safe write gateway
- Cloudinary upload/search helpers
- Stability generation helpers
- n8n approval orchestration
