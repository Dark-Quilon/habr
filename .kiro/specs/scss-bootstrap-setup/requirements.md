# Requirements Document

## Introduction

Добавление Bootstrap 5 и SCSS в существующий Next.js 14 (App Router) + TypeScript проект в директории `frontend/`. Bootstrap подключается через SCSS-импорты с возможностью переопределения переменных до загрузки фреймворка. Текущий `globals.css` заменяется на `globals.scss`. Кастомизация Bootstrap происходит через `_variables.scss`, проектные стили — через `_custom.scss`.

## Glossary

- **SCSS_Compiler**: пакет `sass`, необходимый Next.js для компиляции `.scss`-файлов
- **Bootstrap**: CSS-фреймворк версии 5, подключаемый через SCSS-импорт
- **Globals_Entry**: файл `frontend/src/styles/globals.scss` — единственная точка входа стилей
- **Variables_File**: файл `frontend/src/styles/_variables.scss` — переопределение Bootstrap SCSS-переменных
- **Custom_File**: файл `frontend/src/styles/_custom.scss` — проектные стили поверх Bootstrap
- **Root_Layout**: файл `frontend/src/app/layout.tsx` — корневой layout Next.js приложения
- **Next_Build**: процесс сборки Next.js (`next build` / `next dev`)

## Requirements

### Requirement 1: Установка зависимостей

**User Story:** As a developer, I want to install Bootstrap 5 and sass packages, so that I can use Bootstrap styles and compile SCSS files in the Next.js project.

#### Acceptance Criteria

1. THE Project SHALL have `bootstrap` (^5.3.x) listed as a dependency in `frontend/package.json`
2. THE Project SHALL have `sass` (^1.x) listed as a devDependency in `frontend/package.json`
3. WHEN `npm install` is run in `frontend/`, THE SCSS_Compiler SHALL be available for Next_Build to compile `.scss` files
4. IF `sass` is not installed, THEN THE Next_Build SHALL output the error message: `"To use Next.js' built-in Sass support, you first need to install sass"`

---

### Requirement 2: Структура файлов стилей

**User Story:** As a developer, I want a clear styles directory structure, so that Bootstrap customization and project styles are organized and maintainable.

#### Acceptance Criteria

1. THE Project SHALL contain the file `frontend/src/styles/globals.scss`
2. THE Project SHALL contain the file `frontend/src/styles/_variables.scss`
3. THE Project SHALL contain the file `frontend/src/styles/_custom.scss`
4. THE Project SHALL NOT contain the file `frontend/src/app/globals.css` (заменён на `globals.scss`)

---

### Requirement 3: Точка входа стилей (globals.scss)

**User Story:** As a developer, I want globals.scss to orchestrate all style imports in the correct order, so that Bootstrap variables are overridden before Bootstrap is loaded.

#### Acceptance Criteria

1. THE Globals_Entry SHALL import `_variables.scss` before importing Bootstrap
2. THE Globals_Entry SHALL import `bootstrap/scss/bootstrap` after `_variables.scss`
3. THE Globals_Entry SHALL import `_custom.scss` after `bootstrap/scss/bootstrap`
4. THE Globals_Entry SHALL include base reset styles: `box-sizing: border-box` for all elements and `overflow-x: hidden` for `html, body`
5. IF the import order is changed so that Bootstrap is imported before `_variables.scss`, THEN THE SCSS_Compiler SHALL compile Bootstrap with default variable values, ignoring overrides from `_variables.scss`

---

### Requirement 4: Переопределение Bootstrap переменных (_variables.scss)

**User Story:** As a developer, I want to override Bootstrap SCSS variables before Bootstrap loads, so that the compiled CSS uses my custom values throughout all Bootstrap components.

#### Acceptance Criteria

1. WHEN a Bootstrap SCSS variable is defined in Variables_File without `!default`, THE SCSS_Compiler SHALL use the custom value when compiling Bootstrap
2. THE Variables_File SHALL NOT contain a direct `@import` of Bootstrap
3. THE Variables_File SHALL be the single source of truth for Bootstrap theme customization

---

### Requirement 5: Проектные стили (_custom.scss)

**User Story:** As a developer, I want a dedicated file for project-specific styles, so that custom styles are applied after Bootstrap and have higher cascade priority.

#### Acceptance Criteria

1. WHEN Custom_File defines a CSS rule with the same specificity as a Bootstrap rule, THE SCSS_Compiler SHALL output Custom_File styles after Bootstrap styles, giving them cascade priority
2. WHILE Bootstrap has been imported in Globals_Entry, THE Custom_File SHALL have access to Bootstrap SCSS variables and mixins
3. THE Custom_File SHALL be imported last in Globals_Entry

---

### Requirement 6: Обновление Root Layout

**User Story:** As a developer, I want layout.tsx to import globals.scss instead of globals.css, so that Bootstrap styles are applied to the entire application.

#### Acceptance Criteria

1. THE Root_Layout SHALL import `'../styles/globals.scss'` as the single style entry point
2. THE Root_Layout SHALL NOT contain an import of `'./globals.css'`
3. WHEN Next_Build processes Root_Layout, THE SCSS_Compiler SHALL compile `globals.scss` and apply the resulting CSS to all pages of the application
4. WHEN a React component uses a Bootstrap class (e.g. `btn`, `container`, `row`), THE Root_Layout SHALL ensure Bootstrap styles are available globally without additional imports in that component

---

### Requirement 7: Корректность компиляции

**User Story:** As a developer, I want the Next.js build to complete without SCSS compilation errors, so that the application runs correctly with Bootstrap styles.

#### Acceptance Criteria

1. WHEN all three style files exist and `sass` is installed, THE Next_Build SHALL complete without SCSS compilation errors
2. IF Variables_File does not exist at the path referenced in Globals_Entry, THEN THE SCSS_Compiler SHALL output the error: `"Can't find stylesheet to import"`
3. WHEN `next build` is run in production mode, THE Next_Build SHALL produce a minified CSS bundle containing Bootstrap styles and custom overrides
