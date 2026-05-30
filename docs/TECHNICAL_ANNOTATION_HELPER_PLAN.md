# Technical Annotation Helper Plan (v0)

This document defines the first bounded technical annotation-helper slice for geometry/math diagrams after the recent construction-helper slices.

Status:

- scope: implementation-facing v0 helper note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Add small readability-focused helpers for common mathematical drawing marks:

- right-angle corner marks
- segment tick marks
- label placement along segments

These helpers are intentionally narrow:

- explicit author-called helpers
- emit existing objects or points only
- no new annotation runtime
- no solver behavior
- no resolver behavior changes
- no source-language translation

## 2. v0 Helpers

Implemented helper surface:

```ts
labelAlongSegment(a, b, t, offset?)
rightAngleMarkPath(id, { vertex, from, to, size, style? })
segmentTickMarkPath(id, { a, b, t, size, style? })
segmentTickMarks(idPrefix, { a, b, count, size, centerT?, spacingT?, style? })
```

## 3. Package Boundaries

Current boundary choice:

- point-only helper in `packages/geometry`: `labelAlongSegment(...)`
- ObjectScene-emitting annotation helpers in `packages/object-model` builder layer
- no new package
- no resolver semantics

## 4. Return Conventions

Return behavior:

- `labelAlongSegment(...) => Point`
- `rightAngleMarkPath(...) => PathObject`
- `segmentTickMarkPath(...) => PathObject`
- `segmentTickMarks(...) => readonly PathObject[]`

All outputs are visual annotation conveniences only and remain standard ObjectScene-compatible values.

## 5. Numeric/Tolerance Behavior

v0 behavior follows current helper conventions:

- non-finite values throw
- zero-length segments/rays throw for directional annotation helpers
- `labelAlongSegment(...)` accepts any finite `t` (including extrapolation outside `[0, 1]`)
- `labelAlongSegment(...)` throws for zero-length segments only when `offset` is non-zero
- tests use approximate checks for geometry points and semantic checks for path object command shape

Coordinate note:

- `labelAlongSegment(...)` offset uses the counterclockwise perpendicular of direction `a -> b`
- with SVG-style downward-positive `y`, positive offset appears below a left-to-right horizontal segment

## 6. Deferred

Explicitly deferred from this slice:

- automatic label collision avoidance
- automatic side selection
- multiple right-angle styles
- brace annotations
- dimension lines
- arrowed dimension annotations
- clipping-aware tick-mark placement
- parser syntax
- JSON Core IR support
- parser AST support
- source-language translation
