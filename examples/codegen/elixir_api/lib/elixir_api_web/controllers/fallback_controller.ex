defmodule ElixirApiWeb.FallbackController do
  @moduledoc false

  use ElixirApiWeb, :controller
  alias ElixirApiWeb.ErrorView

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(ErrorView)
    |> render(:"400")
  end

  def call(conn, {:error, :bad_request, code}) when is_atom(code) do
    conn
    |> put_status(:bad_request)
    |> put_view(ErrorView)
    |> render(:"400", code: Atom.to_string(code))
  end

  def call(conn, {:error, :invalid_parameters, params}) when is_list(params) do
    conn
    |> put_status(:bad_request)
    |> put_view(ErrorView)
    |> render(:"400", params: params)
  end

  def call(conn, {:error, :invalid_pointers, pointers}) when is_list(pointers) do
    conn
    |> put_status(:bad_request)
    |> put_view(ErrorView)
    |> render(:"400", pointers: pointers)
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ErrorView)
    |> render(:"401")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(ErrorView)
    |> render(:"403")
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(ErrorView)
    |> render(:"404")
  end

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", changeset: changeset)
  end

  def call(conn, {:error, :validation_failed}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422")
  end

  def call(conn, {:error, :unprocessable_entity}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422")
  end

  def call(conn, {:error, :conflict}) do
    conn
    |> put_status(:conflict)
    |> put_view(ErrorView)
    |> render(:"409")
  end

  def call(conn, {:error, :not_available}) do
    conn
    |> put_status(:service_unavailable)
    |> put_view(ErrorView)
    |> render(:"503")
  end
end