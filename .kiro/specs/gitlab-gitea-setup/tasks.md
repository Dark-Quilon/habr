# План реализации: Настройка GitLab и Gitea

## Обзор

Последовательное добавление GitLab CE и Gitea в существующий `docker-compose.yml`.
GitLab CE запускается первым, после чего текущий проект публикуется в его репозиторий.
Gitea запускается как изолированный сервис без интеграции с проектом.

## Задачи

- [x] 1. Добавить сервисы GitLab CE, Gitea и gitea-db в `docker-compose.yml`
  - Добавить сервис `gitlab` с образом `gitlab/gitlab-ce:latest`, `container_name: gitlab-ce`, `hostname: gitlab.localhost`
  - Настроить порты `8080:80`, `8443:443`, `2222:22`
  - Задать переменную окружения `GITLAB_OMNIBUS_CONFIG` с `external_url 'http://gitlab.localhost:8080'` и `gitlab_shell_ssh_port = 2222`
  - Добавить `shm_size: 256m` и `healthcheck` с командой `curl -f http://localhost/-/health`, `start_period: 300s`
  - Смонтировать тома `gitlab_config:/etc/gitlab`, `gitlab_logs:/var/log/gitlab`, `gitlab_data:/var/opt/gitlab`
  - Добавить сервис `gitea-db` с образом `postgres:16-alpine`, переменными `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и `healthcheck` с `pg_isready -U gitea`
  - Добавить сервис `gitea` с образом `gitea/gitea:latest`, портами `3000:3000`, `2223:22`, всеми `GITEA__*` переменными окружения и `depends_on: gitea-db: condition: service_healthy`
  - Объявить именованные тома `gitlab_config`, `gitlab_logs`, `gitlab_data`, `gitea_data`, `gitea_db_data` в секции `volumes`
  - _Требования: 1.1, 1.2, 1.3, 1.4, 2.1–2.7, 3.1, 3.2, 7.1–7.3, 8.1–8.6, 11.1_

  - [ ]* 1.1 Проверить синтаксис compose-файла
    - Выполнить `docker compose config` и убедиться в отсутствии ошибок
    - Проверить, что все пять именованных томов объявлены в секции `volumes`
    - Проверить уникальность всех портов хоста: `8080`, `8443`, `2222`, `3000`, `2223`, `8000`, `6379`
    - **Свойство 1: Уникальность портов хоста**
    - **Validates: Requirements 1.5, 11.1, 11.2**

- [x] 2. Запустить GitLab CE и дождаться готовности
  - Выполнить `docker compose up -d gitlab`
  - Дождаться статуса `healthy` командой `docker compose ps gitlab` или `docker inspect --format='{{.State.Health.Status}}' gitlab-ce`
  - Ориентировочное время первой инициализации: 3–5 минут; таймаут: 10 минут
  - При таймауте — проверить логи: `docker compose logs gitlab`
  - _Требования: 3.1, 3.2, 3.3, 3.4, 14.1_

- [x] 3. Получить токен доступа GitLab root
  - Прочитать начальный пароль root: `docker exec gitlab-ce cat /etc/gitlab/initial_root_password`
  - Если файл недоступен — сменить пароль через веб-интерфейс `http://localhost:8080`
  - Создать Personal Access Token с правами `api` и `write_repository`:
    ```bash
    docker exec -it gitlab-ce gitlab-rails runner \
      "token = User.find_by_username('root').personal_access_tokens.create(scopes: ['api', 'write_repository'], name: 'setup-token', expires_at: 1.day.from_now); puts token.token"
    ```
  - Сохранить полученный токен в переменную окружения или в `.env`
  - _Требования: 4.1, 4.2, 4.3, 4.4, 13.1_

- [x] 4. Включить Container Registry и добавить GitLab Runner в docker-compose.yml
  - [ ] 4.1 Включить Container Registry в GitLab Omnibus config
    - Добавить в `GITLAB_OMNIBUS_CONFIG`: `registry_external_url 'http://gitlab.localhost:5050'` и `gitlab_rails['registry_enabled'] = true`
    - Добавить порт `5050:5050` в сервис `gitlab`
    - _Требования: 2.1_

  - [ ] 4.2 Добавить сервис `gitlab-runner` в docker-compose.yml
    - Образ: `gitlab/gitlab-runner:latest`
    - Смонтировать `/var/run/docker.sock` для Docker executor (Docker-in-Docker)
    - Смонтировать том `gitlab_runner_config:/etc/gitlab-runner`
    - Объявить том `gitlab_runner_config` в секции `volumes`
    - _Требования: 2.2_

  - [ ] 4.3 Зарегистрировать GitLab Runner в GitLab
    - Получить registration token через GitLab API или веб-интерфейс (`http://localhost:8080/admin/runners`)
    - Выполнить регистрацию runner с Docker executor:
      ```bash
      docker exec gitlab-runner gitlab-runner register \
        --non-interactive \
        --url http://gitlab-ce \
        --registration-token <token> \
        --executor docker \
        --docker-image docker:latest \
        --docker-volumes /var/run/docker.sock:/var/run/docker.sock \
        --description "docker-runner"
      ```
    - Убедиться, что runner отображается как активный в `http://localhost:8080/admin/runners`

  - [ ] 4.4 Создать `.gitlab-ci.yml` для проекта
    - Создать файл `.gitlab-ci.yml` в корне проекта с пайплайном для сборки Docker-образа и push в Container Registry

- [~] 5. Контрольная точка — GitLab Runner и Registry настроены
  - Убедиться, что все тесты пройдены, задать вопросы пользователю при необходимости.

- [~] 6. Запустить Gitea и базу данных
  - [ ] 6.1 Запустить `gitea-db` и дождаться готовности
    - Выполнить `docker compose up -d gitea-db`
    - Дождаться статуса `healthy`: `docker inspect --format='{{.State.Health.Status}}' gitea-db`
    - _Требования: 7.3, 7.4, 9.1_

  - [ ] 6.2 Запустить сервис Gitea
    - Выполнить `docker compose up -d gitea`
    - Дождаться доступности: `curl -f http://localhost:3000` (ожидаемый ответ HTTP 200 или 302)
    - Проверить health endpoint: `curl -f http://localhost:3000/api/healthz` (ожидаемый ответ `{"status":"pass"}`)
    - При отсутствии ответа в течение 2 минут — проверить логи: `docker compose logs gitea`
    - _Требования: 8.1–8.6, 9.2, 9.3, 9.4, 9.5, 14.3_

  - [ ]* 6.3 Проверить изоляцию Gitea от проекта
    - Убедиться, что в Gitea нет репозиториев `blog-app`: `curl http://localhost:3000/api/v1/repos/search?q=blog-app`
    - Убедиться, что в локальном списке remote нет записей, указывающих на Gitea: `git remote -v`
    - **Свойство 5: Изоляция Gitea от проекта**
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [~] 7. Проверить постоянство данных при перезапуске
  - [ ]* 7.1 Проверить постоянство данных GitLab
    - Перезапустить контейнер: `docker compose restart gitlab`
    - Дождаться статуса `healthy`
    - Убедиться, что репозиторий `blog-app` и история коммитов сохранились через API или веб-интерфейс
    - **Свойство 3: Постоянство данных GitLab при перезапуске (round-trip)**
    - **Validates: Requirements 12.1, 12.4**

  - [ ]* 7.2 Проверить постоянство данных Gitea
    - Перезапустить контейнеры: `docker compose restart gitea-db gitea`
    - Дождаться доступности Gitea на `http://localhost:3000`
    - Убедиться, что сервис отвечает корректно после перезапуска
    - **Свойство 4: Постоянство данных Gitea при перезапуске (round-trip)**
    - **Validates: Requirements 12.2, 12.3, 12.4**

- [~] 8. Итоговая контрольная точка — все сервисы работают
  - Убедиться, что все тесты пройдены, задать вопросы пользователю при необходимости.

## Примечания

- Задачи, отмеченные `*`, являются необязательными и могут быть пропущены для ускорения развёртывания
- Каждая задача ссылается на конкретные требования для обеспечения трассируемости
- Контрольные точки обеспечивают инкрементальную проверку
- Свойства корректности описаны в `design.md` и проверяются в соответствующих подзадачах
- Пароли и токены хранить в `.env` (уже включён в `.gitignore`) — требование 13.1
