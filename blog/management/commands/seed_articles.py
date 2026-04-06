import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import Article, Tag, Comment, Vote, Profile, Follow, Notification

USERNAMES = [
    'alex_dev', 'maria_code', 'ivan_tech', 'olga_py', 'dmitry_js',
    'anna_web', 'sergey_ops', 'elena_data', 'nikita_ml', 'yulia_ux',
    'pavel_back', 'kate_front', 'andrey_db',
]

TAGS_POOL = [
    'Python', 'Django', 'JavaScript', 'React', 'Docker', 'Linux',
    'Git', 'API', 'PostgreSQL', 'Redis', 'Nginx', 'DevOps',
    'Тестирование', 'Безопасность', 'Фронтенд', 'Бэкенд',
    'Машинное обучение', 'Алгоритмы', 'TypeScript', 'Vue.js',
    'Kubernetes', 'CI/CD', 'GraphQL', 'MongoDB', 'RabbitMQ',
]

ARTICLE_TEMPLATES = [
    {
        'title': 'Введение в {topic}',
        'content': '''# Введение в {topic}

{topic} — один из ключевых инструментов современного разработчика.

## Установка

```bash
pip install {topic_lower}
```

## Основные концепции

- Простота использования
- Высокая производительность
- Большое сообщество

## Пример кода

```python
# Простой пример использования {topic}
def example():
    print("Hello from {topic}!")

example()
```

## Заключение

{topic} отлично подходит для большинства задач. Рекомендую изучить документацию.
''',
    },
    {
        'title': '{topic} для продакшена',
        'content': '''# {topic} для продакшена

Переход на продакшен — ответственный шаг. Разберём как правильно настроить {topic}.

## Конфигурация

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    environment:
      - DEBUG=False
      - SECRET_KEY=your-secret-key
```

## Мониторинг

Важно настроить логирование и мониторинг:

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Application started")
```

## Безопасность

- Используйте HTTPS
- Регулярно обновляйте зависимости
- Настройте файрвол

## Итог

Правильная настройка {topic} в продакшене — залог стабильной работы.
''',
    },
    {
        'title': 'Оптимизация {topic}: советы и трюки',
        'content': '''# Оптимизация {topic}: советы и трюки

Производительность важна. Рассмотрим как ускорить работу с {topic}.

## Профилирование

Сначала измерьте, потом оптимизируйте:

```python
import time

start = time.time()
# ваш код
elapsed = time.time() - start
print(f"Время выполнения: {{elapsed:.3f}}с")
```

## Кэширование

```python
from django.core.cache import cache

def get_data(key):
    result = cache.get(key)
    if result is None:
        result = expensive_operation()
        cache.set(key, result, 300)
    return result
```

## Индексы в базе данных

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['name', 'created_at']),
        ]
```

## Результаты

После оптимизации время ответа сократилось с 500мс до 50мс.
''',
    },
    {
        'title': 'Тестирование {topic} с pytest',
        'content': '''# Тестирование {topic} с pytest

Тесты — это не скучно, это необходимость. Разберём как тестировать {topic}.

## Установка

```bash
pip install pytest pytest-django
```

## Базовый тест

```python
import pytest

@pytest.mark.django_db
def test_basic():
    assert 1 + 1 == 2
```

## Фикстуры

```python
@pytest.fixture
def user(db):
    from django.contrib.auth.models import User
    return User.objects.create_user(
        username='testuser',
        password='testpass123'
    )

def test_user_login(client, user):
    response = client.post('/login/', {{
        'username': 'testuser',
        'password': 'testpass123'
    }})
    assert response.status_code == 302
```

## Покрытие кода

```bash
pytest --cov=. --cov-report=html
```

## Вывод

Хорошее покрытие тестами — признак зрелого проекта.
''',
    },
    {
        'title': '{topic} vs альтернативы: что выбрать?',
        'content': '''# {topic} vs альтернативы: что выбрать?

Выбор инструмента — важное решение. Сравним {topic} с конкурентами.

## Сравнительная таблица

| Критерий | {topic} | Альтернатива A | Альтернатива B |
|----------|---------|----------------|----------------|
| Скорость | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Простота | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| Экосистема | ★★★★★ | ★★★★☆ | ★★★☆☆ |

## Когда использовать {topic}

- Большие проекты
- Команда уже знакома с инструментом
- Нужна богатая экосистема

## Когда выбрать альтернативу

- Маленький проект
- Специфические требования
- Ограничения по ресурсам

## Мой выбор

После года работы с {topic} я не планирую переходить на что-то другое.
''',
    },
    {
        'title': 'Мой опыт работы с {topic}',
        'content': '''# Мой опыт работы с {topic}

Хочу поделиться личным опытом использования {topic} в реальных проектах.

## С чего всё началось

Год назад я впервые столкнулся с {topic} на работе. Поначалу было сложно, но потом всё встало на свои места.

## Что понравилось

1. Отличная документация
2. Активное сообщество
3. Регулярные обновления

## Что не понравилось

- Крутая кривая обучения в начале
- Иногда избыточная сложность для простых задач

## Реальный кейс

```python
# Решение реальной задачи с {topic}
class DataProcessor:
    def __init__(self):
        self.data = []

    def process(self, item):
        # обработка данных
        return item
```

## Итог

{topic} стал неотъемлемой частью моего рабочего процесса. Рекомендую всем.
''',
    },
    {
        'title': '10 лучших практик {topic}',
        'content': '''# 10 лучших практик {topic}

Собрал лучшие практики работы с {topic} за 5 лет.

## 1. Всегда используйте виртуальное окружение

```bash
python -m venv venv
source venv/bin/activate
```

## 2. Следуйте PEP 8

```bash
pip install flake8
flake8 .
```

## 3. Пишите тесты

Каждая функция должна быть покрыта тестами.

## 4. Используйте type hints

```python
def process_data(data: list[str]) -> dict:
    return {{}}
```

## 5. Логируйте всё

```python
import logging
logging.basicConfig(level=logging.INFO)
```

## 6-10. Остальные практики

6. Документируйте код
7. Используйте CI/CD
8. Ревью кода
9. Мониторинг в продакшене
10. Регулярные обновления

## Заключение

Следование этим практикам сделает ваш код лучше.
''',
    },
    {
        'title': 'Как я перешёл на {topic} и не жалею',
        'content': '''# Как я перешёл на {topic} и не жалею

История моего перехода на {topic}.

## Предыстория

Долгое время я использовал другой инструмент. Но требования проекта выросли.

## Процесс миграции

### Шаг 1: Анализ

Изучил документацию {topic}, посмотрел примеры.

### Шаг 2: Прототип

Создал небольшой прототип:

```python
from {topic_lower} import Client

client = Client()
result = client.do_something()
print(result)
```

### Шаг 3: Миграция

Постепенно перевёл все сервисы на {topic}.

## Результаты

- Скорость разработки выросла на 30%
- Количество багов снизилось
- Команда довольна

## Вывод

Переход на {topic} — лучшее решение за последний год.
''',
    },
]

COMMENTS = [
    'Отличная статья, спасибо!',
    'Очень полезно, буду использовать в своём проекте.',
    'А как это работает с последней версией?',
    'Спасибо за подробное объяснение!',
    'Наконец-то понял как это работает.',
    'Есть ли примеры для Windows?',
    'Попробовал — работает отлично!',
    'Можно добавить больше примеров?',
    'Хорошо написано, легко читается.',
    'Использую это уже год, всё верно описано.',
    'Автор молодец, жду продолжения!',
    'А можно подробнее про настройку?',
    'У меня не заработало с первого раза, но потом разобрался.',
    'Лучшая статья по этой теме что я видел.',
    'Добавьте пожалуйста примеры для Docker.',
]

TOPICS = [
    'Python', 'Django', 'Docker', 'Redis', 'PostgreSQL',
    'Nginx', 'Git', 'Linux', 'React', 'FastAPI',
    'Celery', 'GraphQL', 'Kubernetes', 'TypeScript', 'Vue.js',
    'MongoDB', 'Elasticsearch', 'RabbitMQ', 'Terraform', 'CI/CD',
    'JavaScript', 'Node.js', 'Webpack', 'REST API', 'Microservices',
]


class Command(BaseCommand):
    help = 'Создаёт тестовые данные: 10-15 пользователей, 50-250 статей'

    def handle(self, *args, **kwargs):
        self.stdout.write('Очищаю базу данных...')
        try:
            Vote.objects.all().delete()
            Comment.objects.all().delete()
            Notification.objects.all().delete()
            Follow.objects.all().delete()
            Article.objects.all().delete()
            Tag.objects.all().delete()
            Profile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
        except Exception as e:
            self.stdout.write(f'База данных пуста или ошибка очистки: {e}')

        # Создать теги
        tags = {}
        for tag_name in TAGS_POOL:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            tags[tag_name] = tag
        self.stdout.write(self.style.SUCCESS(f'✓ Создано тегов: {len(tags)}'))

        # Создать админа
        admin, _ = User.objects.get_or_create(username='admin')
        admin.set_password('admin123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.email = 'admin@example.com'
        admin.save()
        Profile.objects.get_or_create(user=admin)
        self.stdout.write(self.style.SUCCESS('✓ Админ: admin / admin123'))

        # Создать пользователей (10-15)
        num_users = random.randint(10, 15)
        selected_usernames = random.sample(USERNAMES, num_users)
        users = []
        for username in selected_usernames:
            user = User.objects.create_user(
                username=username,
                password='pass1234!',
                email=f'{username}@example.com',
            )
            Profile.objects.get_or_create(user=user)
            users.append(user)
        self.stdout.write(self.style.SUCCESS(f'✓ Создано пользователей: {len(users)}'))

        # Создать подписки (follow)
        for user in users:
            follow_count = random.randint(1, min(5, len(users) - 1))
            to_follow = random.sample([u for u in users if u != user], follow_count)
            for author in to_follow:
                Follow.objects.get_or_create(follower=user, author=author)

        # Создать статьи (5-25 на пользователя, итого 50-250)
        all_articles = []
        topics_used = list(TOPICS)
        random.shuffle(topics_used)
        topic_idx = 0

        # Гарантированно создаём статью "10 лучших практик Django часть 24"
        django_template = next(t for t in ARTICLE_TEMPLATES if '10 лучших практик' in t['title'])
        django_title = django_template['title'].format(topic='Django') + ' — часть 24'
        django_content = django_template['content'].format(topic='Django', topic_lower='django')
        django_article = Article.objects.create(
            title=django_title,
            slug='10-luchshikh-praktik-django-chast-24',
            content=django_content,
            author=users[0] if users else admin,
            status='published',
            views=250,
        )
        django_article.tags.set([tags['Django'], tags['Python']])
        all_articles.append(django_article)

        for user in users:
            count = random.randint(5, 25)
            for i in range(count):
                topic = topics_used[topic_idx % len(topics_used)]
                topic_idx += 1
                template = random.choice(ARTICLE_TEMPLATES)
                title = template['title'].format(topic=topic)
                content = template['content'].format(
                    topic=topic,
                    topic_lower=topic.lower(),
                )
                # уникальность заголовка
                base_title = title
                suffix = ''
                attempts = 0
                while Article.objects.filter(title=title).exists():
                    attempts += 1
                    title = f'{base_title} — часть {random.randint(2, 99)}'
                    if attempts > 10:
                        title = f'{base_title} ({user.username}, #{i+1})'

                article = Article.objects.create(
                    title=title,
                    content=content,
                    author=user,
                    status='published',
                    views=random.randint(0, 500),
                )
                # добавить 2-5 тегов
                article_tags = random.sample(list(tags.values()), random.randint(2, 5))
                article.tags.set(article_tags)
                all_articles.append(article)

        total = len(all_articles)
        self.stdout.write(self.style.SUCCESS(f'✓ Создано статей: {total}'))

        # Добавить комментарии
        published = [a for a in all_articles if a.status == 'published']
        for article in random.sample(published, min(len(published), max(1, int(total * 0.6)))):
            num_comments = random.randint(1, 5)
            commenters = random.sample([u for u in users if u != article.author], min(num_comments, len(users) - 1))
            for commenter in commenters:
                Comment.objects.create(
                    article=article,
                    author=commenter,
                    content=random.choice(COMMENTS),
                )

        # Добавить голоса
        for article in random.sample(published, min(len(published), max(1, int(total * 0.7)))):
            num_voters = random.randint(1, 8)
            voters = random.sample([u for u in users if u != article.author], min(num_voters, len(users) - 1))
            for voter in voters:
                Vote.objects.get_or_create(
                    article=article,
                    user=voter,
                    defaults={'value': random.choice([1, 1, 1, -1])},
                )

        # Создать уведомления
        for article in random.sample(published, min(len(published), 20)):
            Notification.objects.create(
                recipient=article.author,
                actor=random.choice([u for u in users if u != article.author]),
                article=article,
            )

        self.stdout.write(self.style.SUCCESS(
            f'\n{"="*50}'
            f'\n✅ Готово!'
            f'\n👤 Пользователей: {len(users)}'
            f'\n📝 Статей: {total}'
            f'\n💬 Комментариев: {Comment.objects.count()}'
            f'\n🗳️ Голосов: {Vote.objects.count()}'
            f'\n{"="*50}'
            f'\n🔑 Админ: admin / admin123'
            f'\n🔑 Пользователи: пароль pass1234!'
            f'\n{"="*50}'
        ))
