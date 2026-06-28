#!/usr/bin/env bash
# Фаззинг-тестирование API через Schemathesis
#
# Требования:
#   - Backend запущен (docker compose up или python manage.py runserver)
#   - pip install -r backend/requirements.txt
#   - Сгенерирована схема: ./scripts/generate-openapi.sh
#
# Переменные окружения (необязательно):
#   FUZZ_BASE_URL, FUZZ_USERNAME, FUZZ_PASSWORD

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
SCHEMA="$ROOT/docs/openapi/openapi.yaml"
REPORT="$ROOT/docs/openapi/fuzz-report.xml"
BASE_URL="${FUZZ_BASE_URL:-http://127.0.0.1:8000}"
MAX_EXAMPLES="${FUZZ_MAX_EXAMPLES:-50}"

if [[ ! -f "$SCHEMA" ]]; then
  echo "Схема не найдена. Генерирую openapi.yaml ..."
  "$ROOT/scripts/generate-openapi.sh"
fi

echo "Проверка доступности API: ${BASE_URL}/api/health/"
if ! curl -sf "${BASE_URL}/api/health/" >/dev/null; then
  echo "Backend недоступен на ${BASE_URL}. Запустите сервер и повторите." >&2
  exit 1
fi

export FUZZ_BASE_URL="$BASE_URL"
export SCHEMATHESIS_HOOKS="fuzzing.hooks"

cd "$BACKEND"
if [[ -f .venv/bin/activate ]]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi

echo "Schemathesis: ${MAX_EXAMPLES} примеров на эндпоинт ..."
schemathesis run "$SCHEMA" \
  --base-url="$BASE_URL" \
  --hypothesis-max-examples="$MAX_EXAMPLES" \
  --workers=1 \
  --request-timeout=10 \
  --checks=all \
  --junit-xml="$REPORT"

echo "Готово. JUnit-отчёт: $REPORT"
