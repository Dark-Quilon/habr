# Отчёт 5: Redis

## Статус: ВЫПОЛНЕНО ✅

## Конфигурация

Redis запускается как отдельный контейнер в Docker Compose:

```yaml
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
```

## Параметры

| Параметр | Значение | Назначение |
|---------|---------|-----------|
| maxmemory | 256mb | Лимит памяти |
| maxmemory-policy | allkeys-lru | Вытеснять давно неиспользуемые ключи |
| save | "" | Не сохранять на диск (кэш не нужно персистировать) |

## Подключение из Django

В `settings.py`:
```python
REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
    }
}
DJANGO_REDIS_IGNORE_EXCEPTIONS = True
```

`DJANGO_REDIS_IGNORE_EXCEPTIONS = True` — если Redis недоступен, Django продолжает работу без кэша, не возвращая HTTP 500.

## Схема ключей кэша

| Ключ | Содержимое | TTL |
|------|-----------|-----|
| `article:<slug>` | Объект статьи | 300 сек |
| `article_list:<sort>:<tag>:<page>` | Страница списка статей | 60 сек |

## Инвалидация

Кэш инвалидируется при:
- Редактировании статьи
- Удалении статьи
- Голосовании за статью
- Добавлении/удалении комментария

## Проверка работы Redis

```powershell
# Проверить что Redis запущен
docker compose exec redis redis-cli ping
# Ответ: PONG

# Проверить политику памяти
docker compose exec redis redis-cli config get maxmemory-policy
# Ответ: allkeys-lru

# Посмотреть ключи в кэше
docker compose exec redis redis-cli keys "*"
```
