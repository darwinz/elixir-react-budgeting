#!/bin/sh
set -e

# Install dependencies (only fetches if missing)
mix deps.get
npm install

# Create database if it doesn't exist, then migrate and seed
mix ecto.create
mix ecto.migrate
mix run priv/repo/seeds.exs

mix phx.server
