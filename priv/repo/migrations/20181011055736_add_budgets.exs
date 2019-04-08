defmodule Budgeting.Repo.Migrations.AddBudgets do
  use Ecto.Migration

  def change do
    create table(:budgets) do
      add :guid, :string, size: 40
      add :name, :string, null: false
      add :starting_balance, :float, default: 0.0
      add :user_id, references(:users)

      timestamps()
    end
  end
end
