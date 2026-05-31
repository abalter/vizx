# Geometry Belt/Pulley Helper Plan (v0)

This document defines a bounded first belt/pulley helper slice built from existing common tangents and circular-arc path support.

Status:

- scope: implementation-facing v0 helper note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Add a first higher-level composition helper for two-pulley belt diagrams.

This slice is intentionally narrow:

- explicit author-called helper
- emits existing path commands/object-model `path` objects
- no new renderer support
- no new runtime object kinds
- no solver behavior
- no automatic pulley system inference
- no source-language translation

## 2. v0 Helper Scope

Implemented helper surface in `@vizx/object-model` builder layer:

```ts
openBeltPath(id, {
  centerA,
  radiusA,
  centerB,
  radiusB,
  style?,
})

crossedBeltPath(id, {
  centerA,
  radiusA,
  centerB,
  radiusB,
  style?,
})
```

Return type:

```ts
PathObject
```

The helper internally uses `circleCircleTangents(...)` and selects the two external tangents.

`crossedBeltPath(...)` is the internal-tangent counterpart and selects the two internal tangents.

## 3. Semantics

v0 semantics:

- external tangents only
- constructs a closed belt-loop centerline path
- command sequence:
  - `moveTo` (circle A upper tangent point)
  - `lineTo` (circle B upper tangent point)
  - `arc` wrap on circle B to the lower tangent point
  - `lineTo` back to circle A lower tangent point
  - `arc` wrap on circle A back to the starting tangent point
  - `closePath`

Crossed-belt v0 semantics:

- internal tangents only
- constructs a closed crossed-belt centerline path
- command sequence:
  - `moveTo` (circle A first internal tangent point)
  - `lineTo` (circle B matching internal tangent point)
  - `arc` wrap on circle B to the second internal tangent point
  - `lineTo` back to circle A second internal tangent point
  - `arc` wrap on circle A back to the starting tangent point
  - `closePath`
- requires two usable internal tangents
- disallows overlap/containment/coincident-center geometries through separation and tangent availability checks
- does not compute belt thickness or belt length
- does not infer rotation direction or mechanics

Arc direction selection:

- for each pulley arc, both clockwise/counterclockwise mid-sweep candidates are evaluated
- the direction whose midpoint is farther from the opposite pulley center is chosen
- this picks the outside wrap arc in a deterministic way

Out of scope in v0:

- belt thickness simulation
- physical length computation
- mechanical semantics (rotation direction, force/torque)

## 4. Return Conventions

`openBeltPath(...)`:

- returns a normal `PathObject`
- preserves provided `id` and optional `style`

`crossedBeltPath(...)`:

- returns a normal `PathObject`
- preserves provided `id` and optional `style`

Validation behavior:

- finite centers and radii required
- radii must be strictly positive
- circles must be disjoint (`distance(centerA, centerB) > radiusA + radiusB`) in v0
- if fewer than two external tangents are available, throw `RangeError`
  - includes overlap/containment/coincident-center cases where a valid open-belt loop cannot be formed
- crossed belt requires separated circles (`distance(centerA, centerB) > radiusA + radiusB`) in v0
- if fewer than two internal tangents are available, throw `RangeError`

## 5. Numeric/Tolerance Behavior

v0 follows existing internal tolerance behavior from the geometry helper stack.

- no public tolerance knobs
- tangent/contact points are inherited from `circleCircleTangents(...)`
- path uses existing circular `arc` command semantics
- tests use approximate checks where numeric comparison is needed

## 6. Deferred

Explicitly deferred from this slice:

- belt thickness and offset boundaries
- belt length computation
- pulley rotation direction and mechanics semantics
- animation concerns
- wrapped arc-length reporting
- tangent-to-path and tangent-to-arc helpers
- clipping beyond circle tangent-contact points
- parser syntax
- JSON Core IR support
- parser AST support
- source-language translation
