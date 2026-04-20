from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, mixins
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet, GenericViewSet
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from blog.models import Profile, Article, Vote, Follow, Tag, Comment, Notification, Report
from api.serializers import (
    RegisterSerializer, LoginSerializer,
    ArticleListSerializer, ArticleDetailSerializer, ArticleWriteSerializer,
    TagSerializer, CommentSerializer, ProfileSerializer, ProfileUpdateSerializer, NotificationSerializer,
    ReportSerializer,
)
from api.permissions import IsAuthorOrReadOnly, IsCommentAuthorOrReadOnly
from api.pagination import StandardPagination


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = User.objects.create_user(
            username=data['username'],
            password=data['password1'],
            first_name=data.get('display_name', '')
        )
        Profile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'display_name': user.first_name or user.username
                }
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = authenticate(request, username=data['username'], password=data['password'])
        if user is None:
            return Response(
                {'detail': 'Неверный логин или пароль'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'display_name': user.first_name or user.username
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'display_name': user.first_name or user.username
        })


class ArticleViewSet(ModelViewSet):
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'tags__name']
    ordering_fields = ['created_at', 'views']
    filterset_fields = ['status', 'tags__slug', 'author__username']
    pagination_class = StandardPagination

    def get_queryset(self):
        return (
            Article.objects.filter(status='published')
            .select_related('author')
            .prefetch_related('tags', 'comments__author')
        )

    def get_serializer_class(self):
        if self.action in ('list', 'feed'):
            return ArticleListSerializer
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleWriteSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, slug=None):
        article = get_object_or_404(Article, slug=slug, status='published')

        if article.author == request.user:
            return Response(
                {'detail': 'Нельзя голосовать за свою статью'},
                status=status.HTTP_403_FORBIDDEN,
            )

        value = request.data.get('value')
        if value not in (1, -1):
            return Response({'detail': 'value должен быть 1 или -1'}, status=status.HTTP_400_BAD_REQUEST)

        vote_obj, created = Vote.objects.get_or_create(
            article=article, user=request.user, defaults={'value': value}
        )

        if not created:
            if vote_obj.value == value:
                vote_obj.delete()
                user_vote = None
            else:
                vote_obj.value = value
                vote_obj.save()
                user_vote = value
        else:
            user_vote = value

        return Response({'rating': article.rating(), 'user_vote': user_vote})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        followed_ids = Follow.objects.filter(
            follower=request.user
        ).values_list('author_id', flat=True)

        queryset = Article.objects.filter(
            author_id__in=followed_ids, status='published'
        ).select_related('author').prefetch_related('tags', 'comments__author')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# --- Task 6: CommentViewSet ---

class CommentViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsCommentAuthorOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(article__slug=self.kwargs['article_slug']).select_related('author')

    def perform_create(self, serializer):
        article = get_object_or_404(Article, slug=self.kwargs['article_slug'])
        serializer.save(author=self.request.user, article=article)
        if article.author != self.request.user:
            Notification.objects.create(recipient=article.author, actor=self.request.user, article=article)


# --- Task 7: TagViewSet ---

class TagViewSet(ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


# --- Task 8: ProfileViewSet ---

class ProfileViewSet(mixins.RetrieveModelMixin, GenericViewSet):
    queryset = Profile.objects.select_related('user')
    serializer_class = ProfileSerializer
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if request.method == 'PATCH':
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, username=None):
        profile = self.get_object()
        target_user = profile.user
        if target_user == request.user:
            return Response({'detail': 'Нельзя подписаться на себя'}, status=status.HTTP_400_BAD_REQUEST)
        follow_obj, created = Follow.objects.get_or_create(follower=request.user, author=target_user)
        if not created:
            follow_obj.delete()
            is_following = False
        else:
            is_following = True
        followers_count = Follow.objects.filter(author=target_user).count()
        return Response({'is_following': is_following, 'followers_count': followers_count})


# --- Task 9: NotificationViewSet ---

class NotificationViewSet(mixins.ListModelMixin, GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('actor', 'article__author').prefetch_related('article__tags').order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'marked': count})


# --- Task 10: ReportViewSet ---

class ReportViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, GenericViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Report.objects.all().select_related('reporter', 'article__author', 'comment__article')

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
