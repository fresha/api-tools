defmodule ElixirApi.Queries.BlockedTimesQuery do
  import Ecto.Query
  alias ElixirApi.BlockedTime
  alias ElixirApi.Repo

  def fetch_all do
    Repo.all(
      from(
        bt in BlockedTime,
        preload: [:employee, :location]
      )
    )
  end
end
