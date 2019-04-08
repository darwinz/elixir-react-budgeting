defmodule Budgeting.Repo.Migrations.AddIndexToTransactionTypes do
  use Ecto.Migration

  def change do
    create unique_index(:transaction_types, [:type])
  end
end
