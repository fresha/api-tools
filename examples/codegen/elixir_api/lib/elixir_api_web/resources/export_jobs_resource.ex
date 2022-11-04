defmodule ElixirApiWeb.ExportJobsResource do
  @moduledoc false

  @resource_type "export-jobs"
  use Jabbax.Document

  def build(config) do
    %Resource{
      type: @resource_type,
      id: config.id,
      attributes: %{
        status: config.status,
        download_link: config.download_link,
      },
    }
  end

  def link(config) do
    %ResourceId{
      type: @resource_type,
      id: config.id,
    }
  end
end