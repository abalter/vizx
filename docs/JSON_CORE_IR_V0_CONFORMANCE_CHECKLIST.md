# JSON Core IR v0 Conformance Checklist (Planning)

This checklist turns the v0 shape and `basic` mapping notes into future pass/fail acceptance criteria for schema drafts and JSON-to-`ObjectScene` conversion work.

Status:

- planning only
- not executable tests
- not a schema file
- not a fixture file
- not parser syntax
- not a public stability guarantee

See [JSON_CORE_IR_V0_SHAPE.md](./JSON_CORE_IR_V0_SHAPE.md) for the minimal v0 shape and [JSON_CORE_IR_BASIC_MAPPING.md](./JSON_CORE_IR_BASIC_MAPPING.md) for field-by-field mapping.
See [JSON_CORE_IR_V0_OWNERSHIP_LANES.md](./JSON_CORE_IR_V0_OWNERSHIP_LANES.md) for the future review lanes associated with each checklist area.

## 1. Purpose

Use this checklist to evaluate whether future v0 JSON work is aligned with current Core IR behavior for the `basic` baseline.

This checklist is intended for:

- future schema draft reviews
- future JSON-to-`ObjectScene` converter reviews
- future semantic-equivalence fixture review planning

This checklist is not:

- executable tests
- a JSON Schema file
- a JSON fixture file
- parser syntax or lowering design
- a public stability/versioning commitment

## 2. Scene-Level Checks

Pass/fail criteria for v0 `basic` scene shape:

- [ ] JSON payload has an `objects` array.
- [ ] JSON payload has a `connectors` array for `basic`.
- [ ] JSON payload omits `distribution` for `basic`.
- [ ] Optional metadata (for example fixture id/name) is not treated as runtime scene data unless explicitly converted by documented policy.

## 3. Object Checks

Pass/fail criteria for v0 `basic` object entries:

- [ ] All objects have stable string ids.
- [ ] All object `kind` values are known for the v0 `basic` slice (`group`, `text`, `rect`).
- [ ] Group objects include a `children` array.
- [ ] Text children include `center` and `text`.
- [ ] Rect children represent fit-to-text behavior with `fitToText.textId`, `fitToText.paddingX`, and `fitToText.paddingY`.
- [ ] Unsupported object fields are either rejected or explicitly ignored according to documented converter policy.

## 4. Placement Checks

Pass/fail criteria for `rightOf` in v0 `basic`:

- [ ] `rightOf` is represented with the correct placement relation field (`placement.kind = rightOf`).
- [ ] `placement.reference.objectId` is present.
- [ ] `placement.reference.anchor` is present.
- [ ] `placement.gap` is present.
- [ ] No JSON `targetAnchor` field is required for `rightOf`; resolver semantics infer the target anchor.

## 5. Connector Checks

Pass/fail criteria for v0 `basic` connectors:

- [ ] Connector `id` is present.
- [ ] Connector `kind` is represented as required by the converter policy (`connector` in the current `basic` mapping).
- [ ] `from.objectId` and `from.anchor` are present.
- [ ] `to.objectId` and `to.anchor` are present.
- [ ] Anchor names are valid Core IR enum values.

## 6. Conversion Checks

Pass/fail criteria for future JSON-to-`ObjectScene` conversion behavior:

- [ ] JSON converts to an `ObjectScene`-compatible value.
- [ ] Conversion does not resolve geometry.
- [ ] Conversion does not precompute anchors.
- [ ] Conversion does not bypass placement semantics.
- [ ] Converted scene resolves through the existing resolver pipeline.

## 7. Semantic Comparison Checks

Pass/fail criteria for future semantic-equivalence fixture reviews:

- [ ] Resolve the JSON-converted `ObjectScene`.
- [ ] Resolve the TypeScript `basic` example.
- [ ] Compare inspected/resolved semantics rather than renderer text output.
- [ ] Assert expected top-level object ids.
- [ ] Assert expected connector endpoint anchors/points.
- [ ] Assert no error diagnostics for valid baseline fixtures.
- [ ] Avoid SVG snapshot comparisons as primary acceptance criteria.

## 8. Boundary Checks

Pass/fail criteria for responsibility boundaries:

- [ ] Structural shape errors are handled at JSON validation/conversion boundaries.
- [ ] Missing referenced object ids remain resolver diagnostics unless converter detection is explicitly safe and documented.
- [ ] Parser syntax and parser lowering are out of scope for this v0 JSON checklist.
- [ ] Alignment/distribution JSON breadth is out of scope for the v0 `basic` checklist.

## 9. Explicitly Out of Scope

This checklist defers:

- executable JSON Schema
- validator selection
- real JSON fixture files
- full object-kind coverage
- alignment/distribution JSON mapping
- parser implementation
- round-trip serialization
- public stability guarantees