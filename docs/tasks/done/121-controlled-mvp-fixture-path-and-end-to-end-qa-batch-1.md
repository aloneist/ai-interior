# Goal
Create a controlled, low-noise QA path for the full `/api/mvp` flow so the project can validate ranking, explanation, and response contract end-to-end without depending on unstable image-analysis variance or leaving unnecessary QA-side database noise.

# Scope
This batch is limited to:
- Designing and implementing a controlled fixture-based QA path for `/api/mvp`
- Reducing or isolating side effects during QA execution where practical
- Making end-to-end recommendation + explanation review repeatable
- Preserving the current production runtime path while adding a controlled QA mode or harness
- Producing reusable QA artifacts and documentation for future recommendation iterations

# Primary Objective
Enable repeatable end-to-end QA of the MVP recommendation route with stable inputs and predictable outputs, without redesigning the runtime architecture.

# Allowed Changes
- Add a controlled fixture path, QA mode, or harness for `/api/mvp`
- Add fixture files for room-analysis inputs and expected QA conditions
- Add or refine QA scripts that execute the controlled end-to-end flow
- Add narrow runtime-safe flags or test-only branching if clearly isolated and documented
- Add docs/ops artifacts describing the controlled QA path and how to use it
- Add response validation helpers for end-to-end QA if needed

# Disallowed Changes
- Do not redesign the core recommendation architecture
- Do not add unrelated product features
- Do not reintroduce legacy data paths
- Do not add heavy testing infrastructure the project cannot realistically maintain
- Do not weaken production behavior just to make QA easier
- Do not mix large ranking changes into this batch

# Critical Safety Rule
The controlled QA path must not silently alter the production path for normal users. Any QA-only behavior must be explicit, documented, and safe to isolate.

# Working Principles
- QA should validate the real MVP business path, not only isolated subparts
- Controlled fixtures are more valuable than noisy live runs
- Side effects should be minimized or clearly isolated during QA
- The QA path must be sustainable for repeated use
- Preserve production runtime correctness while improving observability and repeatability

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what recommendation and explanation behavior is already stable
- why full `/api/mvp` controlled QA is the next correct step
- what risk this batch reduces

## 2. Controlled QA Strategy
Define and implement a repeatable strategy for the full `/api/mvp` path, covering:
- fixture input source
- whether image-analysis is mocked, bypassed, or controlled
- how ranking and explanation are still exercised realistically
- how DB write noise is reduced, isolated, or made acceptable
- why this strategy is repeatable enough for QA

## 3. Fixture Design
Provide stable fixture cases that are sufficient for MVP end-to-end review, including:
- one normal pass case
- one constrained case (category/budget/style/room mix)
- one weak-result case
- any minimal expected conditions that can be asserted safely

## 4. End-to-End QA Runner
Add a reusable QA runner that:
- executes the controlled `/api/mvp` flow
- records response summaries
- validates key response structure and signals
- surfaces pass / weak / fail judgments
- is practical to rerun in future batches

## 5. Response / Contract Validation
Validate at least:
- recommendation response shape
- grouped recommendation presence if applicable
- ranking context presence
- explanation presence or safe fallback
- weak-result signaling
- no contradiction between explanation and ranking context in the controlled path

## 6. Side-Effect Policy
Document clearly:
- what the QA path writes, if anything
- how those writes are limited, tagged, or isolated
- what cleanup expectation exists, if any

## 7. Decision Output
Classify the result after this batch:
- CONTROLLED MVP QA PATH READY
- IMPROVED BUT NEEDS ONE MORE QA HARNESS BATCH
- NOT READY

And explain why.

## 8. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Controlled QA strategy
4. Fixture summary
5. End-to-end QA findings
6. Side-effect policy summary
7. Readiness judgment
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- a repeatable controlled QA path for `/api/mvp` exists
- stable fixtures exist
- end-to-end QA was actually executed
- side effects are documented and acceptably controlled
- the result is reusable for future recommendation-quality iterations

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- run the new controlled `/api/mvp` QA flow
- verify fixtures and reports are readable and reusable

# Required Result Format
Your final response must include:
- how the controlled `/api/mvp` QA path works
- what it validates
- whether it is safe and repeatable enough for ongoing MVP QA
- what should be the next recommendation-quality batch after this one