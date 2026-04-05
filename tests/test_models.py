import pytest
from django.contrib.auth.models import User
from blog.models import Article, Tag, Comment, Vote, Follow, Notification, Profile


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
        content='Some content',
        author=user,
        status=Article.STATUS_PUBLISHED,
    )


# --- Article ---

@pytest.mark.django_db
def test_article_slug_auto_generated(user):
    a = Article.objects.create(title='Hello World', content='x', author=user)
    assert a.slug != ''
    assert 'hello' in a.slug


@pytest.mark.django_db
def test_article_slug_unique(user):
    a1 = Article.objects.create(title='Dup', content='x', author=user, status='published')
    a2 = Article.objects.create(title='Dup', content='y', author=user, status='published')
    assert a1.slug != a2.slug


@pytest.mark.django_db
def test_article_rating_empty(article):
    assert article.rating() == 0


@pytest.mark.django_db
def test_article_rating_with_votes(article, user2):
    Vote.objects.create(article=article, user=user2, value=1)
    assert article.rating() == 1


@pytest.mark.django_db
def test_article_rating_cancel_vote(article, user2):
    # Create a vote, then delete it — rating should return to 0
    v = Vote.objects.create(article=article, user=user2, value=1)
    assert article.rating() == 1
    v.delete()
    assert article.rating() == 0


# --- Tag ---

@pytest.mark.django_db
def test_tag_slug_auto_generated():
    tag = Tag.objects.create(name='Python')
    assert tag.slug != ''


# --- Comment ---

@pytest.mark.django_db
def test_comment_creation(article, user2):
    c = Comment.objects.create(article=article, author=user2, content='Nice!')
    assert article.comments.count() == 1
    assert c.content == 'Nice!'


# --- Follow ---

@pytest.mark.django_db
def test_follow_unique(user, user2):
    Follow.objects.create(follower=user, author=user2)
    with pytest.raises(Exception):
        Follow.objects.create(follower=user, author=user2)


# --- Notification ---

@pytest.mark.django_db
def test_notification_created(article, user2):
    n = Notification.objects.create(recipient=article.author, actor=user2, article=article)
    assert n.is_read is False


# --- Profile signal ---

@pytest.mark.django_db
def test_profile_auto_created():
    u = User.objects.create_user(username='newuser', password='pass')
    assert Profile.objects.filter(user=u).exists()
