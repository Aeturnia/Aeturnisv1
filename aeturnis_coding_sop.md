# Aeturnis Online – Coding SOP (Standard Operating Procedure)

**Version:** 1.0\
**Status:** Production-Enforced\
**Last Updated:** 2025-07-07

---

## 🚩 Purpose

This document establishes the **golden rules** for writing, reviewing, and merging code in the Aeturnis Online MMORPG project, with enforcement across Claude, Replit Agent, and ChatGPT integrations.

---

## 1. API-First, Contract-Driven Development

- **Every new feature starts with an API contract or prompt.**
  - Define request/response schemas, endpoint signatures, or service interfaces before implementation.
  - Use mock or stub dependencies when backend complexity is not ready.
  - All code must be traceable to a prompt or contract in `prompt-tracker.md`.
- **No implementation without an API/prompt.**

---

## 2. Quality Gates (No Exceptions)

- **TypeScript strictness:**
  - `strict`, `noImplicitAny`, `exactOptionalPropertyTypes` enabled at all times.
- **ESLint:**
  - Airbnb TS + Prettier config, auto-formatted before every commit.
- **Tests:**
  - Jest + ts-jest, ≥80% global coverage (no drop allowed).
- **CI/CD:**
  - Every push and PR must pass:
    ```bash
    npm run lint:ts && npm test --coverage
    ```
- **No **``** allowed** in any production or main branch file.
- **Any failure in CI, lint, or coverage:**
  - Implementation is halted and must be fixed via patch prompt in a new branch before proceeding.

---

## 3. Micro-Prompt Cycle & Self-Audit

- **Prompts must target micro-features** (one file, one concern) and always include an accompanying test file.
- **Self-Audit Footer Required** in every Replit Agent output:
  ````markdown
  ---
  ### 🔐 Self‑Audit Commands
  ```bash
  npm run lint:ts --max-warnings=0
  npm test --coverage
  ````
  Paste: TS errors / Coverage %
  ```
  ```
- **Manual review** at the end of each phase: human/AI reviews for technical debt (`any`, `@ts-ignore`), unscalable patterns, and architectural drift.

---

## 4. Branch & Merge Discipline

- **Branch naming:**
  - `main`: Always green & deployable
  - `feat/<feature>`: Micro-features (≤150 LOC)
  - `fix/<slug>`: Bug fixes/patches
  - `phase/<n>-snapshot`: Tagged at end of each phase
- **Merge only if:**
  - CI is green
  - Coverage is ≥80%
  - No `@ts-ignore`
  - Touches ≤3 files (except boilerplate or migrations)
- **Any TypeScript error in **``** triggers auto-revert to last phase snapshot.**

---

## 5. Automated & Manual Auditing

- **Self-audit**: Each implementation step includes an automated self-audit (output in report).
- **Weekly regression check**: Automated cron runs `lint` and `test`, comments on regressions.
- **Human review**: At end of every phase, scan for hidden debt and pattern violations.

---

## 6. Security & Data Handling

- **Always use parameterized queries** (never raw SQL strings).
- **Sanitize/validate all input** for every endpoint, service, and controller.
- **Auth/validation middleware must wrap all API endpoints**—never bypass.
- **Never leak stack traces or secrets** in production logs or API responses.
- **Session/caching:** Redis integration must use secure key patterns.

---

## 7. Scaffolding and Naming

- **Use Plop generators** for new services/controllers to enforce path and naming consistency:
  ```bash
  npx plop service --name FooService
  npx plop controller --name FooController
  ```
- **Adhere to naming conventions:**
  - `snake_case` for DB, `camelCase` for TypeScript, `PascalCase` for types/classes.

---

## 8. Service/Controller/Repository Pattern

- **Service layer:** Business logic only.
- **Controllers:** Only handle HTTP request/response, never business logic.
- **Repositories:** All database access; no direct SQL in services or controllers.
- **No business logic in controllers or routes.**

---

## 9. Documentation & Logging

- **Every step/prompt/code artifact is logged in **``**.**
- **All API routes and methods must be documented with JSDoc, OpenAPI, or Markdown.**
- **Structured logging:** All errors and warnings logged with context, never plain `console.log` in production.

---

## 10. Production Readiness

- **No feature is “done” without:**
  - Passing tests
  - Lint and coverage green
  - Audit/review complete
  - Self-audit output attached
- **Implementation report must include:**
  - Production readiness score
  - Any technical debt or pending improvements

---

## 11. Contribution Policy

- **Never bypass SOP, even for “minor” changes.**
- If the process seems slow or repetitive, document for review, but **never skip a gate**.
- If a prompt or code fails any gate, it is rejected and must be fixed by patch prompt and new review.

---

## References

- [AI Team Charter](aeturnis_ai_charter.md)
- [Implementation Loop Guidelines](implementation_loop_guidelines.md)
- [Detailed Agent Guide](aeturnis-detailed-agent-guide.md)
- [Prompt Tracker](prompt_tracker.md)
- [All Implementation Reports]\(/Implementation Reports)
- [Mobile Design Doc](aeturnis-mobile-design-doc.md)

---

*These SOP rules are enforced across all AI and human contributions. Violations may result in auto-revert, block, or re-prompt. When in doubt, ask for an audit or open a patch prompt.*

---

