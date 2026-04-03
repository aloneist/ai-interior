# Automation System Intent

## Purpose
This document explains why the automation system exists in `AI-INTERIOR`, what each layer is responsible for, and what the current build stage is trying to achieve.

This is not a team onboarding document.
This is a future-context document for later sessions and later development work.

## Core Goal
The automation system exists to make `AI-INTERIOR` development:

- faster
- less tiring
- more repeatable
- safer to review

The goal is not full autonomy.
The goal is controlled execution.

## Current Priority
The project priority remains:

1. recommendation quality
2. operational data structure
3. QA and regression safety

Automation must support those priorities.
Automation is not the product.

## Repository Principle
The main working repository is `AI-INTERIOR`.

This repository contains:
- the actual product code
- Codex operating rules
- task instructions
- QA baseline assets
- review workflow assets

The automation system is being built inside the main product repository because the immediate goal is to improve real development flow on the real product.

## Role Boundaries
The automation system is split by responsibility.

### Codex
Codex is responsible for:
- code generation
- code edits
- narrow scoped implementation tasks

Codex is not the approval authority.
Codex is not the orchestration layer.
Codex is not the policy owner.

### MCP / Actions
MCP or Actions are responsible for:
- external tool access
- service integration
- controlled read/write operations

Examples:
- Supabase
- Cloudinary
- future external tools

This layer exists so external services can be connected later without making Codex itself the unsafe direct holder of every privileged workflow.

### n8n
n8n is responsible for:
- approval routing
- notifications
- scheduling
- execution handoff

n8n is not the code-writing engine.
n8n is not the product logic layer.

### CI
CI is responsible for:
- lint
- build
- type checks
- QA validation hooks later

CI is the minimum automated quality gate.

## Execution Flow
The intended execution flow is:

1. user gives the task
2. ChatGPT defines the change plan
3. Codex executes the code work
4. automated checks run
5. ChatGPT reviews the result
6. user gives final approval

This flow is the core automation loop.

## Why Extensibility Matters
The system should allow more tools later.

The point is not to automate “adding new programs.”
The point is to avoid rebuilding the automation structure every time a new service is introduced.

That means the structure should stay open to:
- new data tools
- new asset tools
- new approval or notification tools
- new QA or deployment integrations

## What This Stage Is Not
This stage is not:
- full external tool integration
- full admin gateway implementation
- final database architecture design
- final orchestration automation
- replacing human judgment

It is the stage where the automation skeleton is made practical and stable.

## Current Scope
At this stage, the system focuses on:

- Codex operating rules
- task instructions
- QA baseline creation and reruns
- review rules
- CI preparation
- future tool-connection readiness

## Design Rule
If a structure choice improves long-term flexibility but adds too much current complexity, do not overbuild it.

Prefer:
- small
- usable
- easy to extend later

## Human Control
Human judgment still owns:
- scope
- risk tolerance
- approval
- merge decisions
- product direction

Automation reduces repetitive work.
It does not replace product judgment.

## Final Reminder
The automation system exists to support real product development in `AI-INTERIOR`.

It should remain:
- practical
- bounded
- extensible
- reviewable