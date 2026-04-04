# Goal
Improve bedroom recommendation relevance for bedroom-intent requests without changing the overall recommendation system scope.

# Scope
This task is limited to the recommendation logic paths that determine candidate/category priority for bedroom-oriented requests.

Primary focus:
- bedroom-intent detection
- bedroom-category weighting / targeting
- top-result category alignment for bedroom requests

Target outcome:
- bedroom requests should more reliably surface bedroom-relevant categories such as:
  - bed
  - nightstand
  - dresser
  - bedroom storage

# Primary Objective
Fix the unresolved bedroom relevance gap identified in recommendation QA by making bedroom requests produce bedroom-aligned top candidates and top results.

# Allowed Changes
- Narrow recommendation logic changes related to bedroom intent
- Small category-priority or weighting adjustments
- Small supporting constant / mapping updates
- Narrow prompt / selection logic updates only if directly required
- Small local helper additions if needed

# Disallowed Changes
- No broad recommendation-system rewrite
- No DB/schema redesign
- No CI/lint work
- No unrelated category tuning outside bedroom relevance
- No UI changes
- No broad style-semantics rewrite
- No room-composition overhaul in this task

# Critical Safety Rule
Keep the change narrow. Do not attempt a general recommendation overhaul. Fix bedroom targeting only.

# Working Principles
- Use the QA evidence as the reason for change
- Prefer the smallest high-ROI fix
- Improve category targeting before broader semantic redesign
- Preserve current behavior for non-bedroom cases as much as possible
- Keep the diff reviewable

# Required Behavior / Structure
For bedroom-intent requests:
1. detect bedroom intent more reliably if needed
2. prioritize bedroom-relevant categories in candidate selection and/or ranking
3. make top results less likely to be dominated by unrelated living-room categories
4. preserve existing behavior for non-bedroom flows as much as possible

# Completion Criteria
Complete only when:
- bedroom-related recommendation logic is updated narrowly
- the change is clearly tied to bedroom QA failure
- non-bedroom behavior is not broadly disturbed
- diff remains reviewable
- validation and QA rerun guidance are provided

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- existing recommendation QA rerun flow if available
- direct spot-check of the bedroom QA case if available

# Required Result Format
Return:
1. Files changed
2. What bedroom-targeting changes were made
3. Validation commands run
4. Any risks or follow-up notes
5. Final diff summary