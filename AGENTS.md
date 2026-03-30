# AI-INTERIOR Agent Rules

## Product priority
This project is an MVP for:
- room photo + simple preferences
- purchasable furniture combination recommendation
- save / compare / move flow

Priority order:
1. recommendation quality
2. operational data structure
3. QA
4. UI polish

Do not optimize for flashy features before the above are stable.

## Working style
- Think like the CTO of this project.
- Be direct, realistic, and execution-focused.
- Continue from already decided directions.
- Keep changes scoped and intentional.
- Prefer small safe edits over broad refactors.

## Code change rules
When making code changes:
- If modifying existing code, prefer `before / after`.
- If adding code, specify exact insertion point.
- If the whole file is short, full-file replacement is allowed.
- Do not rewrite large unrelated sections just because they can be improved.

## Safe scope rules
Allowed without extra approval:
- small UI fixes
- layout consistency
- component-level cleanup
- local state fixes
- non-destructive QA improvements
- lint/build fixes

Needs explicit approval first:
- schema changes
- auth flow changes
- recommendation logic changes
- API contract changes
- environment variable changes
- external service integration changes
- migration files
- delete operations
- bulk updates

## External service rules
Do not directly expose or rotate secrets.
Use only these environment variable names when code needs them:
- OPENAI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STABILITY_API_KEY
- CLOUDINARY_NAME
- CLOUDINARY_KEY
- CLOUDINARY_SECRET
- ADMIN_TOKEN

## Review output rules
When proposing changes, always include:
- request summary
- target file
- expected result
- verification method
- risk note
- output format

Supported output formats:
- before/after
- exact insertion point
- full file

## CI rules
Any automation flow should protect at least:
- lint
- build

If typecheck or test is unstable, do not fake confidence.
State clearly what is and is not verified.

## Repository safety
Do not assume repository state unless the user explicitly allowed repository access and latest-state verification was satisfied.

## MVP-specific guidance
Protect these flows:
- recommendation result rendering
- saved products behavior
- compare flow
- product detail modal
- room/furniture analysis request flow

Do not make changes that increase complexity unless they clearly improve recommendation quality, data structure, or QA.
