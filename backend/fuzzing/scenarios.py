"""
Сценарные проверки API для фаззинг-тестирования.

Каждый сценарий — детерминированный end-to-end поток с явными утверждениями.
Используется вместе со Schemathesis (property-based фаззинг по OpenAPI).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Callable

from .client import ApiClient, BASE_URL


@dataclass
class ScenarioResult:
    name: str
    passed: bool
    error: str | None = None


def _unique_sku(prefix: str = "FUZZ") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


def scenario_product_crud() -> None:
    """CRUD товаров: создание, чтение, обновление, удаление (роль warehouse_manager)."""
    client = ApiClient.login("warehouse1", base_url=BASE_URL)
    sku = _unique_sku()

    created = client.post(
        "/api/products/",
        json={
            "name": "Фаззинг-тест товар",
            "sku": sku,
            "quantity": 100,
            "price": "19.99",
        },
        expected_status=201,
    ).json()
    product_id = created["id"]
    assert created["sku"] == sku
    assert created["quantity"] == 100

    fetched = client.get(f"/api/products/{product_id}/", expected_status=200).json()
    assert fetched["id"] == product_id
    assert fetched["name"] == "Фаззинг-тест товар"

    updated = client.patch(
        f"/api/products/{product_id}/",
        json={"name": "Фаззинг-тест (обновлён)", "quantity": 120},
        expected_status=200,
    ).json()
    assert updated["name"] == "Фаззинг-тест (обновлён)"
    assert updated["quantity"] == 120

    client.delete(f"/api/products/{product_id}/", expected_status=204)

    client.get(f"/api/products/{product_id}/", expected_status=404)


def scenario_order_filling() -> None:
    """Заполнение заказа: выбор товаров в наличии и создание заказа с позициями."""
    client = ApiClient.login("employee1", base_url=BASE_URL)

    products = client.get("/api/products/?in_stock=1", expected_status=200).json()
    assert len(products) >= 2, "Нужно минимум 2 товара в наличии (запустите seed_demo)"

    first, second = products[0], products[1]
    items = [
        {"product_id": first["id"], "quantity": 1},
        {"product_id": second["id"], "quantity": 2},
    ]

    order = client.post("/api/orders/", json={"items": items}, expected_status=201).json()
    assert order["status"] == "new"
    assert len(order["items"]) == 2

    by_product = {item["product"]: item for item in order["items"]}
    assert by_product[first["id"]]["quantity"] == 1
    assert by_product[second["id"]]["quantity"] == 2
    assert by_product[first["id"]]["product_name"] == first["name"]
    assert by_product[second["id"]]["unit_price"] is not None

    my_orders = client.get("/api/orders/my/", expected_status=200).json()
    assert any(o["id"] == order["id"] for o in my_orders)


def scenario_order_lifecycle() -> None:
    """Жизненный цикл заказа: создание → в обработке → отгружен (роль logistic)."""
    client = ApiClient.login("logistic1", base_url=BASE_URL)

    product = client.get("/api/products/?in_stock=1", expected_status=200).json()[0]
    order = client.post(
        "/api/orders/",
        json={"items": [{"product_id": product["id"], "quantity": 1}]},
        expected_status=201,
    ).json()
    order_id = order["id"]
    assert order["status"] == "new"

    in_progress = client.post(
        f"/api/orders/{order_id}/set-status/",
        json={"status": "in_progress"},
        expected_status=200,
    ).json()
    assert in_progress["status"] == "in_progress"

    shipped = client.post(
        f"/api/orders/{order_id}/set-status/",
        json={"status": "shipped"},
        expected_status=200,
    ).json()
    assert shipped["status"] == "shipped"

    client.post(
        f"/api/orders/{order_id}/cancel/",
        expected_status=400,
    )


def scenario_stock_adjustment() -> None:
    """Корректировка остатков: adjust-stock и set-quantity (роль warehouse_manager)."""
    client = ApiClient.login("warehouse1", base_url=BASE_URL)

    product = client.get("/api/products/", expected_status=200).json()[0]
    product_id = product["id"]
    initial_qty = product["quantity"]

    adjusted = client.post(
        f"/api/products/{product_id}/adjust-stock/",
        json={"delta": 5},
        expected_status=200,
    ).json()
    assert adjusted["quantity"] == initial_qty + 5

    restored = client.post(
        f"/api/products/{product_id}/adjust-stock/",
        json={"delta": -5},
        expected_status=200,
    ).json()
    assert restored["quantity"] == initial_qty

    set_qty = client.post(
        f"/api/products/{product_id}/set-quantity/",
        json={"quantity": initial_qty},
        expected_status=200,
    ).json()
    assert set_qty["quantity"] == initial_qty


def scenario_auth_and_roles() -> None:
    """Авторизация и роли: health, /me, запрет создания товара для employee."""
    anon = ApiClient(base_url=BASE_URL)
    anon.get("/api/health/", auth=False, expected_status=200)

    employee = ApiClient.login("employee1", base_url=BASE_URL)
    me = employee.get("/api/auth/me/", expected_status=200).json()
    assert me["username"] == "employee1"
    assert me["role"] == "employee"

    employee.post(
        "/api/products/",
        json={
            "name": "Запрещённый товар",
            "sku": _unique_sku("DENY"),
            "quantity": 1,
            "price": "1.00",
        },
        expected_status=403,
    )

    employee.post(
        f"/api/orders/1/set-status/",
        json={"status": "in_progress"},
        expected_status=403,
    )


def scenario_order_validation() -> None:
    """Валидация заказа: пустые позиции и дублирование товара."""
    client = ApiClient.login("employee1", base_url=BASE_URL)
    product = client.get("/api/products/?in_stock=1", expected_status=200).json()[0]

    client.post("/api/orders/", json={"items": []}, expected_status=400)

    client.post(
        "/api/orders/",
        json={
            "items": [
                {"product_id": product["id"], "quantity": 1},
                {"product_id": product["id"], "quantity": 2},
            ]
        },
        expected_status=400,
    )


SCENARIOS: list[tuple[str, Callable[[], None]]] = [
    ("CRUD товаров", scenario_product_crud),
    ("Заполнение заказа", scenario_order_filling),
    ("Жизненный цикл заказа", scenario_order_lifecycle),
    ("Корректировка остатков", scenario_stock_adjustment),
    ("Авторизация и роли", scenario_auth_and_roles),
    ("Валидация заказа", scenario_order_validation),
]


def run_all_scenarios() -> list[ScenarioResult]:
    results: list[ScenarioResult] = []
    for name, fn in SCENARIOS:
        try:
            fn()
            results.append(ScenarioResult(name=name, passed=True))
        except Exception as exc:  # noqa: BLE001 — сценарный раннер собирает все ошибки
            results.append(ScenarioResult(name=name, passed=False, error=str(exc)))
    return results
