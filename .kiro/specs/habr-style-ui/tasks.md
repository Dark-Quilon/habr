# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Habr UI Components Defects
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases for each component
  - Test 1 — Navbar: render `<Navbar>` → assert `.habr-navbar` class or `background-color: #1f2937` is present (isBugCondition: navbarHasClass('bg-dark') = true)
  - Test 2 — Navbar logo: render `<Navbar>` → assert text "Habr" is present (isBugCondition: logoText = 'BlogApp')
  - Test 3 — Navbar icons: render `<Navbar>` → assert SVG search icon and pencil icon are present (isBugCondition: NOT hasIconSearch() OR NOT hasIconWrite())
  - Test 4 — Navbar burger: render `<Navbar>` → assert burger button is present on the left (isBugCondition: NOT hasBurgerLeft())
  - Test 5 — HomePage: render `<HomePage>` → assert "Моя лента" section is present (isBugCondition: NOT hasMyFeedSection())
  - Test 6 — ArticleCard: render `<ArticleCard article={mockArticle}>` → assert "Читать дальше" button is present (isBugCondition: NOT hasReadMoreButton())
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - `expect(getByText('Habr')).toBeInTheDocument()` — FAIL (found "BlogApp")
    - `expect(container.querySelector('.habr-navbar')).toBeTruthy()` — FAIL (found `bg-dark`)
    - `expect(getByText('Читать дальше')).toBeInTheDocument()` — FAIL (element missing)
    - `expect(getByText('Моя лента')).toBeInTheDocument()` — FAIL (element missing)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Navigation and Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (isBugCondition = false for these interactions)
  - Observe: logo link href="/" on unfixed code
  - Observe: pencil icon href="/articles/new" on unfixed code
  - Observe: tag click triggers filter on unfixed code
  - Observe: article title link href="/articles/{slug}" on unfixed code
  - Observe: unreadCount badge renders correctly for authenticated users on unfixed code
  - Write property-based tests:
    - For all articles with any slug/title/tags combination → article title link always points to `/articles/{slug}` (preservation of 3.6)
    - For all articles with any tags array → tags always render with correct filter links (preservation of 3.5)
    - For all unreadCount values (0..N) → notification badge renders correctly for authenticated users (preservation of 3.7)
    - Logo link always has href="/" (preservation of 3.1)
    - Write/pencil link always has href="/articles/new" (preservation of 3.3)
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Fix Habr-style UI

  - [x] 3.1 Add `.habr-navbar` SCSS class in `frontend/src/styles/globals.scss`
    - Add `.habr-navbar { background-color: #1f2937; }` to globals.scss
    - _Bug_Condition: isBugCondition('Navbar') where navbarHasClass('bg-dark') = true_
    - _Expected_Behavior: navbar background renders as #1f2937_
    - _Preservation: no other styles affected_
    - _Requirements: 2.1_

  - [x] 3.2 Update `frontend/src/components/Navbar.tsx`
    - Replace `bg-dark` class with `habr-navbar`
    - Replace logo text "BlogApp" with "Habr"
    - Add burger button (three horizontal lines) on the left side; on click show offcanvas/dropdown with popular tags
    - Replace text search link with SVG search icon; on click toggle inline search bar
    - Replace text write link with SVG pencil icon with Bootstrap tooltip "Написать публикацию", href="/articles/new"
    - Replace text account links with SVG account icon; authenticated → dropdown with profile/notifications/logout; unauthenticated → dropdown with login/register
    - _Bug_Condition: isBugCondition('Navbar') — all sub-conditions_
    - _Expected_Behavior: expectedBehavior from design — habr-navbar class, "Habr" logo, burger left, SVG icons right_
    - _Preservation: logo href="/", pencil href="/articles/new", search functionality, logout redirect, notification badge_
    - _Requirements: 2.1, 2.2, 2.3, 2.3.1, 2.3.2, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.7_

  - [x] 3.3 Update `frontend/src/app/page.tsx`
    - Add "Моя лента" section above `<ArticleList>`
    - Use `getServerToken()` to check auth state
    - If authenticated: show link to `/feed` or brief feed preview
    - If unauthenticated: show message "Войдите, чтобы видеть свою ленту" with link to `/login`
    - _Bug_Condition: isBugCondition('HomePage') where NOT hasMyFeedSection() = true_
    - _Expected_Behavior: "Моя лента" section renders for all users_
    - _Preservation: ArticleList, pagination remain unchanged_
    - _Requirements: 2.7, 2.8, 3.8_

  - [x] 3.4 Update `frontend/src/components/ArticleCard.tsx`
    - Add `<Link href={`/articles/${article.slug}`} className="btn btn-outline-primary btn-sm mt-2">Читать дальше</Link>` at the bottom of `card-body`
    - _Bug_Condition: isBugCondition('ArticleCard') where NOT hasReadMoreButton() = true_
    - _Expected_Behavior: "Читать дальше" button present with href="/articles/{slug}"_
    - _Preservation: title link, tag links, vote buttons, author info unchanged_
    - _Requirements: 2.9, 3.5, 3.6_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Habr UI Components Defects
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.3.1, 2.3.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Navigation and Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
