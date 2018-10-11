# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :budgeting,
  ecto_repos: [Budgeting.Repo]

# Configures the endpoint
config :budgeting, Budgeting.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "Allyf6zimZrZce8rrePBwHruhC2ewC1c7cVwahgq+nSAMrXYc6WjgBHT2YqaEe2+",
  render_errors: [view: Budgeting.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Budgeting.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
