# JSON Core IR Catch-up Audit

This audit compares the currently implemented runtime/builder surface against:

- current JSON Core IR documentation/schema/fixtures
- current parser AST representation
- current `npm run validate:json-core-ir` behavior

Scope boundary for this phase:

- no new drawing/runtime features
- no new geometry helpers
- no new builder helpers
- no parser syntax expansion
- no source-language translation

## 1. Validation Flow Snapshot

Current validation path:

- schema: `schemas/json-core-ir-v0.schema.json`
- fixtures: `packages/examples/fixtures/json-core-ir-v0/*.json`
- command: `npm run validate:json-core-ir`
- validator: AJV draft-2020 in `scripts/validateJsonCoreIr.ts`
- conversion path for semantic tests: `convertJsonCoreIrV0ToObjectScene(...)` in `packages/object-model/src/jsonCoreIrV0.ts`

Interpretation:

- JSON Core IR currently validates interchange shape only.
- Runtime semantics still come from resolver/renderer behavior after conversion.

## 2. Capability Matrix (Runtime vs Core IR vs Parser AST)

| Capability | Runtime/builder implemented? | JSON Core IR documented? | JSON validation covered? | Parser AST represented? | Renderer/resolver supported? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `rect` | Yes | Yes | Yes | Partial (AST scaffold supports `rect` only) | Yes | Keep covered; no syntax work in this phase. |
| `circle` | Yes | Yes | Yes | No | Yes | Keep in Core IR; defer parser AST catch-up for circle. |
| `text` | Yes | Yes | Yes | Partial (AST scaffold supports text) | Yes | Keep covered; parser syntax still deferred. |
| `group` | Yes | Yes | Yes | Partial (AST scaffold supports group) | Yes | Keep covered. |
| `line` | Yes | Yes | Yes | No | Yes | Keep covered; defer parser AST catch-up. |
| `polyline` | Yes | Yes | Yes | No | Yes | Keep covered; defer parser AST catch-up. |
| `ellipse` | Yes | Yes | Yes | No | Yes | Keep covered; defer parser AST catch-up. |
| `polygon` | Yes | Yes | Yes | No | Yes | Keep covered; defer parser AST catch-up. |
| `path` | Yes | Yes | Yes | No | Yes | Keep covered; parser AST catch-up is next model task. |
| `connector` | Yes | Yes | Yes | Partial (AST scaffold supports connector) | Yes | Keep covered. |
| `moveTo` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `lineTo` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `quadraticCurveTo` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `cubicCurveTo` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `arc` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `closePath` | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR; parser AST deferred. |
| `stroke` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `fill` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `strokeWidth` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `opacity` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `markerStart` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `markerEnd` | Yes | Yes | Yes | No | Yes | Covered in JSON style object. |
| `strokeDasharray` | Yes | Yes | Yes (including malformed-array rejection) | No | Yes | Keep enum/value validation strict in schema/tests. |
| `strokeLineCap` | Yes | Yes | Yes (including invalid enum rejection) | No | Yes | Keep enum validation. |
| `strokeLineJoin` | Yes | Yes | Yes (including invalid enum rejection) | No | Yes | Keep enum validation. |
| `fillRule` | Yes | Yes | Yes (including invalid enum rejection) | No | Yes | Keep enum validation. |
| `translate` transform | Yes | Yes | Yes | No | Yes | Keep in JSON Core IR transform union. |
| `rotate` transform | Yes | Yes | Yes | No | Yes (with existing runtime text deferrals) | Keep covered; document text deferral remains runtime-side. |
| `scale` transform | Yes | Yes | Yes | No | Yes (with existing runtime text deferrals) | Keep covered; document text deferral remains runtime-side. |
| Ordered transform arrays | Yes | Yes | Yes | No | Yes | Keep covered. |
| Legacy translate object (`translateX`/`translateY`) | Yes (compatibility path) | Yes | Yes | No | Yes | Keep for backward compatibility; prefer operation form for new fixtures. |
| VizxExample metadata (`sourcePath`, `reproductionLevel`, `helperFamilies`, `compromises`) | Yes (example registry metadata) | N/A (outside Core IR) | N/A | N/A | N/A | Keep outside Core IR; this is gallery metadata, not scene IR. |
| Generated gallery manifests/html | Yes | N/A (outside Core IR) | N/A | N/A | N/A | Keep outside Core IR. |
| Geometry helpers (intersections/tangents/etc.) | Yes | N/A (authoring helpers) | N/A | N/A | Helper outputs are rendered via ordinary objects | Keep helper surfaces authoring-level; do not serialize helper calls. |
| Annotation helpers | Yes | N/A (authoring helpers) | N/A | N/A | Helper outputs are rendered via ordinary paths/text | Keep authoring-level only. |
| Belt helpers (`openBeltPath`, `crossedBeltPath`) | Yes | N/A (authoring helpers) | N/A | N/A | Helper outputs are rendered via ordinary path commands | Keep authoring-level only. |

## 3. Gap Findings and Phase Decision

Primary gap found before this phase:

- Runtime supported broad object/path/style/transform surface.
- JSON schema and converter covered only a narrow `group`/`text`/`rect` subset.
- Parser AST scaffold remained intentionally narrow and syntax-neutral.

Bounded implementation chosen for this phase:

1. Expand JSON Core IR schema and conversion for already-implemented runtime object/style/path/transform surfaces.
2. Add focused fixture and tests for styled path + arc + ordered transforms.
3. Keep parser AST unchanged and explicitly deferred (no parser syntax changes).

## 4. What Was Intentionally Deferred

Deferred in this phase:

- parser syntax changes
- broad parser AST object/style/path transform parity
- helper-level serialization (intersections/tangents/annotation/belt helpers)
- source translation

Reason:

- helper APIs are authoring conveniences that emit ordinary object/path IR.
- parser AST and parser syntax are separate roadmap branches and should not be forced in a Core IR schema catch-up pass.

## 5. Recommended Next Catch-up Phase

Recommended next bounded phase:

- parser AST model catch-up for object kinds + style/path/transform fields already validated in JSON Core IR
- keep parser syntax unchanged until AST parity is stabilized
- add AST-to-ObjectScene lowering tests for one styled/path fixture family
