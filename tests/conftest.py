import pytest


@pytest.fixture(autouse=True)
def use_simple_staticfiles(settings):
    """Use simple staticfiles storage during tests — no collectstatic needed."""
    settings.STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
    try:
        storages = dict(settings.STORAGES)
        storages['staticfiles'] = {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}
        settings.STORAGES = storages
    except AttributeError:
        pass
