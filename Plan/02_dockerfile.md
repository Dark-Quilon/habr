# Шаг 2: Dockerfile

## Что такое Dockerfile

Dockerfile — инструкция для Docker как собрать образ приложения.
Образ = снимок системы с Python, зависимостями и кодом проекта.

## Итоговый Dockerfile

Создать файл `Dockerfile` в корне проекта (рядом с `manage.py`):

```dockerfile
# Базовый образ — Python 3.12 на минимальном Linux
FROM python:3.12-slim

# Рабочая директория внутри контейнера
WORKDIR /app

# Отключить буферизацию вывода Python (логи сразу видны)
ENV PYTHONUNBUFFERED=1

# Сначала копируем только requirements.txt
# (чтобы Docker кэшировал слой с зависимостями)
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта
COPY . .

# Собираем статику
RUN python manage.py collectstatic --noinput

# Открываем порт 8000
EXPOSE 8000

# Команда запуска
CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
```

## Объяснение каждой строки

| Строка | Зачем |
|--------|-------|
| `FROM python:3.12-slim` | Берём минимальный образ Python, без лишнего |
| `WORKDIR /app` | Все команды выполняются в папке `/app` |
| `ENV PYTHONUNBUFFERED=1` | Логи Django сразу попадают в консоль Docker |
| `COPY requirements.txt .` | Копируем только requirements сначала |
| `RUN pip install ...` | Устанавливаем зависимости (кэшируется Docker'ом) |
| `COPY . .` | Копируем весь код |
| `collectstatic` | Собираем CSS/JS в одну папку |
| `EXPOSE 8000` | Документируем что контейнер слушает порт 8000 |
| `CMD gunicorn ...` | Команда запуска при `docker compose up` |

## Важно: .dockerignore

Создать файл `.dockerignore` чтобы не копировать лишнее в образ:

```
.venv
__pycache__
*.pyc
*.pyo
.git
.gitignore
db.sqlite3
media/
*.md
Plan/
```

Без этого файла Docker скопирует `.venv` (сотни МБ) внутрь образа — это медленно и неправильно.

## Почему два этапа COPY

```dockerfile
COPY requirements.txt .   # сначала только это
RUN pip install ...        # установка зависимостей
COPY . .                   # потом весь код
```

Docker кэширует слои. Если изменить только код (не requirements.txt),
Docker не будет переустанавливать зависимости — пропустит первые два шага.
Это ускоряет пересборку образа в разы.
