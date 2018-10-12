defmodule Budgeting.Category do
  use Budgeting.Web, :model

  schema "categories" do
    field :guid, :string
    field :name, :string
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name])
    |> validate_required([:name])
  end
end
