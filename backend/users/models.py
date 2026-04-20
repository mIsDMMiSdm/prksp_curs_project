from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    WAREHOUSE_MANAGER = "warehouse_manager", "Менеджер склада"
    LOGISTIC = "logistic", "Логист"
    EMPLOYEE = "employee", "Сотрудник"


class User(AbstractUser):
    role = models.CharField(
        max_length=32,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
