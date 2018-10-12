defmodule Budgeting.Router do
  use Budgeting.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Budgeting.Plugs.SetUser
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Budgeting do
    pipe_through :browser # Use the default browser stack

    get "/", BudgetController, :index
    get "/budgets/new", BudgetController, :new
    post "/budgets", BudgetController, :create
    get "/budgets/:id/edit", BudgetController, :edit
    put "/budgets/:id", BudgetController, :update
  end

  # Other scopes may use custom stacks.
  # scope "/api", Budgeting do
  #   pipe_through :api
  # end
end
