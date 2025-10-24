# Testing Standard Operating Procedure

**Document Type:** SOP (Standard Operating Procedure)
**Last Updated:** October 24, 2025
**Applies To:** All developers working on moe-tg-vx
**Review Frequency:** Quarterly or when testing strategy changes

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Types & When to Use Them](#test-types--when-to-use-them)
4. [Setting Up Your Test Environment](#setting-up-your-test-environment)
5. [Running Tests](#running-tests)
6. [Writing New Tests](#writing-new-tests)
7. [Test Data Management](#test-data-management)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This document provides step-by-step instructions for running, writing, and maintaining tests for the MOE Teacher-Student Management System. We use **Playwright** for end-to-end testing.

**Current Test Framework:**
- **E2E Tests:** Playwright Test
- **Unit Tests:** Not yet implemented (planned: Jest/Vitest)
- **Integration Tests:** Not yet implemented

---

## Testing Philosophy

### What We Test

**Priority Order:**
1. **Critical User Flows** - Features teachers use daily (attendance, grades, student profiles)
2. **Data Integrity** - Ensuring data saves/loads correctly from Supabase
3. **Navigation** - Tab system, breadcrumbs, routing
4. **Error Handling** - Network failures, loading states, validation
5. **Authentication** - Login, logout, protected routes (when implemented)

### Test Coverage Goals

- **Critical Paths:** 100% coverage (attendance, grades, student data)
- **Core Features:** 80% coverage (navigation, profiles, messaging)
- **Nice-to-Have Features:** 50% coverage (analytics, exports)

**Overall Target:** Minimum 70% coverage for production deployment

---

## Test Types & When to Use Them

### 1. End-to-End (E2E) Tests

**What:** Tests complete user workflows from start to finish in a real browser

**When to Use:**
- Testing multi-step workflows (e.g., "Take attendance → Save → View report")
- Verifying navigation flows
- Testing interactions across multiple components
- Ensuring Supabase integration works end-to-end

**Tool:** Playwright

**Example:**
```typescript
test('teacher can mark attendance and save', async ({ page }) => {
  await page.goto('/classroom/class-5a')
  await page.click('text=Take Attendance')
  await page.click('text=Mark All Present')
  await page.click('text=Save Attendance')
  await expect(page.locator('text=Saved successfully')).toBeVisible()
})
```

### 2. Integration Tests

**What:** Tests how different parts of the system work together (API + Database)

**When to Use:**
- Testing Supabase query functions
- Testing API routes with database
- Testing data transformations (adapters)

**Tool:** Jest/Vitest (planned)

**Example:**
```typescript
test('getStudentProfile returns correct data', async () => {
  const supabase = createTestClient()
  const { data, error } = await getStudentFullProfile(supabase, 'Alice Wong')

  expect(error).toBeNull()
  expect(data).toMatchObject({
    name: 'Alice Wong',
    form_class: 'Primary 5A'
  })
})
```

### 3. Unit Tests

**What:** Tests individual functions in isolation

**When to Use:**
- Testing utility functions (calculations, formatters)
- Testing helper methods
- Testing hooks (custom React hooks)

**Tool:** Jest/Vitest (planned)

**Example:**
```typescript
test('calculateAttendanceRate returns correct percentage', () => {
  const rate = calculateAttendanceRate(18, 20)
  expect(rate).toBe(90)
})
```

---

## Setting Up Your Test Environment

### Prerequisites

1. **Node.js** (v20+)
2. **npm** or **yarn**
3. **Supabase** account (or local Supabase)

### Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Test Database Setup

**Option 1: Separate Supabase Project (Recommended)**

1. Create a new Supabase project named "moe-tg-test"
2. Copy `.env.local.example` to `.env.test.local`
3. Add test database credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
   ```
4. Run migrations:
   ```bash
   npx supabase db push --db-url postgresql://...
   ```
5. Seed test data:
   ```bash
   npm run test:seed
   ```

**Option 2: Local Supabase (Docker)**

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
npx supabase start

# Migrations auto-apply to local instance
# Seed with test data
npm run test:seed-local
```

### Environment Variables

Create `.env.test.local` (gitignored):

```env
# Test Database
NEXT_PUBLIC_SUPABASE_URL=your-test-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-key

# Test User Credentials
TEST_USER_EMAIL=test.teacher@school.edu.sg
TEST_USER_PASSWORD=TestPassword123!

# Test Mode
NODE_ENV=test
```

---

## Running Tests

### Run All Tests

```bash
# Run all Playwright tests
npm run test:e2e

# Or directly with Playwright
npx playwright test
```

### Run Specific Tests

```bash
# Run tests in a specific file
npx playwright test tests/classroom.spec.ts

# Run a specific test by name
npx playwright test -g "mark attendance"

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with UI mode (interactive)
npx playwright test --ui
```

### Run Tests with Different Browsers

```bash
# Chrome/Chromium only
npx playwright test --project=chromium

# All browsers (Chrome, Firefox, Safari)
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Debug Tests

```bash
# Run in debug mode (step through)
npx playwright test --debug

# Run with Playwright Inspector
PWDEBUG=1 npx playwright test
```

### View Test Report

```bash
# Generate and open HTML report
npx playwright show-report
```

---

## Writing New Tests

### File Organization

```
tests/
├── e2e/
│   ├── classroom/
│   │   ├── attendance.spec.ts
│   │   ├── grades.spec.ts
│   │   └── students.spec.ts
│   ├── auth/
│   │   └── login.spec.ts
│   └── navigation/
│       └── tabs.spec.ts
├── fixtures/
│   └── test-data.ts
└── helpers/
    └── common-actions.ts
```

### Test File Template

```typescript
import { test, expect } from '@playwright/test'

// Describe the feature/module
test.describe('Attendance Marking', () => {

  // Run before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to starting point
    await page.goto('/')

    // Login (if auth is implemented)
    // await loginAsTeacher(page)

    // Navigate to feature
    await page.click('text=My Classes')
    await page.click('text=Class 5A')
  })

  // Individual test case
  test('can mark all students as present', async ({ page }) => {
    // Arrange: Set up test state
    await page.click('text=Take Attendance')

    // Act: Perform action
    await page.click('text=Mark All Present')

    // Assert: Verify expected outcome
    const presentCount = await page.locator('.status-present').count()
    expect(presentCount).toBe(34) // Assuming 34 students in Class 5A
  })

  test('can mark individual student as absent', async ({ page }) => {
    await page.click('text=Take Attendance')

    // Find specific student row
    const aliceRow = page.locator('tr:has-text("Alice Wong")')
    await aliceRow.locator('button[aria-label="Mark Absent"]').click()

    // Verify status changed
    await expect(aliceRow.locator('.status-absent')).toBeVisible()
  })
})
```

### Writing Good Tests

**DO:**
- ✅ Use descriptive test names: `'teacher can save attendance and see confirmation'`
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Test one thing per test
- ✅ Use data-testid attributes for critical elements
- ✅ Wait for elements explicitly: `await expect(element).toBeVisible()`
- ✅ Clean up test data after tests (if applicable)

**DON'T:**
- ❌ Use brittle selectors: `page.locator('div > div > button')` (use text or data-testid)
- ❌ Add arbitrary waits: `await page.waitForTimeout(3000)`
- ❌ Test implementation details (internal state)
- ❌ Make tests depend on each other
- ❌ Hard-code test data in tests (use fixtures)

### Selector Priority

1. **Best:** Role or accessible name
   ```typescript
   page.getByRole('button', { name: 'Save' })
   ```

2. **Good:** Test IDs
   ```typescript
   page.locator('[data-testid="save-button"]')
   ```

3. **Acceptable:** Text content
   ```typescript
   page.locator('text=Save Attendance')
   ```

4. **Avoid:** CSS selectors
   ```typescript
   page.locator('.btn-primary') // Fragile if CSS changes
   ```

---

## Test Data Management

### Using Fixtures

Create reusable test data:

```typescript
// tests/fixtures/students.ts
export const testStudents = [
  {
    id: 'test-student-1',
    name: 'Alice Wong',
    form_class: 'Primary 5A'
  },
  {
    id: 'test-student-2',
    name: 'Bob Tan',
    form_class: 'Primary 5A'
  }
]
```

Use in tests:

```typescript
import { testStudents } from '../fixtures/students'

test('displays all students', async ({ page }) => {
  await page.goto('/classroom/class-5a/students')

  for (const student of testStudents) {
    await expect(page.locator(`text=${student.name}`)).toBeVisible()
  }
})
```

### Database Seeding

Create seed scripts for test data:

```typescript
// tests/helpers/seed-database.ts
import { createClient } from '@/lib/supabase/client'

export async function seedTestData() {
  const supabase = createClient()

  // Clear existing test data
  await supabase.from('students').delete().like('email', '%@test.com')

  // Insert test students
  const { error } = await supabase.from('students').insert([
    { name: 'Test Student 1', email: 'student1@test.com' },
    { name: 'Test Student 2', email: 'student2@test.com' }
  ])

  if (error) throw error
}
```

### Cleanup Strategy

**Option 1: Clean after each test**
```typescript
test.afterEach(async () => {
  // Delete test data created during test
  await cleanupTestData()
})
```

**Option 2: Use test database that resets**
- Better for consistent test runs
- Use separate Supabase project or local instance
- Reset database before each test run

---

## Best Practices

### 1. Test Independence

Each test should work standalone:

```typescript
// ✅ Good: Test creates its own data
test('can edit student profile', async ({ page }) => {
  await createTestStudent({ name: 'Test Student' })
  await page.goto('/student/test-student')
  // ... test logic
})

// ❌ Bad: Depends on previous test
test('can delete student', async ({ page }) => {
  // Assumes student from previous test exists
  await page.goto('/student/test-student')
})
```

### 2. Waiting for Elements

Always wait explicitly:

```typescript
// ✅ Good: Wait for specific condition
await expect(page.locator('text=Saved')).toBeVisible()

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(3000)
```

### 3. Parallel Execution

Tests should be able to run in parallel:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 6, // Run 6 tests in parallel
  fullyParallel: true
})
```

Ensure tests don't conflict:
- Use unique test data per test
- Avoid shared state
- Use test database isolation

### 4. Screenshots on Failure

Automatically capture failures:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
})
```

### 5. Page Object Pattern

For complex features, use Page Objects:

```typescript
// tests/pages/attendance-page.ts
export class AttendancePage {
  constructor(private page: Page) {}

  async markAllPresent() {
    await this.page.click('text=Mark All Present')
  }

  async markStudentAbsent(studentName: string) {
    const row = this.page.locator(`tr:has-text("${studentName}")`)
    await row.locator('button[aria-label="Mark Absent"]').click()
  }

  async saveAttendance() {
    await this.page.click('text=Save Attendance')
    await expect(this.page.locator('text=Saved successfully')).toBeVisible()
  }
}

// Use in test
test('mark attendance', async ({ page }) => {
  const attendancePage = new AttendancePage(page)
  await attendancePage.markAllPresent()
  await attendancePage.markStudentAbsent('Alice Wong')
  await attendancePage.saveAttendance()
})
```

---

## Troubleshooting

### Tests Timing Out

**Symptom:** Tests fail with "Timeout 30000ms exceeded"

**Solutions:**
1. Increase timeout for slow operations:
   ```typescript
   test('slow operation', async ({ page }) => {
     test.setTimeout(60000) // 60 seconds
   })
   ```

2. Check if element selector is correct:
   ```typescript
   // Debug: See what's on the page
   console.log(await page.content())
   ```

3. Wait for network idle:
   ```typescript
   await page.goto('/page', { waitUntil: 'networkidle' })
   ```

### Flaky Tests

**Symptom:** Tests pass sometimes, fail other times

**Solutions:**
1. Add explicit waits:
   ```typescript
   await expect(element).toBeVisible()
   ```

2. Wait for API calls to complete:
   ```typescript
   await page.waitForResponse(response =>
     response.url().includes('/api/students')
   )
   ```

3. Disable animations in test mode:
   ```css
   /* globals.css */
   @media (prefers-reduced-motion) {
     * { animation-duration: 0s !important; }
   }
   ```

### Database Connection Issues

**Symptom:** Tests fail with "Connection refused" or "Network error"

**Solutions:**
1. Check `.env.test.local` has correct credentials
2. Verify test database is running (for local Supabase)
3. Check network/firewall settings
4. Verify Supabase project is not paused

### Test Data Not Found

**Symptom:** Tests fail with "element not found" but data should exist

**Solutions:**
1. Run seed script before tests:
   ```bash
   npm run test:seed && npm run test:e2e
   ```

2. Check RLS policies aren't blocking test data:
   ```sql
   -- Temporarily disable RLS for test database
   ALTER TABLE students DISABLE ROW LEVEL SECURITY;
   ```

3. Verify test user has correct permissions

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_KEY }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Metrics & Reporting

### Coverage Report

```bash
# Generate coverage report (when unit tests implemented)
npm run test:coverage
```

### Test Report Dashboard

After running tests:

```bash
npx playwright show-report
```

Includes:
- Pass/fail status for each test
- Test duration
- Screenshots on failure
- Trace files for debugging

---

## Next Steps

### Immediate Actions
- [ ] Set up test database (separate Supabase project or local)
- [ ] Run existing 13 Playwright tests to verify they still pass
- [ ] Add tests for new Supabase-integrated features
- [ ] Implement authentication tests (when auth is ready)

### Future Improvements
- [ ] Add unit tests with Jest/Vitest
- [ ] Add integration tests for API routes
- [ ] Set up CI/CD pipeline
- [ ] Implement visual regression testing
- [ ] Add performance testing (Lighthouse CI)

---

## Related Documentation

- [Test Results Archive](../Archive/TEST_RESULTS_OCT_2025.md) - Historical test results
- [Current Architecture](../System/CURRENT_ARCHITECTURE.md) - System overview
- [Database Migrations](./DATABASE_MIGRATIONS.md) - Database setup
- [Playwright Documentation](https://playwright.dev) - Official Playwright docs

---

**Document Owner:** Development Team
**Last Review:** October 24, 2025
**Next Review:** January 2026
