# Фаззинг-тестирование API через Schemathesis
#
# Требования:
#   - Backend запущен (docker compose up или python manage.py runserver)
#   - pip install -r backend/requirements.txt
#   - Сгенерирована схема: .\scripts\generate-openapi.ps1
#
# Переменные окружения (необязательно):
#   FUZZ_BASE_URL, FUZZ_USERNAME, FUZZ_PASSWORD, SCHEMATHESIS_HOOKS

param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [int]$MaxExamples = 50
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Schema = Join-Path $Root "docs\openapi\openapi.yaml"
$ReportDir = Join-Path $Root "docs\openapi"
$Report = Join-Path $ReportDir "fuzz-report.xml"

if (-not (Test-Path $Schema)) {
    Write-Host "Схема не найдена. Генерирую openapi.yaml ..."
    & (Join-Path $Root "scripts\generate-openapi.ps1")
}

Write-Host "Проверка доступности API: $BaseUrl/api/health/"
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/health/" -Method Get -TimeoutSec 5 | Out-Null
} catch {
    Write-Error "Backend недоступен на $BaseUrl. Запустите сервер и повторите."
}

$env:FUZZ_BASE_URL = $BaseUrl
$env:SCHEMATHESIS_HOOKS = "fuzzing.hooks"

Push-Location $Backend
try {
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        .\.venv\Scripts\Activate.ps1
    }

    Write-Host "Schemathesis: $MaxExamples примеров на эндпоинт ..."
    schemathesis run $Schema `
        --base-url=$BaseUrl `
        --hypothesis-max-examples=$MaxExamples `
        --workers=1 `
        --request-timeout=10 `
        --checks=all `
        --junit-xml=$Report
} finally {
    Pop-Location
}

Write-Host "Готово. JUnit-отчёт: $Report"
