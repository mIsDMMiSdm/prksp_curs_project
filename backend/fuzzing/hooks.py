"""
Schemathesis hooks: JWT-аутентификация для фаззинг-тестирования защищённых эндпоинтов.

Подключается через переменную окружения SCHEMATHEISIS_HOOKS=fuzzing.hooks
(см. scripts/run-fuzzing.ps1).

Переменные окружения:
  FUZZ_BASE_URL  — базовый URL API (по умолчанию http://127.0.0.1:8000)
  FUZZ_USERNAME  — логин демо-пользователя (по умолчанию logistic1)
  FUZZ_PASSWORD  — пароль (по умолчанию demo12345)
"""

import os

import requests
import schemathesis

BASE_URL = os.getenv("FUZZ_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
USERNAME = os.getenv("FUZZ_USERNAME", "logistic1")
PASSWORD = os.getenv("FUZZ_PASSWORD", "demo12345")

PUBLIC_PATHS = (
    "/api/health/",
    "/api/auth/login/",
    "/api/auth/register/",
    "/api/auth/refresh/",
)


@schemathesis.auth().skip_for(path=list(PUBLIC_PATHS))
class JwtAuth:
    """Получает access-токен и подставляет заголовок Authorization."""

    def get(self, context):
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json={"username": USERNAME, "password": PASSWORD},
            timeout=15,
        )
        response.raise_for_status()
        return response.json()["access"]

    def set(self, case, data, context):
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {data}"
