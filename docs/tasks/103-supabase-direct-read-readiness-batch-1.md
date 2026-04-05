# Goal
Prepare the repository for Codex-led development that depends on direct Supabase reading of real schema/table/catalog reality.

# Scope
This task is for connection-driven development readiness only.

Primary target area:
- scripts/*
- docs/*
- package.json
- narrow repo helpers only if strictly required

This is not product-feature implementation yet.
This is not UI work.
This is not final DB redesign.
This is not broad automation documentation work.

# Primary Objective
Bundle the next practical connection step into one narrow batch:
1. give Codex a repeatable way to read real Supabase schema/table state needed for later coding
2. capture a narrow machine-readable and human-readable snapshot of the current relevant Supabase reality
3. make later code changes use current DB reality instead of assumptions

# Required Design Direction
The design must follow these rules:

1. Do not start broad product-feature work in this task.
2. Focus on direct-read readiness for later Codex coding.
3. Use real Supabase access, not guessed schema descriptions.
4. Keep the diff narrow and reviewable.
5. Prefer repeatable evidence over broad design discussion.

# Allowed Changes
- Add one narrow Supabase inspection/readiness script
- Add one narrow JSON snapshot output
- Add one narrow human-readable summary doc or md report
- Add one package.json entrypoint if clearly useful
- Small helper additions only if strictly required

# Disallowed Changes
- No recommendation-quality changes yet
- No UI changes
- No broad DB redesign
- No unrelated refactor
- No automation baseline expansion
- No broad documentation rewrite

# Critical Safety Rule
Do not drift into feature development.
This task is only about making real Supabase schema/table reality readable and reusable for later Codex coding.

# Working Principles
- Prefer direct evidence from Supabase
- Focus on the tables and schema surface actually needed next
- Keep outputs small, factual, and rerunnable
- Make later code work safer by reducing schema guessing

# Batch Contents

## A. Supabase direct-read snapshot command
Add one narrow command such as:
- npm run supabase:readiness:snapshot

It should directly read current Supabase reality for the key development tables/surfaces that matter next.

At minimum capture:
- table presence
- key row counts
- visible important columns
- whether expected tables are populated or empty

Prioritize current relevant surfaces such as:
- furniture_products
- furniture_vectors
- any directly adjacent tables actually used by the current repository paths

## B. Machine-readable snapshot artifact
Produce one JSON snapshot artifact that can be reused later by ChatGPT/Codex review.

Keep it narrow and factual.

## C. Human-readable summary
Produce one concise summary that states:
- what Supabase surfaces are ready
- what is empty
- what is usable right now for later development
- what is still a blocker vs non-blocker

## D. Minimal pointer alignment
Update only the minimum docs/README surface needed so the snapshot command is easy to find later.

# Required Behavior / Structure
The result should make it clear:
1. that Codex can read real Supabase development reality
2. what current tables/surfaces are actually usable
3. what is missing or empty
4. how this will support the next actual code batch

# Completion Criteria
Complete only when:
- the repo has one repeatable Supabase direct-read snapshot command
- one JSON snapshot exists
- one concise summary exists
- remaining blockers/non-blockers are explicit
- no feature work has started
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint if needed
- run the new Supabase snapshot command
- keep validation narrow and directly relevant

# Required Result Format
Return:
1. Files changed
2. What Supabase direct-read readiness changes were made
3. Validation commands run
4. Current Supabase readiness conclusion
5. Remaining blockers or gaps
6. Final diff summary