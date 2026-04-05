FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV DATA_DIR=/app/data

WORKDIR /app

# Создаём папки для данных (база, медиа, статика)
RUN mkdir -p /app/data/media /app/data/staticfiles

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Собираем статику
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# При запуске: миграция -> статьи -> админ -> сервер
# 2>/dev/null скрывает ошибки, чтобы сервер всё равно запустился
ENV DJANGO_SUPERUSER_PASSWORD=admin123
CMD sh -c "python manage.py migrate --noinput 2>/dev/null; python manage.py seed_articles 2>/dev/null; python manage.py createsuperuser --noinput --username admin --email admin@example.com 2>/dev/null; gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers 2"
