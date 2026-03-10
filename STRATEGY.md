# Test Strategy – Conduit (RealWorld)

> **Application**: [Conduit](https://demo.realworld.show/) — a Medium.com-style social blogging platform  
> **Stack**: Angular (frontend) · Node/Express (backend) · REST API  
> **Author**: Nicolas Abou Chdid

*This strategy was informed by hands-on exploratory testing of the live application and analysis of the [RealWorld API spec](https://realworld-docs.netlify.app/specifications/backend/endpoints/). Observations marked **Verified** below are findings from my testing session.*

---

## 1. Top 4 Critical User Journeys & Quality Risks

### Journey 1: User Registration → First Login → Session Continuity

**Description**  
A new visitor signs up by providing a username, email, and password, then is automatically authenticated and redirected to their personalized feed. On subsequent visits the user logs in with their credentials and expects their session to persist across page reloads/navigation until they explicitly log out.

**Why it's critical**  
Registration is the top-of-funnel gate — if it fails, the platform loses every potential contributor. Login and session persistence underpin every authenticated feature (article CRUD, following, favouriting, commenting). A broken auth flow effectively renders the entire application unusable for returning users.

**Key considerations**
- Duplicate username / email handling — the API returns `422` errors, and the UI must surface them clearly.
- Password strength and field-level validation (empty fields, malformed emails).
- JWT token storage and lifecycle — tokens stored in `localStorage` must survive page reload until the user logs out.
- Race conditions when multiple tabs log out simultaneously.
- Edge case: registering with an already-authenticated session (direct navigation to `/register` while logged in).
- **Logout lives on the Settings page** ("Or click here to logout" link at the bottom) — it is not in the main nav bar, which could confuse first-time users and is a testable UX flow.
- Settings page exposes 5 fields: profile image URL, username, bio, email, and new password — updating any of these must persist correctly.

---

### Journey 2: Article Lifecycle — Create, Read, Edit, Delete

**Description**  
An authenticated user creates a new article (title, description, body, optional tags), sees it appear in the Global Feed and on their profile, edits its content, and finally deletes it. The article is accessible by unauthenticated readers via direct URL (slug-based).

**Why it's critical**  
Content creation is the core value proposition of a blogging platform. If users cannot publish or their edits are lost, they abandon the product. Stale or orphaned data from failed deletes erodes trust and clutters the feed. For the business, no articles = no content = no readers = no growth.

**Key considerations**
- Slug generation on create and slug **update** on title change (per spec) — existing bookmarks/links break if the slug changes silently.
- Required field validation: `title`, `description`, `body` must be non-empty.
- Tag input behaviour — Conduit's tag input relies on Enter-key submission; pasting comma-separated tags may not work as expected.
- **Verified**: only the article author sees Edit/Delete buttons on the article detail page; other users see Follow + Favourite buttons instead. The API must enforce this server-side as well.
- Markdown rendering in the body — the body field accepts Markdown; injection vectors (XSS via Markdown) should be considered.
- **Verified**: after creation, the article immediately appears at the top of the Global Feed (confirmed with a test article).

---

### Journey 3: Social Interactions — Follow User, Favourite Article, Comment

**Description**  
An authenticated user follows another author, expects to see that author's posts in "Your Feed," favourites individual articles (incrementing the counter), and posts/deletes comments on articles. These features together form the engagement loop that differentiates a social platform from a static blog.

**Why it's critical**  
Social features drive retention and stickiness. A broken favourite count misleads readers; broken follow means "Your Feed" shows stale or no content; a broken comment system kills discussion. These features also interact with authorization — you should not be able to delete another user's comment, and the follow button state must stay consistent across navigation.

**Key considerations**
- **Verified: Non-optimistic UI** — both Follow and Favourite buttons wait for the API response before updating the UI. The Follow button changes from `+ Follow <username>` (outline style) to `- Unfollow <username>` (filled style) only after the API round-trip completes. Similarly, the Favourite counter updates only after a successful response. This means slow networks will expose noticeable lag.
- "Your Feed" depends on follow state — unfollowing an author should remove their articles from the feed on next reload.
- **Verified**: Comments appear with the commenter's avatar and username; only the comment author sees a trash-icon delete button. Posting a comment immediately adds it to the list.
- Favourite count must increment/decrement atomically even under concurrent requests.
- Edge case: following yourself — the API may allow it, but the UI should not.
- **Verified**: The favourite counter is accurate — observed `(2)` → `(3)` on favourite and back to `(2)` on unfavourite.

---

### Journey 4: Global Feed, Tag Filtering & Navigation (Unauthenticated)

**Description**  
An unauthenticated visitor lands on the home page, sees the Global Feed with paginated articles, filters by clicking a tag in the sidebar, navigates between pages, and clicks into an article to read it. This is the primary discovery funnel.

**Why it's critical**  
This is the first experience every user has, before any sign-up. If the feed doesn't load, renders incorrectly, or pagination breaks, visitors bounce immediately. Tag filtering is the main content-discovery mechanism — a broken filter hides entire categories of content.

**Key considerations**
- API default pagination: 20 articles per page, offset-based — off-by-one errors can cause duplicate or missing articles.
- **Verified**: Tag sidebar ("Popular Tags") is populated with real tags (ai, api, architecture, backend, javascript, python, etc.). Clicking a tag adds a third tab (e.g., `# javascript`) alongside "Your Feed" and "Global Feed," filtering articles accordingly.
- Deep link stability: navigating directly to `/article/:slug` should render the full article without requiring prior home-page load.
- Angular route guards and lazy loading: the SPA may flash a blank page during navigation if lazy-loaded modules fail.
- Performance: the Global Feed fetches all articles without body (per spec change 2024/08/16) — verify the `body` field is not relied upon in list views.
- **Verified**: Article previews show author avatar, username, date, favourite count (heart icon), title, description, tags, and a "Read more…" link.

---

## 2. Prioritization (Ranked 1–4)

| Rank | Journey | Justification |
|------|---------|---------------|
| **1** | User Registration → First Login → Session Continuity | Every other feature depends on authentication. A failure here blocks 100% of authenticated user flows and is the single highest-impact risk. |
| **2** | Article Lifecycle (Create, Read, Edit, Delete) | The core product value — publishing content — is meaningless if CRUD is broken. It is the most complex mutation flow involving slug handling, validation, and authorization. |
| **3** | Social Interactions (Follow, Favourite, Comment) | Retention-critical, but these features layer on top of working auth and article flows. Testing them also validates cross-feature interactions and authorization boundaries. |
| **4** | Global Feed, Tag Filtering & Navigation | High-traffic entry point, but it is largely read-only and stateless. Bugs here are visible but less destructive than auth or data-loss issues. |

---

## 3. Test Coverage Strategy

### Priority 1 — Registration / Login / Session

| Attribute | Recommendation |
|-----------|---------------|
| **Primary test type** | **E2E** (with API-level auth helpers) |
| **Reasoning** | Auth involves the full stack: form → HTTP → JWT → localStorage → UI state. E2E tests validate the real browser-level flow (token storage, redirect, session persistence across reload). However, the *setup* for every other test suite should create auth via **API calls** (`POST /api/users` or `POST /api/users/login`) to avoid repeating slow UI registration in every test. |
| **Who owns it** | **QA automation** owns the E2E auth journey tests. Devs should own unit tests around JWT parsing, token expiry logic, and Angular auth guards. |

### Priority 2 — Article CRUD

| Attribute | Recommendation |
|-----------|---------------|
| **Primary test type** | **E2E** for happy-path publish → edit → delete; **API-level** for validation edge cases |
| **Reasoning** | The editor form, Markdown preview, and slug-based routing need real browser interaction. But field-validation rules (missing title, overlong body) and authorization checks (editing another user's article) are faster and more deterministic at the API level. |
| **Who owns it** | **QA automation** owns E2E CRUD flow tests. Devs should own API contract tests for `/api/articles` including field validation and authorization. |

### Priority 3 — Social Interactions

| Attribute | Recommendation |
|-----------|---------------|
| **Primary test type** | **API integration + targeted E2E** |
| **Reasoning** | Follow/unfollow and favourite/unfavourite are stateful toggles with no complex UI beyond a button click and counter update. API tests can verify state transitions more reliably and quickly. A small number of E2E tests should validate UI consistency (button state, counter, comment rendering). |
| **Who owns it** | **QA automation** owns integration tests. Dev team should add unit tests for optimistic update logic in the Angular services. |

### Priority 4 — Global Feed & Tag Filtering

| Attribute | Recommendation |
|-----------|---------------|
| **Primary test type** | **E2E** with mocked (intercepted) API responses |
| **Reasoning** | Feed rendering and tag filtering are heavily UI-driven (pagination controls, active tab state, tag chip highlight). By intercepting `GET /api/articles` and `GET /api/tags` with fixtures, tests become fast, deterministic, and independent of live data. |
| **Who owns it** | **QA automation** owns E2E feed/navigation tests. Dev team should own unit tests for Angular components that handle pagination math and query-parameter construction. |

---

## 4. API Testing Approach

### API vs. UI Testing Breakdown

| Priority | Test at API Level | Test at UI Level | Rationale |
|----------|-------------------|------------------|-----------|
| **#1 Auth** | `POST /api/users` with invalid/duplicate data → expect `422`; `POST /api/users/login` with wrong password → expect `422`; `GET /api/user` without token → expect `401` | Full registration form flow; login + redirect; session survives reload; logout clears state | Validation rules and error codes are cheaply asserted at API level. Session persistence, token storage, and UI redirects require a real browser. |
| **#2 Articles** | `POST /api/articles` with missing `title` → `422`; `PUT /api/articles/:slug` by non-author → `403`; `DELETE /api/articles/:slug` → verify `GET` returns `404` | Create article via editor → see in feed; edit → verify slug change; delete → verify removal from profile | Authorization and validation are API concerns; the editor UX and navigation side-effects are UI concerns. |
| **#3 Social** | `POST /api/profiles/:username/follow` then `GET /api/articles/feed` → includes author's articles; double-favourite is idempotent | Follow button toggles in profile; favourite counter increments/decrements; comment appears in list | State-machine transitions (follow → feed inclusion) are deterministic at API level; UI reactivity needs browser testing. |

### Authentication Handling in API Tests

```
Approach: "Authenticate Once, Reuse Token"

1. Before each test suite (or in a global setup fixture):
   - POST /api/users  →  register a unique user (e.g., `qa_<timestamp>@test.com`)
   - Store the returned JWT token in a shared context variable.

2. For each authenticated API request:
   - Attach the token via header:  Authorization: Token <jwt>

3. For tests that require a second user (e.g., follow, authorization checks):
   - Create a second user via API in the test setup.

4. Cleanup:
   - Because the demo database resets regularly, explicit cleanup is optional.
   - For isolation, use unique usernames per test run (timestamp or UUID suffix).
```

This avoids UI login overhead and keeps API tests sub-second. The token is obtained once and reused, mirroring how a real client SDK would work.

### Example API Test — `POST /api/articles`

```
Scenario: Creating an article with valid payload returns 201 and the article object

Given:
  - A registered user with a valid JWT token

When:
  - POST /api/articles
  - Headers: { "Authorization": "Token <jwt>", "Content-Type": "application/json" }
  - Body: {
      "article": {
        "title": "Test Article <timestamp>",
        "description": "A short summary",
        "body": "Full article content in Markdown",
        "tagList": ["test", "automation"]
      }
    }

Then:
  - Response status: 200 (Conduit returns 200, not 201)
  - Response body contains:
    - article.slug  → matches slugified title
    - article.title → "Test Article <timestamp>"
    - article.description → "A short summary"
    - article.tagList → includes "test" and "automation"
    - article.author.username → matches the authenticated user
    - article.favoritesCount → 0
    - article.createdAt → valid ISO 8601 datetime

Cleanup:
  - DELETE /api/articles/<slug>  (using the slug from the response)
```

### Additional API Test Scenarios (Brief)

| Endpoint | Scenario | Expected |
|----------|----------|----------|
| `POST /api/users` | Register with taken username | `422` with `"username has already been taken"` |
| `POST /api/users/login` | Login with incorrect password | `422` with `"email or password is invalid"` |
| `GET /api/articles?tag=dragons` | Filter by tag | All returned articles contain `"dragons"` in `tagList` |
| `DELETE /api/articles/:slug` | Delete by non-author | `403 Forbidden` |
| `POST /api/articles/:slug/comments` | Empty body | `422` validation error |

---

## 5. Quick Wins

Two high-impact deliverables that would add immediate value to the team:

### Quick Win 1: Smoke-Test Suite with Route-Intercepted Fixtures

**Deliver**: A lightweight smoke-test suite (5–8 tests) using Playwright route interception. Each test intercepts API calls and responds with fixture data (JSON files), then asserts that key pages render correctly: home feed, article detail, login page, profile page, and settings page.

**Impact**: Ships on day one and provides immediate regression coverage for the most-visited pages. Because it uses mocked data, it runs in <30 seconds, works offline, and never flakes due to backend instability. It also establishes the CI/CD pipeline foundation — any developer can run the suite before merging.

**Estimated effort**: ~3–4 hours including fixture creation and CI integration.

---

### Quick Win 2: API Health-Check & Auth Contract Tests

**Deliver**: A small Playwright `APIRequestContext` test file that runs against the live API — verifying the authentication endpoints (`POST /api/users`, `POST /api/users/login`, `GET /api/user`) return correct status codes, response shapes, and error messages for both happy and unhappy paths.

**Impact**: Catches backend regressions before they surface in the UI. Auth is the dependency for all other features, so a broken auth API is the earliest and most impactful signal. These tests execute in <5 seconds, making them ideal for a pre-deployment gate.

**Estimated effort**: ~2–3 hours including unique-user generation and CI integration.

---

## Design Decisions & Assumptions

| # | Decision | Rationale |
|---|----------|----------|
| 1 | **Playwright** as the E2E framework | Native multi-browser support, built-in API testing via `APIRequestContext`, excellent route-interception API, and first-class GitHub Actions integration. |
| 2 | **Unique test data per run** | Timestamp-suffixed usernames/emails prevent conflicts when multiple people run tests simultaneously against the shared demo environment. |
| 3 | **No dependency on pre-existing data** | The demo database resets regularly, so tests create their own data and clean up after themselves. |
| 4 | **Non-optimistic UI** informs assertion strategy | The app waits for API responses before updating the UI (follow, favourite, comment), so E2E tests must wait for network completion, not just click events. |
| 5 | **Assumptions documented, not asked** | Per the assignment guidelines, design decisions are documented here rather than raised as questions. |
