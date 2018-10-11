defmodule Budgeting.PageController do
  use Budgeting.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
