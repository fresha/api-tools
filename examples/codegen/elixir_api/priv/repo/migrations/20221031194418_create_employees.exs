defmodule ElixirApi.Repo.Migrations.CreateEmployees do
  use Ecto.Migration

  def up do
    create table("employees") do
      add :name, :string
      timestamps()
    end
  end

  def down do
    drop table("employees")
  end
end
