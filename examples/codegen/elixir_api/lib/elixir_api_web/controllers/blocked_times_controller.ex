defmodule ElixirApiWeb.BlockedTimesController do
  @moduledoc false

  use ElixirApiWeb, :controller

  action_fallback(ElixirApiWeb.FallbackController)

  # add aliases here

  def index(conn, params) do
    with {:ok, date_from, date_to, location_id, employee_ids} <- parse_index_params(params) do
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

  defp parse_index_params(params) do
    flat_parse(
      params,
      date_from: [:date, :required],
      date_to: :date,
      location_id: [:string, :required],
      employee_ids: :id_list,
    )
  end

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
        note: :string,
        is_private: :boolean,
      },
      relationships: %{
        employee: [:resource_id, :required],
        location: [:resource_id, :required],
      },
    )
  end

  def update(conn, params) do
    with {:ok, id} <- parse_update_params(params),
         {:ok, parsed_opts} <- parse_update_conn(conn) do
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

  defp parse_update_params(params) do
    flat_parse(
      params,
      id: [:id, :required],
    )
  end

  defp parse_update_conn(conn) do
    parse(
      conn.assigns[:doc],
      id: [:id, :required],
      attributes: %{
        start: [&naive_date_time/1, :required],
        end: [&naive_date_time/1, :required],
        note: :string,
        is_private: :boolean,
      },
      relationships: %{
        employee: :resource_id,
      },
    )
  end

  def delete(conn, params) do
    with {:ok, id} <- parse_delete_params(params) do
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

  defp parse_delete_params(params) do
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