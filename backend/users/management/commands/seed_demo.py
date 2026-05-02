from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from catalog.models import Product
from users.models import UserRole

User = get_user_model()

DEMO_PASSWORD = "demo12345"

DEMO_USERS = [
    {
        "username": "warehouse1",
        "role": UserRole.WAREHOUSE_MANAGER,
        "email": "warehouse1@demo.local",
    },
    {
        "username": "logistic1",
        "role": UserRole.LOGISTIC,
        "email": "logistic1@demo.local",
    },
    {
        "username": "employee1",
        "role": UserRole.EMPLOYEE,
        "email": "employee1@demo.local",
    },
]

DEMO_PRODUCTS = [
    {
        "name": "Болт М8×40",
        "sku": "BOLT-M8-40",
        "quantity": 500,
        "price": Decimal("12.50"),
    },
    {
        "name": "Гайка М8",
        "sku": "NUT-M8",
        "quantity": 800,
        "price": Decimal("4.20"),
    },
    {
        "name": "Шайба М8",
        "sku": "WASH-M8",
        "quantity": 1200,
        "price": Decimal("1.80"),
    },
    {
        "name": "Коробка картонная 40×30",
        "sku": "BOX-4030",
        "quantity": 150,
        "price": Decimal("35.00"),
    },
    {
        "name": "Скотч упаковочный",
        "sku": "TAPE-PACK",
        "quantity": 60,
        "price": Decimal("89.90"),
    },
    {
        "name": "Паллета деревянная",
        "sku": "PALLET-WOOD",
        "quantity": 25,
        "price": Decimal("450.00"),
    },
]


class Command(BaseCommand):
    help = "Создать демо-пользователей и товары для учебного стенда."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-products",
            action="store_true",
            help="Удалить все товары перед загрузкой (осторожно).",
        )

    def handle(self, *args, **options):
        self._seed_users()
        self._seed_products(reset=options["reset_products"])
        self.stdout.write(self.style.SUCCESS("Демо-данные загружены."))

    def _seed_users(self):
        for data in DEMO_USERS:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "role": data["role"],
                },
            )
            if not created and user.role != data["role"]:
                user.role = data["role"]
                user.email = data["email"]
            user.set_password(DEMO_PASSWORD)
            user.save()
            action = "создан" if created else "обновлён"
            self.stdout.write(f"  Пользователь {user.username} ({action})")

        self.stdout.write(
            self.style.WARNING(f"  Пароль для всех демо-аккаунтов: {DEMO_PASSWORD}")
        )

    def _seed_products(self, reset: bool):
        if reset:
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(f"  Удалено товаров: {deleted}")

        for data in DEMO_PRODUCTS:
            product, created = Product.objects.update_or_create(
                sku=data["sku"],
                defaults={
                    "name": data["name"],
                    "quantity": data["quantity"],
                    "price": data["price"],
                },
            )
            action = "создан" if created else "обновлён"
            self.stdout.write(f"  Товар {product.sku} ({action})")
