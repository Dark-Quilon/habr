# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Динамические страницы и приватные страницы не имеют корректных SEO-метаданных
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - `generateMetadata` не экспортируется из `/articles/[slug]/page.tsx` и `/profile/[username]/page.tsx`
    - `metadata` в `layout.tsx` не содержит полей `openGraph` и `twitter`
    - `metadata` для `/feed/page.tsx` не содержит `robots: 'noindex,nofollow'`
    - Файлы `app/robots.ts` и `app/sitemap.ts` отсутствуют
  - Написать тесты в `frontend/src/__tests__/seo-bug-condition.test.ts`:
    - Попытаться импортировать `generateMetadata` из `/articles/[slug]/page.tsx` — ожидается экспорт (упадёт)
    - Попытаться импортировать `generateMetadata` из `/profile/[username]/page.tsx` — ожидается экспорт (упадёт)
    - Проверить, что `metadata` из `layout.tsx` содержит поле `openGraph` (упадёт)
    - Проверить, что `metadata` для `/feed/page.tsx` содержит `robots: 'noindex,nofollow'` (упадёт)
    - Попытаться импортировать `robots` из `app/robots.ts` — файл не существует (упадёт)
    - Попытаться импортировать `sitemap` из `app/sitemap.ts` — файл не существует (упадёт)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (например: "generateMetadata не является экспортом из /articles/[slug]/page.tsx")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Рендер страниц не изменился после добавления метаданных
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (логика рендера компонентов):
    - Observe: `ArticlePage` рендерит контент статьи, комментарии и кнопки голосования
    - Observe: `ProfilePage` рендерит аватар, bio и кнопку подписки
    - Observe: Главная страница рендерит список статей с пагинацией
    - Observe: `/articles/new` и `/articles/[slug]/edit` редиректят неавторизованных пользователей
  - Написать property-based тесты в `frontend/src/__tests__/seo-preservation.test.ts`:
    - Для любого объекта статьи: JSX, возвращаемый `ArticlePage`, не изменяется при добавлении `generateMetadata`
    - Для любого username: JSX, возвращаемый `ProfilePage`, не изменяется при добавлении `generateMetadata`
    - Для любого набора статей: главная страница рендерит список без изменений
    - Редирект неавторизованных пользователей сохраняется на `/articles/new` и `/articles/[slug]/edit`
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix SEO metadata — добавить generateMetadata, metadata, robots.ts, sitemap.ts

  - [x] 3.1 Расширить корневой layout.tsx — добавить metadataBase, openGraph и twitter fallback
    - Добавить `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`
    - Добавить поля `openGraph: { title, description, type: 'website' }` в существующий `metadata`
    - Добавить поля `twitter: { card: 'summary', title, description }` в существующий `metadata`
    - _Bug_Condition: isBugCondition(layout) — metadata не содержит openGraph и twitter_
    - _Expected_Behavior: metadata.openGraph.title и metadata.twitter.title присутствуют_
    - _Preservation: Рендер дочерних компонентов layout не изменяется_
    - _Requirements: 2.3, 2.4_

  - [x] 3.2 Добавить generateMetadata в /articles/[slug]/page.tsx
    - Экспортировать `async function generateMetadata({ params })` из серверного компонента
    - Вызвать `getArticle(slug)`, вернуть `title: \`${article.title} | Habr Blog\``
    - Добавить `description` — первые 160 символов контента статьи (strip markdown)
    - Добавить `openGraph: { title, description, type: 'article', url }` и `twitter: { card: 'summary', title, description }`
    - Обработать 404: вернуть fallback metadata если статья не найдена
    - _Bug_Condition: isBugCondition(/articles/[slug]) — generateMetadata не экспортируется_
    - _Expected_Behavior: metadata.title содержит article.title, openGraph и twitter присутствуют_
    - _Preservation: JSX компонента ArticlePage не изменяется_
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 3.3 Добавить generateMetadata в /profile/[username]/page.tsx
    - Экспортировать `async function generateMetadata({ params })` из серверного компонента
    - Вызвать `getProfile(username)`, вернуть `title: \`${username} | Habr Blog\``
    - Добавить `description` из bio пользователя (если есть)
    - Добавить `openGraph` и `twitter` поля
    - Обработать случай `username === 'me'` — вернуть `robots: 'noindex,nofollow'`
    - Обработать 404: вернуть fallback metadata если профиль не найден
    - _Bug_Condition: isBugCondition(/profile/[username]) — generateMetadata не экспортируется_
    - _Expected_Behavior: metadata.title содержит username_
    - _Preservation: JSX компонента ProfilePage не изменяется_
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.4 Добавить noindex metadata в приватные страницы
    - `/feed/page.tsx` — добавить `export const metadata: Metadata = { robots: 'noindex,nofollow' }`
    - `/articles/new/page.tsx` — добавить `export const metadata: Metadata = { robots: 'noindex,nofollow' }`
    - `/articles/[slug]/edit/page.tsx` — добавить `export const metadata: Metadata = { robots: 'noindex,nofollow' }`
    - Создать `frontend/src/app/notifications/layout.tsx` — серверный layout с `metadata: { robots: 'noindex,nofollow' }` (обход ограничения 'use client' в page.tsx)
    - _Bug_Condition: isBugCondition(privatePage) — metadata не содержит robots: noindex,nofollow_
    - _Expected_Behavior: metadata.robots === 'noindex,nofollow' для всех приватных страниц_
    - _Preservation: Логика рендера и редиректов приватных страниц не изменяется_
    - _Requirements: 2.7_

  - [x] 3.5 Создать frontend/src/app/robots.ts
    - Экспортировать функцию `robots(): MetadataRoute.Robots`
    - Правила: `{ rules: [{ userAgent: '*', allow: '/', disallow: ['/feed', '/notifications', '/articles/new', '/articles/*/edit'] }], sitemap: \`${siteUrl}/sitemap.xml\` }`
    - _Bug_Condition: isBugCondition(robots.ts) — файл не существует, /robots.txt возвращает 404_
    - _Expected_Behavior: /robots.txt возвращает 200 с Disallow для всех приватных путей_
    - _Requirements: 2.5_

  - [x] 3.6 Создать frontend/src/app/sitemap.ts
    - Экспортировать async-функцию `sitemap(): Promise<MetadataRoute.Sitemap>`
    - Запросить все статьи через `getArticles()`, сформировать URL `/articles/${slug}` с `lastModified`
    - Добавить URL профилей авторов `/profile/${username}` (дедуплицировать)
    - Добавить статические URL: `/`, `/login`, `/register`
    - _Bug_Condition: isBugCondition(sitemap.ts) — файл не существует, /sitemap.xml возвращает 404_
    - _Expected_Behavior: /sitemap.xml возвращает 200 с URL всех публичных статей и профилей_
    - _Requirements: 2.6_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Динамические страницы и приватные страницы имеют корректные SEO-метаданные
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Рендер страниц не изменился
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Убедиться, что все тесты проходят, спросить пользователя если возникнут вопросы.
