defmodule ElixirApi.Repo.Migrations.CreateLocations do
  use Ecto.Migration

  def up do
    create table("locations") do
      add :name, :string
      timestamps()
    end
  end

  def down do
    drop table("locations")
  end
end
