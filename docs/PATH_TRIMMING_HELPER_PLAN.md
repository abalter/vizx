# Path Trimming Helper Plan

Status:

- scope: implementation-facing bounded v0 plan
- runtime model changes: none
- parser syntax changes: none
- source translation: none
- dependencies: none

## 1. Purpose

Add a small pure-geometry helper slice for straight-segment trimming used in technical drawing polish.

The immediate use case is explicit TypeScript authoring where a line should stop short of an endpoint or circular boundary while preserving current rendering primitives.

This slice is intentionally narrow and deterministic.

## 2. Boundaries

Included:

- straight finite segment trim by start/end distances
- start-only and end-only convenience wrappers
- optional segment trim against a single circle for line polish near circular objects
- predictable finite-input validation and over-trim behavior

Explicitly out of scope:

- parser syntax
- source-language translation
- new renderer primitives
- new object kinds
- general path length and point-at-length
- Bezier or arc length
- flattening and sampling
- clipping/fill region operations
- shape perimeter anchors
- `cutbefore` / `cutafter` object semantics
- solver or inference behavior

## 3. Proposed v0 API

Geometry package additions:

- `trimSegment(a, b, startDistance, endDistance): { a: Point; b: Point }`
- `trimSegmentStart(a, b, distance): { a: Point; b: Point }`
- `trimSegmentEnd(a, b, distance): { a: Point; b: Point }`
- `trimSegmentToCircle(a, b, center, radius): { a: Point; b: Point } | null`

Rationale:

- keep return shape explicit and composable with existing `line(...)`/`path(...)` authoring
- avoid introducing object-level semantics or hidden mutation

## 4. Semantics

### 4.1 `trimSegment`

Inputs:

- finite points `a`, `b`
- finite numeric `startDistance`, `endDistance`

Behavior:

- segment direction is from `a` to `b`
- trims are measured along the original segment axis
- resulting segment preserves direction from original `a -> b`
- `startDistance = 0` and `endDistance = 0` returns original segment

Validation/errors:

- throws `RangeError` for zero-length input segment
- throws `RangeError` for negative trim distances
- throws `RangeError` when `startDistance + endDistance` exceeds segment length (beyond epsilon)
- throws `TypeError` for non-finite inputs

Over-trim edge:

- exactly consuming full length (within epsilon) is allowed and returns a collapsed segment at the shared trim point

### 4.2 `trimSegmentStart` / `trimSegmentEnd`

Wrappers over `trimSegment`:

- `trimSegmentStart(a, b, d) = trimSegment(a, b, d, 0)`
- `trimSegmentEnd(a, b, d) = trimSegment(a, b, 0, d)`

### 4.3 `trimSegmentToCircle`

Purpose:

- clip a finite segment to the first and second intersection with a circle when intersections exist on the finite segment

Behavior:

- uses existing finite helper behavior (`segmentCircleIntersections`)
- returns `null` if fewer than two intersection points exist on the finite segment
- with two intersections, returns trimmed segment ordered along original `a -> b`

Validation/errors:

- throws for zero-length segment, negative radius, or non-finite inputs (same guard style as existing helpers)

Notes:

- tangent case yields one intersection and returns `null` in v0
- contained/disjoint endpoint-touch-only cases also return `null`

## 5. Numeric Behavior

- follow existing `GEOMETRY_EPSILON = 1e-9`
- use epsilon-aware comparisons for over-trim and endpoint checks
- preserve deterministic ordering by projection along original segment direction

## 6. Tests (v0)

Add focused tests for:

- horizontal trim and vertical trim
- start-only and end-only wrappers
- direction preservation for reversed segments
- invalid input handling: non-finite, negative trims, zero-length, over-trim
- exact full-consumption collapse case
- circle trim: secant returns trimmed segment, tangent/miss returns `null`, deterministic ordering

## 7. Example and Docs Follow-Through

Add one technical example `technical-trimmed-segments` using:

- two circles as boundary references
- a raw guide line and trimmed visible segment
- optional arrow/marker on trimmed segment
- labels and technical style fields (`strokeDasharray`, `strokeLineCap`, `markerEnd`)

Sync docs:

- checkpoint/track/roadmap/capability/spec-index updates to record the bounded helper addition

## 8. Deferred Follow-Ups

Potential future branch (not this slice):

- path-level trim (`cutbefore`/`cutafter` style semantics)
- curve-aware trimming (Bezier and arc)
- generalized shape-boundary trimming
- path length and point-at-length
