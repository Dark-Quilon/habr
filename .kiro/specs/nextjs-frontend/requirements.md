# Документ требований: nextjs-frontend

## Введение

Next.js 14 фронтенд для блог-платформы в стиле Habr/Dev.to. Подключается к существующему Django REST API (`http://127.0.0.1:8000/api/v1/`). Архитектура гибридная: Server Components для SEO-страниц, Client Components для интерактивных элементов. Аутентификация — Token-based, токен хранится в `httpOnly`-куках (SSR) и `localStorage` (CSR).

---

## Глоссарий

- **System** — Next.js 14 фронтенд-приложение в целом
- **API_Client** — модуль `lib/api.ts`, отвечающий за все HTTP-запросы к Django REST API
- **Auth_Manager** — модуль `lib/auth.ts`, управляющий токеном аутентификации
- **Server_Component** — React Server Component, рендерится на сервере Next.js
- **Client_Component** — React Client Component (`'use client'`), рендерится в браузере
- **Navbar** — клиентский компонент навигационной панели
- **ArticleCard** — серверный компонент карточки статьи
- **CommentSection** — клиентский компонент секции комментариев
- **VoteButtons** — клиентский компонент кнопок голосования
- **FollowButton** — клиентский компонент кнопки подписки
- **SearchBar** — клиентский компонент строки поиска
- **Pagination** — серверный компонент пагинации
- **LoginPage** — клиентский компонент страницы входа
- **RegisterPage** — клиентский компонент страницы регистрации
- **ProfilePage** — клиентский компонент страницы профиля
- **ArticleForm** — клиентский компонент формы создания/редактирования статьи
- **NotificationsPage** — клиентский компонент страницы уведомлений
- **Django_API** — внешний Django REST API по адресу `http://127.0.0.1:8000/api/v1/`
- **Token** — строка аутентификационного токена формата `Authorization: Token <key>`
- **PaginatedResponse** — ответ API с полями `count`, `next`, `previous`, `results`
- **ArticleParams** — параметры фильтрации статей: `page`, `search`, `tags__slug`, `author__username`, `ordering`

---

## Требования

### Требование 1: Инициализация и конфигурация проекта

**User Story:** Как разработчик, я хочу иметь корректно настроенный Next.js 14 проект с TypeScript, Bootstrap 5 и SCSS, чтобы начать разработку фронтенда.

#### Критерии приёмки

1. THE System SHALL использовать Next.js 14 с App Router и TypeScript в качестве основного фреймворка
2. THE System SHALL подключать Bootstrap 5 через SCSS-импорт в глобальных стилях
3. THE System SHALL читать базовый URL Django API из переменной окружения `NEXT_PUBLIC_API_URL` со значением по умолчанию `http://127.0.0.1:8000/api/v1`
4. THE System SHALL экспортировать TypeScript-интерфейсы `User`, `Tag`, `ArticleList`, `ArticleDetail`, `Comment`, `Profile`, `Notification`, `PaginatedResponse`, `AuthResponse` из модуля `lib/types.ts`

---

### Требование 2: Слой HTTP-запросов (API Client)

**User Story:** Как разработчик, я хочу иметь единый модуль для работы с Django REST API, чтобы все запросы были консистентны и корректно обрабатывали ошибки.

#### Критерии приёмки

1. WHEN выполняется серверный запрос, THE API_Client SHALL автоматически добавлять заголовок `Authorization: Token <key>`, читая токен из `httpOnly`-куки `auth_token`
2. WHEN выполняется клиентский запрос, THE API_Client SHALL автоматически добавлять заголовок `Authorization: Token <key>`, читая токен из `localStorage`
3. THE API_Client SHALL устанавливать заголовок `Content-Type: application/json` для всех запросов
4. WHEN запрос содержит заголовок `Authorization`, THE API_Client SHALL устанавливать `cache: 'no-store'` для предотвращения кэширования приватных данных
5. WHEN Django_API возвращает HTTP 401, THE API_Client SHALL выбрасывать ошибку с кодом 401
6. WHEN Django_API возвращает HTTP 403, THE API_Client SHALL выбрасывать ошибку с кодом 403
7. WHEN Django_API возвращает HTTP 404, THE API_Client SHALL выбрасывать ошибку типа `NotFoundError`
8. THE API_Client SHALL предоставлять функции: `getArticles`, `getArticle`, `createArticle`, `updateArticle`, `deleteArticle`, `voteArticle`, `getFeed`, `getComments`, `addComment`, `deleteComment`, `getTags`, `getProfile`, `getMyProfile`, `updateMyProfile`, `followUser`, `getNotifications`, `markNotificationsRead`, `login`, `register`, `logout`, `getMe`
9. WHEN формируется URL запроса из `ArticleParams`, THE API_Client SHALL включать только переданные параметры без дублирования ключей

---

### Требование 3: Управление аутентификацией

**User Story:** Как пользователь, я хочу безопасно входить в систему и оставаться авторизованным между сессиями, чтобы получить доступ к персонализированным функциям.

#### Критерии приёмки

1. WHEN пользователь успешно входит, THE Auth_Manager SHALL сохранять токен в `localStorage` под ключом `auth_token`
2. WHEN пользователь успешно входит, THE Auth_Manager SHALL сохранять объект `User` в `localStorage` под ключом `auth_user` в формате JSON
3. WHEN пользователь успешно входит, THE Auth_Manager SHALL устанавливать `httpOnly`-куку `auth_token` через Server Action
4. WHEN пользователь выходит из системы, THE Auth_Manager SHALL удалять `auth_token` и `auth_user` из `localStorage`
5. WHEN пользователь выходит из системы, THE Auth_Manager SHALL удалять `httpOnly`-куку `auth_token`
6. WHEN Django_API возвращает HTTP 401 на любой запрос, THE Auth_Manager SHALL очищать токен из `localStorage` и куки и перенаправлять пользователя на `/login`
7. THE Auth_Manager SHALL предоставлять функции `getToken`, `setToken`, `removeToken`, `getStoredUser` для клиентской стороны
8. THE Auth_Manager SHALL предоставлять функции `getServerToken`, `setServerToken`, `clearServerToken` для серверной стороны

---

### Требование 4: Главная страница (SSR)

**User Story:** Как посетитель, я хочу видеть список статей с фильтрацией и поиском, чтобы находить интересный контент.

#### Критерии приёмки

1. WHEN пользователь открывает главную страницу, THE Server_Component SHALL выполнять параллельные запросы `getArticles` и `getTags` к Django_API
2. WHEN главная страница рендерится, THE Server_Component SHALL отображать список карточек статей, фильтр по тегам, строку поиска и пагинацию
3. WHEN в URL присутствует параметр `?search=`, THE Server_Component SHALL передавать его в `getArticles` для фильтрации
4. WHEN в URL присутствует параметр `?tags__slug=`, THE Server_Component SHALL передавать его в `getArticles` для фильтрации по тегу
5. WHEN в URL присутствует параметр `?page=`, THE Server_Component SHALL передавать его в `getArticles` для пагинации
6. THE Server_Component SHALL рендерить страницу в виде HTML на сервере для обеспечения SEO

---

### Требование 5: Карточка и список статей

**User Story:** Как посетитель, я хочу видеть информативные карточки статей, чтобы быстро оценить контент.

#### Критерии приёмки

1. WHEN рендерится `ArticleCard`, THE ArticleCard SHALL отображать заголовок, имя автора, теги, рейтинг, дату создания и количество просмотров
2. THE ArticleCard SHALL содержать ссылку на страницу статьи по пути `/articles/{slug}`
3. WHEN рендерится список статей, THE Server_Component SHALL отображать по одной `ArticleCard` для каждой статьи из `results`

---

### Требование 6: Страница статьи (SSR + Client)

**User Story:** Как читатель, я хочу видеть полный текст статьи с комментариями и возможностью голосовать, чтобы взаимодействовать с контентом.

#### Критерии приёмки

1. WHEN пользователь открывает `/articles/{slug}`, THE Server_Component SHALL запрашивать `getArticle(slug)` и рендерить полный текст статьи
2. WHEN страница статьи рендерится, THE Server_Component SHALL передавать `initialComments` и `initialRating` в дочерние Client Components
3. WHEN авторизованный пользователь нажимает кнопку голосования, THE VoteButtons SHALL выполнять оптимистичное обновление рейтинга до получения ответа от Django_API
4. WHEN Django_API возвращает обновлённый рейтинг, THE VoteButtons SHALL синхронизировать отображаемое значение с ответом сервера
5. IF запрос голосования завершается ошибкой, THEN THE VoteButtons SHALL откатывать рейтинг к предыдущему значению
6. WHEN неавторизованный пользователь пытается проголосовать, THE VoteButtons SHALL перенаправлять на `/login`
7. WHEN авторизованный пользователь добавляет комментарий, THE CommentSection SHALL оптимистично добавлять его в список до подтверждения от Django_API
8. WHEN авторизованный пользователь удаляет свой комментарий, THE CommentSection SHALL удалять его из списка после подтверждения от Django_API
9. IF Django_API возвращает HTTP 403 при попытке голосовать за свою статью, THEN THE VoteButtons SHALL отображать уведомление об ошибке

---

### Требование 7: Пагинация

**User Story:** Как пользователь, я хочу перемещаться между страницами списка статей, чтобы просматривать весь контент.

#### Критерии приёмки

1. WHEN рендерится `Pagination`, THE Pagination SHALL вычислять количество страниц как `ceil(count / pageSize)` где `pageSize` по умолчанию равен 10
2. THE Pagination SHALL рендерить ссылки на страницы через URL-параметр `?page=N`
3. WHEN текущая страница равна 1, THE Pagination SHALL отображать кнопку «Назад» как неактивную
4. WHEN текущая страница равна последней, THE Pagination SHALL отображать кнопку «Вперёд» как неактивную

---

### Требование 8: Поиск

**User Story:** Как пользователь, я хочу искать статьи по ключевым словам, чтобы быстро находить нужный контент.

#### Критерии приёмки

1. WHEN пользователь вводит текст в `SearchBar`, THE SearchBar SHALL обновлять URL-параметр `?search=` не чаще одного раза в 300 мс (debounce)
2. WHEN значение поиска изменяется, THE SearchBar SHALL сбрасывать параметр `?page=` до 1
3. THE SearchBar SHALL отображать текущее значение из URL-параметра `?search=` при первоначальном рендере

---

### Требование 9: Аутентификация — вход и регистрация

**User Story:** Как новый пользователь, я хочу зарегистрироваться и войти в систему, чтобы получить доступ к персонализированным функциям.

#### Критерии приёмки

1. WHEN пользователь отправляет форму входа с корректными данными, THE LoginPage SHALL вызывать `POST /api/v1/auth/login/` и сохранять токен через `Auth_Manager`
2. WHEN вход выполнен успешно, THE LoginPage SHALL перенаправлять пользователя на главную страницу `/`
3. IF Django_API возвращает HTTP 400 при входе, THEN THE LoginPage SHALL отображать сообщение об ошибке «Неверный логин или пароль»
4. WHEN пользователь отправляет форму регистрации с корректными данными, THE RegisterPage SHALL вызывать `POST /api/v1/auth/register/` и сохранять токен через `Auth_Manager`
5. WHEN регистрация выполнена успешно, THE RegisterPage SHALL перенаправлять пользователя на главную страницу `/`
6. IF Django_API возвращает HTTP 400 при регистрации, THEN THE RegisterPage SHALL отображать ошибки валидации под соответствующими полями формы
7. WHILE форма отправляется, THE LoginPage SHALL отображать индикатор загрузки и блокировать повторную отправку

---

### Требование 10: Навигационная панель

**User Story:** Как пользователь, я хочу видеть навигационную панель с актуальным состоянием авторизации, чтобы быстро переходить между разделами.

#### Критерии приёмки

1. WHEN пользователь авторизован, THE Navbar SHALL отображать ссылки на `/feed`, `/notifications`, `/profile/{username}` и кнопку выхода
2. WHEN пользователь не авторизован, THE Navbar SHALL отображать ссылки на `/login` и `/register`
3. WHEN у пользователя есть непрочитанные уведомления, THE Navbar SHALL отображать числовой badge рядом со ссылкой на уведомления
4. WHEN пользователь нажимает кнопку выхода, THE Navbar SHALL вызывать `logout()` и перенаправлять на `/login`
5. THE Navbar SHALL читать состояние авторизации из `localStorage` при монтировании компонента

---

### Требование 11: Профиль пользователя

**User Story:** Как пользователь, я хочу просматривать и редактировать свой профиль, а также подписываться на других авторов.

#### Критерии приёмки

1. WHEN пользователь открывает `/profile/{username}`, THE ProfilePage SHALL запрашивать `getProfile(username)` и отображать аватар, bio, количество подписчиков
2. WHEN авторизованный пользователь просматривает чужой профиль, THE FollowButton SHALL отображать актуальное состояние подписки из `initialIsFollowing`
3. WHEN пользователь нажимает `FollowButton`, THE FollowButton SHALL вызывать `followUser(username)` и обновлять состояние кнопки согласно ответу Django_API
4. WHEN неавторизованный пользователь просматривает профиль, THE FollowButton SHALL быть отключена (`disabled`)
5. WHEN авторизованный пользователь открывает `/profile/me`, THE ProfilePage SHALL отображать форму редактирования bio и аватара
6. WHEN пользователь сохраняет изменения профиля, THE ProfilePage SHALL вызывать `updateMyProfile` и отображать обновлённые данные

---

### Требование 12: Лента подписок

**User Story:** Как авторизованный пользователь, я хочу видеть статьи авторов, на которых подписан, чтобы следить за интересным контентом.

#### Критерии приёмки

1. WHEN авторизованный пользователь открывает `/feed`, THE Server_Component SHALL запрашивать `getFeed()` с токеном из куки
2. IF пользователь не авторизован и открывает `/feed`, THEN THE System SHALL перенаправлять его на `/login`
3. WHEN лента рендерится, THE Server_Component SHALL отображать статьи с пагинацией аналогично главной странице

---

### Требование 13: Создание и редактирование статей

**User Story:** Как авторизованный пользователь, я хочу создавать и редактировать статьи, чтобы делиться контентом с сообществом.

#### Критерии приёмки

1. WHEN авторизованный пользователь открывает `/articles/new`, THE ArticleForm SHALL отображать форму с полями: заголовок, контент, теги, статус (`draft`/`published`)
2. WHEN пользователь отправляет форму создания статьи, THE ArticleForm SHALL вызывать `createArticle` и перенаправлять на страницу созданной статьи
3. WHEN авторизованный пользователь открывает `/articles/{slug}/edit`, THE ArticleForm SHALL загружать текущие данные статьи и предзаполнять форму
4. WHEN пользователь сохраняет изменения, THE ArticleForm SHALL вызывать `updateArticle(slug, data)` и перенаправлять на страницу статьи
5. IF Django_API возвращает HTTP 400 при сохранении, THEN THE ArticleForm SHALL отображать ошибки валидации под соответствующими полями
6. IF пользователь не авторизован и открывает `/articles/new`, THEN THE System SHALL перенаправлять его на `/login`
7. WHEN авторизованный пользователь просматривает свою статью, THE Server_Component SHALL отображать ссылки «Редактировать» и «Удалить»
8. WHEN пользователь подтверждает удаление статьи, THE ArticleForm SHALL вызывать `deleteArticle(slug)` и перенаправлять на главную страницу

---

### Требование 14: Уведомления

**User Story:** Как авторизованный пользователь, я хочу получать уведомления о новых комментариях к моим статьям, чтобы быть в курсе активности.

#### Критерии приёмки

1. WHEN авторизованный пользователь открывает `/notifications`, THE NotificationsPage SHALL запрашивать `getNotifications()` и отображать список уведомлений
2. WHEN страница уведомлений загружается, THE NotificationsPage SHALL вызывать `markNotificationsRead()` для отметки всех уведомлений как прочитанных
3. WHEN уведомление отображается, THE NotificationsPage SHALL показывать имя актора, заголовок статьи и время события
4. IF пользователь не авторизован и открывает `/notifications`, THEN THE System SHALL перенаправлять его на `/login`

---

### Требование 15: Обработка ошибок

**User Story:** Как пользователь, я хочу получать понятные сообщения об ошибках, чтобы понимать что пошло не так и как это исправить.

#### Критерии приёмки

1. WHEN `fetch` выбрасывает `TypeError` (сеть недоступна), THE System SHALL отображать глобальный error boundary с кнопкой «Повторить»
2. WHEN Server_Component не может получить данные от Django_API, THE System SHALL рендерить страницу `error.tsx` с сообщением об ошибке
3. IF Django_API возвращает HTTP 403 при мутирующем запросе, THEN THE System SHALL отображать toast-уведомление «Нет прав доступа»
4. WHEN Django_API возвращает HTTP 400 с объектом ошибок полей, THE System SHALL отображать сообщения об ошибках под соответствующими полями формы

---

### Требование 16: Безопасность

**User Story:** Как пользователь, я хочу чтобы мои данные аутентификации были защищены, чтобы предотвратить несанкционированный доступ.

#### Критерии приёмки

1. THE Auth_Manager SHALL хранить токен в `httpOnly`-куке, недоступной для JavaScript на клиенте
2. THE System SHALL устанавливать и удалять `httpOnly`-куку только через Server Actions Next.js
3. WHEN выполняются POST, PUT, PATCH или DELETE запросы, THE API_Client SHALL включать токен аутентификации в заголовок `Authorization`
4. THE System SHALL не хранить пароль пользователя в состоянии компонента после завершения запроса аутентификации

---

### Требование 17: Производительность

**User Story:** Как пользователь, я хочу чтобы страницы загружались быстро, чтобы комфортно пользоваться приложением.

#### Критерии приёмки

1. WHEN Server_Component загружает главную страницу, THE System SHALL выполнять запросы `getArticles` и `getTags` параллельно через `Promise.all`
2. THE System SHALL использовать Server Components для страниц, не требующих интерактивности, чтобы исключить их JS из клиентского бандла
3. WHERE используются изображения аватаров, THE System SHALL применять компонент `next/image` для автоматической оптимизации
4. THE SearchBar SHALL применять debounce 300 мс перед обновлением URL-параметра поиска
