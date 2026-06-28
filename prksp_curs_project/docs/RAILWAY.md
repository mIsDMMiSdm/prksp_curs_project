# Деплой на Railway

Проект разворачивается как **три компонента** в одном Railway Project:

1. **PostgreSQL** (плагин базы данных)
2. **Backend** (папка `backend/`)
3. **Frontend** (папка `frontend/`)

## 1. Подготовка репозитория

Убедитесь, что код запушен в GitHub:  
https://github.com/mIsDMMiSdm/prksp_curs_project

## 2. Создание проекта Railway

1. Войдите на [railway.com](https://railway.com)
2. **New Project** → **Deploy from GitHub repo** → выберите `prksp_curs_project`
3. **Add PostgreSQL** (в проекте: **+ New** → **Database** → **PostgreSQL**)

## 3. Сервис Backend

1. **+ New** → **GitHub Repo** → тот же репозиторий (или **Empty Service** и подключите репозиторий)
2. **Settings** → **Root Directory**: `backend`
3. **Settings** → **Networking** → **Generate Domain** (получите URL вида `https://xxx.up.railway.app`)
4. **Variables** (подключите PostgreSQL: **Add Reference** → `DATABASE_URL` из Postgres)

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | Reference → PostgreSQL |
| `RAILWAY_DEPLOY` | `1` |
| `DJANGO_DEBUG` | `0` |
| `DJANGO_SECRET_KEY` | случайная длинная строка |
| `RUN_SEED_DEMO` | `1` (только первый деплой, потом удалить или `0`) |
| `FRONTEND_URL` | URL фронтенда (добавить после шага 4) |

5. Деплой запустится автоматически. Проверка: `https://<backend-domain>/api/health/`

## 4. Сервис Frontend

1. **+ New** → **GitHub Repo** → тот же репозиторий
2. **Root Directory**: `frontend`
3. **Networking** → **Generate Domain**
4. **Variables**:

| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | `https://<ваш-backend-domain>.up.railway.app` (без слэша в конце) |

> `VITE_API_URL` используется **при сборке**. После изменения — **Redeploy** frontend.

5. Откройте URL фронтенда в браузере, войдите: `warehouse1` / `demo12345`

## 5. Финальная настройка CORS

В **backend** → **Variables** добавьте/обновите:

```
FRONTEND_URL=https://<ваш-frontend-domain>.up.railway.app
```

Сделайте **Redeploy** backend.

## 6. Для отчёта (скриншоты)

- Railway Dashboard: сервисы backend + frontend + postgres
- Deployments → успешный деплой
- GitHub → Commits
- Работающий URL приложения

## Устранение проблем

| Проблема | Решение |
|---------|---------|
| CORS error в браузере | Проверьте `FRONTEND_URL` и `RAILWAY_DEPLOY=1`, redeploy backend |
| API 404 на фронте | `VITE_API_URL` должен указывать на backend, redeploy frontend |
| Пустая БД | `RUN_SEED_DEMO=1` и redeploy backend |
| Build failed | Логи в Railway → Deployments → View logs |

## Локальная проверка production-сборки

```powershell
cd frontend
$env:VITE_API_URL="https://your-backend.up.railway.app"
npm run build
npx serve -s dist
```
