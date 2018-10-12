defmodule Budgeting.BudgetController do
  use Budgeting.Web, :controller

  alias Budgeting.Budget

  plug Budgeting.Plugs.RequireAuth when action in [:new, :create, :edit, :update, :delete]
  plug :check_budget_owner when action in [:update, :edit, :delete]

  def index(conn, _params) do
    current_user = conn.assigns.user
    budgets = Repo.get_by!(Budget, user_id: current_user.id)
    render conn, "index.html", budgets: budgets
  end

  def show(conn, %{"id" => budget_id}) do
    budget = Repo.get!(Budget, budget_id)
    render conn, "show.html", budget: budget
  end

  def new(conn, _params) do
    changeset = Budget.changeset(%Budget{}, %{})

    render conn, "new.html", changeset: changeset
  end

  def create(conn, %{"budget" => budget}) do
    changeset = conn.assigns.user
      |> build_assoc(:budgets)
      |> Budget.changeset(budget)

    case Repo.insert(changeset) do
      {:ok, _budget} ->
        conn
        |> put_flash(:info, "Budget created")
        |> redirect(to: budget_path(conn, :index))
      {:error, changeset} ->
        render conn, "new.html", changeset: changeset
    end
  end

  def edit(conn, %{"id" => budget_id}) do
    budget = Repo.get(Budget, budget_id)
    changeset = Budget.changeset(budget)

    render conn, "edit.html", changeset: changeset, budget: budget
  end

  def update(conn, %{"id" => budget_id, "budget" => budget}) do
    old_budget = Repo.get(Budget, budget_id)
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
    %{params: %{"id" => budget_id}} = conn

    if Repo.get(Budget, budget_id).user_id == conn.assigns.user.id do
      conn
    else
      conn
      |> put_flash(:error, "Not authorized")
      |> redirect(to: budget_path(conn, :index))
      |> halt()
    end
  end
end
