# ElixirApi

This is Elixir/Phoenix application for testing / evaluation code generators.

It uses fairly standard Elixir stack for Elixir apps:

- [Phoenix](https://hex.pm/packages/phoenix) as a web framework
- [Ecto](https://hexdocs.pm/ecto/Ecto.html) for persistence
- [SQLite 3](https://hex.pm/packages/ecto_sqlite3) as a database
- JSON:API-compliant requests / responses
  - [Surgex](https://hexdocs.pm/surgex/readme.html) parsers for deserializing validating requests
  - [Jabbax](https://hex.pm/packages/jabbax) for formatting responses
- [ex_machina](https://hex.pm/packages/ex_machina) for test support

## Structure

There're three Ecto schemas, representing small domain of managing blocked (busy) times.
The domain matches with the domain of OpenAPI schema used for testing code generators.

Most important files / folders:

- `lib/elixir_api/schemas` - Ecto schemas
- `lib/elixir_api/queries` - Ecto query to fetch all blocked times
- `priv/repo/seeds.exs` - seeding data
- `test/support/factory.ex` - ex_machina test factory for Ecto schemas

## Generating code

TBD.

## Running

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
