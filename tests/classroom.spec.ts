import { test, expect } from '@playwright/test'

// Configure test to use the dev server
const BASE_URL = 'http://localhost:3000'

test.describe('Classroom Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to My Classes from sidebar', async ({ page }) => {
    // Click Classroom in sidebar using data attribute
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()

    // Wait for My Classes to load
    await expect(page.getByText('My Classroom')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Form Class' })).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/my-classes.png', fullPage: true })
  })

  test('should open Class 5A overview', async ({ page }) => {
    // Navigate to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await expect(page.getByText('My Classroom')).toBeVisible()

    // Click on Class 5A card
    await page.getByText('Class 5A').first().click()

    // Wait for Class Overview to load
    await expect(page.getByText('Today\'s Snapshot')).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/class-5a-overview.png', fullPage: true })
  })

  test('should show student list on Class Overview', async ({ page }) => {
    // Navigate to Classroom → Class 5A
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()

    // Verify student list is visible on class overview
    await expect(page.getByText(/Students \(\d+\)/)).toBeVisible()
    await expect(page.getByPlaceholder('Search students...')).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/student-list.png', fullPage: true })
  })

  test('should search for students', async ({ page }) => {
    // Navigate to Class Overview
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()

    // Search for "Wong"
    const searchBox = page.getByPlaceholder('Search students...')
    await searchBox.fill('Wong')

    // Wait for filtered results
    await page.waitForTimeout(500)

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/student-search.png', fullPage: true })
  })

  test('should open student profile from class overview', async ({ page }) => {
    // Navigate to Class Overview
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()

    // Click on first student (Alice Wong)
    await page.getByText('Alice Wong').click()

    // Wait for Student Profile to load
    await expect(page.getByRole('heading', { name: /Student Profile/i })).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/student-profile.png', fullPage: true })
  })

  test('should have multiple classroom tabs open', async ({ page }) => {
    // Navigate to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()

    // Open Class 5A
    await page.getByText('Class 5A').first().click()
    await expect(page.getByText('Today\'s Snapshot')).toBeVisible()

    // Open Class 6B by clicking Classroom in sidebar again
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 6B').first().click()

    // Verify both tabs exist in tab bar
    await expect(page.getByRole('button', { name: /Class 5A Close Class 5A/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Class 6B Close Class 6B/i })).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/multiple-tabs.png', fullPage: true })
  })

  test('should show correct tab labels', async ({ page }) => {
    // Navigate to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()

    // Open Class 5A
    await page.getByText('Class 5A').first().click()

    // Check tab labels
    await expect(page.getByRole('button', { name: /Classroom Close Classroom/i })).toBeVisible() // Original tab
    await expect(page.getByRole('button', { name: /Class 5A Close Class 5A/i })).toBeVisible() // Class overview tab

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/tab-labels.png', fullPage: true })
  })

  test('should open grade entry from Class Overview', async ({ page }) => {
    // Navigate to Classroom → Class 5A
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()

    // Click Enter Grades button
    await page.getByRole('button', { name: /Enter Grades/i }).click()

    // Wait for Grade Entry to load
    await expect(page.getByRole('heading', { name: 'Grade Entry' }).first()).toBeVisible()
    await expect(page.getByText('Assessment Details')).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/grade-entry.png', fullPage: true })
  })

  test('should enter grades and calculate percentages', async ({ page }) => {
    // Navigate to Grade Entry
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.getByRole('button', { name: /Enter Grades/i }).click()

    // Fill in assessment details
    await page.getByPlaceholder('e.g., Mid-Term Exam').fill('Mathematics Quiz 1')
    await page.locator('input[type="number"]').first().fill('50') // Max score

    // Enter a score for the first student (should be 50% for score of 25)
    const firstScoreInput = page.locator('tbody tr').first().locator('input[type="number"]')
    await firstScoreInput.fill('25')

    // Verify percentage is calculated (25/50 = 50%)
    await expect(page.locator('tbody tr').first().getByText('50%')).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/grade-calculation.png', fullPage: true })
  })

  test('should bulk fill grades', async ({ page }) => {
    // Navigate to Grade Entry
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.getByRole('button', { name: /Enter Grades/i }).click()

    // Click Fill All Max Score button
    await page.getByRole('button', { name: /Fill All Max Score/i }).click()

    // Verify first student has max score (100)
    await expect(page.locator('tbody tr').first().locator('input[type="number"]')).toHaveValue('100')

    // Verify percentage is 100%
    await expect(page.locator('tbody tr').first().getByText('100%')).toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/bulk-fill-grades.png', fullPage: true })
  })

  test('should complete full teacher workflow', async ({ page }) => {
    // 1. Start from sidebar
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await expect(page.getByText('My Classroom')).toBeVisible()

    // 2. Open Class 5A
    await page.getByText('Class 5A').first().click()
    await expect(page.getByText('Today\'s Snapshot')).toBeVisible()

    // 3. Enter grades for an assessment
    await page.getByRole('button', { name: /Enter Grades/i }).click()
    await expect(page.getByText('Assessment Details')).toBeVisible()

    // Fill assessment details
    await page.getByPlaceholder('e.g., Mid-Term Exam').fill('Unit Test Chapter 1')

    // Enter grades for first 3 students
    const scoreInputs = page.locator('tbody tr input[type="number"]')
    await scoreInputs.nth(0).fill('85')
    await scoreInputs.nth(1).fill('92')
    await scoreInputs.nth(2).fill('78')

    // Verify calculations
    await expect(page.locator('tbody tr').nth(0).getByText('85%')).toBeVisible()
    await expect(page.locator('tbody tr').nth(1).getByText('92%')).toBeVisible()
    await expect(page.locator('tbody tr').nth(2).getByText('78%')).toBeVisible()

    // 4. Navigate back to class overview
    await page.getByRole('button', { name: /Back to Class Overview/i }).click()
    await expect(page.getByText('Today\'s Snapshot')).toBeVisible()

    // 5. Verify student list is visible on class overview
    await expect(page.getByText(/Students \(\d+\)/)).toBeVisible()

    // 6. Search for a student
    const searchBox = page.getByPlaceholder('Search students...')
    await searchBox.fill('Alice')
    await page.waitForTimeout(300)

    // 7. Open student profile
    await page.getByText('Alice Wong').click()
    await expect(page.getByRole('heading', { name: /Student Profile/i })).toBeVisible()

    // Screenshot final state
    await page.screenshot({ path: 'tests/screenshots/full-workflow.png', fullPage: true })
  })
})
