#!/bin/sh
set -e

# Parse DB Host and Port from DATABASE_URL
# Default values
DB_HOST="db"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  # Strip everything before '//'
  STRIP_PROTO="${DATABASE_URL#*//}"
  # Strip everything before '@'
  STRIP_USER="${STRIP_PROTO#*@}"
  # Extract host and port section before '/'
  HOST_PORT="${STRIP_USER%%/*}"
  # Extract host
  DB_HOST="${HOST_PORT%%:*}"
  # Extract port if present
  if echo "$HOST_PORT" | grep -q ":"; then
    DB_PORT="${HOST_PORT#*:}"
  else
    DB_PORT="5432"
  fi
fi

echo "Waiting for database to be ready at $DB_HOST:$DB_PORT..."
# Wait loop using netcat (built-in to alpine)
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Database is not reachable yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seeding
echo "Seeding the database..."
npx prisma db seed

echo "Starting Next.js application..."
exec "$@"
