# Transform Local Coordinate Model Plan

This document defines the practical v0 design for transforms and local coordinates in VizX before implementation.

Status:

- first implementation slice is now landed for ordered transform operations with `translate`, `rotate`, and `scale`
- parser syntax, JSON Core IR, and parser AST transform support remain deferred

## 1. Purpose

After the 2D primitive foundation (line family, path v0, markers, placement/alignment/distribution), transforms and local coordinates are the next major substrate.

The goal is to support common diagram and geometry needs:

- translation
- rotation
- scaling
- reusable local-shape components
- nested local coordinate frames through groups

without turning VizX into a standalone programming language.

JS/TS remains the host-language layer for loops, functions, recursion, data generation, and composition. VizX should provide the geometry/layout/rendering model those host-language programs target.

## 2. Current Baseline

Current code baseline relevant to transforms:

- `BaseObject` already has `transform?: Transform`.
- `Transform` in geometry supports ordered operations:
  - `translate`
  - `rotate`
  - `scale` (with `sy` defaulting to `sx`)
- compatibility input for prior translate-only shape remains accepted:
  - `translateX`
  - `translateY`
- resolver applies transform operations before placement.
- placement/alignment/distribution are all translation-based and bbox-anchor based.
- group bbox is currently the union of resolved child bboxes.
- connectors resolve endpoints from final object anchors after placement/alignment/distribution.
- renderer supports a translate render transform attribute form, but resolver mostly emits pre-translated coordinates.

Pipeline as implemented today:

1. resolve local geometry and local bbox
2. apply ordered transforms (`translate`/`rotate`/`scale`)
3. apply placement
4. apply alignment
5. apply distribution
6. resolve connectors from final anchors
7. render using final coordinates

Current limitations:

- no transform parser/JSON/AST surfaces in the current implementation
- no explicit local coordinate frame semantics
- no transform composition beyond one translate struct
- no transform-aware bbox for non-translation transforms
- no transform-aware connector routing/perimeter logic

## 3. Proposed v0 Transform Scope

Recommended v0 scope:

- include translate, rotate, and scale in the model
- keep skew/shear and full affine matrices deferred

Current implemented subset:

- `translate`
- `rotate`
- `scale`

Reasoning:

- translate already exists and should be normalized into the new transform model
- rotate unlocks many high-value examples immediately (diagram orientation, labels, loads, motifs)
- scale unlocks reusable components and local sizing behavior
- adding all three in v0 keeps the transform model coherent while still bounded

v0 support surface:

- object-level transforms on all drawable objects (`group`, `rect`, `circle`, `text`, `line`, `polyline`, `ellipse`, `polygon`, `path`)
- no transform field on connectors in v0 (connectors derive from anchors)
- group transforms compose with child transforms

## 4. Transform Representation

Recommended object-model representation:

```ts
type TransformOp =
  | { readonly kind: "translate"; readonly x: number; readonly y: number }
  | { readonly kind: "rotate"; readonly angleDegrees: number; readonly around?: Point }
  | { readonly kind: "scale"; readonly sx: number; readonly sy?: number; readonly around?: Point };

interface BaseObject {
  readonly transform?: readonly TransformOp[];
}

// Compatibility path also accepted in code for prior translate-only shape:
// { translateX: number, translateY: number }
```

Semantics:

- operations are applied in listed order
- `around` is expressed in the object's local coordinate space
- for scale, `sy` defaults to `sx`

Why op list over raw matrix in authoring surface:

- easier to read in inspect/debug output
- easier to validate and diagnose
- easier to hand-author in JS/TS scene builders
- still allows internal matrix compilation in resolver later

Internal recommendation:

- compile transform op lists into an internal affine representation during resolution
- keep matrix internals private to geometry/resolver implementation

## 5. Coordinate Semantics

Target model:

- object geometry is authored in local coordinates
- object transform maps local geometry into parent coordinates
- group transform maps child parent-coordinates into ancestor coordinates
- nested groups compose transforms recursively to scene coordinates
- bbox and anchors exposed by resolver are scene-coordinate values after transform composition

v0 simplification:

- keep anchors axis-aligned and bbox-derived in scene coordinates
- do not introduce rotated/perimeter/tangent anchors
- do not expose local-space anchors in resolver output

This keeps current placement/alignment/distribution and connector models compatible while introducing local frames through transform composition.

## 6. Placement Alignment Distribution Interaction

This is the critical ordering decision.

Recommended order for v0:

1. resolve local geometry for each object
2. resolve transform-composed geometry into scene coordinates for intrinsic shape
3. compute scene-space axis-aligned bbox and anchors from transformed geometry
4. apply placement/alignment/distribution as scene-space translations against those anchors
5. recompute translated bbox/anchors after each layout adjustment
6. resolve connectors from final anchors

Interpretation:

- transform defines intrinsic oriented/scaled shape
- placement/alignment/distribution then position that shape in layout space

Why this order:

- aligns with current architecture where layout relations operate on resolved bbox anchors
- preserves deterministic relation semantics for mixed transformed/untransformed objects
- avoids requiring placement/alignment logic to reason about local frames directly

Tradeoff:

- relation anchors are based on axis-aligned transformed bbox, not oriented shape perimeter
- this is acceptable for v0 and consistent with current bbox-derived anchor philosophy

Behavior implications:

- rotated objects align via their post-rotation axis-aligned bbox anchors
- scaled objects align/distribute by post-scale bbox
- transformed groups expose anchors from transformed union bbox
- connector endpoints attach to those final transformed-and-laid-out anchors

## 7. Bbox And Anchors

Recommended v0 bbox policy:

- bbox is axis-aligned in scene coordinates after transform composition
- rotated shapes produce expanded axis-aligned bbox as needed
- anchors remain bbox-derived (`center`, edges, corners; text baseline as currently modeled)

Explicit v0 non-goals:

- no oriented bounding boxes
- no rotated-anchor frame
- no perimeter-intersection anchors
- no transform-aware tangent/normal anchor families

Debug and inspect expectations:

- debug overlay continues to show final scene-space axis-aligned bbox/anchors
- inspect output should include transformed bbox and geometry summary
- inspect output should include transform data if present

## 8. Connector Behavior

Recommended v0 connector semantics under transforms:

- connectors remain straight line/path segments
- connectors attach to resolved object anchors in final scene coordinates
- anchor resolution occurs after transform composition and layout translations

Explicit deferrals:

- no routing around transformed geometry
- no perimeter intersection logic
- no orthogonal or curved connector pathing

Transforms on connectors:

- defer connector-level transform field in v0
- keep connectors as derived edges between resolved anchor points

## 9. SVG Rendering Model

Recommended v0 renderer strategy:

- resolver computes final scene coordinates for transformed geometry
- renderer remains mostly coordinate-emitting
- renderer transform attribute support remains available but is not the primary transform execution path

Why this strategy fits current architecture:

- keeps inspect/debug/resolver data consistent with final rendered positions
- avoids SVG-specific transform behavior leaking into core semantics
- keeps future backend portability higher (resolver output is backend-agnostic coordinates)
- preserves current test style (asserting resolved coordinates and emitted geometry)

Future option (deferred):

- renderer-level transform emission optimization for specific backends
- only after semantic equivalence with resolver-space geometry is guaranteed

## 10. Diagnostics And Edge Cases

Recommended v0 diagnostics policy:

- never throw for invalid transform input in normal resolution flow
- emit diagnostics and skip invalid transform ops where safe
- preserve partially resolvable scenes when possible

Cases to diagnose in v0:

- non-finite numeric values (`NaN`, `Infinity`)
- missing required fields for transform operation kinds
- zero scale values (`sx === 0` or `sy === 0`)
- invalid `around` points (non-finite coordinates)
- excessive nested transform depth if protective limits are added

Cases to allow (with defined behavior):

- negative scale values (mirror behavior) in local frame
- large rotation angles (normalize modulo 360 internally)

Other caveats to keep explicit:

- text metrics remain approximate; transformed text bbox is still approximate in v0
- placement/alignment reference cycles remain existing-scope behavior (diagnostics where applicable)
- transform plus layout may magnify numeric precision drift; avoid brittle snapshot tests

## 11. Examples Unlocked

Transforms/local coordinates should materially improve the next reachable gallery cluster:

- rotated labels and oriented objects
- repeated geometry generated by JS/TS with reusable local components
- coordinate-frame geometry diagrams
- simple isometric-ish 2D projections assembled from rotated/scaled primitives
- physics/load diagrams with rotated arrows and members
- decorative repeated motifs and component reuse patterns

This improves parity for many rotate/scale/shift-style examples in TikZ and MetaPost-like workflows.

Transforms alone still do not unlock:

- curves/arcs completeness
- plotting/data coordinate grammars
- clipping/gradient effects
- 3D/projection model
- source-language translation

## 12. Recommended First Implementation Slice

Recommended first implementation slice after this plan:

1. replace current translate struct with transform-op list on drawable objects
2. support ordered `translate`, `rotate`, and `scale` operations in first code slice
3. keep all parser/JSON/AST transform surfaces deferred
4. apply transforms in resolver to primitives and groups
5. compute post-transform axis-aligned bbox/anchors
6. keep placement/alignment/distribution as scene-space translation passes
7. keep connectors straight and anchor-derived
8. add one `rotated-primitives` example
9. add geometry/resolver/renderer/examples tests for rotate + layout interaction
10. keep parser syntax, JSON Core IR, and parser AST support out of scope

Why this is safest:

- rotate and scale are large semantic unlocks not already covered by placement translation
- translate is already represented today and can be migrated into op-list form
- including scale in the same slice keeps ordered-transform semantics coherent

Implemented in this slice:

- ordered transform operations are now supported in code for `translate`, `rotate`, and `scale`
- resolver applies transforms before placement/alignment/distribution
- axis-aligned post-transform bbox/anchors are used for layout and connectors
- connectors remain straight and anchor-derived
- `rotated-primitives` example and focused geometry/resolver/renderer/examples tests were added

Still deferred in this implementation slice:

- rotate support for `text` objects (resolver emits diagnostics and skips those rotate ops)
- scale support for `text` objects (resolver emits diagnostics and skips those scale ops)
- parser/JSON/AST transform surfaces

## 13. Future Extensions

Deferred beyond v0:

- full affine matrix authoring surface
- skew/shear
- transform-origin shorthand conveniences
- renderer-emitted transform attributes as primary path
- named local coordinate frames
- richer transformed text metrics and font-aware bounds
- transform-aware connector routing
- perimeter and tangent anchors
- plot coordinate transforms and chart-space semantics
- 3D projection transforms
- parser/JSON/AST transform support

## 14. Out Of Scope In This Pass

Explicitly deferred in this docs pass:

- runtime implementation
- parser syntax
- JSON Core IR updates
- parser AST updates
- curves/arcs
- clipping/gradients
- plotting
- 3D/projection
- graph layout/routing
- solver behavior
- source-language conversion
- new primitive types

## Related Documents

- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [PRIMITIVE_GEOMETRY_MODEL_PLAN.md](./PRIMITIVE_GEOMETRY_MODEL_PLAN.md)
- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md)
- [MARKER_ARROWHEAD_MODEL_PLAN.md](./MARKER_ARROWHEAD_MODEL_PLAN.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)