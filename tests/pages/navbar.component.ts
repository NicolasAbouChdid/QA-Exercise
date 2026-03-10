import { type Page, type Locator } from "@playwright/test";

/**
 * Navbar component — shared across all pages.
 * Encapsulates navigation links and authentication state checks.
 */
export class NavbarComponent {
  readonly page: Page;

  // Locators
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;
  readonly usernameLink: Locator;

  constructor(page: Page) {
    this.page = page;
    const nav = page.locator("app-layout-header nav");
    this.homeLink = nav.getByRole("link", { name: "Home" });
    this.signInLink = nav.getByRole("link", { name: "Sign in" });
    this.signUpLink = nav.getByRole("link", { name: "Sign up" });
    this.newArticleLink = nav.getByRole("link", { name: /New Article/i });
    this.settingsLink = nav.getByRole("link", { name: /Settings/i });
    // The username link is dynamic — we locate the last <li> in the nav list for the profile link
    this.usernameLink = nav.locator("ul li:last-child a");
  }

  /**
   * Returns true if the navbar shows authenticated-state links
   * (New Article, Settings, username).
   */
  async isLoggedIn(): Promise<boolean> {
    // If "Sign in" link is hidden, user is logged in
    return !(await this.signInLink.isVisible());
  }

  /**
   * Returns the displayed username from the navbar profile link.
   */
  async getUsername(): Promise<string> {
    return (await this.usernameLink.textContent())?.trim() ?? "";
  }

  async clickNewArticle(): Promise<void> {
    await this.newArticleLink.click();
  }

  async clickSettings(): Promise<void> {
    await this.settingsLink.click();
  }
}
