defmodule Budgeting.Repo do
  use Ecto.Repo,
    otp_app: :budgeting,
    adapter: Ecto.Adapters.Postgres
end
