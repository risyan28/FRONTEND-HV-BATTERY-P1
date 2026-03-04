// tests/e2e/traceability.spec.ts - Traceability feature E2E tests
import { test, expect } from '@playwright/test'

test.describe('Traceability Data', () => {
  test.beforeEach(async ({ page }) => {
    // Login before accessing traceability page
    await page.goto('/login')
    await page.getByLabel(/username/i).fill('admin')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /login/i }).click()

    // Navigate to traceability page
    await page.goto('/dashboard/manufacture/traceability-data')
  })

  test('should display traceability page with filters', async ({ page }) => {
    // Check page title
    await expect(
      page.getByRole('heading', { name: /traceability/i }),
    ).toBeVisible()

    // Check date filters are visible
    await expect(page.getByLabel(/from/i)).toBeVisible()
    await expect(page.getByLabel(/to/i)).toBeVisible()

    // Check search button
    await expect(page.getByRole('button', { name: /search/i })).toBeVisible()
  })

  test('should search traceability data by date range', async ({ page }) => {
    // Fill in date range
    await page.getByLabel(/from/i).fill('2026-02-01')
    await page.getByLabel(/to/i).fill('2026-02-11')

    // Click search
    await page.getByRole('button', { name: /search/i }).click()

    // Wait for loading to finish
    await page.waitForSelector('[data-loading="false"]', { timeout: 10000 })

    // Should display data table or empty state
    const hasData = await page.getByRole('table').isVisible()
    if (hasData) {
      // Verify table has headers
      await expect(
        page.getByRole('columnheader', { name: /pack.*id/i }),
      ).toBeVisible()
    } else {
      // Verify empty state
      await expect(page.getByText(/no data/i)).toBeVisible()
    }
  })

  test('should show error for invalid date range', async ({ page }) => {
    // Fill in invalid date range (from > to)
    await page.getByLabel(/from/i).fill('2026-02-11')
    await page.getByLabel(/to/i).fill('2026-02-01')

    // Click search
    await page.getByRole('button', { name: /search/i }).click()

    // Should display error message
    await expect(page.getByText(/from.*tidak boleh/i)).toBeVisible()
  })

  test('should scroll table horizontally for many columns', async ({
    page,
  }) => {
    // Search for data
    await page.getByLabel(/from/i).fill('2026-02-01')
    await page.getByLabel(/to/i).fill('2026-02-11')
    await page.getByRole('button', { name: /search/i }).click()

    // Wait for data
    await page.waitForSelector('table', { timeout: 10000 })

    // Get table container
    const tableContainer = page.locator('[data-table-scroll]').first()

    // Check if table is scrollable
    const isScrollable = await tableContainer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth
    })

    if (isScrollable) {
      // Scroll right
      await tableContainer.evaluate((el) => {
        el.scrollLeft = el.scrollWidth
      })

      // Verify scroll happened
      const scrollLeft = await tableContainer.evaluate((el) => el.scrollLeft)
      expect(scrollLeft).toBeGreaterThan(0)
    }
  })

  test('should display correct column count', async ({ page }) => {
    // Search for data
    await page.getByLabel(/from/i).fill('2026-02-01')
    await page.getByLabel(/to/i).fill('2026-02-11')
    await page.getByRole('button', { name: /search/i }).click()

    // Wait for table
    await page.waitForSelector('table', { timeout: 10000 })

    // Count columns
    const columnCount = await page.locator('thead th').count()

    // Should have many columns (traceability has 1020+ fields)
    // Or at least the default columns
    expect(columnCount).toBeGreaterThan(5)
  })
})
