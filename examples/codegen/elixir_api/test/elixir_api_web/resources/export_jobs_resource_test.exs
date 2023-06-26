defmodule ElixirApiWeb.ExportJobsResourceTest do
  @moduledoc false

  use ExUnit.Case, async: false
  import ElixirApi.Factory
  alias ElixirApiWeb.ExportJobsResource

  test "build/1" do
    config = build(
      :export_jobs,
      id: 884,
      status: "dolores",
      download_link: "consequuntur",
    )

    assert ExportJobsResource.build(config) == %Jabbax.Document.Resource{
      type: "export-jobs",
      id: 884,
      attributes: %{
        status: "dolores",
        download_link: "consequuntur",
      },
      relationships: %{},
    }
  end

  test "link/1" do
    assert ExportJobsResource.link(%{ id: 3525 }) == %Jabbax.Document.ResourceId{
      type: "export-jobs",
      id: 3525,
    }
  end
end