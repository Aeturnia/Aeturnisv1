# 📚 Aeturnis Project Glossary

A shared terminology resource for all AI agents, prompts, and systems within the Aeturnis Online MMORPG project.

---

## 🔧 System Terms

| Term | Definition |
|------|------------|
| **POAD** | Prompt-Orchestrated AI Development — a development method using structured prompts to guide multiple AI agents in building software systems. |
| **Agent Context** | A shared memory object (`agent-context.json`) used to store cross-agent system state and API contracts. |
| **SOP** | Standard Operating Procedure — a structured format for generating and executing prompts across agents. |
| **Prompt Tracker** | `prompt-tracker.md`, the log of all prompt exchanges and outcomes for versioning and traceability. |
| **Audit Footer** | A markdown block added to Replit Agent outputs with test coverage and lint results. |
| **Microagent** | A Claude or ChatGPT-spawned sub-agent that performs focused subtasks (e.g., LootBalancerAgent). |

---

## ⚙️ Game System Terms

| Term | Definition |
|------|------------|
| **Zone** | A defined in-game area (e.g., `tutorial_area`) with coordinate boundaries used for movement and spawning. |
| **MovementService** | A backend service responsible for validating player movement across zones and coordinates. |
| **Combat Engine** | The game system managing turn-based combat sessions, actions, and resource usage. |
| **Stat Scaling** | A system that determines how character stats grow with level, XP, or item boosts. |
| **Respawn Point** | A designated location in a zone where characters are revived after death. |
| **Monster AI** | Logic controlling monster behavior, such as patrols, aggro radius, and fleeing. |
| **Loot Table** | A schema defining item drop chances and conditions for monsters or chests. |

---

## 🧠 AI Role Definitions

| Agent | Role |
|-------|------|
| **Claude** | "Planner" — generates SOP-based prompts, feature specifications, and API designs. |
| **Replit Agent** | "Engineer" — implements Claude’s prompts in code, validates outputs, and runs audits. |
| **ChatGPT** | "Architect / Critic" — reviews output, compares to specs, detects bugs or misalignment, proposes patches. |

---

## 📈 Progression & Resource Terms

| Term | Definition |
|------|------------|
| **XP (Experience Points)** | Gained from actions like combat; used to level up characters. |
| **Stat Points** | Points awarded at level-up for manual stat allocation (e.g. Strength, Dexterity). |
| **HP / MP / Stamina** | Health, Mana, and Energy resource pools for actions, spells, or abilities. |
| **Level Threshold** | The XP amount required to reach a specific level. |
| **Paragon Points** | Post-max-level stat scaling mechanic used in infinite progression. |

---

## 🧪 Testing & Validation Terms

| Term | Definition |
|------|------------|
| **Test-First Prompting** | A practice of defining test cases before code implementation in the prompt itself. |
| **Prompt Diffing** | A method to compare two prompt versions to detect API or logic regressions. |
| **Self-Audit** | The Agent’s act of running tests/lint and logging the results in a footer. |
| **Prompt Dependency Graph** | A Mermaid.js graph visualizing which features depend on others. |