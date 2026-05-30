# Geometry Tangent Helper Plan (v0)

This document records the first narrow tangent-helper slice for technical geometry drawings.

Status:

- scope: implementation-facing v0 helper note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Add two pure helper capabilities in `@vizx/geometry` for explicit author-called constructions:

- tangent line at a point on a circle
- tangent points from an external point to a circle

This slice is intentionally narrow. It reduces repeated manual math in examples while preserving the current no-solver architecture.

## 2. Implemented Surface

Helpers implemented in `packages/geometry/src/geometry.ts`:

- `tangentLineAtCirclePoint(center, pointOnCircle)`
- `tangentPointsFromPointToCircle(externalPoint, center, radius)`

### 2.1 `tangentLineAtCirclePoint`

Return convention:

- returns `{ point, direction }`
- `point` is the provided point on the circle
- `direction` is a unit-length tangent direction vector

Validation:

- finite-point checks for `center` and `pointOnCircle`
- throws when `pointOnCircle` is coincident with `center`

Behavior:

- direction is the normalized perpendicular to the radius vector
- deterministic orientation uses the counterclockwise perpendicular

### 2.2 `tangentPointsFromPointToCircle`

Return convention:

- returns `[]` when the point is strictly inside the circle
- returns `[point]` when the point is on the circle (single tangent)
- returns `[pointA, pointB]` when the point is outside the circle (two tangents)

Validation:

- finite-point checks for `externalPoint` and `center`
- finite radius check
- radius must be strictly positive (`radius > 0`), otherwise throw

Behavior:

- uses internal numeric tolerance (`GEOMETRY_EPSILON`) for on/inside/outside classification
- uses a direct analytic angle construction (`atan2` + `acos`) for tangent points

## 3. Scope Boundaries

Included in v0:

- pure helper math only
- deterministic helper outputs
- unit tests for geometric correctness and edge cases
- one registry-backed technical example exercising helper usage

Explicit non-goals for this slice:

- no solver or constraint inference
- no resolver tangent integration
- no new drawable/runtime object kinds
- no parser syntax or lowering changes
- no segment/ray tangent clipping families
- no circle-circle common tangent families

## 4. Verification

Coverage added in `packages/geometry/src/geometry.test.ts`:

- tangent-direction orientation checks at canonical points
- invalid tangent-line point input
- external/on/inside tangent-point cardinal cases
- radius validation
- geometric correctness checks:
  - tangent points lie on the circle
  - tangent segment is orthogonal to the radius at tangency

Example usage coverage added in `packages/examples/src/technicalTangents.ts` and registered test harness checks.

## 5. Deferred Follow-Ups

Likely follow-on tangent-related slices (deferred):

- tangent helpers for finite segments/rays
- common tangents between two circles
- tangent helpers involving arcs/path segments
- helper composition with cutbefore/cutafter-like shortening behaviors
