# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     ElixirApi.Repo.insert!(%ElixirApi.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias ElixirApi.Repo
alias ElixirApi.BlockedTime
alias ElixirApi.Location
alias ElixirApi.Employee

inserted_at = ~N[2022-11-01 12:34:56]

location1 = Repo.insert! %Location{
  name: "Eden",
  inserted_at: inserted_at
}
location2 = Repo.insert! %Location{
  name: "Home",
  inserted_at: inserted_at
}

employee1 = Repo.insert! %Employee{
  name: "Adam",
  inserted_at: inserted_at
}
employee2 = Repo.insert! %Employee{
  name: "Eva",
  inserted_at: inserted_at
}

Repo.insert! %BlockedTime{
  start: ~N[2022-10-01 12:00:00],
  end: ~N[2022-10-01 13:00:00],
  note: "lunch",
  is_private: true,
  location_id: location1.id,
  employee_id: employee1.id,
}

Repo.insert! %BlockedTime{
  start: ~N[2022-10-02 12:00:00],
  end: ~N[2022-10-02 13:00:00],
  note: "lunch",
  is_private: true,
  location_id: location1.id,
  employee_id: employee1.id,
}

Repo.insert! %BlockedTime{
  start: ~N[2022-10-03 12:00:00],
  end: ~N[2022-10-03 13:00:00],
  note: "lunch",
  is_private: true,
  location_id: location2.id,
  employee_id: employee2.id,
}

Repo.insert! %BlockedTime{
  start: ~N[2022-10-04 12:00:00],
  end: ~N[2022-10-04 13:00:00],
  note: "lunch",
  is_private: true,
  location_id: location2.id,
  employee_id: employee2.id,
}
