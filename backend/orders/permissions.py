from rest_framework.permissions import BasePermission, SAFE_METHODS

from users.models import UserRole


class OrderPermission(BasePermission):
    """
    GET — авторизованные (сотрудник видит только свои через queryset).
    POST — employee, logistic.
    set-status / cancel — только logistic.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        action = getattr(view, "action", None)
        if action in ("set_status", "cancel"):
            return request.user.role == UserRole.LOGISTIC
        if action == "create":
            return request.user.role in (UserRole.EMPLOYEE, UserRole.LOGISTIC)
        if request.method in SAFE_METHODS or action in ("list", "retrieve", "my_orders"):
            return True
        return False
