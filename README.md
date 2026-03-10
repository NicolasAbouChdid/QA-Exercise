# Conduit E2E Test Suite (Playwright)

End-to-end automation test suite for the [Conduit](https://demo.realworld.show/) application, serving as a Proof of Concept for the QA automation strategy.

## Prerequisites

- **Node.js**: v18.x or v20.x+ recommended.
- **npm** (comes with Node.js).

## Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm ci
   ```

2. **Install Playwright Chromium browser binary:**
   ```bash
   npx playwright install --with-deps chromium
   ```

## Running Tests

The test suite runs entirely locally (Chromium-only by default for speed).

**Run all tests in headless mode (default):**
```bash
npx playwright test
```

**Run tests in headed mode (watch it run):**
```bash
npx playwright test --headed
```

**Run a specific test file:**
```bash
npx playwright test tests/e2e/auth.spec.ts
```

**View the HTML Test Report:**
```bash
npx playwright show-report
```

---

## Architectural Decisions & Trade-offs

1. **Page Object Model (POM)**:
   - Tests interact with POMs (`tests/pages/`) rather than raw locators in the spec files.
   - This keeps tests readable and concentrates UI maintenance to dedicated files.

2. **API Helpers & Auth State Injection**:
   - `tests/helpers/auth.helper.ts` generates unique users and registers them via `POST /api/users`.
   - Instead of logging in via the UI before every test, we inject the JWT directly into `window.localStorage`.
   - **Trade-off**: Slightly less realistic than driving the full UI login every time, but drastically improves test speed and reliability. (The UI login *is* still explicitly tested in `auth.spec.ts`).

3. **Data Isolation (Unique Runs)**:
   - The test data uses `Date.now()` timestamp suffixes (e.g., `qa_user_17100000000@test.com`).
   - This ensures multiple people or CI runners can execute the suite simultaneously against the public demo environment without state collisions.

4. **Route Interception (Smoke Test)**:
   - `tests/e2e/feed-smoke.spec.ts` intercepts `/api/articles` and responds with local JSON fixtures.
   - **Trade-off**: Does not verify live backend integration, but proves the UI renders correctly regardless of live DB state, executes in milliseconds, and works offline. This directly fulfills the local execution assignment requirement.

5. **CI/CD Pipeline**:
   - GitHub Actions workflow (`.github/workflows/tests.yml`) triggers on push/PR to `main`.
   - Uploads Playwright HTML reports and traces *only on failure* to save artifact storage space.

6. **Time Spent**:
   - The total time spent on this assignment was significantly less than the estimated 6-8 hours.
   - This efficiency was achieved by leveraging the **Google Antigravity IDE** alongside the **Playwright MCP (Model Context Protocol) Server**. 
   - Using this AI-agentic tooling allowed for rapid exploratory testing, automated generation of Page Object Models, and instant debugging of CI race conditions, demonstrating how modern AI workflows can compress QA automation lifecycles.
