# Geometry Common Tangent Helper Plan (v0)

This document defines a bounded common-tangent helper slice for two circles after the existing point-to-circle tangent helpers.

Status:

- scope: implementation-facing v0 helper note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Add a pure helper in `@vizx/geometry` for explicit author-called common tangents between two circles.

This slice is intentionally narrow:

- pure helper math only
- explicit author-called use
- no construction solver
- no resolver inference/integration
- no source-language translation
- no automatic pulley/belt system

## 2. v0 Helper

Implemented helper surface:

```ts
circleCircleTangents(centerA, radiusA, centerB, radiusB)
```

Return shape:

```ts
interface CircleCircleTangent {
  kind: "external" | "internal";
  pointA: Point;
  pointB: Point;
}
```

Return type:

```ts
readonly CircleCircleTangent[]
```

`pointA` lies on circle A and `pointB` lies on circle B.

## 3. Return Conventions

Validation:

- finite center coordinates required
- finite radii required
- `radiusA > 0` and `radiusB > 0` required (zero and negative throw)

v0 behavior:

- two disjoint circles can produce up to four tangents:
  - two `external`
  - two `internal`
- externally tangent circles produce two `external` plus one `internal` (degenerate duplicate removed)
- overlapping circles can still produce `external` tangents but no `internal` tangents
- one circle strictly contained in the other returns `[]`
- coincident centers return `[]`

Ordering:

- all `external` tangents first
- all `internal` tangents second
- stable side ordering within each kind based on the signed side of `pointA` relative to the center-to-center direction

Deduplication:

- near-degenerate duplicates are removed with internal epsilon-based point-pair comparison

## 4. Numeric/Tolerance Behavior

v0 follows the existing internal epsilon strategy.

- uses internal `GEOMETRY_EPSILON`
- no public tolerance knobs in v0
- tests use approximate point comparisons

Geometric correctness checks expected in tests:

- `pointA` lies on circle A
- `pointB` lies on circle B
- tangent segment `(pointB - pointA)` is perpendicular to each contact radius

## 5. Deferred

Explicitly deferred from this slice:

- generalized belt wrapping systems beyond the first bounded helper
- tangent arc connections around circles
- clipping tangent segments to object outlines
- tangent-to-path helpers
- tangent-to-arc helpers
- tangent-specific runtime object kinds
- resolver integration or inference
- construction solver behavior
- source-language translation
