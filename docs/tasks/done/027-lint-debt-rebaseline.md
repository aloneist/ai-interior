# Goal
Re-baseline the remaining lint debt in the AI-INTERIOR main repository and identify the next highest-value cleanup batch.

# Scope
This task is for inspection, classification, and planning only.

Primary target:
- repository-wide lint output

Optional supporting reads:
- files reported by current lint output
- current CI-related scripts if needed only for command confirmation

# Primary Objective
Produce a grounded, current lint-debt map based on actual repository reality, then propose the next narrow cleanup batch.

# Allowed Changes
- docs/tasks/027-lint-debt-rebaseline.md only if needed
- no source code changes required for this task unless absolutely necessary to make lint output readable, which should normally be avoided

# Disallowed Changes
- No product logic changes
- No parser/API/admin/UI cleanup in this task
- No CI changes
- No refactors
- No speculative fixes

# Critical Safety Rule
Do not fix code in this task. This task is to inspect, group, and prioritize actual remaining lint debt only.

# Working Principles
- Use actual current lint output
- Group issues by file cluster and issue type
- Prefer next batch candidates that are narrow, safe, and high ROI
- Avoid broad or mixed-scope batch definitions

# Required Behavior / Structure
1. Run repository lint
2. Collect actual remaining issues
3. Group them by file area and issue type
4. Recommend the single best next batch
5. Keep the result short and practical

# Completion Criteria
Complete only when:
- current lint debt is mapped from actual repository output
- issues are grouped into practical cleanup batches
- one next batch is clearly recommended
- no code behavior was changed

# Validation
Use:
- npm run lint

# Required Result Format
Return:
1. Total remaining lint issues
2. Grouped issue map by area
3. Best next batch recommendation
4. Why that batch should go next
5. Any blockers