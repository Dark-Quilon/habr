from django.contrib import admin
from .models import Article, Tag, Comment, Vote, Profile, Follow, Notification

admin.site.register(Article)
admin.site.register(Tag)
admin.site.register(Comment)
admin.site.register(Vote)
admin.site.register(Profile)
admin.site.register(Follow)
admin.site.register(Notification)
