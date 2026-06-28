from django.core.validators import MinValueValidator
from django.db import models


class Product(models.Model):
    name = models.CharField("Наименование", max_length=255)
    sku = models.CharField(
        "Артикул",
        max_length=64,
        blank=True,
        default="",
        db_index=True,
    )
    quantity = models.PositiveIntegerField(
        "Остаток",
        default=0,
        validators=[MinValueValidator(0)],
    )
    price = models.DecimalField(
        "Цена за единицу",
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} (остаток: {self.quantity})"
