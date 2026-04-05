from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthorOrReadOnly(BasePermission):
    """SAFE_METHODS разрешены всем, остальные — только автору объекта."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user


class IsCommentAuthorOrReadOnly(BasePermission):
    """SAFE_METHODS разрешены всем, удаление — только автору комментария."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user
