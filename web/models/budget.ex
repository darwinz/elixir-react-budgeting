defmodule Budgeting.Budget do
  use Budgeting.Web, :model

  schema "budgets" do
    field :guid, :string
    field :name, :string
    field :starting_balance, :float
    field :user_id, :integer
    belongs_to :users, Budgeting.User
    has_many :transactions, Budgeting.Transaction
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:guid, :name, :starting_balance])
    |> validate_required([:guid, :name, :starting_balance])
  end
end
