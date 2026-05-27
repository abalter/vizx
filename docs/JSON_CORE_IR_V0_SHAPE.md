# JSON Core IR v0 Shape (Planning)

This document proposes a minimal v0 JSON shape for future Core IR fixture/schema work.

Status:

- planning only
- not an implemented format
- not an executable JSON Schema
- not a public stability guarantee

See [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for current effective Core IR contracts.
See [JSON_CORE_IR_SCHEMA_PLAN.md](./JSON_CORE_IR_SCHEMA_PLAN.md) for broader schema-planning context.
See [JSON_CORE_IR_BASIC_MAPPING.md](./JSON_CORE_IR_BASIC_MAPPING.md) for strict field-by-field mapping from proposed v0 JSON keys to current `ObjectScene` fields for `basic`.
See [JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md](./JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md) for pass/fail acceptance checks derived from the v0 shape and basic mapping notes.

## 1. Purpose

This v0 note defines the smallest JSON shape that can represent one real end-to-end scene in the current pipeline.

Intent:

- provide a concrete target for future schema and fixture work
- keep scope narrow and testable
- avoid over-design before validation/tooling choices are made

Non-intent:

- defining a production-ready or stable public interchange spec
- replacing parser syntax discussions

## 2. Baseline Example

Baseline example id:

- `basic`

Why `basic` is the correct vertical slice:

- uses grouped labeled objects (`group` with `text` + `rect` children)
- uses implemented placement (`absolute` and `rightOf`)
- uses connectors with anchor refs
- already passes resolve, inspect, debug-overlay, and SVG render paths in current tests/CLI

This keeps v0 grounded in behavior that exists now.

## 3. Minimal Scene Shape (v0)

For the `basic` baseline, the scene payload only needs:

- `objects` array (required)
- `connectors` array (required for this baseline fixture)
- `distribution` omitted (not used by `basic`)

No scene metadata is required by current `ObjectScene`; optional metadata can be outside runtime payload if introduced later.

Illustrative minimal top-level shape:

```json
{
  "objects": [
    { "id": "A", "kind": "group", "children": [], "placement": { "kind": "absolute", "position": { "x": 80, "y": 60 } } }
  ],
  "connectors": [
    { "kind": "connector", "id": "edge-1", "from": { "objectId": "A", "anchor": "east" }, "to": { "objectId": "B", "anchor": "west" } }
  ]
}
```

## 4. Minimal Object Shape (v0 for `basic`)

v0 object shape should follow current Core IR names where possible.

### 4.1 Group object for labeled box container

Required for `basic`:

- `id`
- `kind = group`
- `placement` (`absolute` or `rightOf`)
- `children` array

Illustrative shape:

```json
{
  "id": "A",
  "kind": "group",
  "placement": {
    "kind": "absolute",
    "position": { "x": 80, "y": 60 }
  },
  "children": [
    { "id": "A.label", "kind": "text", "center": { "x": 0, "y": 0 }, "text": "Raw data" },
    { "id": "A.frame", "kind": "rect", "fitToText": { "textId": "A.label", "paddingX": 12, "paddingY": 10 }, "rx": 6, "ry": 6 }
  ]
}
```

### 4.2 Text child (minimal)

Required fields for baseline:

- `id`
- `kind = text`
- `center`
- `text`

### 4.3 Rect child (minimal)

Required fields for baseline:

- `id`
- `kind = rect`
- `fitToText` with `textId`, `paddingX`, `paddingY`
- optional rounded corners (`rx`, `ry`) used by current examples

### 4.4 Style fields

For `basic`, style fields can be omitted from fixture data because defaults are currently applied by resolver/runtime pipeline.

If style is present, it should map to current optional `style` slots on objects/connectors without changing resolver semantics.

## 5. Minimal Connector Shape (v0)

For `basic`, connector entries need:

- `kind = connector`
- `id`
- `from` anchor ref (`objectId`, `anchor`)
- `to` anchor ref (`objectId`, `anchor`)

Illustrative shape:

```json
{
  "kind": "connector",
  "id": "edge-1",
  "from": { "objectId": "A", "anchor": "east" },
  "to": { "objectId": "B", "anchor": "west" }
}
```

## 6. Placement Mapping for `rightOf`

In current Core IR, relative placement is encoded as:

- `kind` relation name (`rightOf`)
- `reference` anchor ref (`objectId`, `anchor`)
- `gap`

There is no explicit `targetAnchor` field in `ObjectPlacement`; target-anchor semantics are determined by resolver relation behavior.

Illustrative `rightOf` mapping from `basic`:

```json
{
  "kind": "rightOf",
  "reference": { "objectId": "A", "anchor": "east" },
  "gap": 90
}
```

## 7. Future Conversion to ObjectScene

Planned flow:

JSON fixture
  -> validate shape
  -> convert to `ObjectScene`
  -> resolve normally

Important constraint:

- JSON conversion must not bypass resolver behavior
- placement/connector semantics remain owned by resolver passes, not pre-resolved by fixture conversion

## 8. Explicitly Out of Scope

This v0 shape note defers:

- executable JSON Schema
- validator library choice
- JSON fixture files in repo
- full coverage of all object kinds and advanced fields
- alignment/distribution JSON shape details
- parser syntax work
- parser lowering implementation/tests
- round-trip serialization/pretty-printing
- public format stability/version guarantees

## 9. v0 Coverage Boundary

v0 is intentionally defined as "enough to model `basic`".

Expansion beyond this (alignment/distribution/styles breadth/metadata conventions) should be incremental and validated against existing TypeScript references.
