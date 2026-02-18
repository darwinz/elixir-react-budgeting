# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs

alias Budgeting.{Repo, TransactionType, Category}

# Insert only if not already present
for type <- ["expense", "income"] do
  unless Repo.get_by(TransactionType, type: type) do
    Repo.insert!(%TransactionType{guid: Ecto.UUID.generate(), type: type})
  end
end

categories = [
  "Auto/Transport", "Utilities", "Home", "Personal Care", "Food/Dining",
  "Insurance", "Clothing", "Travel", "Savings", "Education",
  "Entertainment", "Other Expense", "Paycheck", "Other Income"
]

for name <- categories do
  unless Repo.get_by(Category, name: name) do
    Repo.insert!(%Category{guid: Ecto.UUID.generate(), name: name})
  end
end
