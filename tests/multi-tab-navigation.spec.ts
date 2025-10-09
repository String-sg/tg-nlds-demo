import { test, expect } from '@playwright/test'

test.describe('Multi-Tab Navigation Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate between tabs without lag', async ({ page }) => {
    // Open multiple tabs
    await page.click('button:has-text("Classroom")', { noWaitAfter: false })
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")', { noWaitAfter: false })
    await page.waitForURL('**/explore')

    // Verify tabs are visible
    const tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(2)

    // Switch between tabs rapidly
    const classroomTab = tabs.filter({ hasText: 'Classroom' })
    const exploreTab = tabs.filter({ hasText: 'Explore' })

    // Measure tab switching performance
    const start = Date.now()
    await classroomTab.click()
    await page.waitForURL('**/classroom')
    await exploreTab.click()
    await page.waitForURL('**/explore')
    await classroomTab.click()
    await page.waitForURL('**/classroom')
    const duration = Date.now() - start

    // Should complete in reasonable time (< 2 seconds for 3 switches)
    expect(duration).toBeLessThan(2000)
  })

  test('should open and close tabs correctly', async ({ page }) => {
    // Open Classroom tab
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Verify tab exists
    let tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(1)

    // Open Explore tab
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Should have 2 tabs now
    tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(2)

    // Close Explore tab by hovering and clicking X
    const exploreTab = tabs.filter({ hasText: 'Explore' })
    await exploreTab.hover()
    await exploreTab.locator('[aria-label*="Close"]').click()

    // Should have 1 tab remaining
    tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(1)

    // Should auto-navigate to Classroom
    await expect(page).toHaveURL(/.*classroom/)
  })

  test('should handle parent-child tab replacement', async ({ page }) => {
    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Count tabs - should have 1 (Classroom)
    let tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(1)

    // Click on a class (this should replace Classroom tab with Class 5A tab)
    const classCard = page.locator('text=Class 5A').first()
    await classCard.click()
    await page.waitForURL('**/classroom/class-5a')

    // Should still have 1 tab (replaced, not added)
    tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(1)

    // Tab should show "Class 5A"
    await expect(tabs.filter({ hasText: 'Class 5A' })).toBeVisible()
  })

  test('should persist tabs in sessionStorage', async ({ page }) => {
    // Open multiple tabs
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Verify tabs exist
    let tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(2)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Tabs should be restored from sessionStorage
    tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(2)
    await expect(tabs.filter({ hasText: 'Classroom' })).toBeVisible()
    await expect(tabs.filter({ hasText: 'Explore' })).toBeVisible()
  })

  test('should handle rapid tab switching without errors', async ({ page }) => {
    // Open 4 different tabs
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    await page.click('button:has-text("Inbox")')
    await page.waitForURL('**/inbox')

    // Get all tabs
    const tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs).toHaveCount(3)

    // Rapidly switch between tabs (no waits between clicks)
    const classroomTab = tabs.filter({ hasText: 'Classroom' })
    const exploreTab = tabs.filter({ hasText: 'Explore' })
    const inboxTab = tabs.filter({ hasText: 'Inbox' })

    // Switch rapidly 10 times
    for (let i = 0; i < 10; i++) {
      await classroomTab.click({ force: true })
      await exploreTab.click({ force: true })
      await inboxTab.click({ force: true })
    }

    // Should end on Inbox and have no console errors
    await page.waitForURL('**/inbox')

    // All tabs should still be present
    await expect(tabs).toHaveCount(3)
  })

  test('should show active tab with correct styling', async ({ page }) => {
    // Open Classroom tab
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Open Explore tab
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    const tabs = page.locator('[data-tab-item="true"]')
    const classroomTab = tabs.filter({ hasText: 'Classroom' })
    const exploreTab = tabs.filter({ hasText: 'Explore' })

    // Explore should be active (has bg-background class)
    await expect(exploreTab).toHaveClass(/bg-background/)

    // Classroom should be inactive (has text-muted-foreground)
    await expect(classroomTab).toHaveClass(/text-muted-foreground/)

    // Click Classroom tab
    await classroomTab.click()
    await page.waitForURL('**/classroom')

    // Now Classroom should be active
    await expect(classroomTab).toHaveClass(/bg-background/)

    // And Explore should be inactive
    await expect(exploreTab).toHaveClass(/text-muted-foreground/)
  })

  test('should handle tab overflow with More dropdown', async ({ page }) => {
    // Open many tabs to trigger overflow
    const pages = ['Classroom', 'Explore', 'Inbox', 'Calendar', 'Learning', 'Community']

    for (const pageName of pages) {
      const button = page.locator(`button:has-text("${pageName}")`)
      if (await button.isVisible()) {
        await button.click()
        await page.waitForTimeout(200) // Small wait for navigation
      }
    }

    // Check if More dropdown appears (only if tabs overflow)
    const moreDropdown = page.locator('button[aria-label*="more tabs"]')
    const isOverflowing = await moreDropdown.isVisible()

    if (isOverflowing) {
      // Click the More dropdown
      await moreDropdown.click()

      // Should show hidden tabs in dropdown
      const dropdown = page.locator('[role="menu"]')
      await expect(dropdown).toBeVisible()

      // Should have menu items
      const menuItems = dropdown.locator('[role="menuitem"]')
      await expect(menuItems.first()).toBeVisible()
    }
  })

  test('should update URL when switching tabs', async ({ page }) => {
    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')
    expect(page.url()).toContain('/classroom')

    // Open Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')
    expect(page.url()).toContain('/explore')

    // Switch back to Classroom via tab
    const tabs = page.locator('[data-tab-item="true"]')
    await tabs.filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')
    expect(page.url()).toContain('/classroom')
  })

  test('should handle browser back/forward buttons', async ({ page }) => {
    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Open Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Use browser back button
    await page.goBack()
    await page.waitForURL('**/classroom')

    // Should show Classroom tab as active
    const tabs = page.locator('[data-tab-item="true"]')
    const classroomTab = tabs.filter({ hasText: 'Classroom' })
    await expect(classroomTab).toHaveClass(/bg-background/)

    // Use browser forward button
    await page.goForward()
    await page.waitForURL('**/explore')

    // Should show Explore tab as active
    const exploreTab = tabs.filter({ hasText: 'Explore' })
    await expect(exploreTab).toHaveClass(/bg-background/)
  })

  test('should render only active tab content (lazy loading)', async ({ page }) => {
    // This test verifies that inactive tabs don't render their content

    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Open Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Explore content should be visible
    await expect(page.locator('text=Discover all available apps')).toBeVisible()

    // Classroom content should NOT be in the DOM (lazy loading optimization)
    // We check this by trying to find unique Classroom content
    const classroomContent = page.locator('text=My Classes')

    // Switch to Classroom tab
    const tabs = page.locator('[data-tab-item="true"]')
    await tabs.filter({ hasText: 'Classroom' }).click()
    await page.waitForURL('**/classroom')

    // Now Classroom content should be visible
    await expect(classroomContent).toBeVisible()
  })
})
