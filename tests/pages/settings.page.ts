import { type Page, type Locator } from "@playwright/test";

/**
 * Settings Page Object — /settings
 */
export class SettingsPage {
  readonly page: Page;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // The logout button in Conduit is typically a flat text or button element
    // containing "Or click here to logout"
    this.logoutButton = page.getByRole("button", { name: /click here to logout/i });
  }

  async goto(): Promise<void> {
    await this.page.goto("/settings");
  }

  /**
   * Click the logout button.
   */
  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }
}
