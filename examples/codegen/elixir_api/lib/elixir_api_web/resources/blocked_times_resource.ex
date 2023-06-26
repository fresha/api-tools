defmodule ElixirApiWeb.BlockedTimesResource do
  @moduledoc false

  @resource_type "blocked-times"
  use Jabbax.Document
  alias ElixirApiWeb.EmployeesResource
  alias ElixirApiWeb.LocationsResource

  def build(config) do
    %Resource{
      type: @resource_type,
      id: config.id,
      attributes: %{
        start: config.start,
        end: config.end,
        note: config.note,
        is_private: config.is_private,
      },
      relationships:
        %{}
        |> link_relationship(:employee, config.employee)
        |> link_relationship(:location, config.location)
    }
  end

  def link(config) do
    %ResourceId{
      type: @resource_type,
      id: config.id,
    }
  end

  defp link_relationship(relationships, type, nil) do
    Map.put(relationships, type, %Jabbax.Document.Relationship{data: nil})
  end

  defp link_relationship(relationships, :employee, employee) do
    Map.put(relationships, :employee, EmployeesResource.link(employee))
  end

  defp link_relationship(relationships, :location, location) do
    Map.put(relationships, :location, LocationsResource.link(location))
  end
end