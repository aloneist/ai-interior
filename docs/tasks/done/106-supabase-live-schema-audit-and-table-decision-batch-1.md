# Goal
Audit the live Supabase schema used by the project, compare it against the current repository storage/recommendation paths, and produce a decision-ready table review that clearly separates tables into keep / modify / merge / delete-candidate groups.

# Scope
This task is limited to:
- Reading the live Supabase table structure that is actually available to the current project environment
- Inspecting table names, column names, types, nullability, defaults, constraints if accessible, and row-count/sample-shape where safe
- Comparing live DB structure against the current repository code paths that read/write those tables
- Producing a decision document that explains each table and column role in practical product/ops terms
- Identifying duplicate responsibilities, obsolete paths, schema drift, and missing transitions between staging and production tables

# Primary Objective
Produce a reliable, decision-ready audit of the real database structure so the next step can safely decide which tables should remain, which should be modified, and which should be removed or merged.

# Allowed Changes
- Add documentation files under docs/tasks or docs/ops if needed for the audit output
- Add read-only scripts that inspect schema and table metadata
- Add or improve audit scripts that read Supabase schema safely
- Add structured JSON/MD artifacts summarizing findings
- Read existing repository files related to Supabase usage, recommendation flow, admin import flow, and room-analysis flow

# Disallowed Changes
- Do not change production business logic
- Do not change recommendation scoring behavior
- Do not create, alter, or drop Supabase tables in this batch
- Do not migrate data
- Do not rename application tables
- Do not introduce new product features
- Do not write any destructive SQL
- Do not assume intended architecture without evidence from either live schema or current repository usage

# Critical Safety Rule
This batch is read-only with respect to Supabase. No schema mutation, no data mutation, no cleanup, no migration, no destructive command.

# Working Principles
- Treat the live Supabase schema as the source of truth for this audit
- Treat repository code paths as the source of truth for actual application usage
- Explicitly mark any schema drift between live DB and repository code
- Separate "currently used in code" from "intended future role"
- Separate "staging/import/admin tables" from "customer-facing runtime tables"
- Prefer concrete evidence over interpretation
- If a relation or constraint is not directly verifiable, mark it as inferred, not confirmed

# Required Behavior / Structure
The audit result must include:

## 1. Current Position Summary
A short Korean summary of:
- where the project is now
- why this batch is the next correct step
- what risk this batch is reducing

## 2. Live Table Inventory
For each relevant table found in live Supabase, provide:
- table name
- plain-language role
- whether it is written by current code
- whether it is read by current code
- whether it appears staging/admin/internal/runtime/analytics
- main risk or issue

## 3. Column-Level Analysis
For each relevant table, list columns with:
- column name
- type
- nullable/default if available
- practical meaning in the current system
- whether the column is actively used by current code
- whether the column appears redundant, weakly defined, or suspicious

## 4. Flow Mapping
Document the actual current flows:
- furniture data analysis -> staging/import save
- admin review -> production product save (if present, if absent mark missing)
- furniture vector/recommendation path
- room image analysis -> room analysis save
- recommendation result/event logging path

## 5. Drift / Overlap Analysis
Explicitly call out:
- duplicate tables with overlapping responsibility
- live columns not used by code
- code-referenced columns missing from live DB
- tables that still power runtime despite newer intended architecture
- missing approval/promotion path from staging to production

## 6. Decision Candidate Classification
Classify each relevant table into one of:
- KEEP
- KEEP WITH MODIFICATION
- MERGE CANDIDATE
- DELETE CANDIDATE
- HOLD / NEEDS DECISION

Do not make vague statements. For each classification, provide:
- why
- what blocks immediate action
- what must be verified next

## 7. Recommended Next-Step Order
Provide a strict priority order for the next batch:
1. what to verify/fix first
2. what to redesign second
3. what to migrate later

## 8. Required Result Format
Return results in this order:
1. Current position summary
2. Approval judgment for this audit batch (ready / partial / blocked)
3. Table-by-table analysis
4. Drift and overlap findings
5. Classification table
6. Next priority actions
7. Exact list of files/scripts/artifacts created or updated

# Completion Criteria
This batch is complete only if:
- The live Supabase schema was actually inspected
- The findings are based on both live DB structure and current repository usage
- Every relevant live table used by current app flows is documented
- Duplicate responsibilities are clearly identified
- A decision-ready keep/modify/merge/delete candidate split is produced
- Any schema drift is explicitly documented
- No write/destructive DB operation is performed

# Validation
- Run lint/typecheck if any repository code/script was added or changed
- Validate that any audit script is read-only
- Validate that no SQL mutation path exists in the batch
- Confirm the report references real live tables, not only repository assumptions

# Required Result Format
Your final response must include:
- What you inspected
- What the live schema says
- Where code and DB disagree
- Which tables should likely remain, change, merge, or be removed later
- What should be done next, in order