"""
Запуск сценарных проверок фаззинг-тестирования.

  python -m fuzzing.run_scenarios
"""

from __future__ import annotations

import sys

from .client import BASE_URL
from .scenarios import run_all_scenarios


def main() -> int:
    print(f"Сценарные проверки API: {BASE_URL}")
    print("-" * 50)

    results = run_all_scenarios()
    failed = 0

    for result in results:
        if result.passed:
            print(f"[OK]   {result.name}")
        else:
            failed += 1
            print(f"[FAIL] {result.name}")
            if result.error:
                print(f"       {result.error}")

    print("-" * 50)
    total = len(results)
    passed = total - failed
    print(f"Итого: {passed}/{total} сценариев пройдено")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
