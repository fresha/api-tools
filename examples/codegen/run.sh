#!/usr/bin/env bash

npx fresha-openapi-codegen server-elixir \
  --input ../openapi-codegen-test-api.yaml \
  --output ./elixir_api \
  --phoenix-app elixir_api_web \
  --test-factory-module ElixirApi.Factory \
  --json-api \
  --verbose
