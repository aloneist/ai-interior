# 013 - Recommendation QA Baseline V1

## Goal
Create a first recommendation QA baseline for this repository.

This task is not for changing recommendation behavior yet.
The purpose is to define a small, practical baseline that can later be used to review recommendation quality and detect regressions.

## Scope
Only touch files that are directly needed for creating the QA baseline.

Preferred scope:
- `docs/qa/*`
- `data/qa/*`
- `tests/qa/*`

If the repository uses a different existing folder for fixtures or evaluation notes, use that location instead.
Do not modify recommendation logic, parser logic, API behavior, UI behavior, or database logic.

## Primary Objective
- Create a lightweight QA baseline structure for recommendation review
- Define a small set of representative recommendation test cases
- Define pass/fail review criteria for each case
- Keep the output practical and easy to extend later

## Allowed Changes
- Add QA documentation files
- Add baseline fixture files or structured JSON/TS data files for QA cases
- Add a simple README or notes file explaining how to use the baseline
- Add a lightweight structure for expected review criteria
- Reuse existing repository conventions if a suitable QA/test structure already exists

## Disallowed Changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB schema changes
- No scoring or ranking changes
- No broad refactors
- No unrelated cleanup
- No touching unrelated files

## Critical Safety Rule
This task defines evaluation structure only.

Do not change product behavior.
Do not mix baseline creation with logic improvement.
Do not silently introduce implementation changes while adding QA artifacts.

## Working Principles
- Keep the baseline small and usable
- Prefer a structure that is easy to review manually first
- Make the baseline extensible for future regression checks
- Focus on realistic recommendation quality signals, not synthetic perfection
- Use naming and structure that are easy to understand in future sessions

## Baseline Requirements
Create a V1 baseline that includes:

1. A short overview document
2. A small set of representative cases (about 5 to 10)
3. For each case:
   - case id
   - short scenario description
   - expected user intent summary
   - expected positive signals
   - expected failure signals
   - review notes field or equivalent
4. A short usage note explaining how to review future recommendation outputs against this baseline

## Recommended Evaluation Dimensions
Use practical quality dimensions such as:

- category relevance
- room-context fit
- budget fit
- style fit
- size/space plausibility
- explanation plausibility
- obvious failure conditions

Do not over-engineer scoring in V1.
A clear review baseline is more important than a complex framework.

## Suggested Case Types
Include a mix such as:

- small studio / one-room setup
- bedroom-focused request
- living room / sofa-centered request
- budget-sensitive request
- style-constrained request
- small-space constraint
- storage-priority case

Use realistic and representative cases rather than edge cases only.

## Completion Criteria
- A QA baseline V1 structure exists in-repo
- It includes representative recommendation cases
- It defines clear review criteria and obvious failure conditions
- It does not change product behavior
- It is usable for future manual QA and regression review

## Validation
Run in this order:

1. Review the diff and confirm only QA-baseline-related files were added or changed
2. Confirm no product logic files were modified
3. Summarize the created baseline structure
4. Report how many cases were added and how they are organized

## Required Result Format
Report results using this structure:

- changed files
- baseline structure summary
- case summary
- validation result
- risk notes