import { type Page, type Locator } from "@playwright/test";

/**
 * Home Page Object — /
 * Covers Global Feed, Your Feed, tag filtering, and article previews.
 */
export class HomePage {
  readonly page: Page;

  readonly globalFeedTab: Locator;
  readonly yourFeedTab: Locator;
  readonly tagSidebar: Locator;
  readonly articlePreviews: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.globalFeedTab = page.getByRole("link", { name: "Global Feed" });
    this.yourFeedTab = page.getByRole("link", { name: "Your Feed" });
    this.tagSidebar = page.locator("app-home-page .sidebar");
    this.articlePreviews = page.locator("app-article-preview");
    this.loadingIndicator = page.getByText("Loading articles...");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  /**
   * Wait until articles have finished loading.
   */
  async waitForArticlesLoaded(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: "hidden", timeout: 10_000 });
  }

  /**
   * Returns the titles of all visible article previews.
   */
  async getArticleTitles(): Promise<string[]> {
    await this.waitForArticlesLoaded();
    return this.articlePreviews.locator("h1").allTextContents();
  }

  /**
   * Click a tag in the sidebar to filter articles.
   */
  async clickTag(tagName: string): Promise<void> {
    await this.tagSidebar.getByText(tagName, { exact: true }).click();
  }

  /**
   * Returns all tag names from the sidebar.
   */
  async getTagNames(): Promise<string[]> {
    const texts = await this.tagSidebar.locator("a").allTextContents();
    return texts.map(t => t.trim());
  }

  /**
   * Returns true if the given tab name is the currently active tab.
   */
  async isActiveTab(tabName: string): Promise<boolean> {
    const tab = this.page.locator(".feed-toggle .nav-link.active").first();
    const text = await tab.textContent();
    return text?.trim() === tabName;
  }
}
