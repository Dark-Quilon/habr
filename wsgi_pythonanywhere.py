# WSGI конфигурация для PythonAnywhere
# Замените 'your-username' и 'your-project-name' на ваши значения

import os
import sys

# Путь к проекту
path = '/home/your-username/your-project-name'
if path not in sys.path:
    sys.path.insert(0, path)

# Виртуальное окружение
activate_this = '/home/your-username/.virtualenvs/habr-env/bin/activate_this.py'
with open(activate_this) as f:
    exec(f.read(), {'__file__': activate_this})

# Настройки Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'mysite.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
