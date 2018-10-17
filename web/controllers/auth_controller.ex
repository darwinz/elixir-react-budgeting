require IEx

defmodule Budgeting.AuthController do
  use Budgeting.Web, :controller
  plug Ueberauth

  alias Budgeting.User

  def request(conn, _params) do
    render(conn, "request.html", callback_url: Helpers.callback_url(conn))
  end

  def callback(%{assigns: %{ueberauth_auth: auth}} = conn, params) do
    username = auth.info.email
    if Atom.to_string(auth.provider) == "github" do
      username = auth.extra.raw_info.user["login"]
    end

    user_params = %{
      username: username,
      token: auth.credentials.token,
      email: auth.info.email,
      provider: Atom.to_string(auth.provider)
    }

    changeset = User.changeset(%User{}, user_params)

    signin(conn, changeset)
  end

  def signout(conn, _params) do
    conn
    |> configure_session(drop: true)
    |> redirect(to: page_path(conn, :index))
  end

  defp signin(conn, changeset) do
    case insert_or_update_user(changeset) do
      {:ok, user} ->
        conn
        |> put_flash(:info, "Welcome #{user.username}")
        |> put_session(:user_id, user.id)
        |> redirect(to: budget_path(conn, :index))
      {:error, _reason} ->
        conn
        |> put_flash(:error, "Error signing in")
        |> redirect(to: budget_path(conn, :index))
    end
  end

  defp insert_or_update_user(changeset) do
    case Repo.get_by(User, email: changeset.changes.email) do
      nil ->
        Repo.insert(changeset)
      user ->
        {:ok, user}
    end
  end
end

