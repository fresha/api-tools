#!/usr/bin/env bash

# remove -g option if you want to develop locally
npx -g fresha-openapi-codegen server-elixir \
  --input ../openapi-codegen-test-api.yaml \
  --output ./elixir_api \
  --phoenix-app elixir_api_web \
  --test-factory-module ElixirApi.Factory \
  --json-api \
  --verbose
