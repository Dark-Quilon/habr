# Requirements Document

## Introduction

Настройка полноценной тестовой инфраструктуры для Next.js 14 / React 18 / TypeScript проекта. Требования охватывают конфигурацию Jest, создание вспомогательных утилит (кастомный render, фабрики данных, моки), написание юнит-тестов для всех 11 компонентов в `frontend/src/components/`, а также property-based тесты для чистых функций.

## Glossary

- **Test_Infrastructure**: Совокупность конфигурационных файлов, хелперов и моков, обеспечивающих запуск тестов
- **Jest**: Фреймворк для тестирования JavaScript/TypeScript
- **RTL**: React Testing Library — библиотека для тестирования React-компонентов
- **Factory**: Функция-фабрика, создающая типизированные тестовые объекты с дефолтными значениями
- **Mock**: Заглушка, заменяющая реальную зависимость в тестах
- **Component**: React-компонент из директории `frontend/src/components/`
- **API_Mock**: Мок для функций из `lib/api`, имитирующий HTTP-запросы
- **Auth_Mock**: Мок для функций из `lib/auth`, имитирующий аутентификацию
- **Navigation_Mock**: Мок для `next/navigation`, имитирующий роутинг Next.js
- **PBT**: Property-Based Testing — тестирование на основе свойств с генерацией случайных входных данных
- **fast-check**: Библиотека для property-based тестирования в JavaScript/TypeScript
- **Coverage**: Процент покрытия кода тестами (statement coverage)
- **Optimistic_Update**: Немедленное обновление UI до получения ответа от API

---

## Requirements

### Requirement 1: Конфигурация Jest

**User Story:** As a developer, I want a working Jest configuration for the Next.js 14 project, so that I can run tests with TypeScript and jsdom support.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include a `jest.config.ts` file at the project root that uses `next/jest` transformer
2. THE Test_Infrastructure SHALL configure `testEnvironment` as `jsdom` in `jest.config.ts`
3. THE Test_Infrastructure SHALL configure `moduleNameMapper` to resolve `@/` aliases to `frontend/src/`
4. THE Test_Infrastructure SHALL configure `testMatch` to discover test files matching `**/__tests__/**/*.test.{ts,tsx}`
5. THE Test_Infrastructure SHALL configure `collectCoverageFrom` to include `frontend/src/components/**/*.{ts,tsx}`
6. THE Test_Infrastructure SHALL include a `jest.setup.ts` file that imports `@testing-library/jest-dom`
7. WHEN `npm test` is run in the `frontend/` directory, THE Test_Infrastructure SHALL execute all discovered test files
8. WHEN `npm run test:coverage` is run, THE Test_Infrastructure SHALL generate a coverage report

---

### Requirement 2: Глобальные моки Next.js

**User Story:** As a developer, I want global mocks for Next.js navigation hooks, so that components using `useRouter`, `usePathname`, and `useSearchParams` can be tested without a real Next.js runtime.

#### Acceptance Criteria

1. THE Navigation_Mock SHALL mock `next/navigation` module globally in `jest.setup.ts`
2. THE Navigation_Mock SHALL provide a `useRouter` mock returning an object with `push`, `replace`, and `back` jest functions
3. THE Navigation_Mock SHALL provide a `usePathname` mock returning `'/'` by default
4. THE Navigation_Mock SHALL provide a `useSearchParams` mock returning an empty `URLSearchParams` instance by default
5. WHEN a specific test overrides `useRouter`, THE Navigation_Mock SHALL allow per-test override via `jest.mocked(useRouter).mockReturnValue(...)`

---

### Requirement 3: Вспомогательные утилиты — кастомный render

**User Story:** As a developer, I want a custom render helper that wraps components in required providers, so that all tests use a consistent rendering setup.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL provide a `renderWithProviders` function in `frontend/__tests__/helpers/render.tsx`
2. WHEN `renderWithProviders` is called with a React element, THE Test_Infrastructure SHALL wrap it in all required providers (including `Toaster`)
3. THE Test_Infrastructure SHALL re-export all utilities from `@testing-library/react` alongside `renderWithProviders`
4. WHEN `renderWithProviders` is called with optional `RenderOptions`, THE Test_Infrastructure SHALL pass them through to the underlying RTL `render`

---

### Requirement 4: Вспомогательные утилиты — фабрики тестовых данных

**User Story:** As a developer, I want typed data factories for test fixtures, so that I can create test objects without manually specifying all required fields.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL provide factory functions in `frontend/__tests__/helpers/factories.ts`
2. THE Test_Infrastructure SHALL provide `makeUser(overrides?)` returning a valid `User` object
3. THE Test_Infrastructure SHALL provide `makeTag(overrides?)` returning a valid `Tag` object
4. THE Test_Infrastructure SHALL provide `makeArticle(overrides?)` returning a valid `ArticleList` object
5. THE Test_Infrastructure SHALL provide `makeArticleDetail(overrides?)` returning a valid `ArticleDetail` object
6. THE Test_Infrastructure SHALL provide `makeComment(overrides?)` returning a valid `Comment` object
7. THE Test_Infrastructure SHALL provide `makeProfile(overrides?)` returning a valid `Profile` object
8. WHEN a factory is called with `overrides`, THE Test_Infrastructure SHALL merge overrides into the default object
9. WHEN multiple factory calls are made, THE Test_Infrastructure SHALL generate unique `id` values for each object

---

### Requirement 5: Вспомогательные утилиты — моки API и Auth

**User Story:** As a developer, I want centralized mock helpers for `lib/api` and `lib/auth`, so that I can set up API and authentication scenarios consistently across tests.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL provide mock utilities in `frontend/__tests__/helpers/mocks.ts`
2. THE Auth_Mock SHALL provide `mockAuthenticatedUser(user?)` that configures `getToken` to return a valid token
3. THE Auth_Mock SHALL provide `mockUnauthenticatedUser()` that configures `getToken` to return `null`
4. THE API_Mock SHALL provide `mockApiSuccess(fn, data)` that configures a jest mock to resolve with `data`
5. THE API_Mock SHALL provide `mockApiError(fn, status, message)` that configures a jest mock to reject with an `ApiError`

---

### Requirement 6: Тесты простых компонентов (рендер + props)

**User Story:** As a developer, I want unit tests for display-only components, so that I can verify they render the correct content based on their props.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include tests for `ArticleCard` in `frontend/__tests__/components/ArticleCard.test.tsx`
2. WHEN `ArticleCard` is rendered with an article, THE Test_Infrastructure SHALL verify the title is displayed as a link to `/articles/{slug}`
3. WHEN `ArticleCard` is rendered with tags, THE Test_Infrastructure SHALL verify each tag name is displayed
4. WHEN `ArticleCard` is rendered with rating and views, THE Test_Infrastructure SHALL verify both values are displayed
5. THE Test_Infrastructure SHALL include tests for `ArticleList` in `frontend/__tests__/components/ArticleList.test.tsx`
6. WHEN `ArticleList` is rendered with an empty array, THE Test_Infrastructure SHALL verify an empty state message is displayed
7. WHEN `ArticleList` is rendered with articles, THE Test_Infrastructure SHALL verify the correct number of `ArticleCard` elements is rendered
8. THE Test_Infrastructure SHALL include tests for `Pagination` in `frontend/__tests__/components/Pagination.test.tsx`
9. WHEN `Pagination` is rendered with `count` ≤ `pageSize`, THE Test_Infrastructure SHALL verify no pagination element is rendered
10. WHEN `Pagination` is rendered on the first page, THE Test_Infrastructure SHALL verify the "previous" control has a `disabled` state
11. WHEN `Pagination` is rendered on the last page, THE Test_Infrastructure SHALL verify the "next" control has a `disabled` state
12. WHEN `Pagination` is rendered with `searchParams`, THE Test_Infrastructure SHALL verify generated page links preserve existing query parameters

---

### Requirement 7: Тесты интерактивных компонентов (события + состояние)

**User Story:** As a developer, I want unit tests for interactive components, so that I can verify user interactions trigger the correct state changes and API calls.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include tests for `VoteButtons` in `frontend/__tests__/components/VoteButtons.test.tsx`
2. WHEN an authenticated user clicks the upvote button, THE Test_Infrastructure SHALL verify `voteArticle` is called with the correct slug and value `1`
3. WHEN an authenticated user clicks the downvote button, THE Test_Infrastructure SHALL verify `voteArticle` is called with the correct slug and value `-1`
4. WHEN `voteArticle` resolves successfully, THE Test_Infrastructure SHALL verify the displayed rating updates to the value returned by the API
5. WHEN `voteArticle` rejects with status 403, THE Test_Infrastructure SHALL verify the displayed rating reverts to the initial value
6. WHEN an unauthenticated user clicks a vote button, THE Test_Infrastructure SHALL verify `router.push` is called with `'/login'`
7. THE Test_Infrastructure SHALL include tests for `FollowButton` in `frontend/__tests__/components/FollowButton.test.tsx`
8. WHEN an unauthenticated user views `FollowButton`, THE Test_Infrastructure SHALL verify the button has a `disabled` attribute
9. WHEN an authenticated user clicks `FollowButton` on an unfollowed profile, THE Test_Infrastructure SHALL verify the follow API function is called
10. THE Test_Infrastructure SHALL include tests for `DeleteArticleButton` in `frontend/__tests__/components/DeleteArticleButton.test.tsx`
11. WHEN a user clicks `DeleteArticleButton` and confirms the dialog, THE Test_Infrastructure SHALL verify the delete API function is called
12. WHEN a user clicks `DeleteArticleButton` and cancels the dialog, THE Test_Infrastructure SHALL verify the delete API function is not called
13. THE Test_Infrastructure SHALL include tests for `SearchBar` in `frontend/__tests__/components/SearchBar.test.tsx`
14. WHEN a user types in `SearchBar` and submits, THE Test_Infrastructure SHALL verify `router.push` is called with the correct search query URL

---

### Requirement 8: Тесты сложных компонентов (API + роутинг + auth)

**User Story:** As a developer, I want unit tests for complex components that interact with APIs and routing, so that I can verify their full behavior including loading states, error handling, and navigation.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include tests for `Navbar` in `frontend/__tests__/components/Navbar.test.tsx`
2. WHEN `Navbar` is rendered for an unauthenticated user, THE Test_Infrastructure SHALL verify login and register links are displayed
3. WHEN `Navbar` is rendered for an authenticated user, THE Test_Infrastructure SHALL verify the username and logout option are displayed
4. THE Test_Infrastructure SHALL include tests for `ArticleForm` in `frontend/__tests__/components/ArticleForm.test.tsx`
5. WHEN `ArticleForm` is submitted with valid data, THE Test_Infrastructure SHALL verify the create/update API function is called with correct arguments
6. WHEN `ArticleForm` receives a 400 API error with field errors, THE Test_Infrastructure SHALL verify `.is-invalid` classes are applied to the corresponding fields
7. THE Test_Infrastructure SHALL include tests for `CommentSection` in `frontend/__tests__/components/CommentSection.test.tsx`
8. WHEN `CommentSection` is rendered, THE Test_Infrastructure SHALL verify existing comments are displayed
9. WHEN an authenticated user submits a new comment, THE Test_Infrastructure SHALL verify the create comment API function is called
10. THE Test_Infrastructure SHALL include tests for `ProfileEditForm` in `frontend/__tests__/components/ProfileEditForm.test.tsx`
11. WHEN `ProfileEditForm` is submitted with valid data, THE Test_Infrastructure SHALL verify the update profile API function is called

---

### Requirement 9: Тесты чистых функций — `parseTags`

**User Story:** As a developer, I want unit and property-based tests for the `parseTags` function, so that I can verify it correctly parses comma-separated tag strings under all inputs.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include tests for `parseTags` in the `ArticleForm` test file
2. WHEN `parseTags` is called with an empty string, THE Test_Infrastructure SHALL verify it returns an empty array
3. WHEN `parseTags` is called with `'a, b, c'`, THE Test_Infrastructure SHALL verify it returns `['a', 'b', 'c']`
4. WHEN `parseTags` is called with strings containing extra whitespace, THE Test_Infrastructure SHALL verify each returned tag has no leading or trailing whitespace
5. FOR ALL string inputs, THE Test_Infrastructure SHALL verify `parseTags` never returns an array containing empty strings (property test)
6. THE Pretty_Printer for tags SHALL format a `string[]` back into a comma-separated string
7. FOR ALL valid tag arrays, parsing then printing then parsing SHALL produce an equivalent array (round-trip property)

---

### Requirement 10: Тесты чистых функций — `buildPageUrl`

**User Story:** As a developer, I want unit and property-based tests for the `buildPageUrl` function, so that I can verify it correctly constructs pagination URLs.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include tests for `buildPageUrl` in the `Pagination` test file
2. WHEN `buildPageUrl` is called with page number `n` and no `searchParams`, THE Test_Infrastructure SHALL verify it returns `?page=n`
3. WHEN `buildPageUrl` is called with page number `n` and existing `searchParams`, THE Test_Infrastructure SHALL verify the returned URL contains all existing parameters
4. WHEN `buildPageUrl` is called with page number `n` and `searchParams` already containing a `page` key, THE Test_Infrastructure SHALL verify the `page` parameter is overwritten with `n`
5. FOR ALL positive integer page numbers and any `searchParams`, THE Test_Infrastructure SHALL verify the returned URL contains `page=n` (property test)

---

### Requirement 11: Покрытие кода и изоляция тестов

**User Story:** As a developer, I want tests to be isolated and achieve sufficient code coverage, so that the test suite is reliable and catches regressions.

#### Acceptance Criteria

1. WHEN all component tests are run, THE Test_Infrastructure SHALL achieve ≥ 80% statement coverage for `frontend/src/components/`
2. THE Test_Infrastructure SHALL call `jest.clearAllMocks()` in `beforeEach` to ensure mock isolation between tests
3. WHEN tests are run, THE Test_Infrastructure SHALL not make real HTTP requests — all API calls SHALL be mocked
4. WHEN tests are run, THE Test_Infrastructure SHALL not use real authentication tokens — all token values SHALL be test placeholders
5. THE Test_Infrastructure SHALL use `findBy*` queries instead of `waitFor` with long timeouts for async assertions
