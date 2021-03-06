defmodule Budgeting.Repo.Migrations.AddUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :guid, :string, size: 40
      add :username, :string, null: false
      add :email, :string, null: false
      add :provider, :string, size: 40
      add :token, :string

      timestamps()
    end
  end
end
