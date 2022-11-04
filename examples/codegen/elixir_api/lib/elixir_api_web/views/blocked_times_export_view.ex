defmodule ElixirApiWeb.BlockedTimesExportView do
  @moduledoc false

  use Jabbax.Document
  use ElixirApiWeb, :view

  def render("create.json-api", %{}) do
    # TODO you need to fill in "data", "meta" and "included" fields
    %Document{
      data: [],
      meta: %{},
      included: [],
    }
  end

  def render("show.json-api", %{}) do
    # TODO you need to fill in "data", "meta" and "included" fields
    %Document{
      data: [],
      meta: %{},
      included: [],
    }
  end
end