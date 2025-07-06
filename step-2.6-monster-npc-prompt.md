
# Step 2.6 – Monster & NPC Systems Implementation Prompt (Aeturnis Online)

**For: Claude.ai (Planner) → Replit Agent AI (Engineer)  
Phase 2, Step 2.6 | Project: Aeturnis Online**

---

## Overview

Design and scaffold the Monster & NPC systems for Aeturnis Online, following API-first and contract-driven methodology. Deliver API definitions, schema migrations, models, and sample tests. Use TypeScript, PostgreSQL, and Redis patterns per project conventions.  
Do **not** fully implement business logic beyond scaffolding and critical flows.

---

## Monster AI Framework

### 1. Behavior States
- Support these AI states: `idle`, `patrol`, `combat`, `flee`
- Use an extensible enum/type and state machine approach.
- Document (in code) how transitions are triggered.

### 2. Aggro & Targeting
- Add `aggro_radius` and `target_selection_logic` to the monster schema.
- Scaffold core targeting logic (stub, e.g. nearest player).

### 3. Spawn System
- Schema for `spawn_points`: (zone_id, position, monster_type, respawn_timer)
- Scaffold respawn timer logic (Redis locks for HA).

### 4. Patrol Routes
- Schema for `patrol_routes`: (route_id, waypoints, zone_id, monster_id)
- API to fetch/assign patrols to monsters.

---

## NPC System

### 1. NPC Database Schema
- Migration for `npcs`: id, name, type, zone_id, position, dialogue_ref, quest_giver_flag, metadata.
- Add `npc_interactions` table to log interactions.

### 2. Dialogue System Foundation
- Scaffold dialogue engine:
  - Dialogue trees (JSON, ref by dialogue_ref)
  - Choice/branching (stub/sample)
  - Dialogue variables (player name, quest state)

### 3. Interaction Handlers
- Endpoints:
  - `POST /api/npcs/:id/interact` – start interaction
  - `GET/POST /api/npcs/:id/dialogue` – advance dialogue
- Provide request/response contracts and sample tests.

### 4. Quest Giver Flagging
- Boolean `quest_giver` field.
- Endpoint to fetch all quest givers in a zone.

---

## General Requirements

- Use naming conventions: `snake_case` (SQL), `PascalCase` (types), `camelCase` (APIs)
- Timestamps: `created_at`, `updated_at`
- Parameterize all queries; never direct SQL interpolation.
- For every endpoint/model: add OpenAPI snippet or TS interface.
- Add Jest test stubs per service/endpoint.
- All stubs must include `TODO` with next steps.

---

## Acceptance Criteria

- Run self-audit with project CI/test commands.
- All migrations are reversible and safe.
- Deliver deployable, testable scaffolds (not just pseudocode).
- Output only new/changed files (with paths).
- Summarize all API contracts and DB changes at end.

---

**If anything is missing/ambiguous, start with clarifying questions before proceeding.**

---

**Begin Step 2.6 – Monster & NPC Systems.**
