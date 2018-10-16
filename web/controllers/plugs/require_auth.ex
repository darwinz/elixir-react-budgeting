defmodule Budgeting.Plugs.RequireAuth do
  import Plug.Conn
  import Phoenix.Controller

  alias Budgeting.Router.Helpers

  def init(opts), do: opts

  def call(conn, _params) do
    if conn.assigns[:user] do
      conn
    else
      conn
      |> put_flash(:error, "You must be logged in.")
      |> redirect(to: Helpers.budget_path(conn, :index))
      |> halt()
    end
  end
end

