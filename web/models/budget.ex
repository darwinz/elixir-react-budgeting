require IEx

defmodule Budgeting.Budget do
  use Budgeting.Web, :model

  schema "budgets" do
    field :guid, :string
    field :name, :string
    field :starting_balance, :float
    belongs_to :user, Budgeting.User
    has_many :transactions, Budgeting.Transaction

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    IEx.pry
    struct
    |> cast(params, [:guid, :name, :starting_balance])
    |> validate_required([:guid, :name, :starting_balance])
  end
end
