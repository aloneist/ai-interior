# 015 - Recommendation QA Run 2 After Catalog Refresh

## Goal
Run the same recommendation QA baseline again after the temporary catalog refresh and produce a new QA report.

This task is for evaluation only.
Do not change recommendation logic, parser logic, API behavior, UI behavior, database structure, or baseline definitions in this task.

## Scope
Only touch QA report files.

Preferred scope:
- `docs/qa/*`
- `data/qa/*`

Use the existing baseline:
- `data/qa/recommendation-baseline-v1.json`

Use the previous run only as a comparison reference:
- `data/qa/recommendation-qa-run-1.json`

## Primary Objective
- Re-run the same baseline cases after the temporary `furniture` / `furniture_vectors` refresh
- Save the result as a new run, not an overwrite
- Compare the new output against run 1 in practical terms
- Determine whether candidate-pool recovery actually improved recommendation quality

## Allowed Changes
- Add a new QA report document
- Add a new structured JSON result file
- Add comparison notes versus run 1
- Add per-case findings
- Add overall improvement/regression notes

## Disallowed Changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No baseline redesign
- No unrelated cleanup
- Do not overwrite run 1 files

## Critical Safety Rule
This is an evaluation task only.

Do not mix evaluation with implementation.
Do not modify product behavior while preparing the report.
Do not rewrite baseline case definitions in this task.

## Working Principles
- Keep the rerun directly comparable to run 1
- Reuse the same baseline cases
- Use the same or as-close-as-possible inputs as run 1
- Prefer practical qualitative comparison over fake scoring precision
- Focus on whether the refreshed candidate pool changed actual output quality

## Required Output
Create a new QA run result that includes:

1. A short run summary
2. Coverage of all baseline cases
3. Per-case findings
4. Comparison notes versus run 1
5. Common strengths
6. Common failure patterns
7. A short judgment on whether the catalog refresh improved recommendation quality
8. Suggested next priorities

## Required Naming
Create new files with new run names, for example:

- `docs/qa/recommendation-qa-run-2.md`
- `data/qa/recommendation-qa-run-2.json`

Do not overwrite:
- `docs/qa/recommendation-qa-run-1.md`
- `data/qa/recommendation-qa-run-1.json`

## Suggested Per-Case Fields
For each case, include:
- case id
- proxy inputs
- result summary
- judgment: pass / mixed / fail
- observed positive signals
- observed failure signals
- reviewer notes
- top results
- comparison vs run 1

## Key Comparison Questions
Focus on these questions:
- Was repeated output reduced?
- Did sofa-centered relevance improve?
- Did bedroom relevance improve at all?
- Did category diversity improve?
- Did constrained-space cases become more plausible?
- Did any previous fail case improve to mixed or pass?

## Completion Criteria
- A new run 2 report exists
- All baseline cases are covered
- Run 1 remains untouched
- The report clearly states whether the temporary catalog refresh improved results
- No product logic files were modified

## Validation
Run in this order:

1. Review the diff and confirm only QA-report-related files were added
2. Confirm run 1 files were not overwritten
3. Confirm no product logic files were modified
4. Report how many cases were reviewed
5. Report whether quality improved versus run 1

## Required Result Format
Report results using this structure:

- changed files
- QA run structure summary
- case coverage summary
- comparison summary vs run 1
- validation result
- risk notes