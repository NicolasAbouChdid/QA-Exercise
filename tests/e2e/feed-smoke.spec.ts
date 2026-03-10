import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";
import * as globalFeedFixture from "../fixtures/global-feed.json";
import * as tagsFixture from "../fixtures/tags.json";

test.describe("Smoke Tests - Route Interception", () => {
  test("Global Feed with Route-Intercepted Fixtures", async ({ page }) => {
    const homePage = new HomePage(page);

    // 1. Intercept network requests to provide stable fixture data
    await page.route("**/api/articles*", async (route) => {
      await route.fulfill({ json: globalFeedFixture });
    });

    await page.route("**/api/tags", async (route) => {
      await route.fulfill({ json: tagsFixture });
    });

    // 2. Navigate to Home
    await homePage.goto();

    // 3. Assert: Sidebar tags match the fixture (6 tags)
    const tagNames = await homePage.getTagNames();
    expect(tagNames).toEqual(expect.arrayContaining(["playwright", "mock", "cypress"]));
    expect(tagNames.length).toBe(6);

    // 4. Assert: Exactly 3 articles rendered with data from fixture
    const articleTitles = await homePage.getArticleTitles();
    expect(articleTitles.length).toBe(3);
    expect(articleTitles).toEqual([
      "Playwright E2E Mock Data 1",
      "Playwright E2E Mock Data 2",
      "Playwright E2E Mock Data 3",
    ]);

    // 5. Assert: "Global Feed" tab is active
    expect(await homePage.isActiveTab("Global Feed")).toBe(true);
  });
});
