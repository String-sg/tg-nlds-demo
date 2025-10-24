# Next Implementation Priorities

**Date Created:** October 24, 2025
**Status:** 🔄 Active Planning Document
**Review Frequency:** Weekly or after major feature completion

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Priority Rankings](#priority-rankings)
3. [Detailed Implementation Plans](#detailed-implementation-plans)
4. [2-Week Sprint Proposal](#2-week-sprint-proposal)
5. [Technical Considerations](#technical-considerations)
6. [Questions & Decisions Needed](#questions--decisions-needed)

---

## Current Implementation Status

### ✅ Phase 1 Complete: Foundation & Navigation

**Status:** 100% Complete (October 23, 2025)

**Achievements:**
- ✅ Multi-tab navigation system with drag-and-drop, parent-child hierarchy
- ✅ Breadcrumb navigation with async data fetching and sessionStorage caching
- ✅ My Classes component with Supabase integration
- ✅ Class Overview dashboard with real-time statistics
- ✅ Student Profile with 4 tabs (Overview, Records, Cases, Reports)
- ✅ Student alerts widget with complex priority-based queries
- ✅ Role-based permissions via UserProvider
- ✅ 19 Supabase tables created with 17 migrations applied
- ✅ UI/UX improvements (navigation labels, visual refinements)

**Files:**
- `src/app/[[...slug]]/page.tsx` (2,300+ lines - main app shell)
- `src/components/classroom/my-classes.tsx`
- `src/components/classroom/class-overview.tsx`
- `src/components/student/student-profile.tsx`
- `src/hooks/use-breadcrumbs.ts`

**Database:** All 19 tables operational with test data

---

### 🟡 Phase 2 Partial: Core Teaching Functions

**Status:** 25% Complete (1 of 4 deliverables)

**Completed:**
- ✅ **Class Alerts Dashboard** - Priority-based alert system with Supabase integration

**Needs Completion:**

#### 1. Attendance System 🔴 HIGH PRIORITY
**Current State:**
- ✅ UI component exists: `src/components/classroom/take-attendance.tsx`
- ✅ Database table exists: `attendance`
- ✅ Display widgets working (attendance stats in ClassOverview)
- ❌ **Missing:** Full marking workflow
- ❌ **Missing:** Save/submit functionality
- ❌ **Missing:** Parent notification triggers
- ❌ **Missing:** Historical views (weekly/monthly)
- ❌ **Missing:** Pattern detection (chronic absences)

**Impact:** Critical - Daily essential teacher function

#### 2. Grade Entry System 🔴 HIGH PRIORITY
**Current State:**
- ✅ UI components exist: `grade-entry.tsx`, `academic-record-entry.tsx`
- ✅ Database table exists: `academic_results`
- ✅ Real-time calculations working (percentage, letter grades)
- ✅ Bulk operations UI (Fill All, Clear All)
- ❌ **Missing:** Supabase save/publish integration
- ❌ **Missing:** Draft/publish workflow
- ❌ **Missing:** Bulk import (CSV/Excel)
- ❌ **Missing:** Weighted averages and GPA calculations
- ❌ **Missing:** Export functionality

**Impact:** Critical - Core teaching function

#### 3. Assignment Management ❌ NOT STARTED
**Current State:**
- ❌ No UI components
- ❌ No database tables
- ❌ No design or specification

**Impact:** High - But can be deferred if time-constrained

---

### ❌ Phase 3-5: Not Started

**Student Support:**
- ❌ Wellbeing dashboard
- ❌ Parent communication database (UI exists, needs backend)
- ❌ Enhanced case management
- ❌ Incident reporting workflow

**Reporting & Documents:**
- ❌ PTM report generation workflow
- ❌ Draft reports workspace
- ❌ Document management system
- ❌ Published reports archive

**Analytics:**
- ❌ Performance trends
- ❌ Attendance patterns
- ❌ Grade distributions

---

### 🔒 Critical Gap: Authentication

**Current State:**
- ❌ No authentication system
- ❌ Hardcoded user: `daniel.tan@school.edu.sg`
- ❌ RLS policies bypassed for development
- ❌ No login/logout UI
- ❌ No session management

**Impact:** CRITICAL - Blocks production deployment and security

---

## Priority Rankings

### 🔴 Priority 1: Must Complete Before Production

| Task | Effort | Impact | Urgency | Dependency |
|------|--------|--------|---------|------------|
| **Authentication System** | 3-4 days | Critical | Very High | Blocks RLS enforcement |
| **Complete Attendance Workflow** | 2-3 days | Critical | Very High | Daily teacher use |
| **Complete Grade Entry** | 2-3 days | Critical | High | Core teaching function |

### 🟡 Priority 2: High Value, Can Be Staged

| Task | Effort | Impact | Urgency | Dependency |
|------|--------|--------|---------|------------|
| **Parent Communication DB** | 2-3 days | High | Medium | UI already exists |
| **Update Testing Suite** | 1-2 days | High | Medium | Verify Supabase changes |
| **Assignment Management** | 3-4 days | High | Medium | New feature from scratch |

### 🟢 Priority 3: Enhancement & Future

| Task | Effort | Impact | Urgency | Dependency |
|------|--------|--------|---------|------------|
| **Student Records Integration** | 2-3 days | Medium | Low | UI exists (mock data) |
| **PTM Report Workflow** | 3-4 days | Medium | Low | Tables exist |
| **Analytics Dashboards** | 4-5 days | Medium | Low | Requires complete data |

---

## Detailed Implementation Plans

### 🔴 Priority 1A: Complete Attendance Workflow

**Estimated Effort:** 2-3 days
**Target Completion:** Week 1

**Files to Modify:**
- `src/components/classroom/take-attendance.tsx` (main component)
- `src/lib/supabase/queries.ts` (add attendance mutations)
- `src/hooks/use-attendance.ts` (create new hook)

**Tasks:**

1. **Day 1: Core Workflow**
   - [ ] Implement save attendance to Supabase
   - [ ] Add validation (prevent duplicate entries for same date)
   - [ ] Add loading states and error handling
   - [ ] Implement "Mark All Present" quick action
   - [ ] Add individual status toggles (Present/Absent/Late/Excused)
   - [ ] Add reason selection dropdown for absences

2. **Day 2: Historical Views & Analytics**
   - [ ] Create weekly grid view component
   - [ ] Create monthly calendar view component
   - [ ] Add student-level attendance history view
   - [ ] Implement pattern detection (≥2 absences = alert trigger)
   - [ ] Add attendance statistics dashboard

3. **Day 3: Parent Notifications & Polish**
   - [ ] Design parent notification trigger logic
   - [ ] Add notification preferences (immediate, daily summary, weekly)
   - [ ] Implement export to CSV functionality
   - [ ] Add attendance reports (by student, by date range)
   - [ ] Write tests for attendance workflows

**Database Changes:**
- No schema changes needed (`attendance` table already exists)
- May need to add `notification_sent` boolean column

**Success Criteria:**
- [ ] Teachers can mark attendance in < 2 minutes for 30 students
- [ ] Attendance saves successfully to Supabase
- [ ] Parent notifications trigger correctly
- [ ] Historical data displays accurately
- [ ] E2E tests pass

---

### 🔴 Priority 1B: Complete Grade Entry Integration

**Estimated Effort:** 2-3 days
**Target Completion:** Week 1

**Files to Modify:**
- `src/components/classroom/grade-entry.tsx`
- `src/components/classroom/academic-record-entry.tsx`
- `src/lib/supabase/queries.ts`
- `src/hooks/use-grades.ts` (create new)

**Tasks:**

1. **Day 1: Supabase Integration**
   - [ ] Implement save grades to `academic_results` table
   - [ ] Add draft vs published status field
   - [ ] Implement auto-save (every 30 seconds)
   - [ ] Add optimistic UI updates with SWR mutation
   - [ ] Add conflict resolution (what if 2 teachers edit simultaneously?)

2. **Day 2: Bulk Operations**
   - [ ] Implement CSV/Excel import
   - [ ] Add data validation for imports
   - [ ] Create grade calculation engine (weighted averages)
   - [ ] Implement GPA calculations
   - [ ] Add export to CSV/Excel functionality

3. **Day 3: Publishing Workflow**
   - [ ] Create draft/publish confirmation dialog
   - [ ] Implement publish workflow (lock editing after publish)
   - [ ] Add version history tracking
   - [ ] Create grade analytics dashboard (class average, distribution)
   - [ ] Write tests for grade workflows

**Database Changes:**
- Add `status` enum column: `'draft' | 'published'`
- Add `published_at` timestamp
- Add `published_by` UUID reference to teachers
- Consider `grade_versions` table for audit trail

**Success Criteria:**
- [ ] Grades save successfully to Supabase
- [ ] Draft workflow prevents accidental publishing
- [ ] Bulk import handles 40 students efficiently
- [ ] Auto-save works reliably
- [ ] Analytics display correctly

---

### 🔴 Priority 1C: Implement Authentication System

**Estimated Effort:** 3-4 days
**Target Completion:** Week 2

**Why Priority 1:** Blocks production deployment, required for RLS enforcement

**Files to Create/Modify:**
- `src/app/login/page.tsx` (new)
- `src/components/auth/login-form.tsx` (new)
- `src/middleware.ts` (update with auth checks)
- `src/lib/supabase/middleware.ts` (add route protection)
- `src/contexts/user-context.tsx` (remove hardcoded user)

**Tasks:**

1. **Day 1: Supabase Auth Setup**
   - [ ] Enable Email/Password auth in Supabase Dashboard
   - [ ] Configure auth callbacks (redirect URLs)
   - [ ] Set up email templates (welcome, reset password)
   - [ ] Test auth flow in Supabase Dashboard

2. **Day 2: Login/Logout UI**
   - [ ] Create login page with form
   - [ ] Add email/password validation
   - [ ] Implement sign-in with Supabase Auth
   - [ ] Create logout functionality in sidebar
   - [ ] Add "Forgot Password" flow
   - [ ] Create password reset page

3. **Day 3: Protected Routes & Session**
   - [ ] Update middleware to protect all routes except /login
   - [ ] Implement session refresh logic
   - [ ] Add auto-logout after 30 minutes inactivity
   - [ ] Update UserProvider to get user from auth session
   - [ ] Remove hardcoded `daniel.tan@school.edu.sg`

4. **Day 4: Enable RLS Policies**
   - [ ] Test existing RLS policies
   - [ ] Remove dev bypass policies (`20250110000007_add_dev_policies.sql`)
   - [ ] Verify teachers can only see their own classes
   - [ ] Verify form teachers have additional access
   - [ ] Create migration to remove dev bypass
   - [ ] Test all flows with RLS enabled

**Database Changes:**
- Enable Supabase Auth (already configured)
- Remove dev RLS bypass policies
- Add audit logging for auth events

**Success Criteria:**
- [ ] Teachers can log in with email/password
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect to /login
- [ ] RLS policies enforce correct data access
- [ ] Auto-logout works after inactivity

---

### 🟡 Priority 2A: Parent Communication Database

**Estimated Effort:** 2-3 days
**Target Completion:** Week 2

**Why Priority 2:** Full UI already exists, just needs backend

**Current State:**
- ✅ Complete inbox UI (5 components)
- ✅ Mock data and API routes working
- ❌ No Supabase tables

**Files to Create/Modify:**
- `supabase/migrations/20250124000001_create_messaging_tables.sql` (new)
- `src/lib/supabase/queries.ts` (add messaging queries)
- `src/app/api/conversations/route.ts` (update to use Supabase)
- `src/app/api/conversations/[id]/messages/route.ts` (update)
- `src/hooks/use-conversations.ts` (create new)

**Tasks:**

1. **Day 1: Database Design**
   - [ ] Design messaging schema:
     - `conversations` table (id, subject, created_at, updated_at)
     - `conversation_participants` table (conversation_id, user_id, user_type, role)
     - `messages` table (id, conversation_id, sender_id, content, read, sent_at)
     - `message_attachments` table (id, message_id, file_url, file_type)
   - [ ] Create migration file
   - [ ] Add RLS policies for messaging
   - [ ] Test migration locally

2. **Day 2: API Integration**
   - [ ] Update conversation API routes to use Supabase
   - [ ] Update message API routes to use Supabase
   - [ ] Add real-time subscriptions for new messages
   - [ ] Implement message search functionality
   - [ ] Add message filtering (read/unread, by participant)

3. **Day 3: UI Integration & Polish**
   - [ ] Update inbox components to use Supabase data
   - [ ] Remove mock data files
   - [ ] Add loading states and error handling
   - [ ] Implement message threading
   - [ ] Add notification badges for unread messages
   - [ ] Test full messaging workflow

**Success Criteria:**
- [ ] Messages save to Supabase
- [ ] Real-time updates work (new message appears instantly)
- [ ] Search and filtering work correctly
- [ ] RLS ensures teachers only see their conversations
- [ ] UI transitions smoothly from mock to real data

---

### 🟡 Priority 2B: Update Testing Suite

**Estimated Effort:** 1-2 days
**Target Completion:** End of Week 2

**Current State:**
- ✅ 13 Playwright tests exist (Oct 8, 2025)
- ⚠️ Tests outdated (used mock data, before Supabase)
- ❌ No tests for Supabase integration
- ❌ No error handling tests

**Tasks:**

1. **Day 1: Re-run & Update Existing Tests**
   - [ ] Set up test database (separate Supabase project or local)
   - [ ] Seed test database with known data
   - [ ] Re-run all 13 existing tests
   - [ ] Fix failing tests due to architecture changes
   - [ ] Update test data to match Supabase structure
   - [ ] Add tests for breadcrumb navigation
   - [ ] Add tests for multi-tab system

2. **Day 2: New Tests for Recent Features**
   - [ ] Add tests for student alerts widget
   - [ ] Add tests for attendance workflow (when complete)
   - [ ] Add tests for grade entry save (when complete)
   - [ ] Add tests for error states (network failure, loading)
   - [ ] Add tests for authentication flow (when complete)
   - [ ] Add tests for parent messaging (when complete)

**Success Criteria:**
- [ ] All existing tests pass with Supabase
- [ ] Test coverage > 70% for critical paths
- [ ] CI/CD integration (if applicable)
- [ ] Test documentation updated

---

## 2-Week Sprint Proposal

### Week 1: Complete Phase 2 Core Functions

**Sprint Goal:** Teachers can take attendance and enter grades with data persisting to Supabase

| Day | Morning (4 hours) | Afternoon (4 hours) |
|-----|------------------|---------------------|
| **Mon** | Attendance: Core workflow implementation | Attendance: Save to Supabase + validation |
| **Tue** | Attendance: Historical views (weekly/monthly) | Attendance: Pattern detection & analytics |
| **Wed** | Attendance: Parent notifications + export | Grade Entry: Supabase integration |
| **Thu** | Grade Entry: Auto-save + optimistic updates | Grade Entry: Bulk import CSV/Excel |
| **Fri** | Grade Entry: Publishing workflow | Grade Entry: Analytics dashboard |

**Deliverables:**
- ✅ Attendance fully functional
- ✅ Grade entry fully functional
- ✅ Data persisting to Supabase
- ✅ Basic tests for both features

---

### Week 2: Authentication + Parent Communication

**Sprint Goal:** Secure authentication + real-time parent messaging

| Day | Morning (4 hours) | Afternoon (4 hours) |
|-----|------------------|---------------------|
| **Mon** | Auth: Supabase setup + login UI | Auth: Logout + forgot password |
| **Tue** | Auth: Protected routes + middleware | Auth: Session management |
| **Wed** | Auth: Enable RLS policies | Auth: Testing + bug fixes |
| **Thu** | Messaging: Database schema + migration | Messaging: API integration |
| **Fri** | Messaging: UI integration + real-time | Testing: Update test suite |

**Deliverables:**
- ✅ Authentication working
- ✅ RLS policies enforced
- ✅ Parent messaging functional
- ✅ Test suite updated

---

## Technical Considerations

### Database Performance
- **Attendance:** Potential for large dataset (daily records × students)
  - Solution: Add indexes on `student_id`, `class_id`, `date`
  - Consider archiving old records (> 2 years)

- **Grades:** Multiple assessments per student per term
  - Solution: Add composite indexes
  - Cache calculated averages in `student_overview` table

### Real-Time Updates
- Use Supabase Realtime for:
  - New messages (immediate notification)
  - Live attendance updates (multiple teachers)
  - Grade publish events

### Error Handling
- Network failures: Show retry button, queue for later
- Concurrent edits: Last-write-wins with warning
- Database errors: Log to error tracking service

### Authentication Security
- Password requirements: Min 8 chars, must include number/symbol
- Rate limiting: Max 5 login attempts per 15 minutes
- Session timeout: 30 minutes inactivity
- Secure cookie settings: httpOnly, secure, sameSite

### Testing Strategy
- **Unit Tests:** Utility functions, calculations
- **Integration Tests:** Supabase queries, API routes
- **E2E Tests:** Critical user flows (Playwright)
- **Load Tests:** Attendance marking with 40 students

---

## Questions & Decisions Needed

### Authentication
1. **Auth Method:**
   - [ ] Email/password only?
   - [ ] Add SSO (Google Workspace, Microsoft)?
   - **Decision:** _____________

2. **User Roles:**
   - [ ] Teacher, Form Teacher, HOD, Admin?
   - [ ] Or simplified: Teacher with `is_form_teacher` flag?
   - **Decision:** _____________

3. **Password Policy:**
   - [ ] Require password changes every 90 days?
   - [ ] Two-factor authentication (2FA)?
   - **Decision:** _____________

### Parent Notifications
1. **Notification Channels:**
   - [ ] Email only?
   - [ ] SMS alerts?
   - [ ] In-app notifications?
   - **Decision:** _____________

2. **Service Integrations:**
   - [ ] Which email service? (SendGrid, AWS SES, Supabase Email)
   - [ ] Which SMS provider? (Twilio, AWS SNS)
   - **Decision:** _____________

3. **Notification Frequency:**
   - [ ] Immediate on absence?
   - [ ] Daily digest?
   - [ ] Weekly summary?
   - **Decision:** _____________

### Testing
1. **Test Database:**
   - [ ] Separate Supabase project for testing?
   - [ ] Local Supabase with Docker?
   - **Decision:** _____________

2. **CI/CD:**
   - [ ] Run tests on every commit?
   - [ ] Only on PR to main?
   - **Decision:** _____________

3. **Test Coverage Target:**
   - [ ] 70%? 80%? 90%?
   - **Decision:** _____________

### Grade Entry
1. **Publishing:**
   - [ ] Require HOD approval before publish?
   - [ ] Teachers can publish directly?
   - **Decision:** _____________

2. **Grade Calculations:**
   - [ ] Use Singapore MOE grading scale?
   - [ ] Custom grade boundaries per school?
   - **Decision:** _____________

### Assignment Management
1. **Defer or Implement?**
   - [ ] Defer to Phase 3 (after auth + messaging)?
   - [ ] Include in current sprint?
   - **Decision:** _____________

---

## Success Metrics

### After Week 1 (Phase 2 Complete)
- [ ] Teachers successfully mark attendance for 30 students in < 2 minutes
- [ ] Teachers successfully enter grades for 30 students in < 5 minutes
- [ ] 100% of attendance data persists correctly
- [ ] 100% of grade data persists correctly
- [ ] Zero data loss incidents

### After Week 2 (Auth + Messaging)
- [ ] Teachers can log in successfully (< 5 seconds)
- [ ] RLS policies block unauthorized access
- [ ] Parent messages send/receive in real-time (< 1 second)
- [ ] Zero authentication bypass incidents
- [ ] Test suite coverage > 70%

### Production Readiness Checklist
- [ ] Authentication implemented
- [ ] RLS policies enforced
- [ ] Attendance workflow complete
- [ ] Grade entry workflow complete
- [ ] Parent messaging functional
- [ ] Tests passing (> 70% coverage)
- [ ] Error handling implemented
- [ ] Performance benchmarks met (< 3s page load)
- [ ] Security audit completed
- [ ] User acceptance testing passed

---

## Related Documentation

- [Classroom Iteration Plan](../Tasks/classroom-iteration-plan.md) - Original roadmap
- [Current Architecture](../System/CURRENT_ARCHITECTURE.md) - System state
- [Supabase Implementation](../System/SUPABASE_IMPLEMENTATION.md) - Database details
- [Testing SOP](../SOP/TESTING.md) - How to run tests

---

**Next Review:** After completing Priority 1A (Attendance) or October 31, 2025 (whichever comes first)

**Last Updated:** October 24, 2025
