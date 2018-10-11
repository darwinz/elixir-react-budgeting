defmodule Budgeting.Repo.Migrations.AddTransactions do
  use Ecto.Migration

  def change do
    create table(:transactions) do
      add :guid, :string, size: 40
      add :type, :string, size: 40
      add :category, :string, size: 50
      add :amount, :float
      add :description, :text
      add :budget_id, references(:budgets)
      add :user_id, references(:users)

      timestamps()
    end
  end
end
