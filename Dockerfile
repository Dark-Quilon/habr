FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Собираем статику
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# При запуске: миграции -> статьи (включая админа) -> сервер
CMD python manage.py makemigrations --noinput && python manage.py migrate --noinput && python manage.py seed_articles && gunicorn mysite.wsgi:application --bind 0.0.0.0:8000 --workers 2
