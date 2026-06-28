# Генерация OpenAPI-схемы (docs/openapi/openapi.yaml)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

Push-Location $Backend
try {
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        .\.venv\Scripts\Activate.ps1
    }
    python manage.py generate_openapi_schema
} finally {
    Pop-Location
}
