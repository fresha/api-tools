defmodule ElixirApiWeb.ErrorView do
  @moduledoc false

  use ElixirApiWeb, :view
  use Jabbax.Document

  def template_not_found(template, _assigns) do
    error_code =
      template
      |> Phoenix.Controller.status_message_from_template()
      |> String.downcase()
      |> String.replace(" ", "_")

    %Document{
      errors: [
        %Error{code: error_code}
      ]
    }
  end

  def render("400.json-api", %{params: params}) do
    %Document{
      errors:
        Enum.map(params, fn {code, parameter} ->
          %Error{
            code: code,
            source: %ErrorSource{
              parameter: parameter
            }
          }
        end)
    }
  end

  def render("400.json-api", %{pointers: pointers}) do
    %Document{
      errors:
        Enum.map(pointers, fn {code, pointer} ->
          %Error{
            code: code,
            source: %ErrorSource{
              pointer: pointer
            }
          }
        end)
    }
  end

  def render("400.json-api", _) do
    %Document{errors: [%Error{code: "400", title: "Bad request"}]}
  end

  def render("404.json-api", _) do
    %Document{errors: [%Error{code: "404", title: "Not found"}]}
  end

  def render("422.json-api", %{reason: reason}) do
    %Document{errors: [%Error{code: "422", title: "Unprocessable entity", detail: reason}]}
  end

  def render("422.json-api", %{changeset: changeset}) do
    Surgex.Changeset.build_errors_document(changeset)
  end
end