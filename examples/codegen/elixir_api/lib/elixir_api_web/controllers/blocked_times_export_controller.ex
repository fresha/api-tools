defmodule ElixirApiWeb.BlockedTimesExportController do
  @moduledoc false

  use ElixirApiWeb, :controller

  action_fallback(ElixirApiWeb.FallbackController)

  # add aliases here

  def create(conn, _params) do
    with {:ok, parsed_opts} <- parse_create_conn(conn) do
      # TODO this is the part you need to implement by yourself
      # TODO evaluate extra arguments, then pass them to render()
      render(conn)
    else
      {:error, :invalid_parameters, params} ->
        {:error, :invalid_parameters, params}

      {:error, :invalid_pointers, pointers} ->
        {:error, :invalid_parameters, pointers}
    end
  end

  defp parse_create_conn(conn) do
    parse(
      conn.assigns[:doc],
      id: [:id, :required],
      attributes: %{
        start: [&naive_date_time/1, :required],
        end: [&naive_date_time/1, :required],
      },
      relationships: %{
      },
    )
  end

  def show(conn, params) do
    with {:ok, id} <- parse_show_params(params) do
      # TODO this is the part you need to implement by yourself
      # TODO evaluate extra arguments, then pass them to render()
      render(conn)
    else
      {:error, :invalid_parameters, params} ->
        {:error, :invalid_parameters, params}

      {:error, :invalid_pointers, pointers} ->
        {:error, :invalid_parameters, pointers}

      {:error, :not_found} ->
        {:error, :not_found}
    end
  end

  defp parse_show_params(params) do
    flat_parse(
      params,
      id: [:id, :required],
    )
  end

  defp naive_date_time(nil), do: {:error, :invalid_date_time}

  defp naive_date_time(input) do
    case NaiveDateTime.from_iso8601(input) do
      {:ok, date_time} -> {:ok, date_time}
      {:error, _} -> {:error, :invalid_date_time}
    end
  end
end