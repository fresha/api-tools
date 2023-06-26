defmodule ElixirApiWeb.EmployeesResource do
  @moduledoc false

  @resource_type "employees"
  use Jabbax.Document

  def link(config) do
    %ResourceId{
      type: @resource_type,
      id: config.id,
    }
  end
end