defmodule ElixirApi.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo
  alias ElixirApi.BlockedTime
  alias ElixirApi.Employee
  alias ElixirApi.Location

  def location_factory do
    %Location{
      id: sequence(:location_id, &"#{&1}"),
      name: sequence(:location_name, &"Location #{&1}"),
    }
  end

  def employee_factory do
    %Employee{
      id: sequence(:employee_id, &"#{&1}"),
      name: sequence(:employee_name, &"Employee #{&1}")
    }
  end

  def blocked_time_factory do
    location = build(:location)
    employee = build(:employee)

    %BlockedTime{
      id: sequence(:blocked_times_id, &"#{&1}"),
      start: ~N[2022-10-01 12:00:00],
      end: ~N[2022-10-01 13:00:00],
      note: sequence(:note, &"Blocked times note #{&1}"),
      is_private: true,
      location: location,
      location_id: location.id,
      employee: employee,
      employee_id: employee.id,
    }
  end

  def blocked_times_factory do
    blocked_time_factory()
  end
end
