defmodule Budgeting.Repo.Migrations.AddBudgets do
  use Ecto.Migration

  def change do
    create table(:budgets) do
      add :guid, :string, size: 40
      add :name, :string
      add :starting_balance, :float
      add :user_id, references(:users)

      timestamps()
    end
  end
end
