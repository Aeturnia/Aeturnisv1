# CAFE Methodology v2.0: Division Protocol
_Modular AI Collaboration with Backend/Frontend Role Separation_

**Version:** 2.0  
**Codename:** Division Protocol  
**Author:** Aeturnis Development Labs LLC  
**Last Updated:** July 10, 2025

---

## 🧠 Overview

**CAFE** stands for **Contract-First, AI-Facilitated Engineering**. It is a collaborative development methodology designed for hybrid AI-human software creation. Version 2.0 introduces a formal **Division of Labor** between two specialized AI agents: **Claude Code (Backend Specialist)** and **Replit Agent (Frontend Specialist)**.

This version solidifies phase-aware development using prompt-orchestration loops, interface-first thinking, and phase-guided quality control across AI-generated code.

---

## 🧩 Core Principles

1. **Contract First**  
   - All features begin with TypeScript interface definitions or API schemas.

2. **Agent Specialization**  
   - Claude handles backend logic, API layers, DB schema, and system design.  
   - Replit handles UI components, styling, state, and basic refactoring.

3. **Clear Handoffs**  
   - Handoff points are defined with `// TODO:` markers and interface mockups.

4. **Test Integration Early**  
   - Don’t wait until the end to hook up backend and frontend.

5. **Mobile-First by Default**  
   - UI and interactions are touch-optimized unless otherwise stated.

---

## 🧱 Division of Labor

| Task | Claude Code (Backend) | Replit Agent (Frontend) |
|------|------------------------|--------------------------|
| Architecture & Design | ✅ | ❌ |
| Type Definitions | ✅ | ✅ (reads only) |
| API Routes & Services | ✅ | ❌ |
| React Components | ❌ | ✅ |
| Styling / CSS / Tailwind | ❌ | ✅ |
| Form Validation | ✅ (server-side) | ✅ (UI-level) |
| DB Schema / Migrations | ✅ | ❌ |
| Complex Logic (Combat, AI) | ✅ | ❌ |
| State Management | ✅ (global) | ✅ (local) |
| Unit Testing | ✅ | ✅ |
| npm / Package Management | ⚠️ assist | ✅ |
| Refactoring | ⚠️ limited | ✅ |
| Test Running / Linting | ⚠️ assist | ✅ |

---

## 🧪 Current Priority: Phase 3 – UI Integration

1. **Quick Action Toolbar**
   - Claude: cooldown system, action APIs
   - Replit: drag-drop slots, UI feedback

2. **Dynamic Equipment Stats**
   - Claude: real-time calculation
   - Replit: stat display and update

3. **Error Handling Layer**
   - Claude: service-level retry
   - Replit: user-visible error states

---

## 🧭 SOP Summary

1. **Identify Agent Role**
   - Is this task backend-heavy? → Claude  
   - UI-only, layout, input? → Replit

2. **Start With Interface**
   - Define all types in `*.types.ts` first

3. **Use TODO Handoffs**
   ```ts
   // TODO: Connect this component to EquipmentService.getBonusStats()
   ```

4. **Test & Confirm**
   - Use stubs/mocks early  
   - Run tests and perform agent reviews

---

## 📂 Reference Files

- `CLAUDE.md` – Agent memory and backend SOP
- `Working_SOP_Guidelinesv1.md` – Full working rules
- `Phases.md` – CAFE-aligned implementation roadmap
- `prompt_tracker.md` – Traceable AI prompt log
- `aeturnis-detailed-agent-guide.md` – Prompt structuring guide

---

## 🛡️ Quality Standards

- TypeScript strict mode (no `any`)
- API latency < 500ms
- UI input response < 100ms
- Test coverage ≥ 80%
- All frontend elements mobile-compliant (≥44x44px tap zones)
- All backend endpoints properly validated and error-handled

---

## 📣 Final Note

**Version 2.0 formalizes the CAFE system as a multi-agent software engineering discipline.** With Claude Code and Replit Agent assigned specialized tasks, the methodology now supports large-scale modular AI code collaboration under a production-ready structure.