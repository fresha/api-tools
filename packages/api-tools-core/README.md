# @fresha/api-tools-core

This package contains shared type definitions, functions and classes used in
other `api-tools` packages.

## Installation

```bash
$ npm install @fresha/api-tools-core
```

## Usage example

```ts
import type { JSONRef } from '@fresha/api-tools-core';

const ref: JSONRef = { $ref: '#/components' };
```

## Types

Below is a list of types. For their descriptions, please consult `src/types.ts`.

- `Nullable<T>`
- `CommonMarkString`
- `URLString`
- `ParametrisedURLString`
- `EmailString`
- `VersionString`
- `DateTimeString`
- `MIMETypeString`
- `HTTPMethod`
- `HTTPStatusCode`

- `JSONPrimitive`
- `JSONValue`
- `JSONArray`
- `JSONObject`
- `JSONObjectRecord`
- `JSONObjectArray`
- `JSONPointerString`

- `JSONRef`
- `ObjectOrRef<T>`

- `JSONAPIMeta`
- `JSONAPILink`
- `JSONAPIResourceID`
- `JSONAPIResourceRelationship`
- `JSONAPIServerResource`
- `JSONAPIClientResource`
- `JSONAPIResource`
- `JSONAPIImplementationInfo`
- `JSONAPITopLevelLinks`
- `JSONAPIDataDocument`
- `JSONAPIError`
- `JSONAPIErrorDocument`
- `JSONAPIDocument`

- `Disposable`

## Type guards

Below is a list of guard names. For more information, please read `src/typeGuards.ts`.

- `isJSONObject`
- `isJSONValueArray`
- `isJSONRef`
- `isJSONAPIDataDocument`
- `isJSONAPIErrorDocument`

## Miscellaneous functions

- `transformKeysDeep`
- `camelCase`
- `camelCaseDeep`
- `kebabCase`
- `kebabCaseDeep`
