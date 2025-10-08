import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Classroom Routing Hierarchy - Tab Replacement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should replace classroom tab when opening a class', async ({ page }) => {
    // Navigate to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Classroom

    // Click on Class 5A - should replace Classroom tab
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300) // Give React time to settle state

    // Should still have 2 tabs (Home + Class 5A), classroom tab was replaced
    await expect(tabs).toHaveCount(2)

    // Verify the classroom tab no longer exists
    await expect(page.getByRole('button', { name: /^Classroom Close Classroom$/i })).not.toBeVisible()

    // Verify Class 5A tab exists
    await expect(page.getByRole('button', { name: /Class 5A/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-classroom-to-class.png', fullPage: true })
  })

  test('should replace class tab when opening student details', async ({ page }) => {
    // Navigate to Classroom → Class 5A
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Click on Alice Wong - should replace Class 5A tab
    await page.getByText('Alice Wong').click()
    await page.waitForURL('**/classroom/class-5a/student/alice-wong')
    await page.waitForTimeout(300)

    // Should still have 2 tabs (Home + Alice Wong), class tab was replaced
    await expect(tabs).toHaveCount(2)

    // Verify Class 5A tab no longer exists
    await expect(page.getByRole('button', { name: /^Class 5A Close Class 5A$/i })).not.toBeVisible()

    // Verify student name appears in tab
    await expect(page.getByRole('button', { name: /Alice Wong/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-class-to-student.png', fullPage: true })
  })

  test('should replace class tab when opening grades', async ({ page }) => {
    // Navigate to Classroom → Class 5A
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Click Enter Grades - should replace Class 5A tab
    await page.getByRole('button', { name: /Enter Grades/i }).click()
    await page.waitForURL('**/classroom/class-5a/grades')
    await page.waitForTimeout(300)

    // Should still have 2 tabs (Home + 5A Grades), class tab was replaced
    await expect(tabs).toHaveCount(2)

    // Verify grades tab label
    await expect(page.getByRole('button', { name: /Class 5A Grades/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-class-to-grades.png', fullPage: true })
  })

  test('should replace student tab with class tab when clicking back', async ({ page }) => {
    // Navigate to student profile
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.getByText('Alice Wong').click()
    await page.waitForURL('**/classroom/class-5a/student/alice-wong')
    await page.waitForTimeout(300)

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Alice Wong

    // Click Back button - should replace student tab with class tab
    await page.getByRole('button', { name: /Back/i }).first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    // Should still have 2 tabs (Home + Class 5A)
    await expect(tabs).toHaveCount(2)

    // Verify student tab no longer exists
    await expect(page.getByRole('button', { name: /Alice Wong/i })).not.toBeVisible()

    // Verify Class 5A tab is back
    await expect(page.getByRole('button', { name: /Class 5A/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-student-back-to-class.png', fullPage: true })
  })

  test('should replace grades tab with class tab when clicking back', async ({ page }) => {
    // Navigate to grades
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.getByRole('button', { name: /Enter Grades/i }).click()
    await page.waitForURL('**/classroom/class-5a/grades')
    await page.waitForTimeout(300)

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Class 5A Grades

    // Click Back button - should replace grades tab with class tab
    await page.getByRole('button', { name: /Back to Class Overview/i }).click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    // Should still have 2 tabs (Home + Class 5A)
    await expect(tabs).toHaveCount(2)

    // Verify grades tab no longer exists
    await expect(page.getByRole('button', { name: /Class 5A Grades/i })).not.toBeVisible()

    // Verify Class 5A tab is back
    await expect(page.getByRole('button', { name: /Class 5A/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-grades-back-to-class.png', fullPage: true })
  })

  test('should replace class tab with classroom tab when clicking back', async ({ page }) => {
    // Navigate to class
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Click Back to My Classes - should replace class tab with classroom tab
    await page.getByRole('button', { name: /Back to My Classes/i }).click()
    await page.waitForURL('**/classroom')
    await page.waitForTimeout(300)

    // Should still have 2 tabs (Home + Classroom)
    await expect(tabs).toHaveCount(2)

    // Verify Class 5A tab no longer exists
    await expect(page.getByRole('button', { name: /Class 5A/i })).not.toBeVisible()

    // Verify Classroom tab is back
    await expect(page.getByRole('button', { name: /Classroom/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-class-back-to-classroom.png', fullPage: true })
  })

  test('should maintain hierarchy through full navigation flow', async ({ page }) => {
    const tabs = page.locator('[data-tab-item]')

    // Start with Home tab
    await expect(tabs).toHaveCount(1) // Home

    // Navigate: Home → Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Classroom

    // Navigate: Classroom → Class 5A (replaces Classroom)
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Navigate: Class 5A → Alice Wong (replaces Class 5A)
    await page.getByText('Alice Wong').click()
    await page.waitForURL('**/classroom/class-5a/student/alice-wong')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Alice Wong

    // Navigate back: Alice Wong → Class 5A (replaces Alice Wong)
    await page.getByRole('button', { name: /Back/i }).first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Navigate: Class 5A → Grades (replaces Class 5A)
    await page.getByRole('button', { name: /Enter Grades/i }).click()
    await page.waitForURL('**/classroom/class-5a/grades')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Class 5A Grades

    // Navigate back: Grades → Class 5A (replaces Grades)
    await page.getByRole('button', { name: /Back to Class Overview/i }).click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Navigate back: Class 5A → Classroom (replaces Class 5A)
    await page.getByRole('button', { name: /Back to My Classes/i }).click()
    await page.waitForURL('**/classroom')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Classroom

    await page.screenshot({ path: 'tests/screenshots/hierarchy-full-flow.png', fullPage: true })
  })

  test('should handle multiple top-level tabs with nested hierarchies', async ({ page }) => {
    const tabs = page.locator('[data-tab-item]')

    // Open Classroom → Class 5A
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(2) // Home + Class 5A

    // Open Explore (new top-level tab)
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Explore' }).click()
    await page.waitForURL('**/explore')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(3) // Home + Class 5A + Explore

    // Switch back to Class 5A tab
    await page.getByRole('button', { name: /Class 5A/i }).click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    // Navigate to student (should replace Class 5A, but keep Explore)
    await page.getByText('Alice Wong').click()
    await page.waitForURL('**/classroom/class-5a/student/alice-wong')
    await page.waitForTimeout(300)
    await expect(tabs).toHaveCount(3) // Home + Alice Wong + Explore

    // Verify Class 5A was replaced but Explore still exists
    await expect(page.getByRole('button', { name: /^Class 5A Close Class 5A$/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /Explore/i })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/hierarchy-multiple-top-level.png', fullPage: true })
  })

  test('should maintain correct URL structure', async ({ page }) => {
    // Navigate through hierarchy and verify URLs
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await expect(page).toHaveURL(/.*\/classroom$/)

    await page.getByText('Class 5A').first().click()
    await expect(page).toHaveURL(/.*\/classroom\/class-5a$/)

    await page.getByText('Alice Wong').click()
    await expect(page).toHaveURL(/.*\/classroom\/class-5a\/student\/alice-wong$/)

    await page.getByRole('button', { name: /Back/i }).first().click()
    await expect(page).toHaveURL(/.*\/classroom\/class-5a$/)

    await page.getByRole('button', { name: /Enter Grades/i }).click()
    await expect(page).toHaveURL(/.*\/classroom\/class-5a\/grades$/)

    await page.screenshot({ path: 'tests/screenshots/hierarchy-url-structure.png', fullPage: true })
  })

  test('should not have duplicate tabs in the UI', async ({ page }) => {
    const tabs = page.locator('[data-tab-item]')

    // Navigate through several levels
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForTimeout(300)
    await page.getByText('Alice Wong').click()
    await page.waitForTimeout(300)

    // Get all tab texts
    const tabCount = await tabs.count()
    const tabTexts: string[] = []

    for (let i = 0; i < tabCount; i++) {
      const text = await tabs.nth(i).innerText()
      tabTexts.push(text)
    }

    // Check for duplicates
    const uniqueTabs = new Set(tabTexts)
    expect(uniqueTabs.size).toBe(tabTexts.length)

    await page.screenshot({ path: 'tests/screenshots/hierarchy-no-duplicates.png', fullPage: true })
  })

  test('should display correct student name on profile page', async ({ page }) => {
    // Navigate to Classroom → Class 5A → Alice Wong
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom/class-5a')
    await page.waitForTimeout(300)

    // Click on Alice Wong in the student table
    await page.getByText('Alice Wong').click()
    await page.waitForURL('**/classroom/class-5a/student/alice-wong')
    await page.waitForTimeout(500) // Give time for state to update

    // Check that the student profile shows "Alice Wong" not "Unknown Student"
    const heading = page.locator('h1, h2').first()
    const headingText = await heading.textContent()

    // Should NOT contain "Unknown Student"
    expect(headingText).not.toContain('Unknown Student')

    // Should contain the actual student name
    expect(headingText).toContain('Alice Wong')

    await page.screenshot({ path: 'tests/screenshots/student-name-display.png', fullPage: true })
  })
})
