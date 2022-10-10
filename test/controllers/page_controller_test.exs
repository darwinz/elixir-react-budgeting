defmodule Budgeting.PageControllerTest do
  use Budgeting.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n    <title>My Budgeting App</title>\n    <link rel=\"stylesheet\" href=\"/css/app.css\">\n    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css\">\n    <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/icon?family=Material+Icons\">\n    <script>\n    </script>\n  </head>\n\n  <body>\n    <nav class=\"light-blue\">\n      <div class=\"nav-wrapper container\">\n        <a href=\"/\" class=\"brand-logo\">\n          <i class=\"large material-icons\">attach_money</i> Budgets\n        </a>\n        <ul class=\"right\">\n            <!-- <li>\n            </li> -->\n            <li>\n<a href=\"/auth/github\">Sign in with Github</a>            </li>\n        </ul>\n      </div>\n    </nav>\n\n    <div class=\"container\">\n\n      <p class=\"alert alert-info\" role=\"alert\"></p>\n      <p class=\"alert alert-danger\" role=\"alert\"></p>\n\n      <main role=\"main\">\n<div class=\"jumbotron\">\n  <h2>Welcome to My Budgeting App</h2>\n  <p class=\"lead\">A simple budgeting tool for recording income and expenses</p>\n</div>\n\n      </main>\n\n    </div> <!-- /container -->\n    <script src=\"/js/app.js\"></script>\n  </body>\n</html>\n"
  end
end
