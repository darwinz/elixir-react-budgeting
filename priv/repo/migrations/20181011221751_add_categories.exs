defmodule Budgeting.Repo.Migrations.AddCategories do
  use Ecto.Migration

  def change do
    create table(:categories) do
      add :guid, :string, size: 40
      add :name, :string
    end
  end
end
