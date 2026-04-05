# Отчёт 3: docker-compose.yml

## Статус: ВЫПОЛНЕНО ✅

## Итоговый docker-compose.yml

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: always
    command: >
      redis-server
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --save ""
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
      - ./staticfiles:/app/staticfiles
      - ./db.sqlite3:/app/db.sqlite3
    depends_on:
      - redis
    command: >
      sh -c "python manage.py migrate --noinput &&
             gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers 2"
```

## Сервисы

### redis
- Образ `redis:7-alpine` (~30 МБ)
- Лимит памяти: 256 МБ
- Политика вытеснения: `allkeys-lru` (удаляет давно неиспользуемые ключи)
- `--save ""` — отключает сохранение на диск (кэш не нужно персистировать)

### web
- Собирается из `Dockerfile` в текущей папке
- Читает конфигурацию из `.env`
- Запускает `migrate` перед стартом Gunicorn
- Зависит от `redis` — Redis стартует первым

## Тома (volumes)

| Том | Назначение |
|-----|-----------|
| `./media:/app/media` | Аватары и загруженные файлы сохраняются на хосте |
| `./staticfiles:/app/staticfiles` | Статика доступна на хосте |
| `./db.sqlite3:/app/db.sqlite3` | SQLite база данных хранится рядом с проектом на хосте |

## Важно перед первым запуском

Файл `db.sqlite3` должен существовать до `docker compose up`, иначе Docker создаст папку вместо файла:

```bash
# Windows
type nul > db.sqlite3

# Mac/Linux
touch db.sqlite3
```

## Проблемы и решения

**Проблема:** Монтирование `./db.sqlite3` как файла — Docker на Windows создавал директорию вместо файла если файл не существовал.
**Решение:** Создавать пустой файл `db.sqlite3` перед первым запуском.

## Команды

```powershell
# Запустить всё
docker compose up --build

# Запустить в фоне
docker compose up --build -d

# Остановить
docker compose down

# Логи
docker compose logs web
docker compose logs redis

# Применить миграции вручную
docker compose exec web python manage.py makemigrations blog
docker compose exec web python manage.py migrate

# Создать суперпользователя
docker compose exec web python manage.py createsuperuser
```
