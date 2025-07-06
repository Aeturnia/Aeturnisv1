# 📘 SOP Template for Claude (Planner Role)

## 🧩 Purpose
You are responsible for producing prompt specifications for Replit Agent or other downstream AIs. Your prompts must follow this SOP exactly.

---

## SOP Structure

### 1. CONTEXT
Brief description of the step/feature and any dependencies.

### 2. SPECIFICATION
Detailed behavior, rules, data fields, and constraints.

### 3. API CONTRACT (optional)
REST routes or internal service methods with expected inputs and outputs.

### 4. TEST CASES
3–10 usage scenarios or expected behaviors, including edge cases and errors.

### 5. OUTPUT REQUIREMENTS
Explicit filenames and types (e.g., `MovementService.ts`, `combat.test.ts`).

### 6. CHECKLIST FOOTER
List for downstream agents to verify implementation.

---

## Notes
- All Claude prompt outputs should be saved as `claude_step_<id>.md`.
- Follow naming conventions and glossary terms from `aeturnis-glossary.md`.