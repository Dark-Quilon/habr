# Шаг 1: requirements.txt

## Текущее состояние

Сейчас в `requirements.txt` только одна строка:
```
django-redis
```

Это неполный файл — там нет самого Django и других зависимостей.

## Что должно быть

Полный `requirements.txt` со всеми зависимостями проекта:

```
# Основной фреймворк
Django==6.0.3

# Для работы с изображениями (аватары)
Pillow

# Транслитерация кириллицы в slug
python-slugify

# Markdown в статьях
markdown

# Redis кэш
django-redis

# WSGI сервер для продакшена (вместо runserver)
gunicorn
```

## Как узнать точные версии установленных пакетов

Запустить в терминале:
```bash
.venv/Scripts/pip freeze
```

Это покажет все установленные пакеты с версиями. Скопировать нужные в `requirements.txt`.

## Зачем gunicorn

`python manage.py runserver` — только для разработки, не для Docker/продакшена.
`gunicorn` — настоящий WSGI сервер, который используется в контейнерах.

Запуск через gunicorn:
```bash
gunicorn mysite.wsgi:application --bind 0.0.0.0:8000
```
