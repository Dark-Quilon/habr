from django import forms
from .models import Article, Comment, Profile, Tag


class ArticleForm(forms.ModelForm):
    tags_input = forms.CharField(
        required=False,
        label='Теги',
        help_text='Введите теги через запятую',
        widget=forms.TextInput(attrs={'placeholder': 'python, django, web'})
    )

    class Meta:
        model = Article
        fields = ['title', 'content', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.fields['tags_input'].initial = ', '.join(
                self.instance.tags.values_list('name', flat=True)
            )

    def save_tags(self, article):
        tags_input = self.cleaned_data.get('tags_input', '')
        tag_names = [t.strip() for t in tags_input.split(',') if t.strip()]
        tags = [Tag.objects.get_or_create(name=name)[0] for name in tag_names]
        article.tags.set(tags)


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Ваш комментарий...'})
        }
        labels = {'content': 'Комментарий'}


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio']
        labels = {'avatar': 'Аватар', 'bio': 'О себе'}
