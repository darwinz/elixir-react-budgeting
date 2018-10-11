defmodule Budgeting.User do
  use Budgeting.Web, :model

  @derive {Poison.Encoder, only: [:username]}

  schema "users" do
    field :guid, :string
    field :username, :string
    field :email, :string
    field :provider, :string
    field :token, :string
    has_many :budgets, Budgeting.Budget
    has_many :transactions, Budgeting.Transaction

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:username, :email, :provider, :token])
    |> validate_required([:username, :token])
  end
end
