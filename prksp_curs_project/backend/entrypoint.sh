#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import os, sys, time
import psycopg2
host = os.environ.get('POSTGRES_HOST', 'db')
port = os.environ.get('POSTGRES_PORT', '5432')
user = os.environ.get('POSTGRES_USER', 'postgres')
password = os.environ.get('POSTGRES_PASSWORD', 'postgres')
db = os.environ.get('POSTGRES_DB', 'warehouse_orders')
for i in range(30):
    try:
        psycopg2.connect(host=host, port=port, user=user, password=password, dbname=db).close()
        sys.exit(0)
    except psycopg2.OperationalError:
        time.sleep(1)
sys.exit(1)
"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up"

python manage.py migrate --noinput
python manage.py seed_demo

exec python manage.py runserver 0.0.0.0:8000
