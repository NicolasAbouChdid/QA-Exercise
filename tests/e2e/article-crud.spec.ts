import { test, expect } from "@playwright/test";
import { EditorPage } from "../pages/editor.page";
import { ArticlePage } from "../pages/article.page";
import { HomePage } from "../pages/home.page";
import {
  generateUniqueUser,
  registerViaApi,
  setAuthState,
} from "../helpers/auth.helper";
import {
  generateArticleData,
  createArticleViaApi,
} from "../helpers/article.helper";

test.describe("Article CRUD Flows", () => {
  let user: ReturnType<typeof generateUniqueUser>;
  let token: string;

  test.beforeEach(async ({ request, page }) => {
    // Setup: Create a fresh user for each CRUD test to ensure isolation
    user = generateUniqueUser();
    token = await registerViaApi(request, user);
    // Inject session into the browser to bypass UI login
    await page.goto("/"); // Must hit origin before setting local storage
    await setAuthState(page, token, user);
  });

  test("Create Article → Verify Content → Edit → Verify Changes", async ({
    page,
  }) => {
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);
    const articleData = generateArticleData();

    // 1. Navigate to editor and create
    await editorPage.goto();
    await editorPage.createArticle(articleData);

    // 2. Assert: redirects to article page and displays content
    await expect(page).toHaveURL(/\/article\/.+/);
    expect(await articlePage.getTitle()).toEqual(articleData.title);
    expect(await articlePage.getBody()).toContain("This is a markdown-supported body");

    // 3. Click Edit
    await articlePage.clickEdit();
    await expect(page).toHaveURL(/\/editor\/.+/);

    // 4. Modify content and publish
    const updatedData = {
      ...articleData,
      title: `${articleData.title} (Updated)`,
      body: `${articleData.body} \n\nEdited line.`,
    };
    await editorPage.editArticle(updatedData);

    // 5. Assert: changes reflected on article page
    await expect(page).toHaveURL(/\/article\/.+/);
    expect(await articlePage.getTitle()).toEqual(updatedData.title);
    expect(await articlePage.getBody()).toContain("Edited line.");
  });

  test("Delete Article → Verify Removal", async ({ request, page }) => {
    const articlePage = new ArticlePage(page);
    const homePage = new HomePage(page);

    // 1. Setup: Create article via API
    const articleData = generateArticleData();
    const slug = await createArticleViaApi(request, token, articleData);

    // 2. Navigate directly to the article
    await page.goto(`/article/${slug}`);
    await expect(articlePage.titleHeading).toBeVisible();

    // 3. Delete article
    expect(await articlePage.isDeleteVisible()).toBe(true);
    await articlePage.clickDelete();

    // 4. Assert: redirects to home page
    await expect(page).toHaveURL("/");

    // 5. Assert: article no longer in Global Feed
    await homePage.globalFeedTab.click();
    await homePage.waitForArticlesLoaded();
    const titles = await homePage.getArticleTitles();
    expect(titles).not.toContain(articleData.title);
  });
});
