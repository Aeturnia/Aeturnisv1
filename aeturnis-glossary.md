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
| **Replit Agent** | "Engineer" — implements Claude's prompts in code, validates outputs, and runs audits. |
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
| **Self-Audit** | The Agent's act of running tests/lint and logging the results in a footer. |
| **Prompt Dependency Graph** | A Mermaid.js graph visualizing which features depend on others. |

---

## 💻 Technical Acronyms & Infrastructure

| Term | Definition |
|------|------------|
| **AIPE** | Aeturnis Infinite Progression Engine — core system managing character stat progression, tiers, and infinite scaling |
| **JWT** | JSON Web Token — authentication tokens used for secure API access with 15-minute access tokens and 7-day refresh tokens |
| **ORM** | Object-Relational Mapping — Drizzle ORM is used for database interactions with full TypeScript support |
| **DTO** | Data Transfer Object — structured objects used for API request/response data validation |
| **UUID** | Universally Unique Identifier — v4 UUIDs used as primary keys for all database entities |
| **JSONB** | Binary JSON — PostgreSQL data type used for flexible metadata storage |
| **TTL** | Time To Live — cache expiration setting (e.g., 3600 seconds for character cache) |
| **CORS** | Cross-Origin Resource Sharing — security mechanism for controlling cross-domain requests |
| **REST** | Representational State Transfer — architectural style used for the API design |
| **CRUD** | Create, Read, Update, Delete — standard database operations |
| **CI/CD** | Continuous Integration/Continuous Deployment — automated testing and deployment pipeline |
| **LOC** | Lines of Code — metric used for PR size limits (≤150 LOC recommended) |
| **BigInt** | JavaScript/PostgreSQL large integer type — used for infinite progression values |
| **Argon2id** | Password hashing algorithm — used with 64MB memory cost and 3 iterations |
| **Socket.IO** | Real-time bidirectional communication library — used for live game updates on port 3001 |
| **Redis** | In-memory data store — used for caching and session management (disabled in development) |
| **PostgreSQL** | Relational database system — primary data storage (version 14+) |
| **Drizzle** | TypeScript ORM — database abstraction layer with full type safety and migration support |
| **Vite** | Build tool — fast frontend development server and bundler |
| **Vitest** | Testing framework — unit and integration testing (≥80% coverage required) |
| **ESLint** | JavaScript/TypeScript linter — code quality enforcement |
| **Prettier** | Code formatter — automatic code formatting |

---

## ⚔️ Combat & Game Mechanics

| Term | Definition |
|------|------------|
| **Aggro/Aggro Radius** | Monster detection range that triggers hostile behavior (default: 5 units) |
| **Cooldown** | Time delay between ability uses (5-second base for combat actions) |
| **Proc** | Programmed Random OCcurrence — chance-based effects or abilities |
| **DoT** | Damage over Time — effects that deal damage across multiple turns |
| **HoT** | Heal over Time — effects that restore health across multiple turns |
| **AoE** | Area of Effect — abilities affecting multiple targets in a radius |
| **CC** | Crowd Control — abilities that limit enemy actions (stun, root, silence) |
| **DPS** | Damage Per Second — damage output measurement or character role |
| **Tank** | High-defense character role that absorbs damage for the party |
| **Healer** | Support role focused on restoring health and removing debuffs |
| **Buff** | Temporary positive status effect enhancing stats or abilities |
| **Debuff** | Temporary negative status effect reducing effectiveness |
| **Crit/Critical** | Enhanced damage from critical strikes (base 5% chance, 2x damage) |
| **Dodge/Parry/Block** | Defensive mechanics to avoid or reduce incoming damage |
| **Threat/Enmity** | Aggro generation metric determining monster targeting priority |
| **Kite/Kiting** | Strategy of maintaining distance while dealing damage |

---

## 🏰 Core Game Systems

| Term | Definition |
|------|------------|
| **Spawn Point** | Designated location where monsters appear with configurable timers |
| **Drop Rate** | Percentage chance for items to drop from monsters (0-100%) |
| **Quest System** | Task-based progression system with objectives and rewards (planned) |
| **Dialogue Tree** | Branching NPC conversation system with state tracking |
| **Faction** | Group alignment affecting NPC interactions and reputation |
| **Guild** | Player-created organizations with shared chat, bank, and goals |
| **Party** | Temporary player groups (max 5) for cooperative gameplay |
| **Instance** | Isolated game area for specific player/party with separate state |
| **PvP** | Player versus Player combat with consent flags |
| **PvE** | Player versus Environment (AI-controlled) combat |
| **Consumable** | One-time use items (potions, scrolls, food) |
| **Currency System** | Gold/Silver/Copper economy (100 copper = 1 silver, 100 silver = 1 gold) |
| **Durability** | Equipment degradation system requiring repairs |
| **Set Bonus** | Additional stats from wearing matching equipment pieces |
| **Death Penalty** | XP debt system (-10% current level XP) that must be worked off |
| **Respawn Timer** | 30-second wait after death before revival at designated point |

---

## 🔐 Security & Architecture Patterns

| Term | Definition |
|------|------------|
| **Auth Middleware** | Express middleware validating JWT tokens on protected routes |
| **Rate Limiting** | Request throttling (10 messages/10 seconds for chat, 100 req/min API) |
| **Soft Delete** | Database records marked with `isDeleted` flag rather than removed |
| **Cascade Delete** | Automatic deletion of related records when parent is deleted |
| **Session Management** | JWT refresh token tracking in `user_sessions` table |
| **Audit Trail** | Complete action logging in `audit_log` table for security/debugging |
| **ACID Compliance** | Database transaction properties ensuring data integrity |
| **Connection Pool** | Database connection management (max: 20, idle timeout: 30s) |
| **Hot Reload** | Development feature for instant code updates without restart |
| **Monorepo** | Single repository containing multiple packages (server, shared, client) |
| **Repository Pattern** | Data access abstraction layer (e.g., CharacterRepository) |
| **Service Layer** | Business logic encapsulation (e.g., CombatService, AuthService) |
| **Controller Pattern** | Request handling and validation layer for API endpoints |
| **Middleware Pattern** | Request processing pipeline components for cross-cutting concerns |
| **Event Emitter** | Socket.IO event broadcasting system for real-time updates |
| **Namespace Pattern** | Event naming convention `namespace:action` (e.g., `combat:attack`) |
| **Room Management** | Socket.IO grouping for targeted message delivery by zone/party |
| **Singleton Pattern** | Single instance services (cache manager, database pool) |
| **Factory Pattern** | Object creation abstraction (monster/item generation) |
| **Observer Pattern** | Event-driven updates for position, status changes |

---

## 🌟 AIPE (Infinite Progression) Terms

| Term | Definition |
|------|------------|
| **Base Stats** | Core character attributes (STR, DEX, INT, WIS, VIT, LCK) starting at 10 |
| **Stat Tier** | Progression level beyond base stats (every 100 base points = 1 tier) |
| **Tier Bonus** | +50 stats per tier for infinite scaling potential |
| **Effective Stats** | Calculated total including base, bonus, tier, and equipment modifiers |
| **Paragon Scaling** | Logarithmic stat growth formula from paragon point investment |
| **Prestige Level** | Character rebirth system multiplying resource pools |
| **Prestige Multiplier** | Resource pool multiplication based on prestige level (1.5x per level) |
| **Soft Cap** | Diminishing returns above 1000 stat points (90% effectiveness) |
| **Hard Cap** | Absolute maximum of 1,000,000 per stat for system stability |
| **Stat Allocation** | Manual distribution of 5 points per level among attributes |
| **Resource Pools** | HP/MP/Stamina calculated from effective stats with scaling formulas |
| **Resource Scaling** | HP = VIT × 20, MP = INT × 15, Stamina = (STR + DEX) × 5 |

---

## 🧪 Testing & Quality Assurance

| Term | Definition |
|------|------------|
| **Test Coverage** | Percentage of code covered by tests (≥80% required for PRs) |
| **Unit Test** | Isolated component testing with mocked dependencies |
| **Integration Test** | Multi-component interaction testing with real services |
| **E2E Test** | End-to-end testing simulating user workflows |
| **Mock/Mocking** | Test doubles replacing external dependencies |
| **Test Suite** | Collection of related tests for a module/feature |
| **Watch Mode** | Automatic test re-running on file changes during development |
| **Coverage Report** | Detailed analysis of test coverage by file/function/line |
| **Fixture** | Reusable test data setup/teardown utilities |
| **Assertion** | Test expectation validation (expect().toBe()) |
| **Test Runner** | Vitest execution environment with parallel support |
| **Snapshot Testing** | Capturing and comparing component output over time |

---

## 📡 Real-time Communication

| Term | Definition |
|------|------------|
| **WebSocket** | Persistent bidirectional communication protocol for live updates |
| **Socket Event** | Named message type for real-time game state changes |
| **Broadcast** | Server message sent to multiple connected clients |
| **Emit** | Send event from client to server or vice versa |
| **Acknowledgment** | Confirmation callback for event receipt |
| **Heartbeat** | Connection keepalive mechanism (30-second interval) |
| **Reconnection** | Automatic connection re-establishment with exponential backoff |
| **Transport** | Communication method (websocket preferred, polling fallback) |
| **Handshake** | Initial connection authentication with JWT token |
| **Namespace** | Socket.IO routing mechanism for organizing events |
| **Join/Leave** | Room management for zone-based message routing |