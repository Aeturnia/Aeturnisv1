
# 🔁 Aeturnis Implementation Loop – Strict Guidelines

*Last updated:* 2025-06-30

These rules govern every contribution made via Claude → Replit Agent prompts to maintain a healthy, deployable codebase.

---

## 1. Branch & Tag Discipline
| Branch | Purpose |
|--------|---------|
| `main` | Always green & deployable |
| `feat/<slug>` | Single micro‑feature (≤150 LOC) |
| `fix/<slug>` | Patch failing audits |
| `phase/<n>-snapshot` | Tag at end of each phase |

---

## 2. Quality Gates
* **TypeScript:** `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`
* **ESLint:** Airbnb TS + Prettier (auto‑format pre‑commit)
* **Tests:** Jest + ts‑jest, global coverage **≥80 %**
* **CI command:** `npm run lint:ts && npm test --coverage`

---

## 3. Prompt Lifecycle
1. **Micro‑Prompt** (one file + test)  
2. **Self‑Audit Footer** (Agent runs lint & tests, pastes numbers)  
3. **CI** must stay green  
4. **Patch Prompt** if CI red

**Self‑Audit Footer template**

```md
---

### 🔐 Self‑Audit Commands
```bash
npm run lint:ts --max-warnings=0
npm test --coverage
```
Paste: TS errors / Coverage %
```

---

## 4. Scaffolding with Plop
Use generators to avoid path mistakes:

```bash
npx plop service --name FooService
npx plop controller --name FooController
```

---

## 5. Merge Checklist
- CI 💚  
- Coverage ≥80 %  
- No `@ts-ignore`  
- Touches ≤3 files (unless boilerplate)

---

## 6. Failure Handling
| Issue | Action |
|-------|--------|
| CI fails | Send Patch Prompt to `fix/<slug>` |
| Coverage drop | Add tests in same PR |
| TS errors on `main` | Auto‑revert to last snapshot tag |

---

## 7. Manual Checkpoints
At phase end, human skims diff for hidden debt (`any`, `@ts-ignore`).

---

## 8. Continuous Improvement
Weekly cron runs lint & tests; comments regression.
