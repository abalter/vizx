# Geometry Math Dependency Boundary

This note defines the boundary between VizX-owned lightweight geometry/math helpers and potential future external dependencies.

Status:

- docs-only design note
- no runtime behavior changes
- no dependency additions in this pass

## 1. Purpose

This question matters now because VizX has reached a meaningful geometry baseline:

- primitives are implemented (`line`, `polyline`, `ellipse`, `polygon`, `path` v0, plus existing `rect`/`circle`/`text`/`group`)
- ordered transforms are implemented for `translate`, `rotate`, and `scale`
- resolver layout still relies on axis-aligned bbox/anchor semantics

Upcoming deferred areas (curves, arcs, intersections, plotting, projection math) may require more advanced numerical and geometric operations than the current point/bbox helper layer.

The goal is to keep the current core simple and explicit while defining clear triggers for when external libraries may become the right choice.

## 2. Current Baseline

Current geometry/math implementation is in-house and lightweight.

Primary helper surface (`packages/geometry/src/geometry.ts`):

- types: `Point`, `Vector`, `Size`, `BoundingBox`
- transform types: `translate`, `rotate`, `scale` operations plus legacy translate compatibility
- point helpers: add/subtract/midpoint/distance
- bbox helpers: from rect, line, points, polygon, path commands, ellipse, union, translate, transformed corners
- transform helpers: normalize operations, ordered point transforms, point rotate, point scale

Native JS `Math` usage is direct and simple:

- `Math.min`, `Math.max` for bounds and unions
- `Math.hypot` for Euclidean distance
- `Math.PI`, `Math.cos`, `Math.sin` for rotation
- `Math.abs` and basic arithmetic for scale/bounds adjustments

Diagnostics around transform validity are handled in resolver logic (for example non-finite transform parameters and unsupported object-kind transform operations).

External geometry/math dependency status:

- none in current runtime packages
- package manifests for `@vizx/geometry`, `@vizx/object-model`, `@vizx/resolver`, `@vizx/renderer-svg`, `@vizx/examples`, and `@vizx/parser` do not include third-party geometry/math libraries

Current package coupling to geometry helpers:

- `@vizx/object-model` imports geometry types (`Point`, `BoundingBox`, `Transform`)
- `@vizx/resolver` imports geometry helpers for resolution, bbox math, and transforms
- `@vizx/examples` imports `point` helpers for scene construction
- `@vizx/renderer-svg` does not directly depend on `@vizx/geometry`; it serializes resolved render nodes
- parser remains syntax/lowering scaffolding and does not add runtime geometry libraries

## 3. Keep In VizX For Now

Keep the following in-house for the near term:

- point and vector primitives
- axis-aligned bounding box helpers
- bbox-derived anchors
- point translation, rotation, and scaling
- ordered point transform composition
- bbox from points and transformed corners
- primitive bbox helpers (line/polyline/polygon/ellipse/path v0)
- finite-number validation and transform diagnostics

Why keep these in-house now:

- small and transparent surface area
- straightforward unit and resolver testing
- low maintenance overhead
- avoids early dependency churn while the model is still evolving
- keeps Core IR semantics explicit and stable
- avoids hiding foundational behavior behind third-party APIs too early

## 4. Consider External Libraries Later

The following deferred feature areas are likely candidates for external-library evaluation when implemented:

- Bezier curve bounds
- arc-to-cubic conversion
- path length and point-at-length
- path flattening/sampling
- path intersections
- polygon clipping and boolean operations
- triangulation
- collision/intersection kernels
- graph layout
- plotting scales and transforms
- statistics/regression helpers
- 3D projection and matrix algebra

These areas have higher algorithmic complexity and stronger numerical-robustness requirements than current v0 bbox/anchor math.

## 5. Candidate Dependency Categories

No dependency is selected in this note.

Future candidates should be evaluated by category:

- small geometry helper libraries
- robust polygon clipping libraries
- path manipulation libraries
- matrix/vector linear algebra libraries
- plotting/scale libraries
- graph layout libraries
- numeric/statistics libraries

Host-language JS/TS code can also import its own math libraries for generation workflows. VizX core should only adopt dependencies where the core resolve/render model requires them.

## 6. Decision Criteria For Adding A Dependency

Add a dependency only when most of the following are true:

- correctness is difficult to implement and verify in-house
- numerical robustness is material for expected workloads
- functionality is outside VizX core identity (not basic point/bbox semantics)
- API surface is stable and reasonably small
- works in Node and browser contexts if needed by VizX targets
- TypeScript ergonomics are acceptable
- does not force parser/runtime coupling
- does not leak into public Core IR unless intentionally designed
- license is compatible with project requirements
- maintenance health is acceptable (activity, issue response, release quality)
- bundle-size/runtime cost is acceptable for browser use

## 7. Dependency Isolation Strategy

If VizX adopts a geometry/math dependency later, isolate it behind VizX-owned APIs.

Recommended strategy:

- `packages/geometry` owns stable interfaces and behavioral contracts
- resolver calls VizX geometry helpers, not third-party APIs directly
- object-model and Core IR stay library-agnostic
- tests assert VizX behavior and invariants, not vendor-specific details
- implementation can swap libraries later with minimal ripple

This keeps architectural control in VizX while still allowing external numerical kernels where justified.

## 8. Host-Language Generation Boundary

VizX remains a JS/TS graphics and layout library, not a standalone programming language.

Host JS/TS can supply:

- loops/functions/modules/recursion
- randomness and parametric generation
- data loading and preprocessing
- application-specific math/stat libraries

VizX core should own only geometry operations required to resolve and render VizX objects consistently.

A user application importing extra math libraries does not imply VizX runtime must depend on those libraries.

## 9. Recommended Near-Term Policy

Near-term policy:

- add no external geometry/math dependency yet
- keep current transform and bbox helpers custom
- preserve current resolver-first coordinate semantics and bbox-anchor model
- perform explicit dependency review before implementing:
  - Bezier/arc bounds
  - path intersections
  - polygon booleans/clipping
  - plotting scales
  - 3D/projection math

## 10. Future Review Triggers

Revisit this policy when one or more of these are scheduled:

- quadratic/cubic Bezier support
- arc support
- path length or point-at-length APIs
- clipping or polygon boolean operations
- graph layout integration
- plotting/data scale systems
- 3D/projection support
- recurring numerical instability or tolerance churn in tests

## 11. Out Of Scope

Explicitly out of scope in this pass:

- installing dependencies
- changing runtime behavior
- changing public APIs
- adding new geometry features
- parser syntax work
- JSON Core IR changes
- parser AST changes

## Related Documents

- [TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md](./TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [PRIMITIVE_GEOMETRY_MODEL_PLAN.md](./PRIMITIVE_GEOMETRY_MODEL_PLAN.md)
- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md)
- [BEZIER_PATH_MODEL_PLAN.md](./BEZIER_PATH_MODEL_PLAN.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
