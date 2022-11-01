defmodule ElixirApi.Repo.Migrations.CreateBlockedTimes do
  use Ecto.Migration

  def up do
    create table("blocked_times") do
      add :start, :naive_datetime
      add :end, :naive_datetime
      add :note, :string
      add :is_private, :boolean
      add :location_id, references("locations"), type: :integer
      add :employee_id, references("employees"), type: :integer

      timestamps()
    end
  end

  def down do
    drop table("blocked_times")
  end
end
