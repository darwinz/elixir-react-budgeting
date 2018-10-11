defmodule Budgeting.Transaction do
  use Budgeting.Web, :model

  schema "transactions" do
    field :guid, :string
    field :type, :string
    field :category, :string
    field :amount, :float
    field :description, :string
    field :budget_id, :integer
    field :user_id, :integer
    belongs_to :budgets, Budgeting.Budget
    belongs_to :users, Budgeting.User
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:guid, :type, :category, :amount, :description])
    |> validate_required([:guid, :type, :category, :amount])
  end
end
