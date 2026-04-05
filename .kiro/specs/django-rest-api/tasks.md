# Задачи: Django REST API

## Список задач

- [x] 1. Инфраструктура и настройка
  - [x] 1.1 Добавить зависимости в requirements.txt (djangorestframework, django-cors-headers, django-filter)
  - [x] 1.2 Создать приложение api/ (apps.py, __init__.py, urls.py, serializers.py, views.py, permissions.py, pagination.py)
  - [x] 1.3 Обновить mysite/settings.py: INSTALLED_APPS, MIDDLEWARE (CorsMiddleware первым), CORS_ALLOWED_ORIGINS, REST_FRAMEWORK
  - [x] 1.4 Подключить api.urls в mysite/urls.py с префиксом /api/v1/
  - [x] 1.5 Выполнить миграцию для rest_framework.authtoken (python manage.py migrate)

- [x] 2. Сериализаторы
  - [x] 2.1 UserSerializer (id, username — read only)
  - [x] 2.2 TagSerializer (id, name, slug)
  - [x] 2.3 ArticleListSerializer (id, slug, title, author, tags, status, views, rating, created_at)
  - [x] 2.4 ArticleDetailSerializer (extends List + content, comments, updated_at)
  - [x] 2.5 ArticleWriteSerializer (title, content, status, tags как список строк) с логикой создания/обновления тегов
  - [x] 2.6 CommentSerializer (id, author, content, created_at)
  - [x] 2.7 ProfileSerializer (user, avatar, bio, followers_count, is_following)
  - [x] 2.8 NotificationSerializer (id, actor, article, is_read, created_at)
  - [x] 2.9 RegisterSerializer и LoginSerializer для аутентификации

- [x] 3. Права доступа и пагинация
  - [x] 3.1 IsAuthorOrReadOnly permission (SAFE_METHODS — всем, остальные — только obj.author == request.user)
  - [x] 3.2 StandardPagination (PageNumberPagination, page_size=10, возвращает count/next/previous/results)

- [x] 4. Аутентификация (AuthViewSet)
  - [x] 4.1 POST /api/v1/auth/register/ — создание пользователя + Profile + Token, возврат {token, user}
  - [x] 4.2 POST /api/v1/auth/login/ — obtain_auth_token или кастомный view, возврат {token, user}
  - [x] 4.3 POST /api/v1/auth/logout/ — удаление токена, возврат 204
  - [x] 4.4 GET /api/v1/auth/me/ — данные текущего пользователя

- [x] 5. ArticleViewSet
  - [x] 5.1 list (GET /api/v1/articles/) с фильтрацией, поиском, сортировкой, пагинацией
  - [x] 5.2 retrieve (GET /api/v1/articles/{slug}/) с вложенными комментариями
  - [x] 5.3 create (POST /api/v1/articles/) — только авторизованные, author из request.user
  - [x] 5.4 update/partial_update (PUT/PATCH /api/v1/articles/{slug}/) — только автор
  - [x] 5.5 destroy (DELETE /api/v1/articles/{slug}/) — только автор
  - [x] 5.6 @action vote (POST /api/v1/articles/{slug}/vote/) — toggle логика
  - [x] 5.7 @action feed (GET /api/v1/articles/feed/) — статьи от подписанных авторов

- [x] 6. CommentViewSet
  - [x] 6.1 list (GET /api/v1/articles/{slug}/comments/)
  - [x] 6.2 create (POST /api/v1/articles/{slug}/comments/) — создание Notification для автора статьи
  - [x] 6.3 destroy (DELETE /api/v1/articles/{slug}/comments/{id}/) — только автор комментария

- [x] 7. TagViewSet
  - [x] 7.1 list (GET /api/v1/tags/) — ReadOnlyModelViewSet
  - [x] 7.2 retrieve (GET /api/v1/tags/{slug}/) — lookup_field='slug'

- [x] 8. ProfileViewSet
  - [x] 8.1 retrieve (GET /api/v1/profiles/{username}/) с followers_count и is_following
  - [x] 8.2 partial_update (PATCH /api/v1/profiles/me/) — только свой профиль
  - [x] 8.3 @action follow (POST /api/v1/profiles/{username}/follow/) — toggle follow/unfollow

- [x] 9. NotificationViewSet
  - [x] 9.1 list (GET /api/v1/notifications/) — только уведомления request.user
  - [x] 9.2 @action mark_read (POST /api/v1/notifications/mark-read/) — is_read=True для всех непрочитанных

- [ ] 10. Тесты
  - [ ] 10.1 Тесты аутентификации (register, login, logout, me)
  - [ ] 10.2 Тесты ArticleViewSet (CRUD, фильтрация, поиск, права доступа)
  - [ ] 10.3 Тесты голосования (toggle, запрет для автора)
  - [ ] 10.4 Тесты CommentViewSet (создание, удаление, уведомления)
  - [ ] 10.5 Тесты ProfileViewSet (просмотр, редактирование, follow/unfollow)
  - [ ] 10.6 Тесты NotificationViewSet (список, mark-read)
  - [ ] 10.7 Property-based тест: сериализатор Article возвращает все обязательные поля
  - [ ] 10.8 Property-based тест: rating() == upvotes - downvotes для любого набора голосов
  - [ ] 10.9 Property-based тест: пагинация count == общее число объектов в queryset
  - [ ] 10.10 Property-based тест: IsAuthorOrReadOnly — не-автор получает 403 на модифицирующие методы
