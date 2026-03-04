// playwright.config.ts - E2E test configuration
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',

  // Run tests serially (one by one)
  fullyParallel: false,

  // Fail build on CI if tests fail
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Worker configuration
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'], // Console output
  ],

  // Shared test settings
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry', // Capture trace on retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
})
