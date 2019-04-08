#!/bin/sh
set -e

# Wait for Postgres to become available.
until psql -h db -U "postgres" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

mix ecto.drop
mix ecto.create
mix ecto.migrate
mix run priv/repo/seeds.exs
npm install

mix phx.server
