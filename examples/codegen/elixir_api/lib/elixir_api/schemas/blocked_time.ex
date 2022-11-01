defmodule ElixirApi.BlockedTime do
  use Ecto.Schema
  alias ElixirApi.Employee
  alias ElixirApi.Location

  schema "blocked_times" do
    field :start, :naive_datetime
    field :end, :naive_datetime
    field :note, :string
    field :is_private, :boolean

    belongs_to :employee, Employee
    belongs_to :location, Location

    timestamps()
  end
end
