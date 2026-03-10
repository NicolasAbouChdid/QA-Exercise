import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Article Detail Page Object — /article/:slug
 */
export class ArticlePage {
  readonly page: Page;

  readonly titleHeading: Locator;
  readonly bodyText: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;

  // We scope the author actions specifically to the banner to avoid picking up the bottom actions
  readonly bannerActions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleHeading = page.locator(".banner h1");
    this.bodyText = page.locator(".article-content p");
    this.bannerActions = page.locator(".banner .article-meta");
    this.editButton = this.bannerActions.getByRole("link", { name: /Edit Article/i });
    this.deleteButton = this.bannerActions.getByRole("button", { name: /Delete Article/i });
  }

  /**
   * Returns the article title.
   */
  async getTitle(): Promise<string> {
    return (await this.titleHeading.textContent())?.trim() ?? "";
  }

  /**
   * Returns the article body text.
   */
  async getBody(): Promise<string> {
    await this.bodyText.first().waitFor({ state: "visible" });
    const texts = await this.bodyText.allTextContents();
    return texts.join("\n").trim();
  }

  /**
   * Click the "Edit Article" button.
   */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  /**
   * Click the "Delete Article" button.
   */
  async clickDelete(): Promise<void> {
    // The app might show a native confirmation or just delete it.
    // In Conduit, hitting delete usually fires the API immediately or triggers a JS confirm.
    // We set up a dialog handler just in case it uses window.confirm.
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.deleteButton.click();
  }

  /**
   * Returns true if the delete button is visible (author-only check).
   */
  async isDeleteVisible(): Promise<boolean> {
    return await this.deleteButton.isVisible();
  }
}
