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

  scope "/auth", Budgeting do
    pipe_through :browser # Use the default browser stack

    get "/signout", AuthController, :signout
    get "/:provider/callback", AuthController, :callback
    get "/:provider", AuthController, :request
  end

  scope "/", Budgeting do
    pipe_through :browser # Use the default browser stack

    get "/budgets/new", BudgetController, :new
    get "/budgets/:guid/edit", BudgetController, :edit
    get "/budgets/:guid", BudgetController, :show
    put "/budgets/:guid", BudgetController, :update
    delete "/budgets/:guid", BudgetController, :delete
    post "/budgets", BudgetController, :create
    get "/budgets", BudgetController, :index
    post "/transactions", TransactionController, :create
    put "/transactions/:guid", TransactionController, :update
    delete "/transactions/:guid", TransactionController, :delete
    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", Budgeting do
  #   pipe_through :api
  # end
end
