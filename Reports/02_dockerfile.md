# Отчёт 2: Dockerfile

## Статус: ВЫПОЛНЕНО ✅

## Итоговый Dockerfile

```dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/db && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
```

## Объяснение каждого шага

| Строка | Назначение |
|--------|-----------|
| `FROM python:3.12-slim` | Минимальный образ Python 3.12 (~150 МБ вместо ~900 МБ) |
| `ENV PYTHONUNBUFFERED=1` | Логи Django сразу видны в `docker compose logs` |
| `WORKDIR /app` | Все команды выполняются в `/app` |
| `COPY requirements.txt .` | Копируем только зависимости первыми |
| `RUN pip install ...` | Устанавливаем зависимости (слой кэшируется Docker'ом) |
| `COPY . .` | Копируем весь код проекта |
| `mkdir -p /app/db` | Создаём директорию для SQLite |
| `collectstatic --noinput` | Собираем CSS/JS в `/app/staticfiles` |
| `EXPOSE 8000` | Документируем порт |
| `CMD gunicorn ...` | Запуск через Gunicorn с 2 воркерами |

## Почему два этапа COPY

Если изменить только код (не `requirements.txt`), Docker использует кэшированный слой с зависимостями и не переустанавливает их. Это ускоряет пересборку в разы.

## Статика

`collectstatic` запускается при сборке образа и кладёт файлы в `/app/staticfiles`. WhiteNoise раздаёт их через Gunicorn без отдельного nginx.
