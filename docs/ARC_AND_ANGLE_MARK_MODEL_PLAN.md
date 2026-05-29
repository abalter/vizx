# Arc And Angle-Mark Model Plan

This document records the Milestone 3 arc/angle-mark model decisions and current implemented scope.

Status:

- circular `arc` path command implemented
- minimal helper-layer angle-mark authoring support implemented
- no parser syntax changes
- no JSON Core IR changes
- no parser AST changes
- no dependency additions

## 1. Purpose

Milestone 3 goal:

- define a minimal first-class arc path model and angle-mark strategy that fits the current object-model -> resolver -> renderer pipeline
- unlock the first arc and angle-heavy aspirational reproductions at Level 1 to Level 2

This plan focuses on representational and behavioral decisions first, then a narrow implementation slice.

## 2. Current Baseline

Current path model and execution behavior:

- `path` supports `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `arc`, `closePath`
- resolver serializes path commands to SVG `d` segments and validates command ordering
- circular `arc` commands map to SVG `A` segments in resolver
- bbox for paths is conservative explicit-point bounds (not tight curve extrema)
- circular arc bbox handling includes start/end plus swept cardinal points
- anchors are bbox-derived
- ordered transforms (`translate`, `rotate`, `scale`) apply to command points in resolver
- renderer emits final path data directly and does not interpret higher-level geometry semantics

Relevant current limitations:

- no dedicated angle-mark drawable object
- no elliptical arc surface in `PathCommand`
- no tight analytic arc bounds
- no parser syntax or JSON Core IR surface for helpers

## 3. Arc Representation Options

### Option A - Endpoint-form SVG-aligned arc command

Shape:

- `arcTo { rx, ry, xAxisRotationDegrees, largeArc, sweepClockwise, point }`

Pros:

- directly maps to SVG `A` command
- keeps renderer simple and mostly pass-through
- matches eventual interchange/import pathways

Cons:

- author ergonomics are weak for geometry diagrams
- harder to reason about angle marks from endpoint-only data
- easier to encode invalid/incoherent combinations that need diagnostics

### Option B - Center-angle-form arc command

Shape:

- `arcByCenter { center, radiusX, radiusY, startAngleDegrees, endAngleDegrees, clockwise }`

Pros:

- natural for geometry and physics diagrams
- direct for angle-mark generation and placement
- easier to derive helper-level APIs (`angleMark`, `angleLabelPoint`)

Cons:

- requires conversion to SVG endpoint-form in resolver/renderer
- introduces angle convention decisions early
- adds conversion diagnostics surface

### Option C - Dual model (accept both forms)

Shape:

- support both endpoint-form and center-angle-form path commands

Pros:

- flexible for advanced users and import pipelines
- can optimize both ergonomics and direct SVG mapping

Cons:

- larger API and validation surface
- higher docs and test complexity
- not ideal for a narrow first slice

## 4. Recommended V0 Arc Command

Recommendation:

- choose Option B for v0 core model
- add a single new command in `PathCommand`:
  - `arc { center, radius, startAngleDegrees, endAngleDegrees, clockwise? }`

Reasoning:

- direct geometry authoring ergonomics for technical diagrams
- keeps public object model circular (no elliptical arc surface in v0)
- still maps cleanly to SVG `A` with resolver-owned conversion

V0 notes:

- `arc` remains path-relative in sequence (requires active current point via prior `moveTo`)
- v0 keeps circular radius only (`radius`), with elliptical arcs deferred
- helper-layer angle-mark conveniences stay thin and remain layered above ordinary `path` + `text`

## 5. Current-Point Semantics Choice

Choice:

- keep current path semantics: `arc` is invalid before `moveTo`
- current point advances to the computed arc end point after each command
- `closePath` behavior remains unchanged

Rationale:

- consistent with existing `lineTo`/Bezier command stream rules
- avoids introducing a second command-state model

## 6. Bounding Box Strategy

Options considered:

- exact analytic arc bbox (tight, higher complexity)
- sampled approximation bbox (medium complexity, approximation error)
- conservative endpoint/control bbox (low complexity)

V0 recommendation:

- use conservative arc bbox in resolver for v0, consistent with current non-tight curve policy
- include at least:
  - arc start point (computed from center/radius/start angle)
  - arc end point (computed from center/radius/end angle)
  - cardinal extrema points (0/90/180/270) only when included in the sweep

Policy statement:

- tight arc bounds are explicitly deferred
- docs and diagnostics should call out conservative bounds when inspecting/debugging

## 7. Transform Policy

Baseline continuation:

- keep ordered transform semantics unchanged
- resolver applies object transforms before rendering and derives transformed bbox/anchors

Arc-specific policy:

- `translate` and `rotate` on arcs are fully supported
- uniform `scale` (`sx == sy` or omitted `sy`) on arcs is supported predictably
- non-uniform `scale` (`sx != sy`) is permitted but diagnostics must flag downgraded geometric guarantees in v0

Recommended diagnostic behavior for non-uniform scale:

- emit warning (not error): arc semantics may be approximated/non-tight under non-uniform scaling in v0
- render should continue; no hard failure by default

## 8. Renderer SVG Mapping And Angle Convention

Renderer mapping for Option B:

- `arc` serializes to SVG `A` segment:
  - `A rx ry xAxisRotation largeArcFlag sweepFlag x y`

Boolean to flag mapping:

- `largeArc: false -> 0`, `true -> 1`
- `sweepClockwise: false -> 0`, `true -> 1`

Angle convention policy (for helper-layer and docs):

- degrees
- positive angles are clockwise in screen coordinates (y down) for user-facing helper docs
- any center-angle helper introduced later must explicitly document conversion to SVG sweep semantics

## 9. Diagnostics List

Recommended v0 diagnostics for `arc`:

- error: `arc` before `moveTo`
- error: non-finite numeric fields (`center`, `radius`, `startAngleDegrees`, `endAngleDegrees`)
- error: negative `radius`
- warning: `radius == 0` (degenerates toward line behavior)
- warning: non-uniform scaling applied to arc object under v0 conservative policy
- warning: conservative bbox in effect for arc path bounds

Consistency requirement:

- diagnostics follow current resolver style and do not block render unless severity is error

## 10. Angle-Mark Strategy And Package Boundaries

Angle-mark strategy:

- do not add first-class `angleMark` drawable object in v0
- build angle marks from ordinary `path` + `text` composition
- keep helper support small:
  - `@vizx/geometry`: `angleBetweenPoints(...)`, `angleLabelPoint(...)`
  - `@vizx/object-model`: `angleMarkPath(...)`

Package boundaries:

- `@vizx/object-model`: owns new path command type shape (`arc`)
- `@vizx/resolver`: owns command validation, conservative bbox behavior, and diagnostics
- `@vizx/renderer-svg`: owns `arc` -> SVG `A` serialization
- `@vizx/geometry`: owns pure helper math for angle-mark construction

This keeps `ObjectScene` canonical and avoids new drawable categories in first slice.

## 11. Relationship To Existing Geometry Helpers

Current helper slice already supports:

- `point`, `offsetPoint`, `midpoint`, `distance`, `angleOf`, `polar`, `circlePoint`, `regularPolygonPoints`

Arc/angle relevance:

- `angleOf`, `polar`, and `circlePoint` remain the base primitives
- `angleBetweenPoints(...)` derives author-facing start/end angle metadata from three points
- `angleLabelPoint(...)` places labels on the chosen sweep bisector at `radius + offset`
- `angleMarkPath(...)` emits a plain `PathObject` using `moveTo(...)` plus `arc(...)`

## 12. Target Examples For Milestone 3

Primary targets:

- `examples/aspirational_gallery/tikz/Diagram for the Bernoulli Principle`
- `examples/aspirational_gallery/tikz/Flipping a coin`
- `examples/aspirational_gallery/tikz/projectile_motion`
- `examples/aspirational_gallery/metapost/pendagon.mp`
- `examples/aspirational_gallery/asymptote/fig0810.asy`

Expected unlocks:

- explicit partial-circle and ellipse-arc motifs
- angle sector/angle-label approximation with consistent arc primitives
- less manual curve approximation in aspirational reproductions

## 13. Recommended First Implementation Slice

Keep first implementation intentionally narrow:

1. Add `arc` to object-model path command union.
2. Extend resolver path validation and `d` serialization for `arc`.
3. Add conservative arc bbox handling and arc diagnostics.
4. Extend renderer path emission tests for SVG `A` output.
5. Add one focused example using a single arc path.
6. Add one focused angle-mark approximation example using `path + text` (no new drawable type).

Non-goals for first slice:

- no parser syntax/AST/JSON Core IR expansion
- no tight analytic arc bounds
- no arc-length/point-at-length/intersections
- no clipping or gradient work

## 14. Deferred Features

Explicitly deferred beyond v0:

- tight arc bbox/extrema analysis
- endpoint-form public command shape in object model
- dual-form command support (Option C)
- path flattening and arc-length operations
- intersection and boolean geometry operations
- first-class `angleMark` drawable type
- parser and JSON Core IR catch-up

## 15. Out Of Scope

Out of scope for this planning pass:

- any runtime code changes
- dependency additions
- new source-language translation features
- style-system expansion unrelated to arcs/angles
- plotting/data-coordinate model work
- projection/3D helper work

## Related Documents

- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [TECHNICAL_GEOMETRY_HELPER_PLAN.md](./TECHNICAL_GEOMETRY_HELPER_PLAN.md)
- [PATH_CURVE_CHECKPOINT.md](./PATH_CURVE_CHECKPOINT.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)