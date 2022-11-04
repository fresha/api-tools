defmodule ElixirApiWeb.LocationsResourceTest do
  @moduledoc false

  use ExUnit.Case, async: false
  alias ElixirApiWeb.LocationsResource

  test "link/1" do
    assert LocationsResource.link(%{ id: 3525 }) == %Jabbax.Document.ResourceId{
      type: "locations",
      id: 3525,
    }
  end
end