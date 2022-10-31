defmodule ElixirApiWeb.PageController do
  use ElixirApiWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
