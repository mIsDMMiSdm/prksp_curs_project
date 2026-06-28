from rest_framework import serializers

from catalog.models import Product

from .models import Order, OrderItem
from .services import OrderServiceError, create_order


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
        )
        read_only_fields = fields


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "username",
            "status",
            "status_display",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True, allow_empty=False)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Добавьте хотя бы одну позицию.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        try:
            return create_order(user, validated_data["items"])
        except OrderServiceError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order._meta.get_field("status").choices)
