defmodule ElixirApiWeb.BlockedTimesResourceTest do
  @moduledoc false

  use ExUnit.Case, async: false
  import ElixirApi.Factory
  alias ElixirApiWeb.BlockedTimesResource

  test "build/1" do
    config = build(
      :blocked_times,
      id: 884,
      start: "2022-10-28T21:41:55.404Z",
      end: "2022-10-28T14:50:02.790Z",
      note: "iste",
      is_private: false,
      employee_id: true,
      location_id: true,
    )

    assert BlockedTimesResource.build(config) == %Jabbax.Document.Resource{
      type: "blocked-times",
      id: 884,
      attributes: %{
        start: "2022-10-28T21:41:55.404Z",
        end: "2022-10-28T14:50:02.790Z",
        note: "iste",
        is_private: false,
      },
      relationships: %{
        employee: %Jabbax.Document.ResourceId{id: config.employee.id, type: "employees"},
        location: %Jabbax.Document.ResourceId{id: config.location.id, type: "locations"},
      },
    }
  end

  test "link/1" do
    assert BlockedTimesResource.link(%{ id: 3525 }) == %Jabbax.Document.ResourceId{
      type: "blocked-times",
      id: 3525,
    }
  end
end