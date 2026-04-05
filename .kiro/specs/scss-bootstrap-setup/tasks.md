# Implementation Plan: SCSS + Bootstrap Setup

## Overview

Добавление Bootstrap 5 и SCSS в существующий Next.js 14 + TypeScript проект в `frontend/`. Реализация включает установку зависимостей, создание структуры файлов стилей и обновление корневого layout.

## Tasks

- [x] 1. Установить зависимости Bootstrap и sass
  - Добавить `bootstrap@^5.3` в `dependencies` в `frontend/package.json`
  - Добавить `sass@^1` в `devDependencies` в `frontend/package.json`
  - Выполнить `npm install` в директории `frontend/`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Создать структуру файлов стилей
  - [x] 2.1 Создать файл `frontend/src/styles/_variables.scss`
    - Добавить переопределения Bootstrap SCSS-переменных (цвета, типографика, border-radius)
    - Переменные без `!default` — они должны иметь приоритет над Bootstrap-дефолтами
    - _Requirements: 2.2, 4.1, 4.2, 4.3_

  - [x] 2.2 Создать файл `frontend/src/styles/_custom.scss`
    - Добавить базовый класс `.page-wrapper` как пример проектного стиля
    - Файл может использовать Bootstrap-переменные и миксины (они уже загружены к моменту импорта)
    - _Requirements: 2.3, 5.1, 5.2, 5.3_

  - [x] 2.3 Создать файл `frontend/src/styles/globals.scss`
    - Импортировать `_variables` первым (до Bootstrap)
    - Импортировать `bootstrap/scss/bootstrap` вторым
    - Импортировать `_custom` третьим
    - Добавить базовые reset-стили: `box-sizing: border-box` и `overflow-x: hidden`
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.4 Написать property test для порядка импортов (Property 3)
    - **Property 3: Порядок импортов детерминирован**
    - Проверить что `_variables` импортируется до `bootstrap`, `_custom` — после
    - Использовать fast-check для генерации вариантов порядка импортов
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

- [x] 3. Удалить старый globals.css и обновить layout.tsx
  - [x] 3.1 Удалить файл `frontend/src/app/globals.css`
    - _Requirements: 2.4_

  - [x] 3.2 Обновить `frontend/src/app/layout.tsx`
    - Заменить `import './globals.css'` на `import '../styles/globals.scss'`
    - _Requirements: 6.1, 6.2_

  - [ ]* 3.3 Написать unit test для layout.tsx
    - Проверить что компонент рендерится без ошибок
    - Проверить что children рендерятся внутри `<html>` и `<body>`
    - _Requirements: 6.3_

- [x] 4. Checkpoint — проверить корректность компиляции
  - Убедиться что `next build` завершается без ошибок SCSS-компиляции
  - Убедиться что Bootstrap-классы применяются в браузере
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 7.1, 7.3_

  - [ ]* 4.1 Написать property test для Bootstrap-классов (Property 1)
    - **Property 1: Bootstrap классы доступны после импорта globals.scss**
    - Для произвольного Bootstrap CSS-класса проверить его наличие в скомпилированном CSS
    - Использовать fast-check для генерации списка Bootstrap-классов
    - **Validates: Requirements 6.4**

  - [ ]* 4.2 Написать property test для переопределения переменных (Property 2)
    - **Property 2: Переопределение переменной влияет на все Bootstrap-компоненты**
    - Проверить что кастомное значение `$primary` из `_variables.scss` присутствует в скомпилированном CSS
    - **Validates: Requirements 4.1**

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Порядок импортов в `globals.scss` критичен: `_variables` → `bootstrap` → `_custom`
- Bootstrap JS-компоненты (dropdown, modal) не входят в данный scope
- Для оптимизации bundle size можно позже заменить полный импорт Bootstrap на точечные импорты модулей
