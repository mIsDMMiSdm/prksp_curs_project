from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import UserRole

from .models import Product
from .permissions import IsWarehouseManagerOrReadOnly
from .serializers import (
    ProductQuantitySetSerializer,
    ProductSerializer,
    ProductStockAdjustSerializer,
)
from .services import InsufficientStockError


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsWarehouseManagerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        in_stock = self.request.query_params.get("in_stock")
        if in_stock in ("1", "true", "True"):
            qs = qs.filter(quantity__gt=0)
        return qs

    @action(
        detail=True,
        methods=["post"],
        url_path="adjust-stock",
        permission_classes=[IsAuthenticated],
    )
    def adjust_stock(self, request, pk=None):
        if request.user.role != UserRole.WAREHOUSE_MANAGER:
            return Response(
                {"detail": "Только менеджер склада может изменять остатки."},
                status=status.HTTP_403_FORBIDDEN,
            )
        product = self.get_object()
        serializer = ProductStockAdjustSerializer(
            data=request.data,
            context={"product": product},
        )
        serializer.is_valid(raise_exception=True)
        try:
            product = serializer.save()
        except InsufficientStockError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ProductSerializer(product).data)

    @action(
        detail=True,
        methods=["post"],
        url_path="set-quantity",
        permission_classes=[IsAuthenticated],
    )
    def set_quantity_action(self, request, pk=None):
        if request.user.role != UserRole.WAREHOUSE_MANAGER:
            return Response(
                {"detail": "Только менеджер склада может изменять остатки."},
                status=status.HTTP_403_FORBIDDEN,
            )
        product = self.get_object()
        serializer = ProductQuantitySetSerializer(
            data=request.data,
            context={"product": product},
        )
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductSerializer(product).data)
