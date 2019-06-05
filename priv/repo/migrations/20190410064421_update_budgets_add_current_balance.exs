defmodule Budgeting.Repo.Migrations.UpdateBudgetsAddCurrentBalance do
  use Ecto.Migration

  def change do
    alter table(:budgets) do
      add :current_balance, :float, default: 0.0
    end
  end
end
