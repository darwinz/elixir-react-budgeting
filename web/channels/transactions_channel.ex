defmodule Budgeting.TransactionsChannel do
  use Budgeting.Web, :channel
  alias Budgeting.{Budget, Transaction}

  def join("transactions:" <> budget_id, _params, socket) do
    budget_id = String.to_integer(budget_id)
    budget = Budget
      |> Repo.get(budget_id)
      |> Repo.preload(transactions: [:user])

    {:ok, %{transactions: budget.transactions}, assign(socket, :budget, budget)}
  end

  def handle_in(name, %{"type" => type, "cat" => cat, "amount" => amount, "desc" => desc}, socket) do
    budget = socket.assigns.budget
    user_id = socket.assigns.user_id

    changeset = budget
      |> build_assoc(:transactions, user_id: user_id)
      |> Transaction.changeset(
        %{
          guid: Ecto.UUID.generate,
          type: type,
          category: cat,
          amount: amount,
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
end
