# Этап 4: CRUD статей

## Что нужно сделать

- Список статей (главная страница)
- Страница отдельной статьи
- Создание статьи
- Редактирование статьи
- Удаление статьи

---

## Форма для статьи

Создать файл `blog/forms.py`:

```python
from django import forms
from .models import Article, Tag

class ArticleForm(forms.ModelForm):
    # Теги вводятся через запятую, не через чекбоксы
    tags_input = forms.CharField(
        required=False,
        label='Теги',
        help_text='Введите теги через запятую'
    )

    class Meta:
        model = Article
        fields = ['title', 'content', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # При редактировании заполнить поле тегов текущими тегами
        if self.instance.pk:
            self.fields['tags_input'].initial = ', '.join(
                tag.name for tag in self.instance.tags.all()
            )

    def _save_tags(self, article):
        """Сохранить теги из текстового поля"""
        tags_input = self.cleaned_data.get('tags_input', '')
        tag_names = [t.strip() for t in tags_input.split(',') if t.strip()]
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        article.tags.set(tags)
```

---

## Views

В `blog/views.py`:

```python
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Article, Tag
from .forms import ArticleForm


def article_list(request):
    """Главная страница — список опубликованных статей"""
    articles = Article.objects.filter(status='published').select_related('author')
    return render(request, 'blog/article_list.html', {'articles': articles})


def article_detail(request, slug):
    """Страница отдельной статьи"""
    article = get_object_or_404(Article, slug=slug, status='published')
    # Считать просмотры (не считать автора)
    if request.user != article.author:
        article.views += 1
        article.save(update_fields=['views'])
    return render(request, 'blog/article_detail.html', {'article': article})


@login_required
def article_create(request):
    """Создание новой статьи"""
    if request.method == 'POST':
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            form._save_tags(article)
            return redirect('article_detail', slug=article.slug)
    else:
        form = ArticleForm()
    return render(request, 'blog/article_form.html', {'form': form, 'action': 'Создать'})


@login_required
def article_edit(request, slug):
    """Редактирование статьи (только автор)"""
    article = get_object_or_404(Article, slug=slug, author=request.user)
    if request.method == 'POST':
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            article = form.save(commit=False)
            article.save()
            form._save_tags(article)
            return redirect('article_detail', slug=article.slug)
    else:
        form = ArticleForm(instance=article)
    return render(request, 'blog/article_form.html', {'form': form, 'action': 'Редактировать'})


@login_required
def article_delete(request, slug):
    """Удаление статьи (только автор)"""
    article = get_object_or_404(Article, slug=slug, author=request.user)
    if request.method == 'POST':
        article.delete()
        return redirect('article_list')
    return render(request, 'blog/article_confirm_delete.html', {'article': article})
```

---

## URLs

В `blog/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.article_list, name='article_list'),
    path('register/', views.register, name='register'),
    path('article/new/', views.article_create, name='article_create'),
    path('article/<slug:slug>/', views.article_detail, name='article_detail'),
    path('article/<slug:slug>/edit/', views.article_edit, name='article_edit'),
    path('article/<slug:slug>/delete/', views.article_delete, name='article_delete'),
]
```

---

## Шаблоны

### article_list.html

```html
{% extends 'blog/base.html' %}
{% block content %}
<h1>Статьи</h1>
{% if user.is_authenticated %}
  <a href="{% url 'article_create' %}">Написать статью</a>
{% endif %}

{% for article in articles %}
  <div>
    <h2><a href="{% url 'article_detail' article.slug %}">{{ article.title }}</a></h2>
    <p>Автор: {{ article.author.username }} | {{ article.created_at|date:"d.m.Y" }}</p>
    <p>Просмотры: {{ article.views }}</p>
  </div>
{% empty %}
  <p>Статей пока нет</p>
{% endfor %}
{% endblock %}
```

### article_detail.html

```html
{% extends 'blog/base.html' %}
{% block content %}
<h1>{{ article.title }}</h1>
<p>Автор: {{ article.author.username }} | {{ article.created_at|date:"d.m.Y" }}</p>

<div>{{ article.content }}</div>

{% if user == article.author %}
  <a href="{% url 'article_edit' article.slug %}">Редактировать</a>
  <a href="{% url 'article_delete' article.slug %}">Удалить</a>
{% endif %}
{% endblock %}
```

### article_form.html

```html
{% extends 'blog/base.html' %}
{% block content %}
<h1>{{ action }} статью</h1>
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">{{ action }}</button>
</form>
{% endblock %}
```

### article_confirm_delete.html

```html
{% extends 'blog/base.html' %}
{% block content %}
<h1>Удалить статью?</h1>
<p>{{ article.title }}</p>
<form method="post">
  {% csrf_token %}
  <button type="submit">Да, удалить</button>
  <a href="{% url 'article_detail' article.slug %}">Отмена</a>
</form>
{% endblock %}
```

---

## Итог этапа

- Список статей на главной
- Страница статьи
- Создание, редактирование, удаление
- Только автор может редактировать/удалять свою статью
- Счётчик просмотров
- Черновики не видны на главной
