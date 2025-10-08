import { test, expect } from '@playwright/test'

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Wait for page to load
    await expect(page.getByRole('button', { name: /Home/i }).first()).toBeVisible()
  })

  test('should open new tab when clicking different sidebar items', async ({ page }) => {
    // Start at Home
    await expect(page.getByRole('button', { name: /Home/i }).first()).toBeVisible()

    // Click Explore in sidebar
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Explore' }).click()
    await page.waitForURL('**/explore')

    // Should have Home and Explore tabs
    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2)
    await page.waitForTimeout(100) // Give React time to settle state

    // Click Draft in sidebar
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Draft' }).click()
    await page.waitForURL('**/draft')
    await page.waitForTimeout(100) // Give React time to settle state

    // Should have Home, Explore, and Draft tabs
    await expect(tabs).toHaveCount(3)

    await page.screenshot({ path: 'tests/screenshots/multiple-sidebar-tabs.png', fullPage: true })
  })

  test('should open new tab when navigating within classroom context', async ({ page }) => {
    // Go to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(2) // Home + Classroom

    // Click Class 5A
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom-class-5a')

    // Should now have 3 tabs (Home + Classroom + Class 5A) - always opens new tabs
    await expect(tabs).toHaveCount(3)

    await page.screenshot({ path: 'tests/screenshots/classroom-new-tab.png', fullPage: true })
  })

  test('should create new classroom tab when clicking sidebar from class detail', async ({ page }) => {
    // Go to Classroom
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')

    // Click Class 5A
    await page.getByText('Class 5A').first().click()
    await page.waitForURL('**/classroom-class-5a')

    const tabs = page.locator('[data-tab-item]')
    await expect(tabs).toHaveCount(3) // Home + Classroom + Class 5A (always opens new tabs)

    // Click Classroom in sidebar again
    await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')

    // Should still have 3 tabs (Classroom already exists, switches to it)
    await expect(tabs).toHaveCount(3)

    await page.screenshot({ path: 'tests/screenshots/new-classroom-tab.png', fullPage: true })
  })
})
