from rest_framework import serializers
from django.contrib.auth.models import User
from blog.models import Profile, Tag, Article, Comment, Follow, Notification, Report
import markdown
from django.utils.safestring import mark_safe


# 2.1
class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name']
        read_only_fields = ['id', 'username']
    
    def get_display_name(self, obj):
        return obj.first_name or obj.username


class UserUpdateSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='first_name', required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'display_name']
    
    def validate_username(self, value):
        if self.instance and User.objects.exclude(pk=self.instance.pk).filter(username=value).exists():
            raise serializers.ValidationError('Это имя пользователя уже занято')
        return value


# 2.2
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


# 2.6 — объявляем до ArticleDetailSerializer, который его использует
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']


# 2.3
class ArticleListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    def get_rating(self, obj):
        return obj.rating()

    def get_preview(self, obj):
        # Берём первые 300 символов контента и конвертируем в HTML
        preview_text = obj.content[:300] + '...' if len(obj.content) > 300 else obj.content
        html = markdown.markdown(preview_text, extensions=['fenced_code', 'tables'])
        return mark_safe(html)

    class Meta:
        model = Article
        fields = ['id', 'slug', 'title', 'author', 'tags', 'status', 'views', 'rating', 'created_at', 'preview']


# 2.4
class ArticleDetailSerializer(ArticleListSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    content_html = serializers.SerializerMethodField()

    def get_content_html(self, obj):
        html = markdown.markdown(obj.content, extensions=['fenced_code', 'tables'])
        return mark_safe(html)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ['content', 'content_html', 'comments', 'updated_at']


# 2.5
class ArticleWriteSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), write_only=True, required=False, default=list)

    class Meta:
        model = Article
        fields = ['title', 'content', 'status', 'tags']

    def _set_tags(self, article, tag_names):
        tag_objects = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tag_objects.append(tag)
        article.tags.set(tag_objects)

    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        article = Article.objects.create(**validated_data)
        self._set_tags(article, tag_names)
        return article

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            self._set_tags(instance, tag_names)
        return instance


# 2.7
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    def get_followers_count(self, obj):
        return Follow.objects.filter(author=obj.user).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, author=obj.user).exists()
        return False

    class Meta:
        model = Profile
        fields = ['user', 'avatar', 'bio', 'followers_count', 'is_following']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    username = serializers.CharField(source='user.username', required=False)
    
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'username', 'display_name']
    
    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError('Это имя пользователя уже занято')
        return value
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            username = user_data.get('username')
            first_name = user_data.get('first_name')
            if username:
                instance.user.username = username
            if first_name is not None:
                instance.user.first_name = first_name
            instance.user.save()
        
        return super().update(instance, validated_data)


# 2.8
class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    article = ArticleListSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'article', 'is_read', 'created_at']


# 2.9
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    display_name = serializers.CharField(required=False, allow_blank=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Пользователь с таким логином уже существует.')
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают.'})
        return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'article', 'comment', 'reason', 'text', 'created_at', 'resolved']
        read_only_fields = ['id', 'created_at', 'resolved']
