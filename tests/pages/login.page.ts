import { type Page, type Locator } from "@playwright/test";

/**
 * Login Page Object — /login
 */
export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.signInButton = page.getByRole("button", { name: "Sign in" });
    this.errorList = page.locator("app-list-errors ul li");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  /**
   * Fill the login form and submit.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Returns the list of error messages displayed on the page.
   */
  async getErrors(): Promise<string[]> {
    await this.errorList.first().waitFor({ timeout: 5000 });
    return this.errorList.allTextContents();
  }
}
