# Этап 1: Установка и старт Django проекта

## Что нужно установить

- Python 3.11 или 3.12: https://www.python.org/downloads/
- При установке поставить галочку "Add Python to PATH"

Проверить:
```bash
python --version
```

---

## Создать виртуальное окружение

Виртуальное окружение — изолированная папка с Python и пакетами для проекта.
Чтобы пакеты одного проекта не мешали другому.

```bash
# Создать папку проекта
mkdir Habr
cd Habr

# Создать виртуальное окружение
python -m venv .venv

# Активировать (Windows)
.venv\Scripts\activate

# Активировать (Mac/Linux)
source .venv/bin/activate
```

После активации в терминале появится `(.venv)` перед строкой.

---

## Установить Django

```bash
pip install django
pip install pillow          # для изображений (аватары)
pip install python-slugify  # транслитерация кириллицы в slug
pip install markdown        # Markdown в статьях
```

---

## Создать Django проект

```bash
django-admin startproject mysite .
```

Точка в конце важна — создаёт проект в текущей папке, не в подпапке.

Структура после этого:
```
Habr/
├── mysite/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── manage.py
└── .venv/
```

---

## Создать приложение blog

Django проект состоит из приложений. Создаём приложение `blog`:

```bash
python manage.py startapp blog
```

Структура:
```
Habr/
├── blog/
│   ├── models.py    # модели (таблицы БД)
│   ├── views.py     # логика обработки запросов
│   ├── urls.py      # маршруты (создать вручную)
│   ├── admin.py     # регистрация в админке
│   └── apps.py
├── mysite/
└── manage.py
```

---

## Подключить приложение

В `mysite/settings.py` добавить `'blog'` в `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog',  # добавить
]
```

---

## Подключить URLs приложения

В `mysite/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('blog.urls')),
]
```

Создать файл `blog/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # пока пусто, добавим позже
]
```

---

## Первый запуск

```bash
python manage.py migrate    # создать таблицы БД
python manage.py runserver  # запустить сервер
```

Открыть http://127.0.0.1:8000 — должна открыться стандартная страница Django.

---

## Создать суперпользователя (для админки)

```bash
python manage.py createsuperuser
```

Открыть http://127.0.0.1:8000/admin — войти с созданными данными.

---

## Итог этапа

- Python и Django установлены
- Проект создан, приложение `blog` подключено
- Сервер запускается
- Админка работает
