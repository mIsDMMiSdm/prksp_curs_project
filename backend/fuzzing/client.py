"""HTTP-клиент для сценарных проверок фаззинг-тестирования."""

from __future__ import annotations

import os
from typing import Any

import requests

BASE_URL = os.getenv("FUZZ_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
DEFAULT_PASSWORD = os.getenv("FUZZ_PASSWORD", "demo12345")


class ApiClient:
    def __init__(self, base_url: str = BASE_URL, token: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        if token:
            self.set_token(token)

    def set_token(self, token: str) -> None:
        self.session.headers["Authorization"] = f"Bearer {token}"

    def clear_token(self) -> None:
        self.session.headers.pop("Authorization", None)

    @classmethod
    def login(cls, username: str, password: str = DEFAULT_PASSWORD, base_url: str = BASE_URL) -> ApiClient:
        client = cls(base_url=base_url)
        response = client.post(
            "/api/auth/login/",
            json={"username": username, "password": password},
            auth=False,
        )
        response.raise_for_status()
        client.set_token(response.json()["access"])
        return client

    def request(
        self,
        method: str,
        path: str,
        *,
        auth: bool = True,
        expected_status: int | tuple[int, ...] | None = None,
        **kwargs: Any,
    ) -> requests.Response:
        if not auth:
            saved_auth = self.session.headers.pop("Authorization", None)
            try:
                response = self.session.request(
                    method,
                    f"{self.base_url}{path}",
                    timeout=kwargs.pop("timeout", 15),
                    **kwargs,
                )
            finally:
                if saved_auth is not None:
                    self.session.headers["Authorization"] = saved_auth
        else:
            response = self.session.request(
                method,
                f"{self.base_url}{path}",
                timeout=kwargs.pop("timeout", 15),
                **kwargs,
            )

        if expected_status is not None:
            allowed = (expected_status,) if isinstance(expected_status, int) else expected_status
            if response.status_code not in allowed:
                raise AssertionError(
                    f"{method} {path}: ожидался {allowed}, получен {response.status_code}: {response.text}"
                )
        return response

    def get(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("POST", path, **kwargs)

    def patch(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("PATCH", path, **kwargs)

    def put(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("PUT", path, **kwargs)

    def delete(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("DELETE", path, **kwargs)
