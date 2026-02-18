defmodule Budgeting.TransactionsChannel do
  use Budgeting.Web, :channel
  alias Budgeting.{Budget, Transaction}

  def join("transactions:" <> budget_id, _params, socket) do
    budget_id = String.to_integer(budget_id)
    budget = Budget
      |> Repo.get(budget_id)
      |> Repo.preload(transactions: [:user])

    {:ok, %{transactions: budget.transactions, budget_balance: budget.starting_balance}, assign(socket, :budget, budget)}
  end

  def handle_in(_name, %{"type" => type, "cat" => cat, "amt" => amt, "desc" => desc}, socket) do
    budget = socket.assigns.budget
    user_id = socket.assigns.user_id

    changeset = budget
      |> build_assoc(:transactions, user_id: user_id)
      |> Transaction.changeset(
        %{
          guid: Ecto.UUID.generate,
          type: type,
          category: cat,
          amount: amt,
          description: desc,
          budget_id: budget.id,
          user_id: user_id
        })

    case Repo.insert(changeset) do
      {:ok, transaction} ->
        broadcast!(socket, "transactions:#{socket.assigns.budget.id}:new",
          %{transaction: transaction}
        )
        {:reply, :ok, socket}
      {:error, _reason} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end

  def handle_in("transaction:delete", %{"guid" => guid}, socket) do
    budget_id = socket.assigns.budget.id
    transaction = Repo.get_by(Transaction, guid: guid, budget_id: budget_id)

    case transaction do
      nil ->
        {:reply, {:error, %{message: "Transaction not found"}}, socket}
      transaction ->
        case Repo.delete(transaction) do
          {:ok, deleted_transaction} ->
            broadcast!(socket, "transactions:#{budget_id}:deleted", %{guid: deleted_transaction.guid})
            {:reply, {:ok, %{transaction: deleted_transaction}}, socket}
          {:error, _reason} ->
            {:reply, {:error, %{message: "Unable to delete transaction"}}, socket}
        end
    end
  end

  def handle_in("transaction:restore", params, socket) do
    budget = socket.assigns.budget
    user_id = socket.assigns.user_id

    changeset =
      budget
      |> build_assoc(:transactions, user_id: user_id)
      |> Transaction.changeset(%{
        guid: Map.get(params, "guid", Ecto.UUID.generate()),
        type: params["type"],
        category: params["category"],
        amount: params["amount"],
        description: params["description"],
        budget_id: budget.id,
        user_id: user_id
      })

    case Repo.insert(changeset) do
      {:ok, transaction} ->
        broadcast!(socket, "transactions:#{socket.assigns.budget.id}:new", %{transaction: transaction})
        {:reply, :ok, socket}
      {:error, _reason} ->
        {:reply, {:error, %{message: "Unable to restore transaction"}}, socket}
    end
  end
end
