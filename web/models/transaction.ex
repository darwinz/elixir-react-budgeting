defmodule Budgeting.Transaction do
  use Budgeting.Web, :model

  @derive {Poison.Encoder, only: [:guid, :type, :category, :amount, :description, :user]}

  schema "transactions" do
    field :guid, :string
    field :type, :string
    field :category, :string
    field :amount, :float
    field :description, :string
    belongs_to :budget, Budgeting.Budget
    belongs_to :user, Budgeting.User

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:guid, :type, :category, :amount, :description])
    |> validate_required([:guid, :type, :category, :amount])
  end
end
