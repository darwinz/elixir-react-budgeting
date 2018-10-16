require IEx

defmodule Budgeting.TransactionController do
  use Budgeting.Web, :controller

  alias Budgeting.{Budget, Transaction}

  plug Budgeting.Plugs.RequireAuth when action in [:new, :create, :edit, :update, :delete]
  plug :check_budget_owner when action in [:create, :update, :delete]

  def create(conn, %{"transaction" => transaction}) do
    changeset = conn.assigns.budget
      |> build_assoc(:transaction)
      |> Transaction.changeset(Map.put(transaction, "guid", Ecto.UUID.generate))

    case Repo.insert(changeset) do
      {:ok, transaction} ->
        conn
        |> put_flash(:info, "Transaction created")
      {:error, changeset} ->
        conn
        |> put_flash(:error, "Failed to create transaction")
    end
  end

  def update(conn, %{"guid" => guid, "transaction" => transaction}) do
    old_transaction = Repo.get_by(Transaction, guid: guid)
    changeset = Transaction.changeset(old_transaction, transaction)

    case Repo.update(changeset) do
      {:ok, _budget} ->
        conn
        |> put_flash(:info, "Transaction updated")
      {:error, changeset} ->
        conn
        |> put_flash(:error, "Failed to update transaction")
    end
  end

  def delete(conn, %{"id" => transaction_id}) do
    Repo.get!(Transaction, transaction_id) |> Repo.delete!

    conn
    |> put_flash(:info, "Transaction deleted")
  end

  def check_budget_owner(conn, _params) do
    IEx.pry
    %{params: %{"transaction.budget_id" => budget_id}} = conn

    if Repo.get_by(Budget, id: budget_id).user_id == conn.assigns.user.id do
      conn
    else
      conn
      |> put_flash(:error, "Not authorized")
      |> redirect(to: page_path(conn, :index))
      |> halt()
    end
  end
end
