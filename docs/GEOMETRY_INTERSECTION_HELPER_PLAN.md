# Geometry Intersection Helper Plan

This note defines the first narrow intersection-helper slice for technical/mathematical construction drawing in VizX.

## 1. Purpose

Intersections are a high-leverage next step for geometry-focused examples.

This slice is deliberately narrow:

- pure helper math in `@vizx/geometry`
- explicit author-called geometry operations
- no construction solver behavior
- no automatic construction resolution
- no resolver behavior changes
- no source-language translation

## 2. v0 Helpers

Implemented v0 helper surface:

```ts
lineLineIntersection(a1, a2, b1, b2)
lineCircleIntersections(lineA, lineB, center, radius)
circleCircleIntersections(centerA, radiusA, centerB, radiusB)
```

All helpers operate on infinite geometric primitives (not segment/ray clipping).

## 3. Return Conventions

Return types:

- `lineLineIntersection(...) => Point | null`
- `lineCircleIntersections(...) => readonly Point[]`
- `circleCircleIntersections(...) => readonly Point[]`

Return behavior:

- no intersection: `null` or `[]`
- tangent: one point
- two intersections: two points
- coincident / infinite intersections:
  - coincident lines: `null`
  - coincident circles: `[]`

Input validation behavior:

- non-finite numeric inputs throw
- negative radii throw
- zero-length lines throw for line-based helpers

## 4. Numeric Tolerance

v0 uses a small internal epsilon for numeric stability.

- default epsilon is internal (`1e-9`)
- tolerance knobs are not exposed publicly in v0
- tests should use approximate point comparison

## 5. Deferred

Explicitly deferred from this slice:

- segment-specific intersection clipping
- ray intersections
- polygon intersections
- path intersections
- Bezier/arc intersections
- tangency helper APIs
- construction solver behavior
- resolver integration / implicit scene intersection inference