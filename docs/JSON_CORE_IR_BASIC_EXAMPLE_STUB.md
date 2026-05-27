# JSON Core IR Basic Example Stub (Planning)

This note captures the converter-facing v0 JSON shape currently expected by `convertJsonCoreIrV0ToObjectScene` for the `basic` vertical slice.

Status:

- illustrative stub only
- not a JSON fixture file
- not validated by JSON Schema
- not a public stable format
- intentionally limited to the `basic` slice

See [JSON_CORE_IR_V0_SHAPE.md](./JSON_CORE_IR_V0_SHAPE.md), [JSON_CORE_IR_BASIC_MAPPING.md](./JSON_CORE_IR_BASIC_MAPPING.md), and [JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md](./JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md) for broader planning context.

## 1. Purpose

The goal of this note is to keep future schema/converter/fixture work aligned with the exact field shape currently accepted by the converter skeleton and exercised in converter tests.

This document is a converter-facing reference, not an implementation artifact.

## 2. Supported Converter Slice

Currently supported by the converter skeleton:

- scene `objects` array
- scene `connectors` array
- object kinds: `group`, `text`, `rect`
- `rightOf` placement (plus `absolute` for the baseline anchor object)
- connector endpoint anchor refs (`from`/`to` with `objectId` and `anchor`)

Not supported yet:

- alignment JSON
- distribution JSON
- JSON Schema validation
- real fixture loading from `.json` files
- parser lowering integration
- public format stability guarantees

## 3. Illustrative JSON Snippet

Compact basic-style scene shape accepted by the converter:

```json
{
  "objects": [
    {
      "id": "A",
      "kind": "group",
      "placement": { "kind": "absolute", "position": { "x": 80, "y": 60 } },
      "children": [
        { "id": "A.label", "kind": "text", "center": { "x": 0, "y": 0 }, "text": "Raw data" },
        {
          "id": "A.frame",
          "kind": "rect",
          "fitToText": { "textId": "A.label", "paddingX": 12, "paddingY": 10 },
          "rx": 6,
          "ry": 6
        }
      ]
    },
    {
      "id": "B",
      "kind": "group",
      "placement": { "kind": "rightOf", "reference": { "objectId": "A", "anchor": "east" }, "gap": 90 },
      "children": [
        { "id": "B.label", "kind": "text", "center": { "x": 0, "y": 0 }, "text": "Clean" },
        {
          "id": "B.frame",
          "kind": "rect",
          "fitToText": { "textId": "B.label", "paddingX": 12, "paddingY": 10 },
          "rx": 6,
          "ry": 6
        }
      ]
    }
  ],
  "connectors": [
    {
      "kind": "connector",
      "id": "edge-1",
      "from": { "objectId": "A", "anchor": "east" },
      "to": { "objectId": "B", "anchor": "west" }
    }
  ]
}
```

## 4. Relationship to Converter Tests

Current converter tests keep JSON scene payloads inline in TypeScript code and convert them directly, then compare the converted scene against the TypeScript `basic` example at structural and semantic levels.

This document is not tested directly and does not replace test assertions.

## 5. Future Path

This stub can later guide:

1. a real JSON fixture
2. a JSON Schema-oriented test
3. a converter conformance test for JSON-to-`ObjectScene`

None of the above are implemented in this pass.