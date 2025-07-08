# Error Resolution Automation Scripts

**Source:** ErrorFixv2.md Appendix C  
**Purpose:** Systematic error resolution using subagent methodology  

---

## Available Scripts

### 🚀 start-unit.sh
Initializes a new error resolution unit with tracking and baseline metrics.

```bash
./scripts/start-unit.sh TYPE-A-001 "Type Definition Agent"
```

**Features:**
- Creates unit tracking directory
- Captures baseline TypeScript and ESLint errors
- Generates unit.json with metadata
- Sets up verification infrastructure

### ✅ complete-unit.sh
Completes a unit with verification and report generation.

```bash
./scripts/complete-unit.sh TYPE-A-001
```

**Features:**
- Runs final TypeScript, ESLint, and test verification
- Calculates error reduction metrics
- Generates comprehensive completion report
- Updates unit tracking with results

### ↩️ rollback-unit.sh
Safely rolls back a unit in case of issues.

```bash
./scripts/rollback-unit.sh TYPE-A-001
```

**Features:**
- Creates rollback report with timestamp
- Resets files to previous state using git
- Updates unit status to "rolled-back"
- Provides recovery instructions

### 📊 progress-dashboard.sh
Generates real-time progress dashboard.

```bash
./scripts/progress-dashboard.sh
```

**Features:**
- Shows current error counts
- Displays unit completion statistics
- Calculates error reduction trends
- Provides performance metrics

### 💾 create-backup.sh
Creates comprehensive backup before starting unit work.

```bash
./scripts/create-backup.sh TYPE-A-001
```

**Features:**
- Creates git stash with timestamp
- Backs up critical files to ./backups/
- Generates backup metadata
- Provides restore instructions

---

## Workflow Example

```bash
# 1. Create backup before starting
./scripts/create-backup.sh TYPE-A-001

# 2. Start new unit
./scripts/start-unit.sh TYPE-A-001 "Type Definition Agent"

# 3. Work on fixes...
# Edit files, run tests, etc.

# 4. Complete unit
./scripts/complete-unit.sh TYPE-A-001

# 5. Check progress
./scripts/progress-dashboard.sh

# If needed: rollback
./scripts/rollback-unit.sh TYPE-A-001
```

---

## Unit Types (from ErrorFixv2.md)

### TYPE-A: Type Definition Units
- **Agent:** Type Definition Agent
- **Priority:** HIGH
- **Scope:** Missing properties, interface exports
- **Example:** `TYPE-A-001`, `TYPE-A-002`

### SERVICE-B: Service Implementation Units
- **Agent:** Service Implementation Agent
- **Priority:** HIGH
- **Scope:** Interface compliance, method implementations
- **Example:** `SERVICE-B-001`, `SERVICE-B-002`

### CONTROLLER-C: Controller Cleanup Units
- **Agent:** Controller Cleanup Agent
- **Priority:** MEDIUM
- **Scope:** Parameter types, error handling
- **Example:** `CONTROLLER-C-001`, `CONTROLLER-C-002`

### REPO-D: Repository Units
- **Agent:** Repository Agent
- **Priority:** MEDIUM
- **Scope:** Database operations, BigInt conversions
- **Example:** `REPO-D-001`, `REPO-D-002`

### ROUTE-E: Route Handler Units
- **Agent:** Route Handler Agent
- **Priority:** LOW
- **Scope:** Request/response handling
- **Example:** `ROUTE-E-001`, `ROUTE-E-002`

---

## Directory Structure

```
./units/
├── TYPE-A-001/
│   ├── unit.json           # Unit tracking metadata
│   ├── baseline-errors.txt # Initial error state
│   ├── final-errors.txt    # Final error state
│   └── report.md          # Completion report
├── SERVICE-B-001/
│   └── ...
└── ...

./backups/
├── TYPE-A-001/
│   ├── backup.json        # Backup metadata
│   ├── src/              # Source file backup
│   └── file-list.txt     # List of backed up files
└── ...
```

---

## Error Tracking

Each unit maintains comprehensive tracking:

```json
{
  "id": "TYPE-A-001",
  "agent": "Type Definition Agent",
  "startTime": "2025-07-07T15:30:00Z",
  "endTime": "2025-07-07T16:15:00Z",
  "status": "complete",
  "baselineErrors": {
    "typescript": 25,
    "eslint": 8
  },
  "finalErrors": {
    "typescript": 18,
    "eslint": 5
  },
  "improvement": {
    "typescript": 7,
    "eslint": 3
  }
}
```

---

## Quality Gates

Each script enforces quality gates:

✅ **TypeScript Compilation** - Zero errors in strict mode  
✅ **ESLint Validation** - Zero errors, warnings acceptable  
✅ **Test Suite** - All tests must pass  
✅ **Coverage** - Maintain ≥80% coverage  
✅ **Performance** - No regression in build times  

---

## Integration with ErrorFixv2.md

These scripts implement the systematic approach defined in ErrorFixv2.md:

- **Subagent Methodology** - Each unit assigned to specific agent
- **Micro-Unit Approach** - Small, focused units with clear boundaries
- **Verification Protocols** - Automated baseline and final verification
- **Progress Tracking** - Real-time metrics and completion tracking
- **Rollback Safety** - Safe recovery from failed attempts

---

*These automation scripts enable systematic, trackable error resolution following the ErrorFixv2.md strategy document.*