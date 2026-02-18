defmodule Budgeting do
  use Application

  def start(_type, _args) do
    children = [
      Budgeting.Repo,
      {Phoenix.PubSub, name: Budgeting.PubSub},
      Budgeting.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Budgeting.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def config_change(changed, _new, removed) do
    Budgeting.Endpoint.config_change(changed, removed)
    :ok
  end
end
