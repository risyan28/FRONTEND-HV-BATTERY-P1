// tests/e2e/login.spec.ts - Login flow E2E tests
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    // Check if login form elements are visible
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByLabel(/username/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/username/i).fill('invaliduser')
    await page.getByLabel(/password/i).fill('wrongpassword')

    // Click login button
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Fill in valid credentials (adjust based on your test data)
    await page.getByLabel(/username/i).fill('admin')
    await page.getByLabel(/password/i).fill('admin123')

    // Click login button
    await page.getByRole('button', { name: /login/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Verify dashboard elements are visible
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible()
  })

  test('should persist session after page reload', async ({ page }) => {
    // Login first
    await page.getByLabel(/username/i).fill('admin')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Reload page
    await page.reload()

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/username/i).fill('admin')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /login/i }).click()

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Click logout button (adjust selector based on your UI)
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })
})
