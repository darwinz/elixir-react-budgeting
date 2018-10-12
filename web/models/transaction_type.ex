defmodule Budgeting.TransactionType do
  use Budgeting.Web, :model

  schema "transaction_types" do
    field :guid, :string
    field :type, :string
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:type])
    |> validate_required([:type])
  end
end
