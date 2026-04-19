from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    RegisterView, LoginView, LogoutView, MeView,
    ArticleViewSet, CommentViewSet, TagViewSet, ProfileViewSet, NotificationViewSet,
    ReportViewSet,
)

router = DefaultRouter()
router.register('articles', ArticleViewSet, basename='article')
router.register('tags', TagViewSet, basename='tag')
router.register('profiles', ProfileViewSet, basename='profile')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    # Explicit article detail route
    path(
        'articles/<slug:slug>/',
        ArticleViewSet.as_view({'get': 'retrieve'}),
        name='article-detail',
    ),
    # Nested routes for comments
    path(
        'articles/<slug:article_slug>/comments/',
        CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='comment-list',
    ),
    path(
        'articles/<slug:article_slug>/comments/<int:pk>/',
        CommentViewSet.as_view({'delete': 'destroy'}),
        name='comment-detail',
    ),
]
