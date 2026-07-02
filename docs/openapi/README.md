# OpenAPI-схема WMS API

Файл `openapi.yaml` описывает все REST-эндпоинты проекта и используется для фаззинг-тестирования [Schemathesis](https://schemathesis.readthedocs.io/).

## Генерация

Из каталога `backend` (с активированным venv и установленными зависимостями):

```powershell
python manage.py generate_openapi_schema
```

Или из корня репозитория:

```powershell
.\scripts\generate-openapi.ps1
```

Схема также доступна на работающем сервере:

- JSON/YAML: `GET /api/schema/`
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`

## Фаззинг

См. `scripts/run-fuzzing.ps1` и раздел «Фаззинг-тестирование» в корневом README.

После прогона отчёт JUnit сохраняется в `fuzz-report.xml` (файл генерируется, не коммитится).

Дополнительно выполняются сценарные проверки: CRUD товаров, заполнение заказа, жизненный цикл заказа, остатки, роли и валидация (`backend/fuzzing/scenarios.py`).
