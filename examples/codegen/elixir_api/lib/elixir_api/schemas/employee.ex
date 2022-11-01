defmodule ElixirApi.Employee do
  use Ecto.Schema
  alias ElixirApi.BlockedTime

  schema "employees" do
    field :name, :string

    has_many :blocked_times, BlockedTime

    timestamps()
  end
end
