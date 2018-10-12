# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Budgeting.Repo.insert!(%Budgeting.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Budgeting.{Repo, TransactionType, Category}

Repo.insert %TransactionType{ guid: Ecto.UUID.generate, type: "income" }
Repo.insert %TransactionType{ guid: Ecto.UUID.generate, type: "expense" }

Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Paycheck" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Other Income" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Auto & Transport" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Utilities" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Home" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Personal Care" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Food & Dining" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Insurance" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Clothing" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Travel" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Savings" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Education" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Entertainment" }
Repo.insert %Category{ guid: Ecto.UUID.generate, name: "Other Expense" }
