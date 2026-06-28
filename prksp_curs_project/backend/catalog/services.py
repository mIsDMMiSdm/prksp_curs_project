from django.db import transaction

from .models import Product


class InsufficientStockError(ValueError):
    pass


@transaction.atomic
def adjust_quantity(product: Product, delta: int) -> Product:
    """Изменить остаток на delta (отрицательное — списание)."""
    new_qty = product.quantity + delta
    if new_qty < 0:
        raise InsufficientStockError(
            f"Недостаточно товара «{product.name}»: на складе {product.quantity}, "
            f"требуется списать {abs(delta)}."
        )
    product.quantity = new_qty
    product.save(update_fields=["quantity", "updated_at"])
    return product


@transaction.atomic
def set_quantity(product: Product, quantity: int) -> Product:
    if quantity < 0:
        raise ValueError("Остаток не может быть отрицательным.")
    product.quantity = quantity
    product.save(update_fields=["quantity", "updated_at"])
    return product
