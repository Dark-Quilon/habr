# SEO Metadata Bugfix Design

## Overview

В проекте Next.js 14 App Router отсутствует корректная SEO-разметка. Корневой `layout.tsx`
определяет единственный статический `metadata` объект (`title: 'Habr Blog'`), который
применяется ко всем страницам без изменений. Динамические страницы не экспортируют
`generateMetadata`, отсутствуют OG/Twitter теги, `robots.txt` и `sitemap.xml`.

Стратегия исправления: добавить `generateMetadata` в серверные страницы (`/articles/[slug]`,
`/profile/[username]`), статические `metadata` объекты в серверные страницы (`/`, `/feed`),
отдельные серверные layout-обёртки для клиентских страниц (`/login`, `/register`,
`/notifications`), файлы `app/robots.ts` и `app/sitemap.ts`, а также `noindex` для приватных
страниц.

---

## Glossary

- **Bug_Condition (C)**: Условие, при котором баг проявляется — страница рендерится без
  корректных SEO-тегов (title, description, OG, Twitter, robots)
- **Property (P)**: Ожидаемое поведение — каждая страница возвращает уникальные, релевантные
  метаданные; приватные страницы содержат `noindex`
- **Preservation**: Существующий рендер страниц (контент, навигация, формы) не должен
  измениться после добавления метаданных
- **generateMetadata**: Async-функция Next.js App Router, экспортируемая из серверного
  page/layout файла, возвращает объект `Metadata`
- **metadata**: Статический экспорт объекта `Metadata` из серверного page/layout файла
- **noindex**: Директива `<meta name="robots" content="noindex,nofollow">`, запрещающая
  индексацию страницы поисковыми роботами
- **privatePages**: Страницы `/feed`, `/notifications`, `/articles/new`,
  `/articles/[slug]/edit` — требуют авторизации и не должны индексироваться
- **NEXT_PUBLIC_SITE_URL**: Переменная окружения с базовым URL сайта (например,
  `https://habr-blog.example.com`), используется для canonical URL и sitemap

---

## Bug Details

### Bug Condition

Баг проявляется при любом запросе к страницам приложения. Функция `generateMetadata` не
экспортируется из динамических страниц, статические `metadata` объекты отсутствуют на
большинстве страниц, файлы `robots.ts` и `sitemap.ts` не созданы.

**Formal Specification:**
```
FUNCTION isBugCondition(page)
  INPUT: page — маршрут Next.js App Router
  OUTPUT: boolean

  IF page НЕ экспортирует metadata И НЕ экспортирует generateMetadata
    RETURN true
  IF page является динамической (/articles/[slug], /profile/[username])
     И НЕ экспортирует generateMetadata
    RETURN true
  IF page является приватной (/feed, /notifications, /articles/new, /articles/[slug]/edit)
     И metadata НЕ содержит robots: 'noindex,nofollow'
    RETURN true
  IF файл app/robots.ts НЕ существует
    RETURN true
  IF файл app/sitemap.ts НЕ существует
    RETURN true
  RETURN false
END FUNCTION
```

### Examples

- `/articles/some-slug` → `<title>Habr Blog</title>` (ожидается: `<title>Заголовок статьи | Habr Blog</title>`)
- `/profile/john` → `<title>Habr Blog</title>` (ожидается: `<title>john | Habr Blog</title>`)
- Любая страница → нет `<meta property="og:title">` (ожидается: OG-тег с релевантным значением)
- `/robots.txt` → 404 (ожидается: валидный robots.txt)
- `/sitemap.xml` → 404 (ожидается: XML sitemap со статьями и профилями)
- `/feed` → нет `<meta name="robots" content="noindex,nofollow">` (ожидается: noindex)

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Рендер списка статей на главной странице `/` с пагинацией и фильтрацией по тегам
- Рендер полного контента статьи, комментариев и кнопок голосования на `/articles/[slug]`
- Рендер профиля пользователя с аватаром, bio и кнопкой подписки на `/profile/[username]`
- Редирект неавторизованных пользователей на `/login` при попытке открыть `/articles/new`
  или `/articles/[slug]/edit`
- Отображение страницы 404 без краша приложения

**Scope:**
Все изменения касаются исключительно экспорта `metadata` / `generateMetadata` и добавления
новых файлов (`robots.ts`, `sitemap.ts`). Логика рендера компонентов, API-вызовы, стили и
клиентские интерактивные компоненты остаются без изменений.

---

## Hypothesized Root Cause

1. **Отсутствие generateMetadata в динамических страницах**: `app/articles/[slug]/page.tsx`
   и `app/profile/[username]/page.tsx` являются серверными компонентами и могут экспортировать
   `generateMetadata`, но этого не сделано — разработчики не добавили SEO при создании страниц

2. **Клиентские компоненты не могут экспортировать metadata**: `/notifications/page.tsx`,
   `/login/page.tsx`, `/register/page.tsx` помечены `'use client'` — в Next.js 14 экспорт
   `metadata` из клиентского компонента игнорируется. Решение: добавить промежуточный
   серверный layout или переместить metadata в отдельный серверный файл

3. **Отсутствие файлов robots.ts и sitemap.ts**: Next.js 14 поддерживает генерацию этих
   файлов через специальные файлы в директории `app/`, но они не были созданы

4. **Отсутствие noindex для приватных страниц**: Страницы `/feed`, `/notifications`,
   `/articles/new`, `/articles/[slug]/edit` не имеют директивы `noindex`, хотя содержат
   персонализированный или редакторский контент, не предназначенный для индексации

5. **Отсутствие OG/Twitter тегов**: Корневой `layout.tsx` определяет только `title` и
   `description` без полей `openGraph` и `twitter` в объекте `Metadata`

---

## Correctness Properties

Property 1: Bug Condition — Динамические страницы возвращают уникальные метаданные

_For any_ динамической страницы (`/articles/[slug]` или `/profile/[username]`), где
isBugCondition возвращает true, исправленная функция `generateMetadata` SHALL вернуть
объект `Metadata` с `title`, содержащим уникальный идентификатор ресурса (заголовок статьи
или username), и полями `openGraph.title`, `openGraph.description`, `twitter.title`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation — Рендер страниц не изменился

_For any_ страницы, где isBugCondition НЕ относится к логике рендера (т.е. изменения
касаются только metadata), исправленный код SHALL производить идентичный HTML-контент
страницы (без учёта `<head>`), сохраняя все существующие функции отображения и
интерактивности.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

Property 3: Bug Condition — Приватные страницы содержат noindex

_For any_ приватной страницы (`/feed`, `/notifications`, `/articles/new`,
`/articles/[slug]/edit`), где isBugCondition возвращает true, исправленный `metadata`
объект SHALL содержать `robots: 'noindex,nofollow'`.

**Validates: Requirements 2.7**

Property 4: Bug Condition — robots.txt и sitemap.xml доступны

_For any_ запроса к `/robots.txt` или `/sitemap.xml`, где isBugCondition возвращает true,
исправленные файлы `robots.ts` и `sitemap.ts` SHALL вернуть валидные ответы с HTTP 200,
содержащие корректные директивы и URL публичных страниц соответственно.

**Validates: Requirements 2.5, 2.6**

---

## Fix Implementation

### Changes Required

**File 1**: `frontend/src/app/layout.tsx`

**Specific Changes**:
1. Расширить статический `metadata` объект полями `openGraph` и `twitter` для базового
   fallback на всех страницах
2. Добавить `metadataBase` с `NEXT_PUBLIC_SITE_URL` для корректного формирования
   абсолютных URL в OG-тегах

---

**File 2**: `frontend/src/app/articles/[slug]/page.tsx`

**Specific Changes**:
1. Добавить экспорт `generateMetadata({ params })` — выполнить `getArticle(slug)`,
   вернуть `title`, `description` (первые 160 символов контента), `openGraph`, `twitter`
2. Обработать случай 404 (статья не найдена) — вернуть fallback metadata

---

**File 3**: `frontend/src/app/profile/[username]/page.tsx`

**Specific Changes**:
1. Добавить экспорт `generateMetadata({ params })` — выполнить `getProfile(username)`,
   вернуть `title` с username, `description` из bio, `openGraph`, `twitter`
2. Обработать случай 404 и случай `username === 'me'` (не индексируется)

---

**File 4**: `frontend/src/app/feed/page.tsx`

**Specific Changes**:
1. Добавить статический экспорт `metadata` с `robots: 'noindex,nofollow'`

---

**File 5**: `frontend/src/app/articles/new/page.tsx`

**Specific Changes**:
1. Добавить статический экспорт `metadata` с `robots: 'noindex,nofollow'`

---

**File 6**: `frontend/src/app/articles/[slug]/edit/page.tsx`

**Specific Changes**:
1. Добавить статический экспорт `metadata` с `robots: 'noindex,nofollow'`

---

**File 7**: `frontend/src/app/notifications/layout.tsx` (новый файл)

**Specific Changes**:
1. Создать серверный layout-компонент, экспортирующий `metadata` с
   `robots: 'noindex,nofollow'` — это обходит ограничение `'use client'` в `page.tsx`

---

**File 8**: `frontend/src/app/login/layout.tsx` (новый файл, опционально)

**Specific Changes**:
1. Создать серверный layout с `metadata` (`title: 'Вход | Habr Blog'`) — страница
   `/login` публичная, но специфический title улучшает SEO

---

**File 9**: `frontend/src/app/register/layout.tsx` (новый файл, опционально)

**Specific Changes**:
1. Аналогично `/login` — `title: 'Регистрация | Habr Blog'`

---

**File 10**: `frontend/src/app/robots.ts` (новый файл)

**Specific Changes**:
1. Экспортировать функцию `robots()` возвращающую объект `MetadataRoute.Robots` с
   правилами: Allow `/`, Disallow `/feed`, `/notifications`, `/articles/new`,
   `/articles/*/edit`

---

**File 11**: `frontend/src/app/sitemap.ts` (новый файл)

**Specific Changes**:
1. Экспортировать async-функцию `sitemap()` — запросить все статьи через `getArticles()`,
   вернуть массив `MetadataRoute.Sitemap` с URL статей (`/articles/[slug]`) и профилей
   авторов (`/profile/[username]`), включая `lastModified`

---

## Testing Strategy

### Validation Approach

Двухфазный подход: сначала запустить тесты на НЕИСПРАВЛЕННОМ коде, чтобы зафиксировать
баг и подтвердить гипотезу о корневой причине. Затем применить исправление и убедиться,
что все тесты проходят, а существующее поведение не сломано.

### Exploratory Bug Condition Checking

**Goal**: Зафиксировать контрпримеры, демонстрирующие баг ДО исправления. Подтвердить
или опровергнуть гипотезу о корневой причине.

**Test Plan**: Написать тесты, вызывающие `generateMetadata` (или проверяющие экспорт
`metadata`) для каждой страницы, и утверждающие наличие корректных полей. Запустить на
НЕИСПРАВЛЕННОМ коде.

**Test Cases**:
1. **Article generateMetadata Test**: Вызвать `generateMetadata({ params: { slug: 'test-slug' } })` для `/articles/[slug]/page.tsx` — ожидается объект с `title` содержащим заголовок статьи (упадёт на неисправленном коде, т.к. функция не экспортируется)
2. **Profile generateMetadata Test**: Вызвать `generateMetadata({ params: { username: 'john' } })` для `/profile/[username]/page.tsx` — ожидается `title: 'john | Habr Blog'` (упадёт)
3. **OG Tags Test**: Проверить, что `metadata` из `layout.tsx` содержит поле `openGraph` (упадёт)
4. **Noindex Test**: Проверить, что `metadata` для `/feed/page.tsx` содержит `robots: 'noindex,nofollow'` (упадёт)
5. **Robots.txt Test**: Импортировать `robots` из `app/robots.ts` — файл не существует (упадёт)
6. **Sitemap Test**: Импортировать `sitemap` из `app/sitemap.ts` — файл не существует (упадёт)

**Expected Counterexamples**:
- `generateMetadata` не является экспортом из динамических страниц
- `metadata` объекты не содержат `openGraph` и `twitter` полей
- Файлы `robots.ts` и `sitemap.ts` отсутствуют

### Fix Checking

**Goal**: Убедиться, что для всех входных данных, где isBugCondition истинно, исправленные
функции возвращают ожидаемое поведение.

**Pseudocode:**
```
FOR ALL page WHERE isBugCondition(page) DO
  result := getMetadata_fixed(page)
  ASSERT expectedBehavior(result)
END FOR

FUNCTION expectedBehavior(metadata)
  IF page is dynamic article:
    RETURN metadata.title CONTAINS article.title
           AND metadata.openGraph.title == article.title
           AND metadata.twitter.title == article.title
  IF page is dynamic profile:
    RETURN metadata.title CONTAINS username
  IF page is private:
    RETURN metadata.robots == 'noindex,nofollow'
  IF request is /robots.txt:
    RETURN response.status == 200 AND response.body CONTAINS 'Disallow: /feed'
  IF request is /sitemap.xml:
    RETURN response.status == 200 AND response.body CONTAINS article URLs
END FUNCTION
```

### Preservation Checking

**Goal**: Убедиться, что для всех входных данных, где isBugCondition НЕ относится к
логике рендера, исправленный код производит идентичный HTML-контент страниц.

**Pseudocode:**
```
FOR ALL page WHERE NOT isBugCondition_render(page) DO
  ASSERT render_original(page).body == render_fixed(page).body
END FOR
```

**Testing Approach**: Property-based тестирование рекомендуется для preservation checking:
- Генерирует множество тест-кейсов автоматически
- Ловит edge cases, которые ручные тесты могут пропустить
- Даёт сильные гарантии неизменности поведения

**Test Plan**: Зафиксировать поведение рендера компонентов на НЕИСПРАВЛЕННОМ коде, затем
написать property-тесты, проверяющие сохранение этого поведения.

**Test Cases**:
1. **Article Page Render Preservation**: Убедиться, что добавление `generateMetadata` не
   изменяет JSX, возвращаемый `ArticlePage`
2. **Profile Page Render Preservation**: Убедиться, что добавление `generateMetadata` не
   изменяет JSX, возвращаемый `ProfilePage`
3. **Home Page Render Preservation**: Убедиться, что добавление `metadata` в `page.tsx`
   не изменяет рендер списка статей
4. **Auth Redirect Preservation**: Убедиться, что `/articles/new` и `/articles/[slug]/edit`
   по-прежнему редиректят неавторизованных пользователей

### Unit Tests

- Тест `generateMetadata` для `/articles/[slug]` с mock `getArticle`
- Тест `generateMetadata` для `/profile/[username]` с mock `getProfile`
- Тест `robots()` — проверка наличия Disallow для всех приватных путей
- Тест `sitemap()` с mock `getArticles` — проверка формата и наличия URL
- Тест metadata для каждой приватной страницы — наличие `noindex`
- Тест обработки 404 в `generateMetadata` (статья/профиль не найдены)

### Property-Based Tests

- Для любого объекта статьи с произвольным `title` и `content`: `generateMetadata`
  возвращает `title === \`${article.title} | Habr Blog\`` и `description` длиной ≤ 160 символов
- Для любого `username`: `generateMetadata` возвращает `title` содержащий `username`
- Для любого набора статей: `sitemap()` содержит URL каждой статьи в формате
  `/articles/${slug}`
- Для любой приватной страницы: `metadata.robots` содержит `noindex`

### Integration Tests

- Полный flow: запрос к `/articles/[slug]` возвращает HTML с корректным `<title>` и
  OG-тегами
- Запрос к `/robots.txt` возвращает 200 с валидным содержимым
- Запрос к `/sitemap.xml` возвращает 200 с валидным XML
- Переключение между страницами не ломает навигацию и рендер контента
