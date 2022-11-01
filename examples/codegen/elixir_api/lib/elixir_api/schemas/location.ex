defmodule ElixirApi.Location do
  use Ecto.Schema
  alias ElixirApi.BlockedTime

  schema "locations" do
    field :name, :string

    has_many :blocked_times, BlockedTime

    timestamps()
  end
end
