# Bezier Path Model Plan

This document defines the next path-model extension for Bezier curves after the current path v0 command set.

Status:

- first implementation slice is now landed for quadratic and cubic Bezier path commands with conservative control-point bbox behavior
- no dependency additions in this slice

## 1. Purpose

Bezier support is the next path-model step after v0 `moveTo` / `lineTo` / `closePath`.

This extension is a high-value unlock for aspirational-gallery clusters that need curved geometry:

- TikZ/MetaPost/Asymptote path-heavy diagrams
- curved process arrows
- smooth outlines and decorative curves
- curve-driven physics/annotation sketches

Bezier support remains a geometry-model extension, not parser-language work.

## 2. Current Baseline

Current implementation baseline across object model, resolver, renderer, and docs:

- path object kind exists in object model
- path commands now support `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `closePath`
- path bbox is based on explicit command points, including Bezier controls and endpoints
- anchors remain bbox-derived
- renderer emits SVG path commands `M`, `L`, `Q`, `C`, `Z`
- transforms apply through point transforms and resolver path coordinate transformation
- no external geometry/math dependency is used
- geometry dependency policy recommends explicit review before advanced Bezier/path math

This plan extends the path command model without changing those broader architecture boundaries.

## 3. Proposed Command Shapes

Recommended command representation for next path phase:

```ts
type PathCommand =
  | { readonly kind: "moveTo"; readonly point: Point }
  | { readonly kind: "lineTo"; readonly point: Point }
  | { readonly kind: "quadraticCurveTo"; readonly control: Point; readonly point: Point }
  | { readonly kind: "cubicCurveTo"; readonly control1: Point; readonly control2: Point; readonly point: Point }
  | { readonly kind: "closePath" };
```

Naming notes:

- `quadraticCurveTo` and `cubicCurveTo` match current explicit command naming style (`moveTo`, `lineTo`, `closePath`)
- `point` remains the endpoint field, consistent with existing command shape

Decision for first Bezier extension:

- include both quadratic and cubic commands in the same slice

Rationale:

- both map directly to standard SVG commands (`Q`, `C`)
- both appear in likely target examples
- implementing only one command family creates avoidable follow-up churn in path typing/tests/docs

## 4. Recommended First Bezier Scope

Implemented scope in the first Bezier slice:

- add both `quadraticCurveTo` and `cubicCurveTo` command types to object model path commands
- update resolver path command handling and diagnostics for those commands
- update renderer path serialization to emit `Q` and `C`
- keep bbox behavior conservative in first slice (see Section 5)
- keep anchors bbox-derived
- keep transform behavior point-based for all explicit command points

Mathematically tight Bezier bounds remain deferred.

## 5. Bbox Strategy

Two viable strategies exist.

### Option A: Conservative Control-Point Bbox

Definition:

- bbox includes all explicit points used by commands:
  - `moveTo` point
  - `lineTo` endpoint
  - `quadraticCurveTo` control + endpoint
  - `cubicCurveTo` control1 + control2 + endpoint

Pros:

- simple and robust
- no dependency required
- low implementation and testing risk
- aligns with current lightweight in-house geometry policy

Cons:

- can overestimate visual curve extents
- debug overlays and anchors may appear larger than painted curve geometry

### Option B: Tight Bezier Bbox

Definition:

- compute parametric extrema for quadratic/cubic curves via derivative roots
- compute tight min/max extents from those extrema and endpoints

Pros:

- more accurate bounds and anchors

Cons:

- more math complexity and numeric edge-case burden
- higher test/maintenance overhead
- should be deliberate relative to dependency-boundary policy

Implemented first-slice choice:

- use Option A (conservative control-point bbox)
- defer Option B (tight bounds) to a follow-up geometry review

This recommendation is consistent with the dependency-boundary policy in GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md.

## 6. Transform Behavior

Transform semantics for Bezier commands should stay consistent with current path behavior:

- transforms apply to every explicit point in each command
- no separate curve-space transform math is introduced
- transformed coordinates are emitted in final path render output
- bbox is computed using transformed explicit points under first-slice conservative strategy

Per command:

- `moveTo`: transform point
- `lineTo`: transform endpoint
- `quadraticCurveTo`: transform control and endpoint
- `cubicCurveTo`: transform both controls and endpoint

## 7. Renderer Mapping

SVG command mapping for Bezier path commands:

- `quadraticCurveTo` -> `Q cx cy x y`
- `cubicCurveTo` -> `C c1x c1y c2x c2y x y`

No shorthand commands in this slice:

- no `T`
- no `S`

No arc commands in this slice.

## 8. Diagnostics And Invalid Cases

Diagnostics should remain consistent with current path error handling style (emit diagnostics, do not throw in normal resolution flow).

Add or extend diagnostics for:

- curve command before first `moveTo`
- non-finite control point coordinates
- non-finite endpoint coordinates
- `closePath` before first `moveTo` (existing behavior remains)
- command stream with no drawable segment

Drawable segment policy:

- `quadraticCurveTo` and `cubicCurveTo` count as drawable segments
- path containing `moveTo` plus at least one curve command is drawable

## 9. Style, Markers, Arrowheads

No new style surface is required for first Bezier support.

- existing path style fields apply unchanged
- built-in arrow markers continue to work via SVG marker semantics when `markerStart`/`markerEnd` are set
- no resolver tangent/perimeter marker logic in this slice
- marker geometry does not expand bbox in this slice

## 10. Examples Unlocked

Bezier support should improve coverage for path-heavy clusters such as:

- curved process arrows
- coffee-cup/decorative outlines
- Bernoulli-style curved diagram geometry
- MetaPost path-focused examples
- simple smooth closed/open shapes
- curved annotation/physics sketches

Still out of scope after first Bezier slice:

- arcs
- clipping
- plotting
- 3D/projection
- full source-language conversion

## 11. Recommended First Implementation Slice

Implemented first code slice:

1. add `quadraticCurveTo` and `cubicCurveTo` path command types
2. transform all command explicit points
3. renderer emits `Q` and `C`
4. bbox uses conservative control-point strategy
5. diagnostics for curve-before-move and non-finite curve coordinates
6. add one `bezier-path` example in examples registry
7. add geometry/resolver/renderer/examples tests for command serialization, bbox behavior, and diagnostics
8. update capability/spec/path docs
9. do not add dependencies
10. keep parser syntax out of scope
11. keep JSON Core IR and parser AST support out of scope

## 12. Future Extensions

Deferred extensions beyond first Bezier slice:

- tight Bezier bounds
- path length and point-at-length APIs
- curve flattening/sampling utilities
- path intersections
- arc commands
- shorthand smooth commands (`S`, `T`)
- curve-aware connector routing
- marker/tangent refinements
- clipping/fill-rule expansion
- parser syntax support
- JSON Core IR support
- parser AST support

## 13. Dependency Review Note

Dependency decision for the first Bezier slice:

- no external dependency for first conservative bbox implementation

Review dependency options later when planning:

- tight Bezier bounds
- intersections
- path length
- flattening/sampling

Any future dependency should stay wrapped behind `packages/geometry` and must not leak into public Core IR by accident.

## 14. Out Of Scope In This Pass

Explicitly deferred in this docs pass:

- parser syntax changes
- JSON Core IR changes
- parser AST changes
- dependency installation/selection

## Related Documents

- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
