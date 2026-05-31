# Parser AST Catch-up Audit

This audit compares parser AST representability against:

- current runtime/object-model surface
- current JSON Core IR schema/converter surface
- current parser syntax surface and deferrals

Scope boundary for this phase:

- no new drawing/runtime features
- no new geometry helpers
- no new builder helpers
- no parser source syntax additions
- no source-language translation
- no solver behavior

## 1. Current State Summary

- Runtime/object-model supports broad object/style/path/transform coverage.
- JSON Core IR now validates/converts the same broad interchange surface.
- Parser source syntax remains intentionally minimal and deferred as a user-facing surface.
- Direct parser AST-to-ObjectScene lowering now supports a broader representable model without adding syntax.

## 2. Capability Matrix

| Capability | Runtime implemented? | JSON Core IR supported? | Parser AST represented? | Parser syntax supported? | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `group` object | Yes | Yes | Yes | No | Keep AST parity; keep syntax deferred. |
| `text` object | Yes | Yes | Yes | No | Keep AST parity; keep syntax deferred. |
| `rect` object (fitToText + explicit center/size) | Yes | Yes | Yes | No | Keep AST parity; keep syntax deferred. |
| `line` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `polyline` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `ellipse` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `polygon` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `circle` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `path` object | Yes | Yes | Yes | No | Keep AST representable only. |
| `connector` (with optional style) | Yes | Yes | Yes | No | Keep AST parity; keep syntax deferred. |
| `moveTo` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `lineTo` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `quadraticCurveTo` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `cubicCurveTo` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `arc` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `closePath` path command | Yes | Yes | Yes | No | Keep AST parity. |
| `stroke` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `fill` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `strokeWidth` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `opacity` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `markerStart` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `markerEnd` style field | Yes | Yes | Yes | No | Keep AST parity. |
| `strokeDasharray` style field | Yes | Yes | Yes | No | Keep AST parity; keep validator-level value checks in JSON schema path. |
| `strokeLineCap` style field | Yes | Yes | Yes | No | Keep AST parity; enum checks remain syntax/validation concern later. |
| `strokeLineJoin` style field | Yes | Yes | Yes | No | Keep AST parity; enum checks remain syntax/validation concern later. |
| `fillRule` style field | Yes | Yes | Yes | No | Keep AST parity; enum checks remain syntax/validation concern later. |
| `translate` transform operation | Yes | Yes | Yes | No | Keep AST parity. |
| `rotate` transform operation | Yes | Yes | Yes | No | Keep AST parity (runtime text deferral still applies). |
| `scale` transform operation | Yes | Yes | Yes | No | Keep AST parity (runtime text deferral still applies). |
| ordered transform list | Yes | Yes | Yes | No | Keep AST parity. |
| legacy translate (`translateX`/`translateY`) | Yes | Yes | Yes | No | Keep compatibility for migration paths. |
| Example metadata (`sourcePath`, `reproductionLevel`, `helperFamilies`, `compromises`) | Yes (example registry) | N/A | No (intentionally) | No | Keep outside parser AST unless future language models example registries explicitly. |
| Gallery manifest and HTML outputs | Yes | N/A | No (intentionally) | No | Keep outside parser AST. |
| Intersection helpers | Yes | N/A | No (intentionally) | No | Keep as TypeScript authoring helpers, not parser AST constructs. |
| Tangent helpers | Yes | N/A | No (intentionally) | No | Keep as TypeScript authoring helpers, not parser AST constructs. |
| Segment/ray clipping helpers | Yes | N/A | No (intentionally) | No | Keep as TypeScript authoring helpers, not parser AST constructs. |
| Annotation helpers | Yes | N/A | No (intentionally) | No | Keep as TypeScript authoring helpers, not parser AST constructs. |
| Belt helpers | Yes | N/A | No (intentionally) | No | Keep as TypeScript authoring helpers, not parser AST constructs. |
| Mechanism example composition | Yes | N/A | No (intentionally) | No | Keep as authored scene composition, not parser AST feature families. |

## 3. Bounded Implementation In This Phase

Implemented in parser package only:

1. Expanded direct AST object union to include runtime/Core IR object kinds.
2. Added AST path-command types matching current path surface.
3. Added AST style and transform representations matching current object-model/JSON Core IR fields.
4. Expanded AST-to-ObjectScene lowering and tests for these representable surfaces.

Still deferred:

- parser source grammar and user-facing syntax
- parser text diagnostics for these expanded constructs
- source-language translation
- helper-call syntax/AST constructs

## 4. Why Helper Surfaces Stay Out Of Parser AST

Current helper families (intersections, tangents, clipping, annotation, belt composition) are TypeScript authoring conveniences that emit ordinary scene objects/paths.

Treating helper invocations as parser AST primitives now would:

- couple parser design to helper API churn
- blur authoring convenience vs interchange/runtime contracts
- increase syntax scope before grammar stabilization

Recommendation: keep helpers authoring-level until parser syntax scope is explicitly expanded.

## 5. Next Parser Phase

Recommended next bounded phase:

- keep parser syntax unchanged
- add parser-facing validation/diagnostic planning for expanded AST fields
- add one parser source fixture family only after deciding minimal grammar for non-rect/group/text objects
