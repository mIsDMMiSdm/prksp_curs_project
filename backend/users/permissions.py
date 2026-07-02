from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    """Доступ только для указанных ролей (атрибут allowed_roles на view)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        allowed = getattr(view, "allowed_roles", None)
        if not allowed:
            return True
        return request.user.role in allowed


def role_permission(*roles):
    class _RolePermission(HasRole):
        def has_permission(self, request, view):
            view.allowed_roles = roles
            return super().has_permission(request, view)

    return _RolePermission
