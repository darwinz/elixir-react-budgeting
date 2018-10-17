# My Budgeting App

To start the app:

  * Install dependencies with `mix deps.get`
  * Install postgresql and ensure it is running
  * Add postgresql credentials as environment variables with `export POSTGRES_USERNAME="USERNAME_HERE"` and `export POSTGRES_PASSWORD="PASSWORD_HERE"`
  * Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  * Seed the database with `mix run priv/repo/seeds.exs`
  * Install Node.js dependencies with `npm install`
  * Start Phoenix endpoint with `mix phoenix.server` or `iex -S mix phoenix.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

