# Codex Task Catalog

## Purpose
This document defines which kinds of tasks are appropriate for Codex in this repository, which require explicit human review, and which should not be delegated to Codex.

The goal is not to maximize automation coverage.
The goal is to use Codex where it improves speed and reduces fatigue **without increasing product risk**.

## Decision Principle
When deciding whether Codex should handle a task, use this priority order:

1. product behavior safety
2. recommendation quality safety
3. operational data safety
4. QA and regression safety
5. speed and convenience

If speed conflicts with the first four, speed loses.

---

## Category A — Safe to Delegate to Codex
These are usually good Codex tasks when scope is narrow and validation is required.

### A1. Safe lint cleanup
Examples:
- `any` to specific type
- `any` to `unknown` with narrowing
- `catch (err: any)` to `catch (err: unknown)`
- safe `prefer-const`
- removing truly unused variables
- narrow lint suppressions when the structural fix would risk behavior

Conditions:
- exact file scope must be defined
- no behavior-sensitive rewrites
- validation must be included

### A2. Narrow type-correctness fixes
Examples:
- local TypeScript build error fixes
- local relation-shape typing fixes
- nullable guard additions
- local interface/type alias corrections

Conditions:
- fix must stay local
- no logic changes
- no response shape changes
- no parser behavior changes

### A3. Small UI fixes with explicit boundaries
Examples:
- spacing or text changes in one component
- replacing a hardcoded label
- styling fixes in a single component
- low-risk visual polish with exact scope

Conditions:
- no flow changes
- no state timing changes
- no prop contract changes
- human review required before merge

### A4. Narrow API cleanup
Examples:
- local request typing cleanup
- local response typing cleanup without schema change
- small safe internal alias types
- error handling cleanup that preserves behavior

Conditions:
- no scoring/filtering/ranking changes
- no request semantics changes
- no DB meaning changes

### A5. Small parser-safe cleanup
Examples:
- local parser typing
- unused local helper removal
- safe `prefer-const`
- safe narrowing in helper utilities

Conditions:
- no extraction rule changes
- no normalization changes
- no category logic changes
- no output meaning changes

---

## Category B — Codex Can Help, but Human Review Must Be Stricter
These tasks are allowed only with tighter review and explicit caution.

### B1. UI state-flow-adjacent cleanup
Examples:
- moving derived state out of effects
- lazy initializer changes
- memoization-based cleanup
- effect dependency cleanup

Why this is riskier:
- can change render timing
- can change hydration behavior
- can change interaction timing

Rule:
- only allow when the task explicitly permits it
- must be reviewed more carefully than normal lint cleanup

### B2. Recommendation explanation parsing
Examples:
- explanation JSON parsing cleanup
- local reason-map safety changes
- defensive guards around explanation content

Why this is riskier:
- may affect displayed explanation text
- may change how malformed outputs are treated

Rule:
- allow only with narrow scope and explicit safety framing
- must clearly report behavior-adjacent effects

### B3. Build-stability fixes with visual tradeoffs
Examples:
- font configuration changes
- environment-safe fallback setup
- small CSS compensation for build-safe alternatives

Why this is riskier:
- may affect visual consistency
- may affect branding details

Rule:
- reliability may justify the change
- tradeoffs must be reported clearly

### B4. Local dead-code removal in behavior-sensitive areas
Examples:
- removing helpers in parser/recommendation files
- cleaning up unused branches in API logic
- deleting old local utilities in stateful components

Why this is riskier:
- “unused” can be misread
- hidden coupling may exist

Rule:
- remove only when clearly dead
- if uncertain, leave it

---

## Category C — Do Not Delegate Blindly; Human-Led Design First
Codex can assist after the design is already fixed, but should not be used as the decision-maker.

### C1. Recommendation logic changes
Examples:
- scoring changes
- ranking formula changes
- candidate filtering changes
- recommendation weighting changes

Rule:
- human defines the logic first
- Codex may implement only after constraints are explicit

### C2. Parser behavior changes
Examples:
- extraction rule changes
- normalization rule changes
- category reclassification logic
- parser output schema changes

Rule:
- human must define expected behavior and QA criteria first
- Codex should not invent parser logic changes

### C3. State architecture changes
Examples:
- component state redesign
- context/store changes
- cross-component state ownership changes
- hydration strategy changes

Rule:
- human must design the architecture first
- Codex may help implement in narrow batches only

### C4. API contract changes
Examples:
- request schema changes
- response schema changes
- endpoint semantics changes
- auth behavior changes

Rule:
- human decision first
- Codex implementation second

### C5. Database structure changes
Examples:
- migration logic
- table/schema redesign
- relation redesign
- data-shape meaning changes

Rule:
- human-led only
- Codex may assist with narrowly defined implementation later

---

## Category D — Do Not Delegate to Codex
These tasks should not be handed to Codex as normal execution tasks.

### D1. Broad refactors with unclear boundaries
Examples:
- “clean up this whole module”
- “make this architecture better”
- “simplify everything in this folder”

Reason:
- scope expands too easily
- behavior risk becomes hard to control

### D2. Production-risk operations without explicit approval
Examples:
- destructive DB actions
- large-scale content replacement
- deleting many assets
- changing operational configuration blindly

Reason:
- operational blast radius is too high

### D3. Tasks with stale or unverified repository assumptions
Examples:
- changing code based on an outdated repo view
- designing around files that may no longer match reality

Reason:
- wrong assumptions create bad automation decisions

### D4. Silent behavior rewrites disguised as cleanup
Examples:
- changing fallback semantics while “typing”
- changing parser inclusion rules while “fixing lint”
- changing UI flow while “improving state”

Reason:
- this breaks trust in the automation workflow

---

## Required Conditions for Any Codex Task
Every Codex task must include:

- exact file scope
- exact goal
- explicit allowed changes
- explicit disallowed changes
- critical safety rule
- validation steps
- required result format

If any of these are missing, the task is underspecified.

---

## Validation Standard by Task Type

### Lint / type cleanup
Minimum:
- targeted lint
- repo-wide lint if practical

### Build unblock
Minimum:
- `npm run build`

### UI task
Minimum:
- targeted lint
- build if practical
- human visual review before approval

### API task
Minimum:
- targeted lint/build
- human review of schema/behavior safety

### Parser task
Minimum:
- targeted lint/build
- human review of behavior sensitivity

---

## Approval Expectation by Category

### Category A
Usually fast review, then approve if scoped and safe.

### Category B
Review carefully.
Approval is possible, but only after checking behavior-adjacent risk.

### Category C
Human defines first.
Codex executes second.

### Category D
Do not delegate as a normal Codex task.

---

## Default Recommendation
When uncertain, downgrade the task to a safer category.

Examples:
- from A to B if behavior-adjacent
- from B to C if design judgment is required
- from C to D if scope is unclear or risk is too high

Conservative classification is preferred.

---

## Practical Use
Before creating a task file, classify the task first:

- Is this A, B, C, or D?
- What is the exact risk boundary?
- What validation is required?
- Is the repository state verified enough for this task?

If these answers are not clear, do not start the task yet.

---

## Final Rule
Codex should handle the work that is repetitive, narrow, and reviewable.

Humans should keep control over:
- product behavior
- recommendation quality
- parser meaning
- data meaning
- operational risk