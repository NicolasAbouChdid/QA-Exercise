import { type APIRequestContext, type Page } from "@playwright/test";

export interface UserData {
  username: string;
  email: string;
  password?: string;
}

/**
 * Generates unique user data to avoid collisions between test runs.
 */
export function generateUniqueUser(): Required<UserData> {
  const timestamp = Date.now();
  return {
    username: `qa_user_${timestamp}`,
    email: `qa_${timestamp}@test.com`,
    password: "Password123!",
  };
}

/**
 * Registers a new user via API and returns their JWT token.
 * Highly recommended for fast test setups.
 */
export async function registerViaApi(
  request: APIRequestContext,
  user: Required<UserData>
): Promise<string> {
  const response = await request.post("https://api.realworld.show/api/users", {
    data: {
      user: {
        username: user.username,
        email: user.email,
        password: user.password,
      },
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to register user: ${await response.text()}`);
  }

  const json = await response.json();
  return json.user.token;
}

/**
 * Injects the auth token directly into the browser context for UI testing.
 * This bypasses the need to manually log in via the UI.
 */
export async function setAuthState(
  page: Page,
  token: string,
  user: UserData
): Promise<void> {
  // Conduit stores the exact JWT token in localStorage under the key "jwtToken"
  // It expects the plain token string without quotes or headers.
  await page.addInitScript((jwt) => {
    window.localStorage.setItem("jwtToken", jwt);
  }, token);

  // We should navigate briefly to allow the auth guards to pick up the token
  // Usually this is handled by the test itself afterwards, but we ensure localStorage is primed.
}
