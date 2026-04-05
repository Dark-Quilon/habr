# Bugfix Requirements Document

## Introduction

В Next.js 14 App Router проекте отсутствует корректная SEO-разметка на большинстве страниц.
Единственный `metadata` объект определён в корневом `layout.tsx` со статическими значениями
(`title: 'Habr Blog'`, `description: 'Блог-платформа'`), которые применяются ко всем страницам
без изменений. Динамические страницы (`/articles/[slug]`, `/profile/[username]`) не экспортируют
`generateMetadata`, поэтому поисковые роботы и социальные сети получают одинаковый заголовок и
описание для любой статьи или профиля. Страницы-клиентские компоненты (`'use client'`) физически
не могут экспортировать серверный `metadata`, что также не учтено. Отсутствуют Open Graph теги,
Twitter Card теги, canonical URL и файлы `robots.txt` / `sitemap.xml`.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN поисковый робот или краулер социальной сети запрашивает страницу `/articles/[slug]` THEN система возвращает `<title>Habr Blog</title>` и `<meta name="description" content="Блог-платформа">` вместо заголовка и описания конкретной статьи

1.2 WHEN поисковый робот или краулер социальной сети запрашивает страницу `/profile/[username]` THEN система возвращает `<title>Habr Blog</title>` вместо имени пользователя в заголовке

1.3 WHEN любая страница рендерится THEN система не включает теги `og:title`, `og:description`, `og:type`, `og:url` в `<head>`

1.4 WHEN любая страница рендерится THEN система не включает теги `twitter:card`, `twitter:title`, `twitter:description` в `<head>`

1.5 WHEN поисковый робот запрашивает `/robots.txt` THEN система возвращает 404, так как файл отсутствует

1.6 WHEN поисковый робот запрашивает `/sitemap.xml` THEN система возвращает 404, так как файл отсутствует

1.7 WHEN страница `/feed`, `/notifications`, `/articles/new`, `/articles/[slug]/edit` рендерится THEN система не устанавливает `noindex` директиву, хотя эти страницы не должны индексироваться

### Expected Behavior (Correct)

2.1 WHEN поисковый робот или краулер социальной сети запрашивает страницу `/articles/[slug]` THEN система SHALL вернуть `<title>{article.title} | Habr Blog</title>` и `<meta name="description">` с первыми ~160 символами контента статьи

2.2 WHEN поисковый робот или краулер социальной сети запрашивает страницу `/profile/[username]` THEN система SHALL вернуть `<title>{username} | Habr Blog</title>` и `<meta name="description">` с bio пользователя (если есть)

2.3 WHEN любая публичная страница рендерится THEN система SHALL включать теги `og:title`, `og:description`, `og:type`, `og:url` с корректными значениями для данной страницы

2.4 WHEN любая публичная страница рендерится THEN система SHALL включать теги `twitter:card` (summary), `twitter:title`, `twitter:description`

2.5 WHEN поисковый робот запрашивает `/robots.txt` THEN система SHALL вернуть валидный файл, разрешающий индексацию публичных страниц и запрещающий индексацию приватных (`/feed`, `/notifications`, `/articles/new`, `/articles/*/edit`)

2.6 WHEN поисковый робот запрашивает `/sitemap.xml` THEN система SHALL вернуть валидный XML sitemap со всеми публичными статьями и профилями

2.7 WHEN страница `/feed`, `/notifications`, `/articles/new`, `/articles/[slug]/edit` рендерится THEN система SHALL включать `<meta name="robots" content="noindex,nofollow">` в `<head>`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN пользователь открывает главную страницу `/` THEN система SHALL CONTINUE TO отображать список статей с пагинацией и фильтрацией по тегам

3.2 WHEN пользователь открывает страницу `/articles/[slug]` THEN система SHALL CONTINUE TO отображать полный контент статьи, комментарии и кнопки голосования

3.3 WHEN пользователь открывает страницу `/profile/[username]` THEN система SHALL CONTINUE TO отображать профиль пользователя с аватаром, bio и кнопкой подписки

3.4 WHEN авторизованный пользователь открывает `/articles/new` или `/articles/[slug]/edit` THEN система SHALL CONTINUE TO перенаправлять неавторизованных пользователей на `/login`

3.5 WHEN страница не найдена (404) THEN система SHALL CONTINUE TO отображать страницу ошибки без краша приложения
