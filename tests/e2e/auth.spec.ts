import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/register.page";
import { LoginPage } from "../pages/login.page";
import { HomePage } from "../pages/home.page";
import { NavbarComponent } from "../pages/navbar.component";
import { SettingsPage } from "../pages/settings.page";
import { generateUniqueUser, registerViaApi } from "../helpers/auth.helper";

test.describe("Authentication Flows", () => {
  test("User Registration → Auto-Login → Session Persistence", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    const homePage = new HomePage(page);
    const navbar = new NavbarComponent(page);

    const user = generateUniqueUser();

    // 1. Navigate to Register
    await registerPage.goto();

    // 2. Fill form and submit
    await registerPage.register(user.username, user.email, user.password);

    // 3. Assert: navigated to home, navbar shows username, "Your Feed" is active
    await expect(page).toHaveURL("/");
    await expect(navbar.usernameLink).toContainText(user.username);
    expect(await navbar.isLoggedIn()).toBe(true);

    await expect(homePage.yourFeedTab).toBeVisible();

    // 4. Assert session persists across reload
    await page.reload();
    await expect(navbar.usernameLink).toContainText(user.username);
  });

  test("Login → Authenticated State → Logout", async ({ request, page }) => {
    const loginPage = new LoginPage(page);
    const navbar = new NavbarComponent(page);
    const settingsPage = new SettingsPage(page);

    const user = generateUniqueUser();

    // 1. Setup: Register user via API to save time
    await registerViaApi(request, user);

    // 2. Navigate to Login and authenticate
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // 3. Assert: authenticated components are visible
    await expect(page).toHaveURL("/");
    expect(await navbar.isLoggedIn()).toBe(true);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.settingsLink).toBeVisible();

    // 4. Navigate to Settings and Logout
    await navbar.clickSettings();
    await settingsPage.clickLogout();

    // 5. Assert: logged out state
    await expect(page).toHaveURL("/");
    await expect(navbar.signInLink).toBeVisible();
    expect(await navbar.isLoggedIn()).toBe(false);
  });
});
