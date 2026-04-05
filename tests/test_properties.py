import pytest
from hypothesis import given, settings, assume
from hypothesis import strategies as st
from django.contrib.auth.models import User
from blog.models import Article, Tag, Vote


# --- Slug uniqueness property ---

@pytest.mark.django_db(transaction=True)
@given(title=st.text(min_size=1, max_size=100, alphabet=st.characters(
    whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters=' -'
)))
@settings(max_examples=30, deadline=2000)
def test_article_slug_always_generated(title):
    """Every article always gets a non-empty slug regardless of title."""
    assume(title.strip())
    user, _ = User.objects.get_or_create(username='prop_user', defaults={'password': 'x'})
    a = Article.objects.create(title=title, content='x', author=user)
    assert a.slug != ''
    a.delete()


@pytest.mark.django_db(transaction=True)
@given(titles=st.lists(
    st.text(min_size=1, max_size=50, alphabet=st.characters(
        whitelist_categories=('Lu', 'Ll'), whitelist_characters=' '
    )),
    min_size=2, max_size=5, unique=True
))
@settings(max_examples=20, deadline=3000)
def test_duplicate_titles_get_unique_slugs(titles):
    """Articles with identical titles must have unique slugs."""
    assume(all(t.strip() for t in titles))
    user, _ = User.objects.get_or_create(username='prop_user2', defaults={'password': 'x'})
    created = []
    for title in titles:
        a = Article.objects.create(title=title, content='x', author=user)
        created.append(a)
    slugs = [a.slug for a in created]
    assert len(slugs) == len(set(slugs)), "Duplicate slugs found"
    for a in created:
        a.delete()


# --- Rating invariant ---

@pytest.mark.django_db(transaction=True)
@given(
    ups=st.integers(min_value=0, max_value=10),
    downs=st.integers(min_value=0, max_value=10),
)
@settings(max_examples=30, deadline=3000)
def test_rating_equals_ups_minus_downs(ups, downs):
    """article.rating() == upvotes - downvotes always."""
    author, _ = User.objects.get_or_create(username='rating_author', defaults={'password': 'x'})
    article = Article.objects.create(
        title=f'Rating test {ups} {downs}',
        content='x',
        author=author,
        status=Article.STATUS_PUBLISHED,
    )
    voters_up = []
    for i in range(ups):
        u, _ = User.objects.get_or_create(username=f'up_voter_{i}', defaults={'password': 'x'})
        Vote.objects.get_or_create(article=article, user=u, defaults={'value': 1})
        voters_up.append(u)

    voters_down = []
    for i in range(downs):
        u, _ = User.objects.get_or_create(username=f'down_voter_{i}', defaults={'password': 'x'})
        Vote.objects.get_or_create(article=article, user=u, defaults={'value': -1})
        voters_down.append(u)

    assert article.rating() == ups - downs

    article.delete()


# --- Tag slug property ---

@pytest.mark.django_db(transaction=True)
@given(name=st.text(
    min_size=1, max_size=40,
    alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters=' -')
))
@settings(max_examples=30, deadline=2000)
def test_tag_slug_never_empty(name):
    """Tag always gets a non-empty slug after save."""
    assume(name.strip())
    tag, created = Tag.objects.get_or_create(name=name.strip()[:50])
    assert tag.slug != ''
    if created:
        tag.delete()
