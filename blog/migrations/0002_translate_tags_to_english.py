from django.db import migrations

# Полный маппинг ВСЕХ русских тегов на английские
TRANSLATIONS = {
    'Тестирование': 'Testing',
    'Безопасность': 'Security',
    'Фронтенд': 'Frontend',
    'Бэкенд': 'Backend',
    'Машинное обучение': 'Machine Learning',
    'Алгоритмы': 'Algorithms',
    'Карьера в IT': 'IT Career',
    'Искусственный интеллект': 'Artificial Intelligence',
    'Веб-разработка': 'Web Development',
    'Администрирование': 'System Administration',
    'Информационная безопасность': 'Information Security',
    'Системный и бизнес-анализ': 'System & Business Analysis',
    'Промышленная инженерия': 'Industrial Engineering',
    'Мобильная разработка': 'Mobile Development',
    'Геймдев': 'GameDev',
}


def translate_tags(apps, schema_editor):
    Tag = apps.get_model('blog', 'Tag')
    for ru_name, en_name in TRANSLATIONS.items():
        Tag.objects.filter(name=ru_name).update(name=en_name)


def reverse_translate(apps, schema_editor):
    Tag = apps.get_model('blog', 'Tag')
    for ru_name, en_name in TRANSLATIONS.items():
        Tag.objects.filter(name=en_name).update(name=ru_name)


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(translate_tags, reverse_translate),
    ]
