defmodule ElixirApiWeb.EmployeesResourceTest do
  @moduledoc false

  use ExUnit.Case, async: false
  alias ElixirApiWeb.EmployeesResource

  test "link/1" do
    assert EmployeesResource.link(%{ id: 3525 }) == %Jabbax.Document.ResourceId{
      type: "employees",
      id: 3525,
    }
  end
end