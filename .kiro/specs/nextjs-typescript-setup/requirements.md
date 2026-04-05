# Requirements Document

## Introduction

Настройка фронтенд-приложения на Next.js 14 (App Router) с TypeScript в директории `frontend/` поверх существующего Django-бэкенда. Фронтенд общается с Django через REST API, деплоится как отдельный сервис. Цель — production-ready структура с правильной конфигурацией TypeScript, алиасами путей, переменными окружения, централизованным API-слоем и базовыми UI-компонентами.

## Glossary

- **Frontend**: Next.js 14 приложение в директории `frontend/`
- **App_Router**: Механизм маршрутизации Next.js 14 на основе файловой системы в директории `app/`
- **API_Layer**: Модуль `lib/api.ts` — централизованный HTTP-клиент для запросов к Django
- **Config_Module**: Модуль `lib/config.ts` — типобезопасный доступ к переменным окружения
- **Django_API**: Существующий Django REST API бэкенд
- **AppConfig**: TypeScript-объект с полями `apiUrl`, `isDevelopment`, `isProduction`
- **ApiError**: Кастомный класс ошибки с HTTP-статусом и сообщением
- **Server_Component**: React Server Component, рендерящийся на стороне сервера Next.js
- **Client_Component**: React Client Component с директивой `'use client'`
- **RootLayout**: Корневой layout-компонент `app/layout.tsx`

## Requirements

### Requirement 1: Инициализация проекта Next.js с TypeScript

**User Story:** As a developer, I want a Next.js 14 project with TypeScript configured in the `frontend/` directory, so that I have a typed, structured frontend codebase separate from the Django backend.

#### Acceptance Criteria

1. THE Frontend SHALL be located in the `frontend/` directory at the project root
2. THE Frontend SHALL use Next.js 14 with App Router (not Pages Router)
3. THE Frontend SHALL use TypeScript 5.x in strict mode
4. WHEN TypeScript strict mode is enabled, THE Frontend SHALL enforce `strict: true` in `tsconfig.json`
5. THE Frontend SHALL configure path aliases so that `@/` resolves to the `frontend/src/` or `frontend/` root directory
6. THE Frontend SHALL include ESLint configured with `eslint-config-next`

---

### Requirement 2: Конфигурация переменных окружения

**User Story:** As a developer, I want type-safe access to environment variables, so that missing configuration is caught at startup rather than at runtime.

#### Acceptance Criteria

1. THE Config_Module SHALL export a single `config` object of type `AppConfig`
2. WHEN `NEXT_PUBLIC_API_URL` is not set, THE Config_Module SHALL throw an `Error` with a descriptive message before the application starts
3. WHEN all required environment variables are present, THE Config_Module SHALL return a fully populated `AppConfig` object
4. IF `NEXT_PUBLIC_API_URL` is absent, THEN THE Config_Module SHALL never return a partially populated `AppConfig` object
5. THE Frontend SHALL provide a `.env.local.example` file listing all required environment variables

---

### Requirement 3: API Layer — типизированный HTTP-клиент

**User Story:** As a developer, I want a centralized API layer for communicating with the Django REST API, so that all HTTP logic is consistent and type-safe across the application.

#### Acceptance Criteria

1. THE API_Layer SHALL export an `apiFetch<T>` function that accepts an endpoint string and optional fetch options
2. WHEN a request succeeds with a 2xx status, THE API_Layer SHALL return a value of type `T`
3. WHEN Django_API returns a non-2xx status, THE API_Layer SHALL throw an `ApiError` containing the HTTP status code and error message
4. WHEN `fetch()` throws a network error, THE API_Layer SHALL propagate the error to the caller without swallowing it
5. THE API_Layer SHALL construct the full request URL by combining `config.apiUrl` with the provided endpoint
6. WHEN query parameters are provided, THE API_Layer SHALL append them as a valid query string to the URL
7. THE API_Layer SHALL set `Content-Type: application/json` as a default request header
8. THE API_Layer SHALL NOT mutate the options object passed by the caller

---

### Requirement 4: Построение URL (`buildUrl`)

**User Story:** As a developer, I want a reliable URL builder, so that API requests always target the correct endpoint with correct query strings.

#### Acceptance Criteria

1. THE API_Layer SHALL include a `buildUrl(base, endpoint, params?)` function
2. WHEN `params` is provided, THE API_Layer SHALL append all key-value pairs as a URL query string
3. FOR ALL valid combinations of `base` and `endpoint`, THE API_Layer SHALL return a string that is parseable as a valid URL
4. WHEN `base` has no trailing slash and `endpoint` starts with `/`, THE API_Layer SHALL produce a URL without double slashes

---

### Requirement 5: Корневой Layout и структура App Router

**User Story:** As a developer, I want a root layout component and proper App Router structure, so that the application has a consistent HTML shell and global styles.

#### Acceptance Criteria

1. THE RootLayout SHALL render an `<html>` element with a `lang` attribute and a `<body>` element
2. THE RootLayout SHALL accept and render `children` of type `React.ReactNode`
3. WHEN `children` is `null` or `undefined`, THE RootLayout SHALL render without errors
4. THE Frontend SHALL include a global CSS file imported in `RootLayout`
5. THE App_Router SHALL include a root `page.tsx` as the home page entry point

---

### Requirement 6: TypeScript-типы для данных

**User Story:** As a developer, I want shared TypeScript interfaces for API data models, so that frontend components and the API layer share a single source of truth for data shapes.

#### Acceptance Criteria

1. THE Frontend SHALL define an `Article` interface with fields: `id`, `title`, `content`, `author`, `created_at`, `updated_at`, `tags`
2. THE Frontend SHALL define an `Author` interface with fields: `id`, `username`, `avatar_url`
3. THE Frontend SHALL define a generic `PaginatedResponse<T>` interface with fields: `count`, `next`, `previous`, `results`
4. THE Frontend SHALL export all shared types from a dedicated `types/` directory or `types/index.ts` file

---

### Requirement 7: Базовые UI-компоненты

**User Story:** As a developer, I want reusable primitive UI components, so that the application has a consistent design foundation.

#### Acceptance Criteria

1. THE Frontend SHALL include a `Button` component in `components/ui/`
2. THE Button component SHALL accept a `variant` prop with values `'primary'`, `'secondary'`, or `'danger'`
3. THE Button component SHALL accept a `size` prop with values `'sm'`, `'md'`, or `'lg'`
4. THE Button component SHALL accept an `isLoading` prop of type `boolean`
5. THE Frontend SHALL include an `ErrorBoundary` component that accepts `children` and an optional `fallback` prop

---

### Requirement 8: Обработка ошибок

**User Story:** As a developer, I want consistent error handling across the application, so that users see meaningful feedback and the application recovers gracefully.

#### Acceptance Criteria

1. WHEN Django_API is unreachable, THE Frontend SHALL display a fallback UI via Next.js `error.tsx` boundary
2. WHEN Django_API returns a 4xx or 5xx response, THE API_Layer SHALL throw an `ApiError` with the HTTP status code and a human-readable message parsed from the JSON response body
3. IF the JSON error body cannot be parsed, THEN THE API_Layer SHALL fall back to `response.statusText` as the error message
4. THE Frontend SHALL include an `error.tsx` file in the `app/` directory to handle unhandled errors at the route level

---

### Requirement 9: Интеграция с Docker Compose

**User Story:** As a developer, I want the Next.js frontend to run as a separate Docker Compose service, so that the full stack can be started with a single command.

#### Acceptance Criteria

1. THE Frontend SHALL have a `Dockerfile` in the `frontend/` directory
2. WHEN Docker Compose starts, THE Frontend service SHALL be reachable on a dedicated port separate from Django
3. THE Frontend service SHALL receive `NEXT_PUBLIC_API_URL` as an environment variable from Docker Compose
4. THE Frontend service SHALL depend on the Django service in the Docker Compose configuration

---

### Requirement 10: Безопасность

**User Story:** As a developer, I want the frontend to follow security best practices, so that sensitive data is not exposed and cross-origin requests are handled correctly.

#### Acceptance Criteria

1. THE Frontend SHALL NOT store secret credentials in variables prefixed with `NEXT_PUBLIC_`
2. WHEN making POST, PUT, or DELETE requests, THE API_Layer SHALL include the `X-CSRFToken` header with the value read from the Django CSRF cookie
3. THE Frontend documentation SHALL specify that Django must be configured with `django-cors-headers` to allow requests from the frontend origin
