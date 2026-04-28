from django.db import transaction

from catalog.models import Product
from catalog.services import InsufficientStockError, adjust_quantity
from users.models import UserRole

from .models import Order, OrderItem, OrderStatus


class OrderServiceError(ValueError):
    pass


class InvalidStatusTransition(OrderServiceError):
    pass


ALLOWED_TRANSITIONS = {
    OrderStatus.NEW: {OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED},
    OrderStatus.IN_PROGRESS: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: set(),
    OrderStatus.CANCELLED: set(),
}


@transaction.atomic
def create_order(user, items_data: list[dict]) -> Order:
    """
    items_data: [{"product_id": int, "quantity": int}, ...]
    Списание остатков выполняется при создании заказа.
    """
    if user.role not in (UserRole.EMPLOYEE, UserRole.LOGISTIC):
        raise OrderServiceError("Создавать заказы могут сотрудник или логист.")

    if not items_data:
        raise OrderServiceError("Заказ должен содержать хотя бы одну позицию.")

    product_ids = [item["product_id"] for item in items_data]
    if len(product_ids) != len(set(product_ids)):
        raise OrderServiceError("Один товар не может быть указан в заказе дважды.")

    order = Order.objects.create(user=user, status=OrderStatus.NEW)

    for item in items_data:
        quantity = item["quantity"]
        if quantity < 1:
            raise OrderServiceError("Количество должно быть не меньше 1.")

        try:
            product = Product.objects.select_for_update().get(pk=item["product_id"])
        except Product.DoesNotExist:
            raise OrderServiceError(f"Товар id={item['product_id']} не найден.")

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            unit_price=product.price,
        )
        try:
            adjust_quantity(product, -quantity)
        except InsufficientStockError as exc:
            raise OrderServiceError(str(exc)) from exc

    return order


@transaction.atomic
def cancel_order(order: Order) -> Order:
    if order.status in (OrderStatus.CANCELLED, OrderStatus.SHIPPED):
        raise OrderServiceError("Нельзя отменить отгруженный или уже отменённый заказ.")

    for item in order.items.select_related("product"):
        product = Product.objects.select_for_update().get(pk=item.product_id)
        adjust_quantity(product, item.quantity)

    order.status = OrderStatus.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return order


@transaction.atomic
def set_order_status(order: Order, new_status: str) -> Order:
    if new_status == OrderStatus.CANCELLED:
        return cancel_order(order)

    allowed = ALLOWED_TRANSITIONS.get(order.status, set())
    if new_status not in allowed:
        raise InvalidStatusTransition(
            f"Переход из «{order.get_status_display()}» в «{dict(OrderStatus.choices).get(new_status, new_status)}» недопустим."
        )

    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    return order
