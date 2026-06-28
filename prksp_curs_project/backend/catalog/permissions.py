from rest_framework.permissions import SAFE_METHODS, BasePermission

from users.models import UserRole


class IsWarehouseManagerOrReadOnly(BasePermission):
    """Чтение — любой авторизованный; изменение — только менеджер склада."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == UserRole.WAREHOUSE_MANAGER
