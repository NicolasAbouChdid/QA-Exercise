import { type Page, type Locator } from "@playwright/test";

/**
 * Editor Page Object — /editor (new) or /editor/:slug (edit)
 */
export class EditorPage {
  readonly page: Page;

  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder("Article Title");
    this.descriptionInput = page.getByPlaceholder(
      "What's this article about?"
    );
    this.bodyInput = page.getByPlaceholder(
      "Write your article (in markdown)"
    );
    this.tagInput = page.getByPlaceholder("Enter tags");
    this.publishButton = page.getByRole("button", {
      name: "Publish Article",
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/editor");
  }

  /**
   * Fill the article form with the provided data and publish.
   */
  async createArticle(data: {
    title: string;
    description: string;
    body: string;
    tags?: string[];
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);
    await this.bodyInput.fill(data.body);

    if (data.tags) {
      for (const tag of data.tags) {
        await this.tagInput.fill(tag);
        await this.tagInput.press("Enter");
      }
    }

    await this.publishButton.click();
  }

  /**
   * Edit existing article fields. Only fills fields that are provided.
   */
  async editArticle(data: {
    title?: string;
    description?: string;
    body?: string;
  }): Promise<void> {
    if (data.title !== undefined) {
      await this.titleInput.clear();
      await this.titleInput.fill(data.title);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.clear();
      await this.descriptionInput.fill(data.description);
    }
    if (data.body !== undefined) {
      await this.bodyInput.clear();
      await this.bodyInput.fill(data.body);
    }

    await this.publishButton.click();
  }
}
