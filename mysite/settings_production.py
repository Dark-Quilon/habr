"""
Django settings для PythonAnywhere (production).
Наследует основные настройки из settings.py
"""
import os
from .settings import *

# Production настройки
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Безопасность
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# На бесплатном тарифе Redis недоступен - используем локальный кэш
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Безопасность для production
if not DEBUG:
    SECURE_SSL_REDIRECT = False  # PythonAnywhere обрабатывает SSL
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
