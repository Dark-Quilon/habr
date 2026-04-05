# Шаг 4: Переменные окружения (.env)

## Зачем .env файл

Сейчас в `settings.py` секреты прямо в коде:
```python
SECRET_KEY = 'django-insecure-c^p1...'
DEBUG = True
```

Это плохо — если залить код на GitHub, секрет утечёт.
`.env` файл хранит секреты отдельно и не попадает в git.

## Создать .env

Создать файл `.env` в корне проекта:

```env
SECRET_KEY=django-insecure-c^p1%(6#-ffc&4wmkwq2mi89w--*@_%8rmz4&_i-)raee3h%lh
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://redis:6379/1
```

## Создать .env.example

Создать файл `.env.example` — шаблон без реальных значений.
Этот файл можно заливать на GitHub:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://redis:6379/1
```

## Добавить .env в .gitignore

Если есть `.gitignore`, добавить туда:
```
.env
```

Если `.gitignore` нет — создать его с таким содержимым:
```
.env
.venv/
__pycache__/
*.pyc
db.sqlite3
media/
```

## Как читать .env в settings.py

Нужна библиотека `python-decouple` или встроенный `os.environ`.

### Вариант 1: через os.environ (без доп. библиотек)

```python
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-key-for-dev')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')
```

### Вариант 2: через python-decouple (удобнее)

Установить: добавить `python-decouple` в `requirements.txt`

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/1')
```

Для этого плана используем `os.environ` — без лишних зависимостей.

## Итог

После этого шага:
- `.env` — реальные значения, не в git
- `.env.example` — шаблон, в git
- `settings.py` — читает из переменных окружения
- `docker-compose.yml` — передаёт `.env` в контейнер через `env_file`
