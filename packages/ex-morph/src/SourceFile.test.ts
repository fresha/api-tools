import { Project } from './Project';
import { poorMansElixirFormat } from './testHelpers';

test('code writing', () => {
  const sourceFile = new Project({
    useInMemoryFileSystem: true,
    rootDir: '/',
    phoenixApp: 'web',
  }).createSourceFile('test.ex');

  sourceFile.writeDefmodule('ShopkeeperWeb.BasketController', () => {
    sourceFile.writeUse('ShopkeeperWeb', ':controller');
    sourceFile.writeAliases(
      'Shopkeeper.Actions.Storefront',
      'ShopkeeperWeb.Helpers.StorefrontSession',
    );

    sourceFile.writeFunction({
      name: 'index',
      params: ['conn', 'params'],
      content: () => {
        sourceFile.writeWith(
          [
            '{:ok, shop_slug} <- parse_params(params)',
            '{:ok, shop} <- Shopkeeper.Shops.impl().get_by_slug(shop_slug)',
          ],
          () => {
            sourceFile.writeLines(
              'categories = Shopkeeper.Catalog.impl().list_storefront_categories(shop)',
              'render(conn, %{categories: categories})',
            );
          },
          () => {
            sourceFile.writeMappings({
              '{:error, :invalid_parameters, params}': '{:error, :invalid_parameters, params}',
              '{:error, :not_found}': '{:error, :not_found}',
            });
          },
        );
      },
    });

    sourceFile.writeFunction({
      isPrivate: true,
      name: 'parse_index_params',
      params: ['params'],
      content: () => {
        sourceFile.writeLine('flat_parse(params, shop_slug: [:string, :required])');
      },
    });
  });

  expect(sourceFile.getText()).toBe(
    poorMansElixirFormat(`
      defmodule ShopkeeperWeb.BasketController do
        @moduledoc false

        use ShopkeeperWeb, :controller
        alias Shopkeeper.Actions.Storefront
        alias ShopkeeperWeb.Helpers.StorefrontSession

        def index(conn, params) do
          with {:ok, shop_slug} <- parse_params(params),
               {:ok, shop} <- Shopkeeper.Shops.impl().get_by_slug(shop_slug) do
            categories = Shopkeeper.Catalog.impl().list_storefront_categories(shop)
            render(conn, %{categories: categories})
          else
            {:error, :invalid_parameters, params} ->
              {:error, :invalid_parameters, params}

            {:error, :not_found} ->
              {:error, :not_found}
          end
        end

        defp parse_index_params(params) do
          flat_parse(params, shop_slug: [:string, :required])
        end
      end
    `),
  );
});
