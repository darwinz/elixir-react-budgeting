defmodule Budgeting.Repo.Migrations.AddTransactionTypes do
  use Ecto.Migration

  def change do
    create table(:transaction_types) do
      add :guid, :string, size: 40
      add :type, :string
    end
  end
end
