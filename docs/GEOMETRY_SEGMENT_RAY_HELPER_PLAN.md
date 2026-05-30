# Geometry Segment/Ray Helper Plan (v0)

This document defines the first narrow segment/ray clipped construction helper slice after the infinite-line intersection and tangent helper slices.

Status:

- scope: implementation-facing v0 helper note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Add small, pure helper math in `@vizx/geometry` for finite segments and rays so technical/math examples do not need to manually filter infinite-line intersection results as often.

This slice is intentionally bounded:

- pure helper math only
- explicit author-called use
- no construction solver
- no resolver inference/integration
- no cutbefore/cutafter rendering semantics
- no source-language translation

## 2. v0 Helpers

Implemented v0 helper surface:

```ts
pointOnSegment(testPoint, a, b)
pointOnRay(testPoint, origin, through)
segmentSegmentIntersection(a1, a2, b1, b2)
segmentCircleIntersections(a, b, center, radius)
rayCircleIntersections(origin, through, center, radius)
```

`rayLineIntersection(...)` is deferred from this slice to keep API growth narrow.

## 3. Return Conventions

Return types:

- `pointOnSegment(...) => boolean`
- `pointOnRay(...) => boolean`
- `segmentSegmentIntersection(...) => Point | null`
- `segmentCircleIntersections(...) => readonly Point[]`
- `rayCircleIntersections(...) => readonly Point[]`

Return behavior:

- no intersection: `null` or `[]`
- tangent: one point
- two intersections: two points
- endpoint intersections count as valid
- overlapping collinear finite segments are deferred and return `null` in v0

Validation behavior:

- non-finite inputs throw
- negative radius throws
- zero-length segment/ray direction throws where an actual segment/ray primitive is required
- `pointOnSegment` accepts a degenerate segment and returns `true` only when the test point equals the endpoint within epsilon

## 4. Numeric Tolerance

v0 follows the existing internal epsilon strategy.

- uses internal `GEOMETRY_EPSILON`
- no public tolerance knobs in v0
- endpoint/near-boundary checks are epsilon-aware
- tests should use approximate point comparison

## 5. Deferred

Explicitly deferred from this slice:

- overlapping segment ranges as returned intervals
- ray-ray and ray-segment intersection families
- polygon intersections
- path/Bezier/arc intersections
- cutbefore/cutafter behavior
- resolver integration and automatic inference
- construction solver behavior
