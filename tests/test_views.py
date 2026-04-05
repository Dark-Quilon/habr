import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from blog.models import Article, Comment, Vote, Follow


@pytest.fixture
def user(db):
    return User.objects.create_user(username='alice', password='pass')


@pytest.fixture
def user2(db):
    return User.objects.create_user(username='bob', password='pass')


@pytest.fixture
def article(user):
    return Article.objects.create(
        title='Test Article',
        content='Content here',
        author=user,
        status=Article.STATUS_PUBLISHED,
    )


@pytest.fixture
def client_logged(client, user):
    client.login(username='alice', password='pass')
    return client


# --- Article list ---

@pytest.mark.django_db
def test_article_list_ok(client, article):
    r = client.get(reverse('article_list'))
    assert r.status_code == 200
    assert b'Test Article' in r.content


@pytest.mark.django_db
def test_article_list_search(client, article):
    r = client.get(reverse('article_list') + '?q=Test')
    assert r.status_code == 200
    assert b'Test Article' in r.content


@pytest.mark.django_db
def test_article_list_search_no_results(client, article):
    r = client.get(reverse('article_list') + '?q=zzznomatch')
    assert r.status_code == 200
    assert b'Test Article' not in r.content


# --- Article detail ---

@pytest.mark.django_db
def test_article_detail_ok(client, article):
    r = client.get(reverse('article_detail', args=[article.slug]))
    assert r.status_code == 200


@pytest.mark.django_db
def test_article_detail_increments_views(client, article):
    views_before = article.views
    client.get(reverse('article_detail', args=[article.slug]))
    article.refresh_from_db()
    assert article.views == views_before + 1


# --- Article create ---

@pytest.mark.django_db
def test_article_create_requires_login(client):
    r = client.get(reverse('article_create'))
    assert r.status_code == 302
    assert '/accounts/login/' in r['Location']


@pytest.mark.django_db
def test_article_create_ok(client_logged):
    r = client_logged.post(reverse('article_create'), {
        'title': 'New Article',
        'content': 'Body',
        'status': 'published',
        'tags_input': 'python, django',
    })
    assert r.status_code == 302
    assert Article.objects.filter(title='New Article').exists()


# --- Vote ---

@pytest.mark.django_db
def test_vote_up(client, user2, article):
    client.login(username='bob', password='pass')
    client.post(reverse('vote', args=[article.slug]), {'value': '1'})
    assert Vote.objects.filter(article=article, user=user2, value=1).exists()


@pytest.mark.django_db
def test_vote_toggle(client, user2, article):
    client.login(username='bob', password='pass')
    client.post(reverse('vote', args=[article.slug]), {'value': '1'})
    client.post(reverse('vote', args=[article.slug]), {'value': '1'})
    assert not Vote.objects.filter(article=article, user=user2).exists()


@pytest.mark.django_db
def test_author_cannot_vote_own_article(client, user, article):
    client.login(username='alice', password='pass')
    client.post(reverse('vote', args=[article.slug]), {'value': '1'})
    assert not Vote.objects.filter(article=article, user=user).exists()


# --- Comment ---

@pytest.mark.django_db
def test_comment_add(client, user2, article):
    client.login(username='bob', password='pass')
    client.post(reverse('comment_add', args=[article.slug]), {'content': 'Great!'})
    assert Comment.objects.filter(article=article, content='Great!').exists()


# --- Follow ---

@pytest.mark.django_db
def test_follow_toggle(client, user2, user):
    client.login(username='bob', password='pass')
    client.post(reverse('follow_toggle', args=[user.username]))
    assert Follow.objects.filter(follower=user2, author=user).exists()
    client.post(reverse('follow_toggle', args=[user.username]))
    assert not Follow.objects.filter(follower=user2, author=user).exists()


# --- Register ---

@pytest.mark.django_db
def test_register_new_user(client):
    r = client.post(reverse('register'), {
        'username': 'newuser',
        'password1': 'complexpass123',
        'password2': 'complexpass123',
    })
    assert r.status_code == 302
    assert User.objects.filter(username='newuser').exists()
