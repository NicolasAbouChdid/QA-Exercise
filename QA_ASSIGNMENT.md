# QA Engineer Take-Home Assignment

**Time Expectation**: 6–8 hours maximum  
**Deadline**: 1 week from receipt  
**Goal**: Show us how you'd start building our E2E automation practice from day one.

---

## The Application

**URL**: https://demo.realworld.show/

This is "Conduit" - a full-stack Medium.com clone built with Angular (frontend) and Node/Express (backend). It's a real social blogging platform with:
- User authentication (register, login, logout)
- Article management (create, edit, delete, favorite)
- Social features (follow users, comment on articles, personal feeds)
- Tags and filtering

**Getting Started with the App**:
- You can **browse articles without logging in** to get familiar with the UI
- **Then register a test account** (use a throwaway email) to access full functionality
- Most features (creating articles, following, favoriting) require authentication
- Feel free to click around and experiment - the database resets regularly

**Technical Details**:
- Frontend: Angular (our stack)
- Backend: Node/Express RESTful API
- Source: https://github.com/gothinkster/angular-realworld-example-app

---

## The Assignment (Two Parts)

### Part 1: Explore & Strategize (2–2.5 hours)

Create a file called `STRATEGY.md` in your repository.

#### Required Sections:

**1. Top 4 Critical User Journeys or Quality Risks**

Identify the most important flows or risks to focus on. For each one, include:
- **Description**: What is the journey/risk? (2-3 sentences)
- **Why it's critical**: What's the user or business impact if this breaks?
- **Key considerations**: Any edge cases, dependencies, or gotchas you noticed?

*Example format*:
> **Journey 1: User Registration & First Login**  
> New user signs up, receives confirmation, and accesses their account.  
> **Critical because**: First impression - broken registration = lost users.  
> **Considerations**: Email validation, duplicate username handling, session persistence.

**2. Prioritization (Rank 1–4)**

Rank your four items from most to least critical, with a 1-2 sentence justification for each ranking.

**3. Test Coverage Strategy**

For each of your top 4 priorities, recommend:
- **Primary test type**: E2E, API, integration, or unit?
- **Reasoning**: Why is this the right level to test this?
- **Who owns it**: QA automation, or should devs handle it?


**4. API Testing Approach** _(Conceptual Only - No Implementation Required)_

Even though you won't be implementing API tests in this assignment due to time constraints, we want to see your thinking:

- **API vs UI Testing**: For 2-3 of your priorities, which endpoints would you test at the API level vs UI level? Why?
- **Auth Handling**: How would you handle authentication in API tests? (Describe your approach)
- **Example Scenario**: Write a brief description or pseudocode for one API test (e.g., "POST /api/articles with valid payload should return 201 and article slug")

*This demonstrates your understanding of testing at different layers without requiring implementation.*

**5. Quick Wins (First Week)**

List 2 things you could implement and ship in your first week that would add immediate value.

---

### Part 2: E2E Automation Proof-of-Concept (4–5.5 hours)

Implement production-ready E2E tests that demonstrate your technical skills.

#### Framework Choice

Use **Playwright** or **Cypress** (your choice).

#### Requirements

**Test Coverage**:
- Write **3–5 high-quality E2E tests**
- Focus on your **#1 and #2 priority journeys** from your strategy
- Quality over quantity - we'd rather see 3 excellent tests than 5 mediocre ones

**Code Quality**:
- Use **Page Object Model** or similar architectural pattern
- Clean, readable code with consistent naming conventions
- Reusable utilities where appropriate
- Meaningful test descriptions

**Test Data & Isolation**:
- At least **one test must demonstrate proper handling** of:
  - Authentication (login, session management, logout)
  - OR test data (user creation, cleanup, or isolation between tests)
- Each test should be **independent** (can run in any order)
- Consider using unique data per test run (timestamps, random IDs) to avoid conflicts

**Local Execution (Critical)**:
- Tests must run **entirely locally** with minimal network dependency
- Use **route interception** or **fixtures** to mock API responses after initial load
- Multiple people should be able to run your tests simultaneously without conflicts
- We should be able to run your tests offline (after first visit) if designed well

*Why this matters: It ensures your tests are reliable, fast, and don't depend on external service availability.*

**CI/CD Pipeline**:
- Create `.github/workflows/tests.yml` that:
  - Runs on push/PR to main branch
  - Executes your test suite
  - Uses parallel execution if applicable 
  - Uploads screenshots/videos/traces as artifacts on failure
  - Shows clear pass/fail status

**Performance**:
- Full suite should complete in **under 5 minutes**

---

## Deliverables

To submit your assignment, reply to the email with a **GitHub repository link** (public or private - your choice) containing:

### Required Files:

1. **`STRATEGY.md`**  
   Your test planning document (see Part 1)

2. Your test code organized logically

3. Your test framework configuration files

4. Your github CI/CD workflow

5. **`README.md`**  
   **Must include**:
   - **Prerequisites**: Node version, any other dependencies
   - **Installation**: Step-by-step setup instructions
   - **Running Tests**: Commands to run tests locally
     - How to run all tests
     - How to run in headed mode (if applicable)
     - How to view test reports
   - **Key Decisions**: Any architectural choices or trade-offs you made
   - **Time Spent**: Approximate time (optional but helpful)


---

## How We Evaluate

We assess submissions on four criteria:

| Criterion | Weight | What We're Looking For |
|-----------|--------|------------------------|
| **Code Quality & Architecture** | 40% | • Clean, maintainable code<br>• Proper use of patterns (Page Objects, etc.)<br>• Good separation of concerns<br>• Reusable components<br>• Consistent style |
| **Strategic Thinking** | 30% | • Realistic prioritization<br>• Understanding of risk vs. effort<br>• Appropriate test level recommendations<br>• Practical "quick wins"<br>• Clear reasoning |
| **CI/CD & Test Setup** | 20% | • Working GitHub Actions workflow<br>• Proper test isolation<br>• Local execution capability<br>• Good use of fixtures/interception<br>• Fast execution |
| **Documentation & Communication** | 10% | • Clear, complete README<br>• Well-structured STRATEGY.md<br>• Good commit messages<br>• Explains trade-offs |

### What We Value:
- **Pragmatic solutions** - Production-ready over perfect
- **Clear thinking** - Can you explain your decisions?
- **Maintainability** - Could your team extend this?
- **Realism** - Appropriate scope for time given

---

## Tips for Success

1. Start with `STRATEGY.md` - it informs what you automate

2. Use 20-30 min to explore the app before diving in

3. Make architectural decisions you could defend in an interview

4. If you hit 8 hours, submit what you have - completeness matters less than quality


---

## Questions?

In order to be fair to all candidates we will not be taking questions.  If you have any questions about the requirements we recommend making an assumption or design decision and documenting it. 

**Good luck!** We're excited to see your approach to testing and automation.
