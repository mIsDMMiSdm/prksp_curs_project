from rest_framework import serializers

from .models import Product
from .services import adjust_quantity, set_quantity


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "quantity",
            "price",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProductStockAdjustSerializer(serializers.Serializer):
    """Приход (+) или расход (−) относительно текущего остатка."""

    delta = serializers.IntegerField(
        help_text="Положительное — приход, отрицательное — расход.",
    )

    def save(self, **kwargs):
        product = self.context["product"]
        return adjust_quantity(product, self.validated_data["delta"])


class ProductQuantitySetSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)

    def save(self, **kwargs):
        product = self.context["product"]
        return set_quantity(product, self.validated_data["quantity"])
