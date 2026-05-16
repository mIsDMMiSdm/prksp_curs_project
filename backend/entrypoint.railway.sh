#!/bin/sh
set -e

echo "Railway deploy: migrate..."
python manage.py migrate --noinput

if [ "${RUN_SEED_DEMO}" = "1" ]; then
  echo "Seeding demo data..."
  python manage.py seed_demo
fi

PORT="${PORT:-8000}"
echo "Starting gunicorn on 0.0.0.0:${PORT}"
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
