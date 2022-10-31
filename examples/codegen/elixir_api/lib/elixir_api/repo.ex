defmodule ElixirApi.Repo do
  use Ecto.Repo,
    otp_app: :elixir_api,
    adapter: Ecto.Adapters.SQLite3
end
