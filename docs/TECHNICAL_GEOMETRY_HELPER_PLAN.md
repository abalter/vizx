# Technical Geometry Helper Plan

This document is a docs-only implementation plan for Milestone 2 of the aspirational reproduction roadmap.

Status:

- docs-only plan
- no runtime changes
- no parser/JSON Core IR/AST changes
- no dependency additions

Current implementation status:

- first pure-helper slice implemented in `packages/geometry/src/geometry.ts`
- implemented helpers in this slice:
  - `point`
  - `offsetPoint`
  - `distance`
  - `midpoint`
  - `angleOf`
  - `polar`
  - `circlePoint`
  - `regularPolygonPoints`
- helpers remain pure and dependency-free
- arc/angle-arc helpers remain deferred

## 1. Purpose

Milestone 2 goal:

- make technical geometry and math illustrations easier to author in TypeScript using existing VizX primitives and pipeline behavior

The helper layer is intended to:

- produce points, vectors, point arrays, and label-placement inputs
- optionally provide object-construction convenience inputs for existing object-model factories
- reduce repetitive coordinate math in examples and host-side scene generation

The helper layer is not intended to:

- replace `ObjectScene` as the canonical model
- bypass resolver diagnostics or inspect/debug flows
- introduce parser syntax or a source-language translation layer
- become a full computational geometry engine

## 2. Current Baseline

Relevant baseline already implemented:

- `Point` and lightweight geometry helpers in `packages/geometry/src/geometry.ts`
- point and bbox helpers (`point`, `midpoint`, `distance`, bbox unions/transforms)
- transform helpers (`translate`, `rotate`, `scale`) and ordered transform application in resolver
- drawable primitives (`line`, `polyline`, `polygon`, `ellipse`, `path` with `M/L/Q/C/Z`)
- text labels and bbox-derived anchors
- `ObjectScene` builder helpers in `packages/object-model/src/builder.ts`
- inspect/debug/render pipeline and broad example-test harness coverage

Current aspirational examples show practical friction points:

- `aspirational-labeled-polygon` uses manual vertex coordinates and manual label placement offsets
- `aspirational-arrow-label` manually approximates cutbefore/cutafter behavior by shortening endpoints
- no dedicated helper module currently exists for common coordinate-generation patterns (polar, regular polygons, vertex labels, angle-label points)

## 3. Helper Categories

### 3.1 Point Construction Helpers

Proposed helpers:

- `point(x, y)`
- `polar(origin, radius, angleDegrees)`
- `circlePoint(center, radius, angleDegrees)`
- `midpoint(a, b)`
- `interpolate(a, b, t)`

Role:

- deterministic coordinate generation for geometry diagrams
- keep all outputs as plain point data

### 3.2 Measurement Helpers

Proposed helpers:

- `distance(a, b)`
- `vector(a, b)`
- `angleBetween(a, b)`
- `angleOf(a, b)`
- `normalizeVector(v)`
- `perpendicularVector(v)`

Role:

- small vector/angle utilities used by author code for constructing diagram inputs

### 3.3 Polygon Helpers

Proposed helpers:

- `regularPolygonPoints(center, radius, sides, rotationDegrees?)`
- `trianglePoints(...)`
- `rectangleCorners(...)`

Deferred candidate:

- `starPolygonPoints(...)`

Role:

- reduce repeated point-array construction in polygon-heavy examples

### 3.4 Label Positioning Helpers

Proposed helpers:

- `offsetPoint(point, dx, dy)`
- `labelAt(id, text, point, offset?)`
- `labelAroundPoint(id, text, center, radius, angleDegrees)`
- `vertexLabels(prefix, points, options?)`

Role:

- standardize text-label placement patterns while still returning plain object inputs

### 3.5 Path Construction Convenience Helpers

Proposed helpers:

- `polylineFromPoints(id, points, options?)`
- `polygonFromPoints(id, points, options?)`
- `pathFromPoints(id, points, options?)`
- `closedPathFromPoints(id, points, options?)`

Role:

- convenience composition helpers that map point arrays into existing primitives
- no new path commands

### 3.6 Future Arc/Angle Helpers (Planned, Not Current)

Future placeholders only:

- `angleArcPoints(...)`
- `angleLabelPoint(...)`
- `arcPathCommands(...)`
- `markedAngle(...)`

Boundary:

- these depend on the separate arc-path model decision (first-class arc command vs approximation policy)

## 4. Package Placement

Placement options:

1. `packages/geometry/src/technical.ts`
2. `packages/geometry/src/helpers.ts`
3. `packages/object-model/src/geometryBuilder.ts`
4. expand `packages/object-model/src/builder.ts`

Tradeoffs:

- geometry package is best for numeric and point-array helpers because it has no object-model coupling
- object-model package is best for `ObjectScene` object factories and scene construction helpers
- mixing numeric geometry and object-scene factories in one file risks boundary blur and larger surface churn
- cross-package boundaries should avoid cycles (`object-model` depends on `geometry` types already)

Recommendation:

- place pure numeric/point helpers in `packages/geometry` (new `technical.ts` or similarly named module)
- keep existing object-construction helpers in `packages/object-model/src/builder.ts`
- if convenience helpers return `DrawableObject` values, place those in object-model layer and keep their math dependencies shallow

## 5. Dependency Policy

Policy aligned with `GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md`:

- no external dependencies for this helper layer
- implement with small in-house pure functions and native `Math`
- revisit dependency decisions only for more complex domains such as:
  - intersections
  - polygon booleans/clipping
  - path length and flattening
  - projection math

## 6. API Style

Recommended style:

- pure functions only
- no hidden state
- no classes
- no mutation of inputs
- no global coordinate-system state
- no renderer coupling
- deterministic outputs
- TypeScript-friendly names and signatures
- plain `Point`/array/object outputs that are easy to test structurally

## 7. Relationship to Builder API

Boundary model:

- geometry helpers generate coordinates and coordinate-derived inputs
- builder helpers generate `ObjectScene` objects and relations
- author code composes both layers

Proposed API sketch (not implemented):

```ts
const c = point(0, 0);
const pts = regularPolygonPoints(c, 60, 5, -90);

const scene = sceneOf([
  polygon("pentagon", { points: pts }),
  ...vertexLabels("v", pts),
]);
```

This keeps `ObjectScene` canonical while improving author ergonomics.

## 8. Relationship to Arcs

Observed tension from Milestone 1 examples:

- geometry illustrations often need angle arcs and angle labels
- arc commands are not currently implemented

Recommendation:

1. implement point/polygon/label helpers first (Milestone 2)
2. keep first-class angle-arc helpers deferred until the arc path model is designed
3. optional polyline angle-arc approximation can be considered later only if clearly documented as approximation behavior

Default recommendation:

- avoid first-class angle-arc helper APIs in the first geometry-helper slice

## 9. Target Examples Unlocked

How helper categories support roadmap targets:

- `asymptote/labeled_polygon`
  - regular polygon points, vertex labels, offset helpers
- `asymptote/geometry_1`
  - coordinate transform visualization support through point generation and label positioning
- `asymptote/fig0110.asy`
  - coordinate-system point construction and measurement helpers
- `asymptote/fig0140.asy`
  - line/point side tests and directional/angle helpers
- `asymptote/fig0210.asy`
  - angle/measurement labeling support (without first-class arcs in first slice)
- `metapost/pappus.mp`
  - repeated geometric construction primitives (midpoints, intersections later, circles and offsets)
- `metapost/mechanism.mp`
  - repeated linkage-point calculations, distance and polar helpers

Note:

- some target files still require features explicitly out of scope for this milestone (for example intersections), but helper work reduces the authoring burden for reachable substructures.

## 10. Recommended First Implementation Slice

Narrow first slice after this plan:

- add pure helpers in `packages/geometry`:
  - `point`
  - `midpoint`
  - `distance`
  - `polar`
  - `circlePoint`
  - `angleOf` or `angleBetween`
  - `regularPolygonPoints`
  - `offsetPoint`
- add unit tests in geometry test surface
- update geometry exports
- optionally update `aspirational-labeled-polygon` or add a focused `technical-regular-polygon` example to demonstrate helper usage

Constraints for the first slice:

- no arcs
- no external dependencies
- no builder API redesign
- no parser/JSON/AST changes

## 11. Future Slices

Future helper slices after the first implementation:

- angle helpers after arc-path model decision
- coordinate-frame helper expansion
- small vector algebra additions
- projection helpers for 2.5D milestone
- annotation helpers for geometry diagrams
- helper-driven reproduction passes for `pappus` and `mechanism` families

## 12. Out of Scope

Explicitly deferred in this pass:

- implementation work
- arc path command support
- first-class angle arc rendering
- cutbefore/cutafter behavior
- connector routing
- intersections and polygon booleans
- constraints/solvers
- external math/geometry libraries
- parser syntax work
- JSON Core IR changes
- parser AST changes
- source-language translation

## Related Documents

- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [JS_TS_BUILDER_API_CHECKPOINT.md](./JS_TS_BUILDER_API_CHECKPOINT.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
