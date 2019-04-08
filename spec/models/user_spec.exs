defmodule Budgeting.UserSpec do
  use ESpec.Phoenix, model: User, async: true
  alias Budgeting.User

  @valid_attrs %{
    guid: "abcdef0123456789",
    username: "test",
    email: "test@tester.com",
    provider: "GitHub",
    token: "abcdefghijklmnop"
  }
  @invalid_attrs %{}

  context "validation" do
    it "checks changeset with valid attributes" do
      changeset = User.changeset(%User{}, @valid_attrs)
      assert changeset.valid?
    end
  end
end