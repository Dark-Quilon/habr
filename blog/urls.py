from django.urls import path
from . import views

urlpatterns = [
    path('', views.ArticleListView.as_view(), name='article_list'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('article/new/', views.ArticleCreateView.as_view(), name='article_create'),
    path('article/<slug:slug>/', views.ArticleDetailView.as_view(), name='article_detail'),
    path('article/<slug:slug>/edit/', views.ArticleEditView.as_view(), name='article_edit'),
    path('article/<slug:slug>/delete/', views.ArticleDeleteView.as_view(), name='article_delete'),
    path('article/<slug:slug>/comment/', views.comment_add, name='comment_add'),
    path('article/<slug:slug>/vote/', views.vote, name='vote'),
    path('comment/<int:pk>/delete/', views.comment_delete, name='comment_delete'),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('profile/edit/me/', views.profile_edit, name='profile_edit'),
    path('follow/<str:username>/', views.follow_toggle, name='follow_toggle'),
    path('feed/', views.feed, name='feed'),
    path('notifications/', views.notifications, name='notifications'),
    path('my-articles/', views.my_articles, name='my_articles'),
]
