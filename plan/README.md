# Database Migration Planning Documents

This folder contains comprehensive planning and reference materials for migrating the MOE-TG-VX teacher portal from mock data to a proper database.

---

## 📁 Files

### 1. [DATABASE_MIGRATION_PLAN.md](./DATABASE_MIGRATION_PLAN.md)
**The main implementation guide.**

Contains:
- 3-phase staged approach (Core Setup → Data Migration → Component Integration)
- Detailed task breakdowns with checkboxes
- Testing requirements (Playwright test scenarios)
- Success criteria for each phase
- Rollback procedures
- Progress tracking
- Timeline estimates

**Use this file to:**
- Track implementation progress
- Understand what needs to be done next
- Validate completion of each phase
- Reference testing requirements

---

### 2. [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)
**Quick reference for database schema.**

Contains:
- Entity relationship diagrams
- Complete table definitions
- Index strategies
- Common query patterns
- Performance optimization tips
- Enum reference

**Use this file to:**
- Look up table structures
- Understand relationships between entities
- Find query examples
- Reference field names and types

---

## 🚀 Getting Started

1. **Read**: Start with `DATABASE_MIGRATION_PLAN.md` to understand the approach
2. **Reference**: Keep `SCHEMA_REFERENCE.md` open while coding
3. **Track**: Check off tasks in the plan as you complete them
4. **Test**: Run Playwright tests after each phase

---

## 📊 Quick Overview

### Current State
- ✅ Comprehensive planning complete
- ✅ Schema design finalized (3-view architecture)
- ✅ Testing strategy defined
- ⏳ Implementation not started

### Next Steps
1. Begin Phase 1: Install Prisma and create schema
2. Run Phase 1 tests
3. Proceed to Phase 2: Data migration
4. Finish with Phase 3: Component integration

---

## 🎯 Key Design Decisions

1. **3-View Architecture**: Attendance, Performance, Cases
2. **Two-Tier Records**: General Recordings (lightweight) → Cases (formal)
3. **JSONB for Flexibility**: GeneralRecording.data uses JSON for flexible schemas
4. **Denormalized Performance**: Student.overallAverage cached for speed
5. **SQLite → PostgreSQL**: SQLite for dev, PostgreSQL for production

---

## 🧪 Testing Strategy

- **Phase 1**: Basic CRUD operations
- **Phase 2**: Data integrity and counts
- **Phase 3**: E2E UI tests with Playwright

---

## 📈 Progress Tracking

Check `DATABASE_MIGRATION_PLAN.md` for:
- [ ] Phase 1: Core Setup (0/5 tasks)
- [ ] Phase 2: Data Migration (0/8 tasks)
- [ ] Phase 3: Component Integration (0/9 tasks)

---

**Created**: 2025-10-09
**Status**: Planning Complete, Ready to Implement
