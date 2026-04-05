# План реализации: nextjs-frontend

## Обзор

Реализация Next.js 14 фронтенда для блог-платформы. Стек: TypeScript, Bootstrap 5, SCSS, fetch (без axios). Гибридная архитектура: Server Components для SEO-страниц, Client Components для интерактивных элементов. Token-based аутентификация через httpOnly-куки (SSR) и localStorage (CSR).

## Задачи

- [x] 1. Настройка проекта и базовые типы
  - Проверить и дополнить `frontend/next.config.js`: переменная окружения `NEXT_PUBLIC_API_URL`, настройки изображений для `next/image`
  - Создать `frontend/src/lib/types.ts` с интерфейсами: `User`, `Tag`, `ArticleList`, `ArticleDetail`, `Comment`, `Profile`, `Notification`, `PaginatedResponse<T>`, `AuthResponse`, `ArticleParams`, `ArticleWriteData`, `ProfileUpdateData`
  - Обновить `frontend/src/styles/globals.scss`: импорт Bootstrap 5 через SCSS, базовые переменные
  - _Требования: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Слой аутентификации
  - [x] 2.1 Создать `frontend/src/lib/auth.ts`
    - Клиентские функции: `getToken`, `setToken`, `removeToken`, `getStoredUser`
    - Серверные функции (Server Actions): `getServerToken`, `setServerToken`, `clearServerToken` — работают с `httpOnly`-кукой `auth_token` через `next/headers`
    - _Требования: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8, 16.1, 16.2_

  - [ ]* 2.2 Написать property-тест: round-trip токена через localStorage
    - **Свойство 6: Round-trip токена через localStorage**
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 2.3 Написать property-тест: round-trip User через localStorage
    - **Свойство 7: Round-trip User через localStorage**
    - **Validates: Requirements 3.2**

- [x] 3. API Client
  - [x] 3.1 Создать `frontend/src/lib/api.ts`
    - Базовые функции `serverFetch<T>` и `clientFetch<T>` с автоматическим добавлением заголовков `Authorization` и `Content-Type: application/json`
    - `serverFetch` читает токен из `httpOnly`-куки через `getServerToken()`; `clientFetch` — из `localStorage` через `getToken()`
    - Для запросов с `Authorization` устанавливать `cache: 'no-store'`
    - Обработка ошибок: 401 → `ApiError(401)`, 403 → `ApiError(403)`, 404 → `NotFoundError`
    - При 401 на клиенте — очищать токен и редиректить на `/login`
    - _Требования: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.6, 16.3_

  - [x] 3.2 Добавить в `api.ts` все публичные функции
    - Статьи: `getArticles`, `getArticle`, `createArticle`, `updateArticle`, `deleteArticle`, `voteArticle`, `getFeed`
    - Комментарии: `getComments`, `addComment`, `deleteComment`
    - Теги: `getTags`
    - Профили: `getProfile`, `getMyProfile`, `updateMyProfile`, `followUser`
    - Уведомления: `getNotifications`, `markNotificationsRead`
    - Аутентификация: `login`, `register`, `logout`, `getMe`
    - Формирование URL из `ArticleParams` — только переданные параметры, без дублирования
    - _Требования: 2.8, 2.9_

  - [ ]* 3.3 Написать property-тест: заголовок Authorization добавляется при наличии токена
    - **Свойство 1: Заголовок Authorization добавляется ко всем запросам с токеном**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 3.4 Написать property-тест: Content-Type всегда application/json
    - **Свойство 2: Content-Type всегда application/json**
    - **Validates: Requirements 2.3**

  - [ ]* 3.5 Написать property-тест: авторизованные запросы не кэшируются
    - **Свойство 3: Авторизованные запросы не кэшируются**
    - **Validates: Requirements 2.4**

  - [ ]* 3.6 Написать property-тест: корректное отображение HTTP-кодов ошибок
    - **Свойство 4: Корректное отображение HTTP-кодов ошибок**
    - **Validates: Requirements 2.5, 2.6, 2.7**

  - [ ]* 3.7 Написать property-тест: URL из ArticleParams без дублирующихся ключей
    - **Свойство 5: URL из ArticleParams не содержит дублирующихся ключей**
    - **Validates: Requirements 2.9**

  - [ ]* 3.8 Написать property-тест: мутирующие запросы всегда содержат токен
    - **Свойство 30: Мутирующие запросы всегда содержат токен**
    - **Validates: Requirements 16.3**

- [ ] 4. Checkpoint — убедиться что все тесты проходят
  - Убедиться что все тесты проходят, задать вопросы пользователю при необходимости.

- [x] 5. Базовые UI-компоненты
  - [x] 5.1 Создать `frontend/src/components/ArticleCard.tsx` (Server Component)
    - Отображает: заголовок, автор, теги (Bootstrap badges), рейтинг, дата, просмотры
    - Ссылка на `/articles/{slug}`
    - Props: `article: ArticleList`
    - _Требования: 5.1, 5.2_

  - [ ]* 5.2 Написать property-тест: ArticleCard отображает все обязательные поля
    - **Свойство 9: ArticleCard отображает все обязательные поля**
    - **Validates: Requirements 5.1, 5.2**

  - [x] 5.3 Создать `frontend/src/components/ArticleList.tsx` (Server Component)
    - Рендерит список `ArticleCard` из массива `ArticleList[]`
    - Props: `articles: ArticleList[]`
    - _Требования: 5.3_

  - [ ]* 5.4 Написать property-тест: количество карточек соответствует количеству статей
    - **Свойство 10: Количество карточек соответствует количеству статей**
    - **Validates: Requirements 5.3**

  - [x] 5.5 Создать `frontend/src/components/Pagination.tsx` (Server Component)
    - Вычисляет `totalPages = Math.ceil(count / pageSize)` (pageSize по умолчанию 10)
    - Рендерит ссылки через URL-параметр `?page=N` (Bootstrap pagination)
    - Кнопка «Назад» неактивна на странице 1, «Вперёд» — на последней
    - Props: `count: number, page: number, pageSize?: number`
    - _Требования: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 5.6 Написать property-тест: количество страниц пагинации
    - **Свойство 14: Количество страниц пагинации**
    - **Validates: Requirements 7.1**

  - [ ]* 5.7 Написать property-тест: ссылки пагинации содержат корректный параметр ?page=N
    - **Свойство 15: Ссылки пагинации содержат корректный параметр ?page=N**
    - **Validates: Requirements 7.2**

  - [x] 5.8 Создать `frontend/src/components/SearchBar.tsx` (Client Component)
    - Управляемый input с debounce 300 мс
    - Обновляет URL-параметр `?search=`, сбрасывает `?page=` до 1
    - Отображает текущее значение из URL при первоначальном рендере
    - Props: `defaultValue?: string`
    - _Требования: 8.1, 8.2, 8.3, 17.4_

  - [ ]* 5.9 Написать property-тест: debounce поиска — URL обновляется не чаще раза в 300мс
    - **Свойство 16: Debounce поиска**
    - **Validates: Requirements 8.1, 17.4**

  - [ ]* 5.10 Написать property-тест: поиск сбрасывает страницу до 1
    - **Свойство 17: Поиск сбрасывает страницу до 1**
    - **Validates: Requirements 8.2**

  - [ ]* 5.11 Написать property-тест: SearchBar отображает значение из URL
    - **Свойство 18: SearchBar отображает значение из URL**
    - **Validates: Requirements 8.3**

- [x] 6. Navbar и обработка ошибок
  - [x] 6.1 Создать `frontend/src/components/Navbar.tsx` (Client Component)
    - Читает `auth_user` из localStorage при монтировании
    - Авторизован: ссылки `/feed`, `/notifications` (с числовым badge при непрочитанных), `/profile/{username}`, кнопка выхода
    - Не авторизован: ссылки `/login`, `/register`
    - Кнопка выхода вызывает `logout()` и редиректит на `/login`
    - _Требования: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 6.2 Написать property-тест: Navbar отображает корректные ссылки
    - **Свойство 20: Navbar отображает корректные ссылки в зависимости от состояния авторизации**
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 6.3 Написать property-тест: badge уведомлений при наличии непрочитанных
    - **Свойство 21: Badge уведомлений отображается при наличии непрочитанных**
    - **Validates: Requirements 10.3**

  - [ ]* 6.4 Написать property-тест: Navbar читает состояние авторизации из localStorage
    - **Свойство 22: Navbar читает состояние авторизации из localStorage**
    - **Validates: Requirements 10.5**

  - [x] 6.5 Создать `frontend/src/app/error.tsx` и `frontend/src/app/global-error.tsx`
    - `error.tsx` — страница ошибки Server Component с кнопкой «Повторить»
    - `global-error.tsx` — глобальный error boundary для сетевых ошибок (`TypeError`)
    - _Требования: 15.1, 15.2_

- [x] 7. Главная страница (SSR)
  - [x] 7.1 Обновить `frontend/src/app/page.tsx` (Server Component)
    - Параллельные запросы `getArticles` и `getTags` через `Promise.all`
    - Читает `searchParams`: `page`, `search`, `tags__slug` и передаёт в `getArticles`
    - Рендерит: `ArticleList`, фильтр по тегам (Bootstrap pills), `SearchBar`, `Pagination`
    - _Требования: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 17.1, 17.2_

  - [ ]* 7.2 Написать property-тест: параметры страницы передаются в getArticles
    - **Свойство 8: Параметры страницы передаются в getArticles**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [x] 8. Страницы аутентификации
  - [x] 8.1 Создать `frontend/src/app/login/page.tsx` (Client Component)
    - Форма: username, password
    - Submit: вызывает `login()`, сохраняет токен через `Auth_Manager` (localStorage + Server Action для куки)
    - Успех: редирект на `/`
    - HTTP 400: отображает «Неверный логин или пароль»
    - Во время отправки: индикатор загрузки, кнопка заблокирована
    - _Требования: 9.1, 9.2, 9.3, 9.7_

  - [x] 8.2 Создать `frontend/src/app/register/page.tsx` (Client Component)
    - Форма: username, password1, password2
    - Submit: вызывает `register()`, сохраняет токен через `Auth_Manager`
    - Успех: редирект на `/`
    - HTTP 400: отображает ошибки валидации под соответствующими полями
    - _Требования: 9.4, 9.5, 9.6_

  - [ ]* 8.3 Написать property-тест: ошибки валидации формы отображаются под соответствующими полями
    - **Свойство 19: Ошибки валидации формы отображаются под соответствующими полями**
    - **Validates: Requirements 9.6, 13.5, 15.4**

- [x] 9. Страница статьи (SSR + Client)
  - [x] 9.1 Создать `frontend/src/app/articles/[slug]/page.tsx` (Server Component)
    - Запрашивает `getArticle(slug)`, рендерит полный текст статьи
    - Передаёт `initialComments` и `initialRating` в дочерние Client Components
    - Если текущий пользователь — автор: отображает ссылки «Редактировать» и «Удалить»
    - _Требования: 6.1, 6.2, 13.7_

  - [x] 9.2 Создать `frontend/src/components/VoteButtons.tsx` (Client Component)
    - Оптимистичное обновление рейтинга при нажатии
    - Синхронизация с ответом сервера после успешного запроса
    - Откат к предыдущему значению при ошибке
    - Неавторизованный пользователь → редирект на `/login`
    - HTTP 403 → toast-уведомление «Нет прав доступа»
    - Props: `slug: string, initialRating: number`
    - _Требования: 6.3, 6.4, 6.5, 6.6, 6.9_

  - [ ]* 9.3 Написать property-тест: синхронизация рейтинга после голосования
    - **Свойство 11: Синхронизация рейтинга после голосования**
    - **Validates: Requirements 6.4**

  - [ ]* 9.4 Написать property-тест: откат рейтинга при ошибке голосования
    - **Свойство 12: Откат рейтинга при ошибке голосования**
    - **Validates: Requirements 6.5**

  - [x] 9.5 Создать `frontend/src/components/CommentSection.tsx` (Client Component)
    - Список комментариев с оптимистичным добавлением
    - Форма добавления (только для авторизованных)
    - Удаление своих комментариев с подтверждением от API
    - Props: `slug: string, initialComments: Comment[]`
    - _Требования: 6.7, 6.8_

  - [ ]* 9.6 Написать property-тест: инвариант длины списка комментариев
    - **Свойство 13: Инвариант длины списка комментариев**
    - **Validates: Requirements 6.7, 6.8**

- [ ] 10. Checkpoint — убедиться что все тесты проходят
  - Убедиться что все тесты проходят, задать вопросы пользователю при необходимости.

- [x] 11. Профиль пользователя
  - [x] 11.1 Создать `frontend/src/app/profile/[username]/page.tsx` (Client Component)
    - Запрашивает `getProfile(username)`, отображает аватар (`next/image`), bio, количество подписчиков
    - Если `/profile/me` — отображает форму редактирования bio и аватара
    - Сохранение: вызывает `updateMyProfile`, обновляет отображаемые данные
    - _Требования: 11.1, 11.5, 11.6, 17.3_

  - [ ]* 11.2 Написать property-тест: ProfilePage отображает все поля профиля
    - **Свойство 23: ProfilePage отображает все поля профиля**
    - **Validates: Requirements 11.1**

  - [x] 11.3 Создать `frontend/src/components/FollowButton.tsx` (Client Component)
    - Отображает актуальное состояние подписки из `initialIsFollowing`
    - Нажатие: вызывает `followUser(username)`, обновляет состояние согласно ответу API
    - Disabled если пользователь не авторизован
    - Props: `username: string, initialIsFollowing: boolean`
    - _Требования: 11.2, 11.3, 11.4_

  - [ ]* 11.4 Написать property-тест: FollowButton отражает актуальное состояние подписки
    - **Свойство 24: FollowButton отражает актуальное состояние подписки**
    - **Validates: Requirements 11.2, 11.3**

  - [ ]* 11.5 Написать property-тест: FollowButton отключена для неавторизованных
    - **Свойство 25: FollowButton отключена для неавторизованных пользователей**
    - **Validates: Requirements 11.4**

- [x] 12. Лента подписок и уведомления
  - [x] 12.1 Создать `frontend/src/app/feed/page.tsx` (Server Component)
    - Проверяет токен из куки; если нет — редирект на `/login`
    - Запрашивает `getFeed()`, рендерит статьи с пагинацией аналогично главной странице
    - _Требования: 12.1, 12.2, 12.3_

  - [x] 12.2 Создать `frontend/src/app/notifications/page.tsx` (Client Component)
    - Проверяет авторизацию; если нет — редирект на `/login`
    - Запрашивает `getNotifications()`, отображает список уведомлений
    - При загрузке вызывает `markNotificationsRead()`
    - Каждое уведомление: имя актора, заголовок статьи, время события
    - _Требования: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 12.3 Написать property-тест: уведомление отображает все обязательные поля
    - **Свойство 29: Уведомление отображает все обязательные поля**
    - **Validates: Requirements 14.3**

  - [ ]* 12.4 Написать property-тест: редирект на /login для защищённых маршрутов
    - **Свойство 26: Редирект на /login для защищённых маршрутов**
    - **Validates: Requirements 12.2, 13.6, 14.4**

- [x] 13. Создание и редактирование статей
  - [x] 13.1 Создать `frontend/src/app/articles/new/page.tsx` (Client Component)
    - Проверяет авторизацию; если нет — редирект на `/login`
    - Рендерит `ArticleForm` в режиме создания
    - _Требования: 13.1, 13.6_

  - [x] 13.2 Создать `frontend/src/app/articles/[slug]/edit/page.tsx` (Client Component)
    - Загружает текущие данные статьи через `getArticle(slug)`, предзаполняет форму
    - Рендерит `ArticleForm` в режиме редактирования
    - _Требования: 13.3_

  - [x] 13.3 Создать `frontend/src/components/ArticleForm.tsx` (Client Component)
    - Поля: заголовок, контент (textarea), теги (multi-input), статус (`draft`/`published`)
    - Создание: вызывает `createArticle`, редирект на страницу статьи
    - Редактирование: вызывает `updateArticle(slug, data)`, редирект на страницу статьи
    - Удаление: вызывает `deleteArticle(slug)`, редирект на `/`
    - HTTP 400: отображает ошибки валидации под соответствующими полями
    - Props: `initialData?: ArticleDetail, slug?: string`
    - _Требования: 13.1, 13.2, 13.4, 13.5, 13.8_

  - [ ]* 13.4 Написать property-тест: ArticleForm предзаполняется данными статьи
    - **Свойство 27: ArticleForm предзаполняется данными статьи**
    - **Validates: Requirements 13.3**

  - [ ]* 13.5 Написать property-тест: автор видит ссылки управления своей статьёй
    - **Свойство 28: Автор видит ссылки управления своей статьёй**
    - **Validates: Requirements 13.7**

- [x] 14. Интеграция и финальная сборка
  - [x] 14.1 Обновить `frontend/src/app/layout.tsx`
    - Подключить `Navbar` в корневой layout
    - Настроить метаданные (title, description)
    - _Требования: 1.1_

  - [x] 14.2 Установить дополнительные зависимости
    - Добавить в `package.json`: `react-hot-toast` (toast-уведомления), `fast-check` (property-тесты), `@testing-library/react`, `@testing-library/jest-dom`, `jest`, `jest-environment-jsdom`
    - _Требования: 15.3_

  - [x] 14.3 Настроить конфигурацию тестов
    - Создать `frontend/jest.config.js` и `frontend/jest.setup.ts` для Jest + Testing Library
    - _Требования: 1.1_

- [x] 15. Финальный checkpoint — убедиться что все тесты проходят
  - Убедиться что все тесты проходят, задать вопросы пользователю при необходимости.

## Примечания

- Задачи с `*` — опциональные, можно пропустить для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Property-тесты используют библиотеку `fast-check`
- Unit-тесты используют `@testing-library/react` + Jest
- Toast-уведомления реализуются через `react-hot-toast`
