import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Conduit E2E Tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Limit parallel workers on CI to avoid flakiness */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["html", { open: "on-failure" }]],

  /* Shared settings for all projects */
  use: {
    baseURL: "https://demo.realworld.show",

    /* Collect trace on first retry */
    trace: "on-first-retry",

    /* Screenshot on failure only */
    screenshot: "only-on-failure",

    /* Reasonable timeouts */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  /* Timeout per test */
  timeout: 30_000,

  /* Expect timeout */
  expect: {
    timeout: 5_000,
  },

  /* Project configuration — Chromium only for speed */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
