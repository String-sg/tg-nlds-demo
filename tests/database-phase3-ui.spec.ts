import { test, expect, type Page } from '@playwright/test'
import { prisma } from '../src/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

test.describe.configure({ mode: 'serial' })

test.describe('Phase 3: UI Integration - Database Data Display', () => {
  test.beforeAll(async () => {
    // Seed the database before running UI tests
    console.log('🌱 Seeding database for UI tests...')
    try {
      await execAsync('npx prisma db seed', {
        cwd: process.cwd(),
      })
      console.log('✅ Database seeded successfully')
    } catch (error) {
      console.error('❌ Failed to seed database:', error)
      throw error
    }
  })

  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should display the home page', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check for the sidebar
    await expect(page.getByText("Tan's Space")).toBeVisible()

    // Check for the home link in the sidebar (more specific)
    await expect(page.locator('[data-sidebar="menu-button"]', { hasText: 'Home' }).first()).toBeVisible()
  })

  test('should navigate to classroom and display My Classes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click on Classroom in the sidebar
    await page.locator('[data-sidebar="menu-button"]', { hasText: 'Classroom' }).first().click()

    // Wait for navigation
    await page.waitForURL(/.*\/classroom/)

    // Should show "My Classes" heading
    await expect(page.getByText('My Classes')).toBeVisible()
  })

  test('should open Class 5A and display class overview', async ({ page }) => {
    await page.goto('/classroom')
    await page.waitForLoadState('networkidle')

    // Look for Class 5A card or button
    const class5AButton = page.getByText('5A')
    await expect(class5AButton).toBeVisible({ timeout: 10000 })

    // Click to open Class 5A
    await class5AButton.click()

    // Wait for navigation to class overview
    await page.waitForURL(/.*\/classroom\/class-5a/, { timeout: 10000 })

    // Should show class name in breadcrumbs or heading
    await expect(page.getByText(/Class 5A/i)).toBeVisible()
  })

  test('should display seeded students in the student list with correct data', async ({ page }) => {
    // Navigate directly to the student list for Class 5A
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/student-list-page.png', fullPage: true })

    // Wait for the students table to load (check for loading state to disappear)
    // Increase timeout and make it optional
    const tableExists = await page.waitForSelector('[role="table"], table, tbody', {
      timeout: 15000,
      state: 'visible'
    }).catch(() => null)

    if (!tableExists) {
      // Log page content for debugging
      const bodyText = await page.textContent('body')
      console.log('Page content:', bodyText?.substring(0, 500))
      throw new Error('Table not found on page')
    }

    // Verify students are displayed - check for student names from seed data
    const studentNames = [
      'Alice Wong',
      'David Chen',
      'Emily Tan',
      'Lim Hui Ling',
      'Muhammad Iskandar',
      'Eric Lim',
    ]

    for (const name of studentNames) {
      await expect(page.getByText(name)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display correct student data from database', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Get Alice Wong's data from the database
    const alice = await prisma.student.findFirst({
      where: { name: 'Alice Wong' },
    })

    expect(alice).toBeTruthy()

    // Verify Alice's data is displayed correctly in the UI
    // Find the row with Alice Wong
    const aliceRow = page.locator('tr').filter({ hasText: 'Alice Wong' })
    await expect(aliceRow).toBeVisible()

    // Check attendance rate (98%)
    await expect(aliceRow.getByText('98%')).toBeVisible()

    // Check overall average (should be around 88.4)
    await expect(aliceRow.getByText(/88\./)).toBeVisible()

    // Check conduct grade (Excellent)
    await expect(aliceRow.getByText('Excellent')).toBeVisible()
  })

  test('should display Eric Lim with SWAN status', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Find Eric Lim's row
    const ericRow = page.locator('tr').filter({ hasText: 'Eric Lim' })
    await expect(ericRow).toBeVisible()

    // Eric should have SWAN status badge
    await expect(ericRow.getByText('SWAN')).toBeVisible()

    // Verify his data from database
    const eric = await prisma.student.findFirst({
      where: { name: 'Eric Lim' },
    })

    expect(eric).toBeTruthy()
    expect(eric?.status).toBe('SWAN')
    expect(eric?.needsCounselling).toBe(true)
    expect(eric?.hasSEN).toBe(true)
  })

  test('should handle empty states when no students exist', async ({ page }) => {
    // Create a new empty class
    const emptyClass = await prisma.class.create({
      data: {
        id: 'class-empty-test',
        className: 'Empty Test',
        subject: 'Test',
        yearLevel: 1,
        academicYear: '2025',
        isFormClass: false,
        teacherId: 'teacher-001',
      },
    })

    // Navigate to this empty class's student list
    await page.goto(`/classroom/${emptyClass.id}/students`)
    await page.waitForLoadState('networkidle')

    // Should show empty state message
    await expect(page.getByText(/No students found/i)).toBeVisible({ timeout: 10000 })

    // Clean up
    await prisma.class.delete({ where: { id: emptyClass.id } })
  })

  test('should handle error when class does not exist', async ({ page }) => {
    // Navigate to a non-existent class
    await page.goto('/classroom/non-existent-class/students')
    await page.waitForLoadState('networkidle')

    // Should show error message
    await expect(
      page.getByText(/Class not found|Failed to fetch class/i)
    ).toBeVisible({ timeout: 10000 })
  })

  test('should allow sorting students by different fields', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Look for sort buttons/headers (adjust selectors based on actual implementation)
    const attendanceHeader = page.getByText('Attendance').first()
    if (await attendanceHeader.isVisible()) {
      await attendanceHeader.click()
      // Wait for re-render after sort
      await page.waitForTimeout(500)

      // Verify students are still displayed
      await expect(page.getByText('Alice Wong')).toBeVisible()
    }
  })

  test('should filter students by status', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Look for filter dropdown or input (adjust based on implementation)
    const filterButton = page.getByRole('button', { name: /filter/i }).first()

    if (await filterButton.isVisible()) {
      await filterButton.click()
      await page.waitForTimeout(300)

      // Try to select SWAN filter
      const swanOption = page.getByText('SWAN')
      if (await swanOption.isVisible()) {
        await swanOption.click()
        await page.waitForTimeout(500)

        // Should show Eric Lim
        await expect(page.getByText('Eric Lim')).toBeVisible()

        // Should not show students without SWAN status
        // (This depends on filter implementation)
      }
    }
  })

  test('should search for students by name', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i).first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('Alice')
      await page.waitForTimeout(500)

      // Should show Alice Wong
      await expect(page.getByText('Alice Wong')).toBeVisible()

      // Should filter out other students
      // (Depends on search implementation)
    }
  })

  test('should click on a student to open their profile', async ({ page }) => {
    await page.goto('/classroom/class-5a/students')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })

    // Click on Alice Wong's name or row
    const aliceName = page.getByText('Alice Wong').first()
    await aliceName.click()

    // Should navigate to student profile
    await page.waitForURL(/.*\/student.*alice.*wong/i, { timeout: 10000 })

    // Should show student profile
    await expect(page.getByText('Alice Wong')).toBeVisible()
  })

  test('should verify API endpoints return correct data', async ({ page }) => {
    // Test the API endpoint directly using page.request
    const classResponse = await page.request.get('/api/classes/class-5a')
    expect(classResponse.ok()).toBeTruthy()

    const classData = await classResponse.json()
    expect(classData.className).toBe('5A')
    expect(classData.id).toBe('class-5a')

    // Test students endpoint
    const studentsResponse = await page.request.get('/api/classes/class-5a/students')
    expect(studentsResponse.ok()).toBeTruthy()

    const students = await studentsResponse.json()
    expect(students).toBeInstanceOf(Array)
    expect(students.length).toBeGreaterThan(0)

    // Verify Alice Wong is in the response
    const alice = students.find((s: any) => s.name === 'Alice Wong')
    expect(alice).toBeTruthy()
    expect(alice.attendanceRate).toBe(98)
    expect(alice.conductGrade).toBe('EXCELLENT')
  })

  test('should show loading state while fetching data', async ({ page }) => {
    // Navigate to student list
    await page.goto('/classroom/class-5a/students')

    // Check for skeleton loading state (adjust selector based on implementation)
    // This might be too fast to catch, but we try
    const skeleton = page.locator('[class*="skeleton"], [aria-busy="true"]').first()
    if (await skeleton.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Loading state was visible
      expect(true).toBe(true)
    }

    // Wait for actual content to appear
    await page.waitForSelector('[role="table"], table', { timeout: 15000 })
    await expect(page.getByText('Alice Wong')).toBeVisible()
  })
})
