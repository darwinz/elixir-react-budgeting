defmodule Budgeting.UserRepoSpec do
  use ESpec.Phoenix, model: User, async: true
  alias Budgeting.User

  @valid_attrs %{name: "Testing", username: "test"}

  describe "converting unique_constraint on username to error" do
    before do: Repo.insert(username: "brandon", email: "test@testing.com")
    let :changeset do
      attrs = Map.put(@valid_attrs, :username, "brandon", email: "test@other.com", provider: "github", token: "abcdefghk")
      User.changeset(%User{}, attrs)
    end

    it do: expect(Repo.insert(changeset)).to be_error_result

    context "when username has already been taken" do
      let :new_changeset do
        {:error, changeset} = Repo.insert(changeset)
        changeset
      end

      it "has error" do
        error = {:username, {"has already been taken", []}}
        expect(new_changeset.errors).to have(error)
      end
    end
  end
end