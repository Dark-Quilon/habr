from django.core.cache import cache

ARTICLE_TTL = 300       # 5 minutes
ARTICLE_LIST_TTL = 60   # 1 minute


def get_article_cache_key(slug):
    return f'article:{slug}'


def get_article_list_cache_key(sort='new', tag='', page=1):
    return f'article_list:{sort}:{tag}:{page}'


def get_cached_article(slug):
    return cache.get(get_article_cache_key(slug))


def set_cached_article(slug, article):
    cache.set(get_article_cache_key(slug), article, ARTICLE_TTL)


def get_cached_article_list(sort='new', tag='', page=1):
    return cache.get(get_article_list_cache_key(sort, tag, page))


def set_cached_article_list(data, sort='new', tag='', page=1):
    cache.set(get_article_list_cache_key(sort, tag, page), data, ARTICLE_LIST_TTL)


def invalidate_article(slug):
    cache.delete(get_article_cache_key(slug))


def invalidate_article_lists():
    # LocMemCache doesn't support pattern deletion
    # Clear known article list cache keys manually
    for sort in ('new', 'popular', 'rating'):
        for tag in ('',):
            for page in range(1, 11):
                cache.delete(get_article_list_cache_key(sort, tag, page))
