# Шаг 3: docker-compose.yml

## Что такое docker-compose

docker-compose описывает несколько контейнеров которые работают вместе.
Один файл — и Django, и Redis запускаются одной командой.

## Итоговый docker-compose.yml

Создать файл `docker-compose.yml` в корне проекта:

```yaml
services:

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

  web:
    build: .
    restart: always
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./media:/app/media
      - ./db.sqlite3:/app/db.sqlite3
    depends_on:
      - redis
    command: >
      sh -c "python manage.py migrate &&
             gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers 2"
```

## Объяснение

### Сервис `redis`

```yaml
redis:
  image: redis:7-alpine   # готовый образ Redis с Docker Hub, не нужно собирать
  restart: always          # перезапускать если упал
  ports:
    - "6379:6379"          # порт хоста : порт контейнера
```

`redis:7-alpine` — официальный образ Redis на Alpine Linux (очень маленький, ~30 МБ).

### Сервис `web`

```yaml
web:
  build: .                 # собрать образ из Dockerfile в текущей папке
  ports:
    - "8000:8000"          # сайт доступен на localhost:8000
  env_file:
    - .env                 # читать переменные окружения из файла .env
  volumes:
    - ./media:/app/media   # папка с аватарами — снаружи контейнера
    - ./db.sqlite3:/app/db.sqlite3  # база данных — снаружи контейнера
  depends_on:
    - redis                # сначала запустить redis, потом web
  command: >
    sh -c "python manage.py migrate &&
           gunicorn ..."   # сначала применить миграции, потом запустить сервер
```

### Зачем volumes для media и db.sqlite3

Контейнер — временный. Если его удалить, всё внутри пропадёт.
`volumes` монтирует папки с хоста внутрь контейнера — данные сохраняются.

- `./media` — загруженные аватары пользователей
- `./db.sqlite3` — база данных SQLite

### Адрес Redis в Django

Когда Django работает внутри Docker, Redis доступен не по `127.0.0.1`,
а по имени сервиса: `redis`.

Поэтому в `settings.py` адрес будет:
```python
"LOCATION": "redis://redis:6379/1"
#                    ^^^^^ имя сервиса из docker-compose
```

## Команды

```bash
# Собрать образы и запустить
docker compose up --build

# Запустить в фоне
docker compose up --build -d

# Остановить
docker compose down

# Посмотреть логи
docker compose logs web
docker compose logs redis

# Зайти внутрь контейнера
docker compose exec web bash

# Применить миграции вручную
docker compose exec web python manage.py migrate

# Создать суперпользователя
docker compose exec web python manage.py createsuperuser
```
