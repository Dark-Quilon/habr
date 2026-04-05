# Настройка Redis

## Как Redis используется в проекте

Django подключается к Redis через `django-redis`.
Redis хранит кэш статей и списков статей.

Схема подключения:
```
Django (web контейнер) --> redis://redis:6379/1 --> Redis (redis контейнер)
```

`/1` — это номер базы данных внутри Redis (0-15). Используем 1 чтобы не мешать другим приложениям если они используют базу 0.

---

## Базовая конфигурация в settings.py

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",  # redis — имя сервиса в docker-compose
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,   # таймаут подключения (секунды)
            "SOCKET_TIMEOUT": 5,           # таймаут операций (секунды)
        }
    }
}

# Не падать если Redis недоступен — просто идти в БД
DJANGO_REDIS_IGNORE_EXCEPTIONS = True
```

---

## Конфигурация Redis через docker-compose

### Минимальная (для разработки)

```yaml
redis:
  image: redis:7-alpine
  restart: always
  ports:
    - "6379:6379"
```

### Расширенная (с настройками)

```yaml
redis:
  image: redis:7-alpine
  restart: always
  ports:
    - "6379:6379"
  command: >
    redis-server
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
    --save ""
  volumes:
    - redis_data:/data

volumes:
  redis_data:
```

### Объяснение параметров

| Параметр | Значение | Зачем |
|----------|----------|-------|
| `--maxmemory 256mb` | Лимит памяти 256 МБ | Без лимита Redis может съесть всю память |
| `--maxmemory-policy allkeys-lru` | При переполнении удалять давно неиспользуемые ключи | Самая разумная политика для кэша |
| `--save ""` | Отключить сохранение на диск | Для кэша не нужно — при перезапуске кэш всё равно сбросится |

### Политики вытеснения (maxmemory-policy)

| Политика | Поведение |
|----------|-----------|
| `allkeys-lru` | Удалять любые ключи по принципу "давно не использовался" — лучший выбор для кэша |
| `volatile-lru` | Удалять только ключи с TTL — если TTL не установлен, Redis упадёт с ошибкой |
| `noeviction` | Не удалять ничего — при переполнении возвращать ошибку (плохо для кэша) |

Для кэша статей используй `allkeys-lru`.

---

## Проверка что Redis работает

После `docker compose up`:

```bash
# Зайти в Redis CLI
docker compose exec redis redis-cli

# Проверить подключение
127.0.0.1:6379> PING
PONG

# Посмотреть все ключи в базе 1
127.0.0.1:6379> SELECT 1
127.0.0.1:6379[1]> KEYS *

# Посмотреть конкретный ключ
127.0.0.1:6379[1]> GET article:my-slug

# Посмотреть TTL ключа (сколько секунд осталось)
127.0.0.1:6379[1]> TTL article:my-slug

# Удалить все ключи в базе 1 (сбросить кэш)
127.0.0.1:6379[1]> FLUSHDB

# Статистика Redis
127.0.0.1:6379> INFO memory
```

---

## Как работает кэш в проекте

| Ключ | Что хранит | TTL |
|------|-----------|-----|
| `article:<slug>` | Объект статьи | 300 сек (5 мин) |
| `article_list:<sort>:<tag>:<page>:` | Страница списка статей | 60 сек (1 мин) |

### Когда кэш инвалидируется (сбрасывается)

- Редактирование статьи → удаляется `article:<slug>` + все `article_list:*`
- Удаление статьи → то же самое
- Голосование → удаляется `article:<slug>`
- Добавление/удаление комментария → удаляется `article:<slug>`

### Что никогда не кэшируется

- `user_vote` — голос конкретного пользователя (у каждого свой)
- Счётчик просмотров — пишется напрямую в БД при каждом запросе
- Поисковые запросы (`?q=...`) — слишком много вариантов

---

## Мониторинг Redis

```bash
# Смотреть все команды в реальном времени
docker compose exec redis redis-cli MONITOR

# Статистика использования памяти
docker compose exec redis redis-cli INFO memory

# Количество ключей по базам
docker compose exec redis redis-cli INFO keyspace
```

---

## Сброс кэша вручную

Если нужно сбросить весь кэш (например после деплоя):

```bash
# Через redis-cli
docker compose exec redis redis-cli -n 1 FLUSHDB

# Через Django shell
docker compose exec web python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```
