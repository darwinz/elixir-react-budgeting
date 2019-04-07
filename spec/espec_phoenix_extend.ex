defmodule ESpec.Phoenix.Extend do
  def model do
    quote do
      alias Budgeting.Repo
    end
  end

  def controller do
    quote do
      alias Budgeting
      import Budgeting.Router.Helpers

      @endpoint Budgeting.Endpoint
    end
  end

  def view do
    quote do
      import Budgeting.Router.Helpers
    end
  end

  def channel do
    quote do
      alias Budgeting.Repo

      @endpoint Budgeting.Endpoint
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
