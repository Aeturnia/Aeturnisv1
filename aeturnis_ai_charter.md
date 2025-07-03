# 🧠 Aeturnis Online – AI Team Charter

## 🎯 Purpose
This charter defines the roles, responsibilities, communication rules, and integration standards for the AI agents collaborating to build *Aeturnis Online*, a mobile-first, text-based MMORPG. It ensures equitable, modular, and structured contributions from each AI.

---

## 👤 Human Role: Creative Director & Orchestrator
- Oversees high-level vision, priorities, and game integrity
- Decides feature prioritization and prompts Claude as needed
- Reviews outputs, identifies needed adjustments, and coordinates AI task flow

---

## 🤖 AI Roles & Responsibilities

### 🟨 Claude.ai — "The Planner"
- **Primary Role:** Strategic Design & Prompt Generation
- **Strengths:** Structured writing, high-level reasoning, large context awareness
- **Responsibilities:**
  - Generates detailed implementation prompts for Replit Agent
  - Writes game system overviews, balance matrices, design lore, etc.
  - Documents feature specs, flowcharts, and progression models

### 🟩 Replit Agent AI — "The Engineer"
- **Primary Role:** Code Generation and Runtime Execution
- **Strengths:** Real-time coding, build/test/deploy cycles
- **Responsibilities:**
  - Executes Claude’s prompts to generate working code
  - Creates full project architecture, server files, database migrations, etc.
  - Runs in Replit with build/test/debug feedback

### 🟦 ChatGPT — "The Architect / Integrator"
- **Primary Role:** QA Lead, Code Integrator, Prompt Strategist
- **Strengths:** Code review, architectural integrity, prompt editing
- **Responsibilities:**
  - Validates Claude’s prompts and sequences
  - Audits Replit Agent’s output against GDD and security best practices
  - Refactors, patches, or expands Agent code if needed
  - Maintains prompt history, glossary, and integration consistency

---

## 🔁 Collaboration & Communication Rules

### 🔄 Prompt Cycle
1. Claude generates a detailed feature prompt → sent to Replit Agent
2. Replit Agent executes and logs an implementation report
3. ChatGPT reviews output, logs quality, suggests patches
4. If needed, Claude or ChatGPT amends prompt → reattempt

### 🧩 Inter-AI Handoff Standards
- Shared naming conventions (`snake_case`, `PascalCase`, `camelCase` based on context)
- Adhere to database schema definitions from prompt or glossary
- Follow modular structure as per `aeturnis-detailed-agent-guide.md`
- Always include test cases, even if mocked or partial

---

## 📚 Shared Artifacts
| Asset | Description |
|-------|-------------|
| `aeturnis-mobile-design-doc.md` | Full game design, architecture, and gameplay systems |
| `aeturnis-detailed-agent-guide.md` | Phase-based prompt plan for Replit Agent |
| `prompt-tracker.md` | Rolling log of AI prompt and response chain |
| `aeturnis-glossary.md` (TBD) | Shared game-specific term definitions |
| `feature-index.md` (TBD) | System implementation and readiness tracker |

---

## 🔐 Quality + Security Commitments
- Replit Agent code must:
  - Use parameterized queries
  - Implement auth/validation consistently
  - Log errors securely (no sensitive stack traces in prod)
  - Support full test coverage or graceful stubs

- Claude prompts must:
  - Include validation rules, fallback cases, and business logic
  - Include token/session lifecycle if applicable

- ChatGPT will:
  - Intercept misalignments across features
  - Catch unscalable patterns early
  - Prevent redundant or circular dependencies

---

## ✅ Success Criteria
- Prompts and outputs are traceable, modular, testable
- Game systems interoperate cleanly via defined interfaces
- Each AI agent works within its role without unnecessary duplication
- Feature development is aligned with player experience and mobile-first usability

---

## 📅 Charter Revision Policy
This charter may be updated by the Creative Director at any time or on recommendation by any AI agent.

