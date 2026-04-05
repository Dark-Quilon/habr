FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV DATA_DIR=/app/data

WORKDIR /app

# Создаём папки для данных (база, медиа, статика)
RUN mkdir -p /app/data/media /app/data/staticfiles

# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Collect static files at build time
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Автоматическая миграция и создание админа при запуске
ENV DJANGO_SUPERUSER_PASSWORD=admin123
CMD sh -c "python manage.py migrate && python manage.py createsuperuser --noinput --username admin --email admin@example.com 2>/dev/null || true && gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers 2"
