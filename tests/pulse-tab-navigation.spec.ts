import { test, expect } from '@playwright/test'

test.describe('Pulse Tab Navigation', () => {
  test('should show Home tab when Pulse is opened from homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Verify we're on the home page - check for home content
    await expect(page.locator('text=Class Schedule')).toBeVisible()

    // Find and click the Pulse button in page actions
    const pulseButton = page.locator('button:has-text("Pulse")')
    await pulseButton.click()

    // Wait for navigation
    await page.waitForURL('**/roundup')

    // Verify breadcrumbs show "Home > Pulse"
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('text=Pulse')).toBeVisible()

    // Verify the tab bar shows a "Home" tab (which represents the Pulse page)
    const tabBar = page.locator('[data-tab-item="true"]')
    await expect(tabBar).toBeVisible()

    // Check that the tab contains "Home" text
    await expect(tabBar.filter({ hasText: 'Home' })).toBeVisible()

    // Verify the tab is active (has the correct styling)
    const homeTab = tabBar.filter({ hasText: 'Home' })
    await expect(homeTab).toHaveClass(/bg-background/)

    // Verify we're seeing Pulse content
    await expect(page.locator('text=Daily Snapshot')).toBeVisible()
  })

  test('should replace Home tab with Pulse, not create a new tab', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Count tabs before clicking Pulse
    const tabsBefore = await page.locator('[data-tab-item="true"]').count()

    // Click Pulse button
    const pulseButton = page.locator('button:has-text("Pulse")')
    await pulseButton.click()

    // Wait for navigation
    await page.waitForURL('**/roundup')

    // Count tabs after clicking Pulse
    const tabsAfter = await page.locator('[data-tab-item="true"]').count()

    // Should have the same number of tabs (replacement, not addition)
    expect(tabsAfter).toBe(tabsBefore)
  })

  test('should navigate back to home when clicking the Home tab on Pulse page', async ({ page }) => {
    // Navigate directly to Pulse page
    await page.goto('http://localhost:3000/roundup')
    await page.waitForLoadState('networkidle')

    // Verify we're on Pulse page
    await expect(page.locator('text=Daily Snapshot')).toBeVisible()

    // Click the Home tab
    const homeTab = page.locator('[data-tab-item="true"]').filter({ hasText: 'Home' })
    await homeTab.click()

    // Should navigate back to home
    await page.waitForURL('http://localhost:3000/')

    // Verify home content is visible
    await expect(page.locator('text=Class Schedule')).toBeVisible()
  })
})
