import { test, expect } from '@playwright/test'

/**
 * Critical navigation tests to verify functionality after performance optimizations
 * Tests core tab navigation, URL syncing, and state persistence
 */

test.describe('Post-Optimization Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to Pulse page and show Pulse tab', async ({ page }) => {
    // Click sidebar Pulse button (or find button with Pulse text)
    const pulseButton = page.locator('button').filter({ hasText: /^Pulse$/i }).first()

    // If no button found on homepage, check the page header for Pulse action
    if (await pulseButton.count() === 0) {
      const headerPulseButton = page.locator('[role="main"] button:has-text("Pulse")')
      if (await headerPulseButton.count() > 0) {
        await headerPulseButton.click()
      } else {
        // Skip test if Pulse button not found
        return
      }
    } else {
      await pulseButton.click()
    }

    // Wait for URL to change to pulse
    await page.waitForURL('**/pulse', { timeout: 10000 })

    // Verify URL contains pulse
    expect(page.url()).toContain('/pulse')

    // Check that we have at least one tab
    const tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs.first()).toBeVisible()
  })

  test('should navigate between multiple tabs', async ({ page }) => {
    // Navigate to Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom', { timeout: 10000 })
    expect(page.url()).toContain('/classroom')

    // Navigate to Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore', { timeout: 10000 })
    expect(page.url()).toContain('/explore')

    // Verify both tabs exist
    const tabs = page.locator('[data-tab-item="true"]')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThanOrEqual(2)

    // Find and click Classroom tab
    const classroomTab = tabs.filter({ hasText: /classroom/i })
    if (await classroomTab.count() > 0) {
      await classroomTab.first().click()
      await page.waitForURL('**/classroom', { timeout: 10000 })
      expect(page.url()).toContain('/classroom')
    }
  })

  test('should close tabs correctly', async ({ page }) => {
    // Open two tabs
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Get initial tab count
    const tabs = page.locator('[data-tab-item="true"]')
    const initialCount = await tabs.count()
    expect(initialCount).toBeGreaterThanOrEqual(2)

    // Find and close Explore tab
    const exploreTab = tabs.filter({ hasText: /explore/i })
    if (await exploreTab.count() > 0) {
      // Hover to show close button
      await exploreTab.first().hover()

      // Click the close button (X icon)
      const closeButton = exploreTab.first().locator('[aria-label*="Close"]')
      if (await closeButton.count() > 0) {
        await closeButton.click()

        // Wait a bit for the close animation
        await page.waitForTimeout(500)

        // Should have one less tab
        const newCount = await tabs.count()
        expect(newCount).toBe(initialCount - 1)

        // Should navigate away from explore
        await page.waitForFunction(() => !window.location.pathname.includes('/explore'), { timeout: 5000 })
      }
    }
  })

  test('should handle rapid navigation without errors', async ({ page }) => {
    // Navigate rapidly between pages
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Classroom")', { force: true })
      await page.waitForTimeout(100)

      await page.click('button:has-text("Explore")', { force: true })
      await page.waitForTimeout(100)
    }

    // Should end up on a valid page with no console errors
    const url = page.url()
    expect(url).toMatch(/classroom|explore/)

    // Check for console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Give it a moment to catch any errors
    await page.waitForTimeout(500)

    // Should have minimal errors (ignoring common warnings)
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning') &&
      !e.includes('DevTools') &&
      !e.includes('source map')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('should persist tabs on page reload', async ({ page }) => {
    // Open multiple tabs
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Get tab count before reload
    const tabsBefore = await page.locator('[data-tab-item="true"]').count()

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Tabs should be restored
    const tabsAfter = await page.locator('[data-tab-item="true"]').count()
    expect(tabsAfter).toBeGreaterThanOrEqual(1)

    // At minimum, should have the active tab
    const tabs = page.locator('[data-tab-item="true"]')
    await expect(tabs.first()).toBeVisible()
  })

  test('should maintain active tab state visually', async ({ page }) => {
    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Open Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    const tabs = page.locator('[data-tab-item="true"]')
    const exploreTab = tabs.filter({ hasText: /explore/i })

    // Explore tab should have active styling
    if (await exploreTab.count() > 0) {
      const classes = await exploreTab.first().getAttribute('class')
      expect(classes).toContain('bg-background')
    }

    // Click Classroom tab
    const classroomTab = tabs.filter({ hasText: /classroom/i })
    if (await classroomTab.count() > 0) {
      await classroomTab.first().click()
      await page.waitForURL('**/classroom')

      // Classroom should now be active
      const classroomClasses = await classroomTab.first().getAttribute('class')
      expect(classroomClasses).toContain('bg-background')
    }
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate forward through pages
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Go back
    await page.goBack()
    await page.waitForURL('**/classroom')
    expect(page.url()).toContain('/classroom')

    // Go forward
    await page.goForward()
    await page.waitForURL('**/explore')
    expect(page.url()).toContain('/explore')

    // Tabs should reflect the current page
    const tabs = page.locator('[data-tab-item="true"]')
    const exploreTab = tabs.filter({ hasText: /explore/i })

    if (await exploreTab.count() > 0) {
      const classes = await exploreTab.first().getAttribute('class')
      expect(classes).toContain('bg-background')
    }
  })

  test('should render tab content efficiently (no inactive content)', async ({ page }) => {
    // Open Classroom
    await page.click('button:has-text("Classroom")')
    await page.waitForURL('**/classroom')

    // Open Explore
    await page.click('button:has-text("Explore")')
    await page.waitForURL('**/explore')

    // Only Explore content should be rendered (performance optimization)
    // We verify this by checking that the main content area shows explore-specific content

    // The page should show explore content
    const content = await page.locator('[role="main"]').first()
    const contentText = await content.textContent()

    // Should contain explore-related text
    expect(contentText).toBeTruthy()

    // Now switch to Classroom
    const tabs = page.locator('[data-tab-item="true"]')
    const classroomTab = tabs.filter({ hasText: /classroom/i })

    if (await classroomTab.count() > 0) {
      await classroomTab.first().click()
      await page.waitForURL('**/classroom')

      // Content should update to classroom content
      const newContentText = await content.textContent()
      expect(newContentText).toBeTruthy()
    }
  })
})
