defmodule ElixirApiWeb.LocationsResource do
  @moduledoc false

  @resource_type "locations"
  use Jabbax.Document

  def link(config) do
    %ResourceId{
      type: @resource_type,
      id: config.id,
    }
  end
end