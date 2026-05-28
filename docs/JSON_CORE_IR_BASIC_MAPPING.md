# JSON Core IR Basic Mapping (Planning)

This document defines a strict field-by-field mapping from the proposed v0 JSON shape to current `ObjectScene`/Core IR fields for the `basic` example only.

Status:

- planning only
- not an executable JSON Schema
- not a JSON fixture file
- not a parser-lowering contract
- not a public stability guarantee
- committed JSON fixtures now exist separately for `basic`, `relative-placement`, `alignment-family`, `distribute-x`, and `distribute-y`; this document remains intentionally `basic`-only

See [JSON_CORE_IR_V0_SHAPE.md](./JSON_CORE_IR_V0_SHAPE.md) for the v0 shape proposal, [JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md](./JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md) for pass/fail acceptance checks, [JSON_CORE_IR_BASIC_EXAMPLE_STUB.md](./JSON_CORE_IR_BASIC_EXAMPLE_STUB.md) for a converter-facing inline JSON stub, and [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for the current runtime contract.

## 1. Purpose

The goal is to make future schema drafting mechanical by mapping each JSON key in the `basic` baseline shape to current TypeScript Core IR fields (`ObjectScene`, `DrawableObject`, `ConnectorObject`, and placement/anchor contracts).

This document is intentionally narrow:

- baseline: `basic`
- mapping target: current object-model contracts
- not a full inventory of current converter coverage

## 2. Scene-Level Mapping Table

`basic` scene shape is represented by `ObjectScene` with `objects` and `connectors`.

| JSON field | Required? (`basic` v0) | Maps to `ObjectScene` field | Type / expected shape | Notes |
| --- | --- | --- | --- | --- |
| `objects` | Yes | `objects` | array of drawable object entries | Required top-level ordered list. |
| `connectors` | Yes (for `basic`) | `connectors` | array of connector entries | Optional in runtime type, but present in `basic`. |
| `distribution` | No (omitted) | `distribution` | array of distribution ops | Not used by `basic`; omitted in v0 baseline mapping. |
| `sceneId` (if introduced later) | No | n/a | string | Not part of current `ObjectScene`; keep outside runtime payload if present. |

## 3. Object Mapping Table (`basic` kinds only)

`basic` uses `group` objects with `text` and `rect` children.

| JSON field | Required? (`basic` v0) | Maps to Core IR field | Type / expected shape | Notes |
| --- | --- | --- | --- | --- |
| `id` (group) | Yes | `BaseObject.id` | string | Unique id expected semantically. |
| `kind` (group) | Yes | `GroupObject.kind` | literal `group` | Must map to known object kind. |
| `placement` (group) | Yes | `BaseObject.placement` | placement object | `basic` uses `absolute` for `A`; `rightOf` for `B`, `C`. |
| `children` (group) | Yes | `GroupObject.children` | array of drawable objects | Child order preserved. |
| `style` (group) | No | `BaseObject.style` | style object | Omitted in `basic`; defaults/render behavior remain unchanged. |
| `transform` (group) | No | `BaseObject.transform` | transform object | Omitted in `basic`. |
| `align` (group) | No | `BaseObject.align` | alignment object | Omitted in `basic`. |
| `id` (text child) | Yes | `TextObject.id` | string | Example: `A.label`. |
| `kind` (text child) | Yes | `TextObject.kind` | literal `text` | Known object kind. |
| `center` (text child) | Yes | `TextObject.center` | `{ x: number, y: number }` | `basic` child text centers are `{0,0}` before group placement translation. |
| `text` (text child) | Yes | `TextObject.text` | string | Label payload. |
| `style` (text child) | No | `BaseObject.style` | style object | Omitted in `basic`; resolver applies defaults as needed. |
| `id` (rect child) | Yes | `RectObject.id` | string | Example: `A.frame`. |
| `kind` (rect child) | Yes | `RectObject.kind` | literal `rect` | Known object kind. |
| `fitToText` (rect child) | Yes (`basic`) | `RectObject.fitToText` | `{ textId: string, paddingX: number, paddingY: number }` | Drives rect sizing from sibling text metrics. |
| `rx` / `ry` (rect child) | Yes in current `basic` fixture values | `RectObject.rx` / `RectObject.ry` | number | Rounded corner parameters used by current helper. |
| `center` / `width` / `height` (rect child) | No for current `basic` shape | `RectObject.center` / `width` / `height` | numeric geometry fields | Not required when `fitToText` is used in this baseline. |
| `style` (rect child) | No | `BaseObject.style` | style object | Omitted in `basic`; runtime defaults are used. |

## 4. Placement Mapping Table (`rightOf` in `basic`)

`basic` uses current `ObjectPlacement` fields directly.

| JSON field | Required? (`rightOf`) | Maps to Core IR field | Type / expected shape | Notes |
| --- | --- | --- | --- | --- |
| `placement.kind` | Yes | `RelativePlacement.kind` | literal `rightOf` | Relation name must be a known placement relation. |
| `placement.reference.objectId` | Yes | `RelativePlacement.reference.objectId` | string | Example: `A` for object `B`. |
| `placement.reference.anchor` | Yes | `RelativePlacement.reference.anchor` | anchor enum value | Example: `east`. |
| `placement.gap` | Yes | `RelativePlacement.gap` | number | Example: `90` in `basic`. |
| `placement.targetAnchor` | No (not used) | n/a | n/a | Target anchor is inferred by resolver relation semantics (`rightOf` implies target `west` alignment). |

For completeness, `A` in `basic` uses absolute placement:

| JSON field | Required? (`absolute`) | Maps to Core IR field | Type / expected shape | Notes |
| --- | --- | --- | --- | --- |
| `placement.kind` | Yes | `AbsolutePlacement.kind` | literal `absolute` | Known placement variant. |
| `placement.position.x` | Yes | `AbsolutePlacement.position.x` | number | Scene-space translation contribution. |
| `placement.position.y` | Yes | `AbsolutePlacement.position.y` | number | Scene-space translation contribution. |

## 5. Connector Mapping Table

| JSON field | Required? (`basic` v0) | Maps to Core IR field | Type / expected shape | Notes |
| --- | --- | --- | --- | --- |
| `kind` | Yes | `ConnectorObject.kind` | literal `connector` | Explicit in current examples. |
| `id` | Yes | `ConnectorObject.id` | string | Example: `edge-1`, `edge-2`. |
| `from.objectId` | Yes | `ConnectorObject.from.objectId` | string | Source object id. |
| `from.anchor` | Yes | `ConnectorObject.from.anchor` | anchor enum value | Source anchor name (`east` in `basic`). |
| `to.objectId` | Yes | `ConnectorObject.to.objectId` | string | Destination object id. |
| `to.anchor` | Yes | `ConnectorObject.to.anchor` | anchor enum value | Destination anchor name (`west` in `basic`). |
| `style` | No | `ConnectorObject.style` | style object | Omitted in `basic`; connector defaults apply. |

## 6. Required vs Optional Keys (v0 `basic` boundary)

Required for `basic` baseline mapping:

- scene: `objects`, `connectors`
- group object: `id`, `kind`, `placement`, `children`
- text child: `id`, `kind`, `center`, `text`
- rect child: `id`, `kind`, `fitToText`, `rx`, `ry` (required by current `basic` helper shape)
- connector: `kind`, `id`, `from.objectId`, `from.anchor`, `to.objectId`, `to.anchor`

Optional or omitted in `basic` baseline mapping:

- scene `distribution`
- object `style`, `transform`, `align`
- rect `center`, `width`, `height` when `fitToText` is used
- connector `style`
- any non-runtime metadata fields

## 7. Validation Implications (Future)

A future schema can validate structurally:

- required keys exist per mapped shape
- object `kind` values are known (`group`, `text`, `rect` for this baseline)
- anchor names are valid enum values
- placement relation names are valid enum values (`absolute`, `rightOf` for this baseline)
- connector endpoint object shape is valid

Resolver diagnostics still own semantic checks such as:

- missing referenced object ids
- semantically invalid object graph ordering/references
- duplicate ids unless explicitly enforced by schema-level uniqueness rules later

## 8. Out of Scope

This mapping note explicitly defers:

- executable JSON Schema
- validator library choice
- full object-kind coverage beyond `basic` needs
- alignment/distribution JSON mapping
- parser implementation or parser-lowering tests
- round-trip serialization/pretty-printing
- public format stability guarantees
