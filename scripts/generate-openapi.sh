#!/usr/bin/env bash
# Генерация OpenAPI-схемы (docs/openapi/openapi.yaml)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
if [[ -f .venv/bin/activate ]]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi
python manage.py generate_openapi_schema
