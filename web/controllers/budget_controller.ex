require IEx

defmodule Budgeting.BudgetController do
  use Budgeting.Web, :controller

  alias Budgeting.{Budget, Transaction}

  plug Budgeting.Plugs.RequireAuth when action in [:index, :new, :create, :edit, :update, :delete]
  plug :check_budget_owner when action in [:update, :edit, :delete]

  def index(conn, _params) do
    IEx.pry
    current_user = conn.assigns.user
    response = Repo.get_by(Budget, user_id: current_user.id)
    case response do
      nil -> render conn, "index.html", budgets: []
      budgets -> render conn, "index.html", budgets: budgets
    end
  end

  def show(conn, %{"guid" => guid}) do
    budget = Repo.get_by(Budget, guid: guid)
    transactions = Repo.get_by(Transaction, budget_id: budget.id)
    render conn, "show.html", budget: budget, transactions: transactions
  end

  def new(conn, _params) do
    changeset = Budget.changeset(%Budget{}, %{})

    render conn, "new.html", changeset: changeset
  end

  def create(conn, %{"budget" => budget}) do
    changeset = conn.assigns.user
      |> build_assoc(:budgets)
      |> Budget.changeset(Map.put(budget, "guid", Ecto.UUID.generate))

    case Repo.insert(changeset) do
      {:ok, budget} ->
        conn
        |> put_flash(:info, "Budget created")
        |> redirect(to: budget_path(conn, :edit, budget))
      {:error, changeset} ->
        render conn, "new.html", changeset: changeset
    end
  end

  def edit(conn, %{"guid" => guid}) do
    budget = Repo.get_by(Budget,  guid: guid)
    changeset = Budget.changeset(budget)

    render conn, "edit.html", changeset: changeset, budget: budget
  end

  def update(conn, %{"guid" => guid, "budget" => budget}) do
    old_budget = Repo.get_by(Budget, guid: guid)
    changeset = Budget.changeset(old_budget, budget)

    case Repo.update(changeset) do
      {:ok, _budget} ->
        conn
        |> put_flash(:info, "Budget updated")
        |> redirect(to: budget_path(conn, :index))
      {:error, changeset} ->
        render conn, "edit.html", changeset: changeset, budget: old_budget
    end
  end

  def delete(conn, %{"id" => budget_id}) do
    Repo.get!(Budget, budget_id) |> Repo.delete!

    conn
    |> put_flash(:info, "Budget deleted")
    |> redirect(to: budget_path(conn, :index))
  end

  def check_budget_owner(conn, _params) do
    IEx.pry
    %{params: %{"guid" => guid}} = conn

    if Repo.get_by(Budget, guid: guid).user_id == conn.assigns.user.id do
      conn
    else
      conn
      |> put_flash(:error, "Not authorized")
      |> redirect(to: budget_path(conn, :index))
      |> halt()
    end
  end
end
