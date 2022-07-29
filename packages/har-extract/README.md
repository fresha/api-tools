# @fresha/har-extract

Contains CLI utilities for working with HAR files.

## Installation

```bash
npm install @fresha/har-extract
```

## fresha-har-extract

This command parses HAR files and extracts structure of JSON:API requests and responses.
The output is written in tree-like form to specified file.

```bash
npx fresha-har-extract file1.har file2.har ... -o structure.json
```

Output data is structured as a 2-level map:

```json5
{
  "www.example.com": {
    "/path1": [
      {
        "url": {
          "host": "www.example.com",
          "pathname": "/path1",
          "searchParams": [
            "p1",
            "p2"
          ]
        },
        "request": null,
        "response": {
          // high-level representation of JSON:API response document
          // we're mostly interested in resource types here, because
          // exact response structure is defined by resources themselves
          "data": "resource-type",
          "included": [
            "included-type",
          ],
        },
      },
    ],
    "path2": [
      // entries for /path2
    ]
  },
  "another.example.com": {
    // map of entries for this host
  },
}
```

In the future, this command will be extended to support plain JSON payloads, as well as host/path
filtering.
