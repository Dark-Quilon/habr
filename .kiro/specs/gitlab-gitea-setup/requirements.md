# Документ требований: Настройка GitLab и Gitea

## Введение

Данный документ описывает требования к добавлению двух самостоятельно размещаемых Git-сервисов — GitLab CE и Gitea — в существующую инфраструктуру Docker Compose проекта (Django + Next.js блог-приложение). GitLab CE разворачивается как полноценная платформа с публикацией текущего проекта в репозиторий. Gitea разворачивается исключительно как изолированный Docker-сервис без какой-либо интеграции с проектом.

## Глоссарий

- **Docker_Compose** — инструмент оркестрации контейнеров, управляющий всеми сервисами через `docker-compose.yml`
- **GitLab_CE** — самостоятельно размещаемый экземпляр GitLab Community Edition, запущенный в Docker-контейнере `gitlab-ce`
- **Gitea** — лёгкий самостоятельно размещаемый Git-сервис, запущенный в Docker-контейнере `gitea`
- **Gitea_DB** — экземпляр PostgreSQL 16, обеспечивающий хранение метаданных Gitea
- **GitLab_API** — REST API GitLab CE, доступный по пути `/api/v4/`
- **Root_Token** — Personal Access Token пользователя `root` с правами `api` и `write_repository`
- **Blog_App** — текущий проект (Django + Next.js блог-приложение), расположенный в корне рабочего пространства
- **Health_Check** — механизм проверки работоспособности контейнера через HTTP-эндпоинт или команду
- **Named_Volume** — именованный Docker-том для постоянного хранения данных

---

## Требования

### Требование 1: Добавление сервисов в Docker Compose

**User Story:** Как оператор, я хочу добавить GitLab CE и Gitea в существующий `docker-compose.yml`, чтобы управлять всеми сервисами единым инструментом.

#### Критерии приёмки

1. THE Docker_Compose SHALL содержать определение сервиса `gitlab` с образом `gitlab/gitlab-ce:latest`
2. THE Docker_Compose SHALL содержать определение сервиса `gitea` с образом `gitea/gitea:latest`
3. THE Docker_Compose SHALL содержать определение сервиса `gitea-db` с образом `postgres:16-alpine`
4. THE Docker_Compose SHALL объявлять именованные тома `gitlab_config`, `gitlab_logs`, `gitlab_data`, `gitea_data`, `gitea_db_data`
5. WHEN выполняется команда `docker compose config`, THE Docker_Compose SHALL проходить валидацию без ошибок

---

### Требование 2: Конфигурация сервиса GitLab CE

**User Story:** Как оператор, я хочу, чтобы GitLab CE был правильно сконфигурирован, чтобы он был доступен по HTTP, HTTPS и SSH на заданных портах.

#### Критерии приёмки

1. THE GitLab_CE SHALL публиковать порт `8080` хоста на порт `80` контейнера для HTTP-доступа
2. THE GitLab_CE SHALL публиковать порт `8443` хоста на порт `443` контейнера для HTTPS-доступа
3. THE GitLab_CE SHALL публиковать порт `2222` хоста на порт `22` контейнера для SSH git-операций
4. THE GitLab_CE SHALL монтировать тома `gitlab_config`, `gitlab_logs`, `gitlab_data` в соответствующие директории контейнера
5. THE GitLab_CE SHALL иметь переменную окружения `GITLAB_OMNIBUS_CONFIG` с параметрами `external_url 'http://gitlab.localhost:8080'` и `gitlab_shell_ssh_port = 2222`
6. THE GitLab_CE SHALL иметь `shm_size: 256m` для предотвращения ошибок разделяемой памяти
7. THE GitLab_CE SHALL иметь `container_name: gitlab-ce` и `hostname: gitlab.localhost`

---

### Требование 3: Health Check GitLab CE

**User Story:** Как оператор, я хочу, чтобы Docker отслеживал работоспособность GitLab CE, чтобы знать, когда сервис готов к работе.

#### Критерии приёмки

1. THE GitLab_CE SHALL иметь настроенный `healthcheck` с командой `curl -f http://localhost/-/health`
2. THE GitLab_CE SHALL иметь `start_period` не менее `300s` для учёта времени первоначальной инициализации
3. WHEN GitLab_CE достигает статуса `healthy`, THE GitLab_CE SHALL отвечать HTTP 200 на запрос `GET /-/health`
4. IF GitLab_CE не достигает статуса `healthy` в течение 10 минут, THEN THE оператор SHALL получить сообщение об ошибке с инструкцией по восстановлению

---

### Требование 4: Получение токена доступа GitLab

**User Story:** Как оператор, я хочу получить Personal Access Token пользователя `root`, чтобы использовать GitLab API для создания проекта.

#### Критерии приёмки

1. WHEN GitLab_CE находится в статусе `healthy`, THE оператор SHALL получить начальный пароль `root` из файла `/etc/gitlab/initial_root_password` внутри контейнера
2. WHEN выполняется команда через `gitlab-rails runner`, THE GitLab_CE SHALL создать Personal Access Token с правами `api` и `write_repository`
3. THE Root_Token SHALL иметь срок действия не менее 1 дня с момента создания
4. IF файл `initial_root_password` недоступен, THEN THE оператор SHALL сменить пароль `root` через веб-интерфейс `http://localhost:8080`

---

### Требование 5: Создание проекта в GitLab через API

**User Story:** Как оператор, я хочу создать проект `blog-app` в GitLab через REST API, чтобы подготовить репозиторий для публикации кодовой базы.

#### Критерии приёмки

1. WHEN выполняется `POST /api/v4/projects` с заголовком `PRIVATE-TOKEN: <root_token>` и телом `{"name": "blog-app", "visibility": "private"}`, THE GitLab_API SHALL вернуть HTTP 201 с полем `http_url_to_repo` в теле ответа
2. WHEN проект создан, THE GitLab_API SHALL сделать проект `blog-app` доступным по пути `/root/blog-app`
3. IF GitLab_API возвращает статус, отличный от 201, THEN THE оператор SHALL получить тело ответа с описанием ошибки для диагностики

---

### Требование 6: Публикация проекта в GitLab

**User Story:** Как оператор, я хочу опубликовать текущую кодовую базу в репозиторий GitLab, чтобы иметь полную историю коммитов в локальном GitLab CE.

#### Критерии приёмки

1. WHEN проект `blog-app` создан в GitLab, THE оператор SHALL добавить git-remote `gitlab` с URL вида `http://root:<password>@localhost:8080/root/blog-app.git`
2. IF remote `gitlab` уже существует, THEN THE оператор SHALL обновить его URL командой `git remote set-url`
3. WHEN выполняется `git push gitlab <branch>`, THE GitLab_CE SHALL принять push и создать ветку в репозитории
4. WHEN push завершён, THE GitLab_API SHALL подтвердить, что количество коммитов в ветке равно результату `git rev-list --count HEAD` в локальном репозитории
5. WHEN push завершён, THE GitLab_CE SHALL отображать проект `blog-app` с полной историей коммитов в веб-интерфейсе

---

### Требование 7: Конфигурация базы данных Gitea

**User Story:** Как оператор, я хочу, чтобы Gitea использовала выделенный экземпляр PostgreSQL, чтобы обеспечить надёжное хранение метаданных.

#### Критерии приёмки

1. THE Gitea_DB SHALL иметь переменные окружения `POSTGRES_USER=gitea`, `POSTGRES_PASSWORD=gitea_password`, `POSTGRES_DB=gitea`
2. THE Gitea_DB SHALL монтировать том `gitea_db_data` в `/var/lib/postgresql/data`
3. THE Gitea_DB SHALL иметь `healthcheck` с командой `pg_isready -U gitea`
4. WHEN Gitea_DB достигает статуса `healthy`, THE Gitea_DB SHALL принимать подключения от сервиса `gitea`

---

### Требование 8: Конфигурация сервиса Gitea

**User Story:** Как оператор, я хочу, чтобы Gitea была правильно сконфигурирована и подключена к своей базе данных, чтобы сервис запускался корректно.

#### Критерии приёмки

1. THE Gitea SHALL публиковать порт `3000` хоста на порт `3000` контейнера для HTTP-доступа
2. THE Gitea SHALL публиковать порт `2223` хоста на порт `22` контейнера для SSH git-операций
3. THE Gitea SHALL иметь переменные окружения `GITEA__database__DB_TYPE=postgres`, `GITEA__database__HOST=gitea-db:5432`, `GITEA__database__NAME=gitea`, `GITEA__database__USER=gitea`, `GITEA__database__PASSWD=gitea_password`
4. THE Gitea SHALL иметь переменные окружения `GITEA__server__DOMAIN=localhost`, `GITEA__server__HTTP_PORT=3000`, `GITEA__server__SSH_PORT=2223`, `GITEA__server__ROOT_URL=http://localhost:3000/`
5. THE Gitea SHALL монтировать том `gitea_data` в `/data`
6. THE Gitea SHALL иметь условие `depends_on: gitea-db: condition: service_healthy`

---

### Требование 9: Запуск и доступность Gitea

**User Story:** Как оператор, я хочу, чтобы Gitea была доступна по адресу `http://localhost:3000` после запуска, чтобы убедиться в корректной работе сервиса.

#### Критерии приёмки

1. WHEN выполняется `docker compose up -d gitea-db`, THE Gitea_DB SHALL достичь статуса `healthy` до запуска сервиса `gitea`
2. WHEN выполняется `docker compose up -d gitea`, THE Gitea SHALL выполнить миграции базы данных до начала приёма HTTP-соединений
3. WHEN Gitea запущена, THE Gitea SHALL отвечать HTTP 200 или 302 на запрос `GET http://localhost:3000`
4. WHEN Gitea запущена, THE Gitea SHALL отвечать `{"status":"pass"}` на запрос `GET http://localhost:3000/api/healthz`
5. IF Gitea не становится доступной в течение 2 минут, THEN THE оператор SHALL получить сообщение об ошибке с инструкцией по диагностике

---

### Требование 10: Изоляция Gitea от проекта

**User Story:** Как оператор, я хочу, чтобы Gitea не содержала никаких данных текущего проекта, чтобы сохранить чёткое разграничение между сервисами.

#### Критерии приёмки

1. WHEN настройка завершена, THE Gitea SHALL не содержать репозиториев, связанных с проектом `blog-app`
2. THE Gitea SHALL не иметь git-remote, указывающих на текущий рабочий каталог
3. THE оператор SHALL не выполнять никаких `git push` или API-вызовов к Gitea в рамках данной настройки

---

### Требование 11: Изоляция портов и отсутствие конфликтов

**User Story:** Как оператор, я хочу, чтобы все сервисы использовали уникальные порты, чтобы избежать конфликтов при одновременной работе.

#### Критерии приёмки

1. THE Docker_Compose SHALL назначать каждому сервису уникальные порты хоста: `8080`, `8443`, `2222` для GitLab_CE и `3000`, `2223` для Gitea
2. WHEN все сервисы запущены одновременно, THE Docker_Compose SHALL не допускать конфликтов портов между `gitlab`, `gitea`, `web` и `redis`
3. IF порт уже занят на хосте, THEN THE оператор SHALL изменить маппинг портов в `docker-compose.yml` и обновить соответствующие переменные `external_url` или `ROOT_URL`

---

### Требование 12: Постоянство данных при перезапуске

**User Story:** Как оператор, я хочу, чтобы данные репозиториев и конфигурация сохранялись при перезапуске контейнеров, чтобы не терять историю коммитов и настройки.

#### Критерии приёмки

1. WHEN контейнер `gitlab-ce` перезапускается, THE GitLab_CE SHALL сохранять все репозитории, конфигурацию и данные из именованных томов `gitlab_config`, `gitlab_logs`, `gitlab_data`
2. WHEN контейнер `gitea` перезапускается, THE Gitea SHALL сохранять все данные из тома `gitea_data`
3. WHEN контейнер `gitea-db` перезапускается, THE Gitea_DB SHALL сохранять все данные PostgreSQL из тома `gitea_db_data`
4. WHILE именованные тома существуют, THE Docker_Compose SHALL монтировать их в контейнеры при каждом запуске

---

### Требование 13: Безопасность и хранение секретов

**User Story:** Как оператор, я хочу, чтобы секреты не попадали в систему контроля версий, чтобы обеспечить безопасность инфраструктуры.

#### Критерии приёмки

1. THE оператор SHALL хранить пароли и токены (включая `GITEA__database__PASSWD` и `Root_Token`) в файле `.env`, который уже включён в `.gitignore`
2. THE оператор SHALL сменить пароль `root` GitLab_CE сразу после первого входа в веб-интерфейс
3. THE оператор SHALL не открывать порты GitLab_CE и Gitea в публичный интернет без обратного прокси и TLS

---

### Требование 14: Последовательность развёртывания

**User Story:** Как оператор, я хочу выполнять развёртывание в строго определённом порядке, чтобы каждый сервис был проверен до запуска следующего.

#### Критерии приёмки

1. THE оператор SHALL запустить GitLab_CE первым командой `docker compose up -d gitlab` и дождаться статуса `healthy` перед переходом к следующему шагу
2. WHEN GitLab_CE достиг статуса `healthy`, THE оператор SHALL выполнить публикацию проекта `blog-app` в GitLab_CE перед запуском Gitea
3. WHEN публикация проекта завершена, THE оператор SHALL запустить Gitea командами `docker compose up -d gitea-db` и `docker compose up -d gitea` в указанном порядке
4. IF любой шаг завершается с ошибкой, THEN THE оператор SHALL устранить ошибку перед переходом к следующему шагу
