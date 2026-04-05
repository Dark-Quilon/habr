from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import ListView
from django.db.models import Q, Sum, Case, When, IntegerField
from .models import Article, Tag
from .forms import ArticleForm
from .cache import (
    get_cached_article, set_cached_article,
    get_cached_article_list, set_cached_article_list,
    invalidate_article, invalidate_article_lists,
)


class ArticleListView(ListView):
    model = Article
    template_name = 'blog/article_list.html'
    context_object_name = 'articles'
    paginate_by = 10

    def get_queryset(self):
        sort = self.request.GET.get('sort', 'new')
        tag = self.request.GET.get('tag', '')
        query = self.request.GET.get('q', '')
        page = self.request.GET.get('page', 1)

        cached = get_cached_article_list(sort=sort, tag=tag, page=page)
        if cached is not None and not query:
            return cached

        qs = Article.objects.filter(status=Article.STATUS_PUBLISHED).select_related('author')

        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct()

        if tag:
            qs = qs.filter(tags__slug=tag).distinct()

        if sort == 'popular':
            qs = qs.order_by('-views', '-created_at')
        elif sort == 'rating':
            qs = qs.annotate(
                rating_score=Sum(Case(
                    When(votes__value=1, then=1),
                    When(votes__value=-1, then=-1),
                    default=0,
                    output_field=IntegerField()
                ))
            ).order_by('-rating_score', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        if not query:
            set_cached_article_list(qs, sort=sort, tag=tag, page=page)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['sort'] = self.request.GET.get('sort', 'new')
        context['tag'] = self.request.GET.get('tag', '')
        context['query'] = self.request.GET.get('q', '')
        return context


class RegisterView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('article_list')
        form = UserCreationForm()
        return render(request, 'registration/register.html', {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('article_list')
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('article_list')
        return render(request, 'registration/register.html', {'form': form})


class ArticleDetailView(View):
    def get(self, request, slug):
        article = get_cached_article(slug)
        if article is None:
            article = get_object_or_404(Article, slug=slug, status=Article.STATUS_PUBLISHED)
            set_cached_article(slug, article)

        # Increment view count for non-authors
        if not request.user.is_authenticated or request.user != article.author:
            Article.objects.filter(pk=article.pk).update(views=article.views + 1)
            article.views += 1
        return render(request, 'blog/article_detail.html', {'article': article})


@method_decorator(login_required, name='dispatch')
class ArticleCreateView(View):
    def get(self, request):
        form = ArticleForm()
        return render(request, 'blog/article_form.html', {'form': form, 'action': 'Создать'})

    def post(self, request):
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            form.save_tags(article)
            invalidate_article_lists()
            return redirect('article_detail', slug=article.slug)
        return render(request, 'blog/article_form.html', {'form': form, 'action': 'Создать'})


@method_decorator(login_required, name='dispatch')
class ArticleEditView(View):
    def get(self, request, slug):
        article = get_object_or_404(Article, slug=slug, author=request.user)
        form = ArticleForm(instance=article)
        return render(request, 'blog/article_form.html', {'form': form, 'action': 'Редактировать'})

    def post(self, request, slug):
        article = get_object_or_404(Article, slug=slug, author=request.user)
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            article = form.save(commit=False)
            article.save()
            form.save_tags(article)
            invalidate_article(slug)
            invalidate_article_lists()
            return redirect('article_detail', slug=article.slug)
        return render(request, 'blog/article_form.html', {'form': form, 'action': 'Редактировать'})


@method_decorator(login_required, name='dispatch')
class ArticleDeleteView(View):
    def get(self, request, slug):
        article = get_object_or_404(Article, slug=slug, author=request.user)
        return render(request, 'blog/article_confirm_delete.html', {'article': article})

    def post(self, request, slug):
        article = get_object_or_404(Article, slug=slug, author=request.user)
        invalidate_article(slug)
        invalidate_article_lists()
        article.delete()
        return redirect('article_list')

from django.contrib.auth.models import User
from django.core.paginator import Paginator
from .models import Comment, Vote, Follow, Notification, Profile
from .forms import CommentForm, ProfileForm


# --- Comments ---

@login_required
def comment_add(request, slug):
    article = get_object_or_404(Article, slug=slug, status=Article.STATUS_PUBLISHED)
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.article = article
            comment.author = request.user
            comment.save()
            invalidate_article(slug)
            if article.author != request.user:
                Notification.objects.create(
                    recipient=article.author,
                    actor=request.user,
                    article=article,
                )
    return redirect('article_detail', slug=slug)


@login_required
def comment_delete(request, pk):
    comment = get_object_or_404(Comment, pk=pk, author=request.user)
    slug = comment.article.slug
    if request.method == 'POST':
        comment.delete()
        invalidate_article(slug)
    return redirect('article_detail', slug=slug)


# --- Votes ---

@login_required
def vote(request, slug):
    article = get_object_or_404(Article, slug=slug, status=Article.STATUS_PUBLISHED)
    if article.author == request.user:
        return redirect('article_detail', slug=slug)
    value = int(request.POST.get('value', 1))
    if value not in (1, -1):
        return redirect('article_detail', slug=slug)
    vote_obj, created = Vote.objects.get_or_create(
        article=article, user=request.user, defaults={'value': value}
    )
    if not created:
        if vote_obj.value == value:
            vote_obj.delete()
        else:
            vote_obj.value = value
            vote_obj.save()
    invalidate_article(slug)
    return redirect('article_detail', slug=slug)


# --- Profiles ---

def profile(request, username):
    author = get_object_or_404(User, username=username)
    articles = Article.objects.filter(author=author, status=Article.STATUS_PUBLISHED)
    profile_obj, _ = Profile.objects.get_or_create(user=author)
    is_following = (
        request.user.is_authenticated and
        Follow.objects.filter(follower=request.user, author=author).exists()
    )
    followers_count = author.followers.count()
    return render(request, 'blog/profile.html', {
        'author': author,
        'profile': profile_obj,
        'articles': articles,
        'is_following': is_following,
        'followers_count': followers_count,
    })


@login_required
def profile_edit(request):
    profile_obj, _ = Profile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile_obj)
        if form.is_valid():
            form.save()
            return redirect('profile', username=request.user.username)
    else:
        form = ProfileForm(instance=profile_obj)
    return render(request, 'blog/profile_edit.html', {'form': form})


# --- Follow ---

@login_required
def follow_toggle(request, username):
    author = get_object_or_404(User, username=username)
    if author == request.user:
        return redirect('profile', username=username)
    follow, created = Follow.objects.get_or_create(follower=request.user, author=author)
    if not created:
        follow.delete()
    return redirect('profile', username=username)


# --- Feed ---

@login_required
def feed(request):
    following_users = request.user.following.values_list('author', flat=True)
    articles = Article.objects.filter(
        author__in=following_users, status=Article.STATUS_PUBLISHED
    ).select_related('author').order_by('-created_at')
    paginator = Paginator(articles, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'blog/feed.html', {'page_obj': page_obj})


# --- Notifications ---

@login_required
def notifications(request):
    notifs = request.user.notifications.select_related('actor', 'article')
    notifs.filter(is_read=False).update(is_read=True)
    return render(request, 'blog/notifications.html', {'notifications': notifs})


# --- My Articles ---

@login_required
def my_articles(request):
    articles = Article.objects.filter(author=request.user).order_by('-created_at')
    return render(request, 'blog/my_articles.html', {'articles': articles})
