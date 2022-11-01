import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :elixir_api, ElixirApi.Repo,
  adapter: Sqlite.Ecto,
  pool: Ecto.Adapters.SQL.Sandbox,
  database: "ecto_simple_test.sqlite3"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :elixir_api, ElixirApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "ZQfDCdWxx53yiDn+M5vqo1JR1TTXgzFemzovQ5rDvNQYSWueaOpY7Ti34FuxJpUL",
  server: false

# In test we don't send emails.
config :elixir_api, ElixirApi.Mailer, adapter: Swoosh.Adapters.Test

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
