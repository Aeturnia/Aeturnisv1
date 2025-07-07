# Error Catalog - Aeturnis Monorepo

Generated on: 2025-07-07
Last Updated: 2025-07-07 (Comprehensive Re-analysis)

## Summary

- **TypeScript Errors**: 195+ total (13+ new errors found)
- **ESLint Errors**: 160+ errors + 130+ warnings (14+ new errors, 8+ new warnings)
- **New Issues**: Missing type exports, configuration problems, test client errors

## TypeScript Errors by Category

### 1. Not All Code Paths Return Value (TS7030)
| File | Line | Description |
|------|------|-------------|
| `src/app.ts` | 175:16 | Arrow function missing return statement (updated line number) |
| `src/controllers/combat.controller.simple.ts` | 110:32 | Function missing return value |

### 2. Unused Parameters/Variables (TS6133)
| File | Line | Variable | Context |
|------|------|----------|---------|
| `src/controllers/combat.controller.simple.ts` | 6:40 | `req` | Parameter never used |
| `src/controllers/combat.controller.simple.ts` | 29:37 | `req` | Parameter never used |
| `src/controllers/combat.controller.simple.ts` | 58:39 | `req` | Parameter never used |
| `src/controllers/combat.controller.ts` | 19:38 | `req` | Parameter never used |
| `src/controllers/combat.controller.ts` | 484:24 | `battleType` | Variable declared but never used |
| `src/controllers/death.controller.ts` | 26:14 | `characterId` | Variable declared but never used |
| `src/controllers/death.controller.ts` | 29:20 | `locationData` | Variable declared but never used |
| `src/controllers/death.controller.ts` | 29:34 | `killer` | Variable declared but never used |
| `src/controllers/death.controller.ts` | 29:42 | `deathTime` | Variable declared but never used |
| `src/controllers/loot.controller.ts` | 125:19 | `item` | Variable declared but never used |
| `src/controllers/npc.controller.ts` | 233:30 | `distance` | Variable declared but never used |
| `src/controllers/zone.controller.ts` | 89:13 | `query` | Variable declared but never used |
| `src/providers/mock/MockCombatService.ts` | 186:20 | `sourceType` | Parameter never used |
| `src/providers/mock/MockCombatService.ts` | 250:23 | `opponentType` | Parameter never used |
| `src/providers/mock/MockMonsterService.ts` | 108:28 | `distance` | Parameter never used |
| `src/providers/mock/MockNPCService.ts` | 108:28 | `distance` | Parameter never used |
| `src/services/CharacterService.ts` | 60:11 | `existingChar` | Variable declared but never used |
| `src/services/CharacterService.ts` | 141:18 | `updates` | Parameter never used |
| `src/services/CharacterService.ts` | 171:12 | `character` | Variable declared but never used |
| `src/services/CombatService.ts` | 123:12 | `characterId` | Variable declared but never used |
| `src/services/CombatService.ts` | 127:12 | `characterId` | Variable declared but never used |
| `src/services/CombatService.ts` | 161:21 | `monsterId` | Variable declared but never used |
| `src/services/CombatService.ts` | 267:12 | `characterId` | Variable declared but never used |
| `src/services/CombatService.ts` | 305:24 | `target` | Variable declared but never used |
| `src/services/CombatService.ts` | 502:23 | `opponentType` | Parameter never used |
| `src/services/CombatService.ts` | 566:20 | `sourceType` | Parameter never used |
| `src/services/EquipmentService.ts` | 19:3 | `Equipment` | Import never used |
| `src/services/EquipmentService.ts` | 25:42 | `ConflictError` | Import never used |
| `src/services/ResourceService.ts` | 162:29 | `charId` | Parameter never used |
| `src/services/ResourceService.ts` | 179:31 | `charId` | Parameter never used |
| `src/services/SpawnService.ts` | 62:25 | `spawnPointId` | Parameter never used |
| `src/services/SpawnService.ts` | 75:18 | `spawnPointId` | Parameter never used |
| `src/services/SpawnService.ts` | 119:20 | `spawnPointId` | Parameter never used |
| `src/services/StatsService.ts` | 393:5 | `character` | Variable declared but never used |
| `src/services/TestMonsterService.ts` | 1:1 | `uuidv4` | Import never used |
| `src/services/death.service.ts` | 21:27 | `DURABILITY_DAMAGE_PERCENTAGE` | Constant never used |
| `src/services/death.service.ts` | 185:41 | `characterId` | Parameter never used |
| `src/services/loot.service.ts` | 150:19 | `event` | Parameter never used |
| `src/services/loot.service.ts` | 200:34 | `characterId` | Parameter never used |
| `src/services/mock/MockProgressionService.ts` | 12:3 | `CharacterStats` | Import never used |
| `src/services/mock/MockProgressionService.ts` | 16:3 | `StatType` | Import never used |
| `src/services/mock/MockZoneService.ts` | 225:31 | `characterId` | Parameter never used |
| `src/sockets/combat.socket.ts` | 3:24 | `CombatResult` | Import never used |
| `src/sockets/monster.events.ts` | 9:39 | `io` | Parameter never used |
| `src/sockets/npc.events.ts` | 9:35 | `io` | Parameter never used |
| **NEW** `src/controllers/movement.controller.ts` | 340:39 | `req` | Parameter never used |
| **NEW** `src/controllers/progression.controller.ts` | 364:42 | `req` | Parameter never used |
| **NEW** `src/controllers/tutorial.controller.ts` | 26:25 | `req` | Parameter never used |
| **NEW** `src/controllers/tutorial.controller.ts` | 82:22 | `req` | Parameter never used |
| **NEW** `src/controllers/affinity.controller.ts` | Various | `req` | Multiple unused parameters |

### 3. Property Does Not Exist (TS2339)
| File | Line | Property | On Type |
|------|------|----------|---------|
| `src/controllers/combat.controller.ts` | 105:46 | `status` | `CombatSession` |
| `src/controllers/combat.controller.ts` | 105:100 | `roundNumber` | `CombatSession` |
| `src/controllers/combat.controller.ts` | 105:169 | `charId` | `Combatant` |
| `src/controllers/combat.controller.ts` | 105:233 | `charName` | `Combatant` |
| `src/controllers/combat.controller.ts` | 201:24 | `status` | `CombatSession` |
| `src/controllers/combat.controller.ts` | 225:83 | `code` | `CombatResult & Record<"error", unknown>` |
| `src/controllers/combat.controller.ts` | 231:22 | `code` | `CombatResult & Record<"error", unknown>` |
| `src/controllers/combat.controller.ts` | 272:27 | `code` | `CombatResult & Record<"error", unknown>` |
| `src/controllers/combat.controller.ts` | 336:22 | `code` | `CombatResult & Record<"error", unknown>` |
| `src/controllers/combat.controller.ts` | 359:27 | `code` | `CombatResult & Record<"error", unknown>` |
| `src/controllers/death.controller.ts` | 36:45 | `del` | `CacheService` |
| `src/controllers/death.controller.ts` | 44:37 | `getCharacterByUsername` | `any` |
| `src/controllers/death.controller.ts` | 51:40 | `set` | `CacheService` |
| `src/controllers/death.controller.ts` | 97:46 | `set` | `CacheService` |
| `src/controllers/death.controller.ts` | 152:42 | `lootItems` | Response object |
| `src/controllers/loot.controller.ts` | 202:17 | `characterId` | Request body |
| `src/controllers/monster.controller.ts` | 33:38 | `getNearbyMonsters` | `MockMonsterService` |
| `src/controllers/monster.controller.ts` | 40:38 | `getMonsterById` | `MockMonsterService` |
| `src/controllers/monster.controller.ts` | 135:43 | `isAlive` | `SpawnedMonster` |
| `src/controllers/progression.controller.ts` | 54:46 | `getStatsByCharacterNameFromDB` | `StatsService` |
| `src/controllers/progression.controller.ts` | 90:47 | `stats` | Object type |
| `src/middleware/auth.ts` | 84:25 | `charname` | Decoded token |
| `src/middleware/auth.ts` | 113:25 | `charname` | Decoded token |
| `src/services/CharacterService.ts` | 66:18 | `setex` | `CacheService` |
| `src/services/CharacterService.ts` | 178:18 | `setex` | `CacheService` |
| `src/services/CharacterService.ts` | 301:22 | `setex` | `CacheService` |
| `src/services/CharacterService.ts` | 335:22 | `setex` | `CacheService` |
| `src/services/CharacterService.ts` | 400:20 | `del` | `CacheService` |
| `src/services/CharacterService.ts` | 415:22 | `del` | `CacheService` |
| `src/services/CharacterService.ts` | 439:20 | `del` | `CacheService` |
| `src/services/EquipmentService.ts` | 465:18 | `del` | `CacheService` |
| `src/services/EquipmentService.ts` | 466:18 | `del` | `CacheService` |
| `src/services/EquipmentService.ts` | 467:18 | `del` | `CacheService` |
| `src/services/death.service.ts` | 258:41 | `getTTL` | `CacheService` |
| **NEW** `src/controllers/npc.controller.ts` | 91:47 | `getAvailableInteractions` | `MockNPCService` |

### 4. Cannot Invoke Possibly Undefined (TS2722/TS18048)
| File | Line | Method |
|------|------|--------|
| `src/controllers/combat.controller.ts` | 90:27 | `combatService.getActiveCombat` |
| `src/controllers/combat.controller.ts` | 197:27 | `combatService.getActiveCombat` |
| `src/controllers/combat.controller.ts` | 218:26 | `combatService.processCombatAction` |
| `src/controllers/combat.controller.ts` | 329:26 | `combatService.processCombatAction` |
| `src/controllers/combat.controller.ts` | 408:27 | `combatService.initiateCombat` |
| `src/controllers/death.controller.ts` | 126:20 | `realDeathService.respawnCharacter` |
| `src/controllers/death.controller.ts` | 160:43 | `lootResult.lootItems` |
| `src/providers/mock/MockCombatService.ts` | 171:21 | `target.takeDamage` |
| `src/providers/mock/MockCombatService.ts` | 175:21 | `source.takeDamage` |

### 5. Wrong Number of Arguments (TS2554)
| File | Line | Expected | Got |
|------|------|----------|-----|
| `src/controllers/combat.controller.ts` | 218:80 | 2 | 3 |
| `src/controllers/combat.controller.ts` | 329:80 | 2 | 3 |
| `src/controllers/death.controller.ts` | 82:62 | 1 | 2 |

### 6. Property Name Typos (TS2551)
| File | Line | Wrong | Correct |
|------|------|--------|---------|
| `src/controllers/combat.controller.ts` | 105:208 | `currentTurnIndex` | `currentTurn` |
| `src/services/EquipmentService.ts` | 59:24 | `setex` | `set` |
| `src/services/EquipmentService.ts` | 224:24 | `setex` | `set` |

### 7. Type 'unknown' Errors (TS18046)
| File | Line | Context |
|------|------|---------|
| `src/controllers/combat.controller.ts` | 233:15 | `result.error` |
| `src/controllers/combat.controller.ts` | 236:22 | `result.error` |
| `src/controllers/combat.controller.ts` | 239:22 | `result.error` |
| `src/controllers/combat.controller.ts` | 251:15 | `result.error` |
| `src/controllers/combat.controller.ts` | 254:22 | `result.error` |
| `src/controllers/combat.controller.ts` | 338:15 | `result.error` |
| `src/controllers/combat.controller.ts` | 341:22 | `result.error` |

### 8. Type Assignment Errors (TS2345/TS2740/TS2739)
| File | Line | Error Description |
|------|------|-------------------|
| `src/services/EquipmentService.ts` | 43:25 | Argument type '{}' not assignable to 'string' |
| `src/services/EquipmentService.ts` | 205:25 | Argument type '{}' not assignable to 'string' |
| `src/services/EquipmentService.ts` | 315:11 | Missing properties: min_damage, max_damage |
| `src/services/EquipmentService.ts` | 380:11 | Missing 17 properties from Record<StatType, number> |
| `src/services/EquipmentService.ts` | 397:11 | Missing 17 properties from Record<StatType, number> |

### 9. Duplicate Property in Object (TS2783)
| File | Line | Property |
|------|------|----------|
| `src/controllers/combat.controller.ts` | 279:7 | `success` |
| `src/controllers/combat.controller.ts` | 364:7 | `success` |

### 10. Module Import Errors
| File | Line | Error |
|------|------|-------|
| `src/services/EquipmentService.ts` | 25:10 | Module has no exported member 'BadRequestError' |
| `src/services/mock/MockMovementService.ts` | 11:3 | 'Direction' not exported from module |
| `../shared/src/types/npc.types.ts` | 1:28 | File not under 'rootDir' |
| **NEW** `src/controllers/movement.controller.ts` | 7:37 | Module declares 'Direction' locally, but it is not exported |
| **NEW** `src/routes/tutorial.routes.ts` | 9-12 | Missing module '../../../shared/types/tutorial.types' |
| **NEW** `src/routes/affinity.routes.ts` | 9-15 | Missing module '../../../shared/types/affinity.types' |

### 11. Property Never Read (TS6138)
| File | Line | Property |
|------|------|----------|
| `src/services/CharacterService.ts` | 31:13 | `statsService` |
| `src/services/CharacterService.ts` | 33:13 | `sessionManager` |
| `src/services/SpawnService.ts` | 23:13 | `spawnPointRepository` |
| `src/services/SpawnService.ts` | 24:13 | `monsterService` |

## ESLint Errors by Category

### 1. Unused Variables (@typescript-eslint/no-unused-vars)
| File | Line | Variable |
|------|------|----------|
| `src/__tests__/monster.service.test.ts` | 5:7 | `monsterService` |
| `src/__tests__/npc.service.test.ts` | 5:7 | `npcService` |
| `src/controllers/combat.controller.ts` | 484:24 | `battleType` |
| `src/controllers/combat.controller.ts` | 686:13 | `charId` |
| `src/controllers/combat.controller.ts` | 714:13 | `charId` |
| `src/controllers/death.controller.ts` | 3:25 | `IDeathStatusResponse` |
| `src/controllers/death.controller.ts` | 199:11 | `mockDeathRequest` |
| `src/providers/ServiceProvider.ts` | 168:11 | `currentMode` |
| `src/providers/ServiceProvider.ts` | 349:5 | `MockMonsterService` |
| `src/providers/ServiceProvider.ts` | 350:5 | `MockNPCService` |
| `src/providers/ServiceProvider.ts` | 369:5 | `RealMonsterService` |
| `src/providers/ServiceProvider.ts` | 370:5 | `RealNPCService` |
| `src/providers/__tests__/mock/MockCurrencyService.test.ts` | 2:10 | `CurrencyType` |
| `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:3 | `describe` |
| `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:13 | `it` |
| `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:17 | `expect` |
| `src/providers/__tests__/mock/MockMonsterService.test.ts` | 2:25 | `beforeEach` |
| `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:3 | `describe` |
| `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:13 | `it` |
| `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:17 | `expect` |
| `src/providers/__tests__/mock/MockNPCService.test.ts` | 2:25 | `beforeEach` |
| `src/providers/real/RealBankService.ts` | 2:10 | `BankTransaction` |
| `src/routes/character.routes.simple.ts` | 5:10 | `CharacterService` |
| `src/routes/character.routes.ts` | 8:10 | `CharacterService` |
| `src/routes/equipment.routes.simple.ts` | 5:10 | `EquipmentService` |
| `src/routes/equipment.routes.ts` | 5:10 | `EquipmentService` |
| `src/services/CharacterService.ts` | 8:32 | `Character` |
| `src/services/EquipmentService.ts` | 18:3 | `EquipmentItemWithDetails` |
| `src/sockets/handlers/combatHandler.ts` | 1:10 | `Socket` |

### 2. Unexpected 'any' Type (@typescript-eslint/no-explicit-any)
| File | Line | Context |
|------|------|---------|
| `src/controllers/combat.controller.ts` | 687:77 | Type annotation |
| `src/controllers/combat.controller.ts` | 717:85 | Type annotation |
| `src/controllers/combat.controller.ts` | 783:75 | Type annotation |
| `src/controllers/death.controller.ts` | 200:27 | Type annotation |
| `src/controllers/loot.controller.ts` | 298:26 | Type annotation |
| `src/controllers/loot.controller.ts` | 392:42 | Type annotation |
| `src/controllers/movement.controller.ts` | 88:36 | Type annotation |
| `src/controllers/movement.controller.ts` | 300:41 | Type annotation |
| `src/controllers/npc.controller.ts` | 37:49 | Type annotation |
| `src/controllers/npc.controller.ts` | 125:52 | Type annotation |
| `src/controllers/npc.controller.ts` | 127:85 | Type annotation |
| `src/controllers/npc.controller.ts` | 181:52 | Type annotation |
| `src/controllers/npc.controller.ts` | 183:85 | Type annotation |
| `src/controllers/npc.controller.ts` | 215:54 | Type annotation |
| `src/controllers/npc.controller.ts` | 233:36 | Type annotation |
| `src/controllers/npc.controller.ts` | 257:78 | Type annotation |
| `src/controllers/progression.controller.ts` | 105:50 | Type annotation |
| `src/controllers/progression.controller.ts` | 107:84 | Type annotation |
| `src/controllers/zone.controller.ts` | 96:76 | Type annotation |
| `src/controllers/zone.controller.ts` | 117:47 | Type annotation |
| `src/controllers/zone.controller.ts` | 119:81 | Type annotation |
| `src/controllers/zone.controller.ts` | 211:47 | Type annotation |
| `src/controllers/zone.controller.ts` | 213:81 | Type annotation |
| `src/database/index.ts` | 34:64 | Type annotation |
| `src/middleware/auth.ts` | 48:30 | Type annotation |
| `src/middleware/auth.ts` | 49:14 | Type annotation |
| `src/middleware/auth.ts` | 55:19 | Type annotation |
| `src/middleware/auth.ts` | 82:15 | Type annotation |
| `src/providers/ServiceProvider.ts` | 117:26 | Type annotation |
| `src/providers/ServiceProvider.ts` | 235:47 | Type annotation |
| `src/providers/ServiceProvider.ts` | 236:53 | Type annotation |
| `src/providers/ServiceProvider.ts` | 239:48 | Type annotation |
| `src/providers/ServiceProvider.ts` | 240:52 | Type annotation |
| `src/providers/ServiceProvider.ts` | 430:59 | Type annotation |
| `src/providers/ServiceProvider.ts` | 431:21 | Type annotation |
| `src/providers/ServiceProvider.ts` | 432:21 | Type annotation |
| `src/routes/bank.routes.ts` | 107:23 | Type annotation |
| `src/routes/bank.routes.ts` | 108:29 | Type annotation |
| `src/routes/bank.routes.ts` | 110:63 | Type annotation |
| `src/routes/character.routes.simple.ts` | 143:44 | Type annotation |
| `src/routes/character.routes.simple.ts` | 146:78 | Type annotation |
| `src/routes/character.routes.ts` | 170:62 | Type annotation |
| `src/routes/character.routes.ts` | 171:62 | Type annotation |
| `src/routes/character.routes.ts` | 199:44 | Type annotation |
| `src/routes/character.routes.ts` | 202:78 | Type annotation |
| `src/routes/combat.routes.ts` | 22:65 | Type annotation |
| `src/routes/combat.routes.ts` | 23:58 | Type annotation |
| `src/routes/combat.routes.ts` | 38:68 | Type annotation |
| `src/routes/combat.routes.ts` | 39:61 | Type annotation |
| `src/routes/combat.routes.ts` | 54:64 | Type annotation |
| `src/routes/combat.routes.ts` | 55:57 | Type annotation |
| `src/routes/currency.routes.ts` | 150:39 | Type annotation |
| `src/routes/currency.routes.ts` | 154:67 | Type annotation |
| `src/routes/death.routes.ts` | 24:58 | Type annotation |
| `src/routes/death.routes.ts` | 25:53 | Type annotation |
| `src/routes/death.routes.ts` | 44:58 | Type annotation |
| `src/routes/death.routes.ts` | 45:53 | Type annotation |
| `src/routes/death.routes.ts` | 62:57 | Type annotation |
| `src/routes/death.routes.ts` | 63:52 | Type annotation |
| `src/routes/death.routes.ts` | 80:61 | Type annotation |
| `src/routes/death.routes.ts` | 81:56 | Type annotation |
| `src/routes/equipment.routes.simple.ts` | 131:45 | Type annotation |
| `src/routes/equipment.routes.simple.ts` | 134:79 | Type annotation |
| `src/routes/equipment.routes.ts` | 123:45 | Type annotation |
| `src/routes/equipment.routes.ts` | 126:79 | Type annotation |
| `src/routes/loot.routes.ts` | 20:58 | Type annotation |
| `src/routes/loot.routes.ts` | 21:53 | Type annotation |
| `src/routes/loot.routes.ts` | 36:58 | Type annotation |
| `src/routes/loot.routes.ts` | 37:53 | Type annotation |
| `src/routes/loot.routes.ts` | 52:62 | Type annotation |
| `src/routes/loot.routes.ts` | 53:57 | Type annotation |
| `src/routes/loot.routes.ts` | 68:57 | Type annotation |
| `src/routes/loot.routes.ts` | 69:52 | Type annotation |
| `src/routes/loot.routes.ts` | 84:63 | Type annotation |
| `src/routes/loot.routes.ts` | 85:58 | Type annotation |
| `src/routes/monster.routes.ts` | 24:65 | Type annotation |
| `src/routes/monster.routes.ts` | 25:60 | Type annotation |
| `src/routes/monster.routes.ts` | 40:62 | Type annotation |
| `src/routes/monster.routes.ts` | 41:57 | Type annotation |
| `src/routes/monster.routes.ts` | 56:61 | Type annotation |
| `src/routes/monster.routes.ts` | 57:56 | Type annotation |
| `src/routes/npc.routes.ts` | 20:58 | Type annotation |
| `src/routes/npc.routes.ts` | 21:53 | Type annotation |
| `src/routes/npc.routes.ts` | 36:56 | Type annotation |
| `src/routes/npc.routes.ts` | 37:51 | Type annotation |
| `src/routes/npc.routes.ts` | 52:60 | Type annotation |
| `src/routes/npc.routes.ts` | 53:55 | Type annotation |
| `src/routes/npc.routes.ts` | 68:60 | Type annotation |
| `src/routes/npc.routes.ts` | 69:55 | Type annotation |
| `src/routes/session.routes.ts` | 36:66 | Type annotation |
| `src/routes/session.routes.ts` | 37:48 | Type annotation |
| `src/services/CharacterService.ts` | 144:7 | Type annotation |
| `src/services/CombatService.ts` | 268:17 | Type annotation |
| `src/services/CombatService.ts` | 306:29 | Type annotation |
| `src/sockets/SocketServer.ts` | 87:63 | Type annotation |
| `src/sockets/SocketServer.ts` | 246:14 | Type annotation |
| `src/sockets/SocketServer.ts` | 262:12 | Type annotation |
| `src/sockets/death.events.ts` | 78:16 | Type annotation |
| `src/sockets/handlers/FixedChatHandler.ts` | 59:21 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 30:54 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 31:21 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 67:21 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 108:21 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 146:21 | Type annotation |
| `src/sockets/handlers/combatHandler.ts` | 189:21 | Type annotation |
| `src/sockets/loot.events.ts` | 106:60 | Type annotation |
| `src/sockets/monster.events.ts` | 83:77 | Type annotation |
| `src/sockets/npc.events.ts` | 147:17 | Type annotation |
| `src/sockets/npc.events.ts` | 230:14 | Type annotation |
| `src/sockets/npc.events.ts` | 284:12 | Type annotation |
| **NEW** `src/routes/bank.routes.ts` | 195 | Type annotation - `(req as any).user?.id` |
| **NEW** `src/routes/character.stats.routes.ts` | 24, 83, 130, 131, 180, 233 | Multiple uses of `(req as any)` |
| **NEW** `src/routes/equipment.routes.ts` | 363 | Type annotation - `slot as any` |
| **NEW** `src/services/BankService.ts` | 334 | Use of 'any' type for rawSlots |
| **NEW** `src/services/CharacterService.ts` | 202 | `updates` variable typed as 'any' |
| **NEW** `src/services/CombatService.ts` | 946 | Use of 'any' type for buff object |
| **NEW** `src/services/ResourceService.ts` | 89 | Type assertion with `as any` |

### 3. Console Statements (no-console)
| File | Line Count | Lines |
|------|------------|-------|
| `src/controllers/combat.controller.ts` | 40+ | 88, 91, 121-122, 128-130, 132-133, 142, 152, 156-162, 177-180, 188-189, 198-202, 205, 217-221, 226, 264, 283-290, 380-382, 388, 392-393, 399-400, 409-417, 429, 432-439 |
| `src/controllers/monster.controller.ts` | 10 | 30, 63, 86, 138, 171, 211, 218, 263, 270, 302 |
| `src/controllers/combat.controller.simple.ts` | 4 | 18, 47, 99, 143 |
| `src/controllers/npc.controller.ts` | 5 | 24, 52, 75, 101, 133 |
| `src/providers/ServiceProvider.ts` | 9 | 126, 173, 190, 194, 197, 318, 320, 461, 465 |
| `src/sockets/SocketServer.ts` | 2 | 223, 238 |
| **NEW** `src/services/CombatService.ts` | Multiple | 113-127, 139-145, 163-165, and more throughout file |

### 4. Function Type Usage (@typescript-eslint/ban-types)
| File | Line | Context |
|------|------|---------|
| `src/sockets/SocketServer.ts` | 80:76 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 81:70 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 82:75 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 154:77 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 161:86 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 183:82 | Using `Function` type |
| `src/sockets/SocketServer.ts` | 192:83 | Using `Function` type |

### 5. ESLint Configuration Errors
| File | Error |
|------|-------|
| `/packages/shared/src/types/monster.types.d.ts` | Not included in TSConfig |
| `/packages/shared/src/types/npc.types.d.ts` | Not included in TSConfig |

## Error Summary by File

### Most Problematic Files (by error count)
1. **src/controllers/combat.controller.ts** - 68 total errors (41 TS + 27 ESLint)
2. **src/controllers/death.controller.ts** - 44 total errors (34 TS + 10 ESLint)
3. **src/services/CharacterService.ts** - 33 total errors (24 TS + 9 ESLint)
4. **src/services/EquipmentService.ts** - 13 total errors (11 TS + 2 ESLint)
5. **src/controllers/npc.controller.ts** - 10 total errors (2 TS + 8 ESLint)

### Critical Issues to Address First
1. **Missing return statements** in route handlers
2. **Cache service method mismatches** (`setex` vs `set`, `del` missing)
3. **Type safety issues** with excessive `any` usage
4. **Missing type definitions** for combat and character properties
5. **Configuration issues** with TypeScript paths and ESLint

## New Issues Added in Latest Analysis

### 12. Missing Implementations
| File | Line | Issue |
|------|------|-------|
| `src/controllers/combat.controller.ts` | 811, 904 | `CombatService` used but not imported |
| `src/controllers/combat.controller.ts` | 869 | `testMonsterService` used but not declared |
| `src/controllers/combat.controller.ts` | 687, 717, 783 | Methods not in ICombatService interface |
| `src/controllers/loot.controller.ts` | 295 | TODO: `getAllLootTables` not in ILootService |
| `src/routes/bank.routes.ts` | 146 | TODO: Missing itemId implementation |
| `src/routes/bank.routes.ts` | 198-204 | `transferItem` not in IBankService |

### 13. Type Safety Issues in Services
| File | Line | Issue |
|------|------|-------|
| `src/services/CacheService.ts` | 97, 107, 115 | Accessing `this.redis` without null checks |
| `src/services/CacheService.ts` | 39-46 | Type assertion on JSON.parse without validation |
| `src/services/BankService.ts` | 241 | BigInt to Number conversion without overflow check |
| `src/services/CurrencyService.ts` | 241 | BigInt to Number conversion without overflow check |
| `src/services/CombatService.ts` | 89 | Type assertion on error without type guard |
| `src/services/EquipmentService.ts` | 532-534 | Silent error handling without propagation |

### 14. Test Client Errors (New)
| File | Line | Variable | Issue |
|------|------|----------|-------|
| `test-client/src/App.tsx` | - | `React` | Imported but never used |
| `test-client/src/components/combat/CombatPanel.tsx` | - | `isAuthenticated` | Declared but never used |
| `test-client/src/components/logs/LogsPanel.tsx` | - | `isAuthenticated` | Declared but never used |
| `test-client/src/components/monsters/MonsterList.tsx` | - | `isAuthenticated` | Declared but never used |
| `test-client/src/components/monsters/SpawnControl.tsx` | - | `isAuthenticated` | Declared but never used |
| `test-client/src/components/npcs/DialogueViewer.tsx` | - | `DialogueNode` | Declared but never used |
| `test-client/src/components/npcs/NPCList.tsx` | - | `isAuthenticated` | Declared but never used |
| `test-client/src/components/zones/ZonePanel.tsx` | - | `Zone` | Declared but never used |

### 15. Configuration Issues
| Issue | Description |
|-------|-------------|
| Missing Jest Dependencies | @types/jest@^29.5.0, jest@^29.7.0, ts-jest@^29.1.0 |
| Inconsistent Export Patterns | Some routes use default export, others use named exports |
| Duplicate Type Definitions | ItemRarity defined in both server and shared packages |

## Recommendations

1. **Immediate Actions**:
   - Fix missing return statements in `app.ts` (line 175) and `combat.controller.simple.ts`
   - Update CacheService interface to match actual implementation
   - Remove or properly type all `any` usages
   - Add missing imports for CombatService and testMonsterService
   - Create missing type files: tutorial.types.ts and affinity.types.ts

2. **Short-term Fixes**:
   - Clean up unused variables and imports
   - Fix property access errors in combat and death controllers
   - Update TypeScript configuration to include .d.ts files
   - Replace all console.log statements with proper logger
   - Add null checks for redis operations in CacheService
   - Export Direction type from movement.types.ts

3. **Long-term Improvements**:
   - Implement proper error handling types
   - Standardize service interfaces across mock and real implementations
   - Add comprehensive type definitions for all domain objects
   - Standardize route export patterns
   - Add runtime validation for JSON parsing and type assertions
   - Implement proper BigInt to Number conversion with overflow checks