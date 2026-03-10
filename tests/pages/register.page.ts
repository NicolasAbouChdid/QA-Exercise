import { type Page, type Locator } from "@playwright/test";

/**
 * Register Page Object — /register
 */
export class RegisterPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly errorList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username");
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.signUpButton = page.getByRole("button", { name: "Sign up" });
    this.errorList = page.locator("app-list-errors ul li");
  }

  async goto(): Promise<void> {
    await this.page.goto("/register");
  }

  /**
   * Fill the registration form and submit.
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  /**
   * Returns the list of error messages displayed on the page.
   */
  async getErrors(): Promise<string[]> {
    await this.errorList.first().waitFor({ timeout: 5000 });
    return this.errorList.allTextContents();
  }
}
