# Goal
Review the current recommendation QA baseline and recent rerun results, then identify the single highest-value recommendation quality gap to address next.

# Scope
This task is analysis and planning only.

Primary materials:
- docs/qa/*
- data/qa/*
- any existing recommendation baseline / rerun result files already present in the main repository

# Primary Objective
Determine the most important currently unresolved recommendation-quality weakness based on actual QA artifacts, then recommend one narrow next improvement task.

# Allowed Changes
- docs/tasks/028-recommendation-qa-gap-review.md only if needed for tracking
- no product code changes in this task
- no schema changes in this task
- no CI changes in this task

# Disallowed Changes
- No implementation work
- No speculative code fixes
- No broad product redesign
- No lint/CI cleanup
- No unrelated refactors

# Critical Safety Rule
Do not change code. Use existing QA artifacts only and recommend one next improvement target grounded in actual evidence.

# Working Principles
- Use actual QA baseline and rerun artifacts
- Focus on unresolved gaps, not already-improved areas
- Recommend only one next task
- Keep the result short and practical

# Required Behavior / Structure
1. Read current QA baseline and rerun artifacts
2. Identify what improved
3. Identify what still remains weak
4. Recommend the single best next recommendation-quality task
5. Explain why it should go next

# Completion Criteria
Complete only when:
- current QA artifacts were reviewed
- resolved vs unresolved gaps were clearly separated
- one next task was recommended
- no code behavior was changed

# Validation
Use repository QA artifacts only.

# Required Result Format
Return:
1. QA artifacts reviewed
2. What improved
3. What still remains weak
4. Best next task recommendation
5. Why it should go next