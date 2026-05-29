# Arc And Angle-Mark Checkpoint

This document is a docs-only checkpoint after landing Milestone 3's first arc and angle-mark implementation phase in VizX.

It summarizes what exists now, what that surface enables, what remains deferred, and which roadmap branch should come next.

No runtime behavior changes are made in this pass.

## 1. Purpose

This checkpoint closes the first Milestone 3 implementation phase.

VizX now supports:

- basic circular arc path geometry in the object model, resolver, and SVG renderer
- helper-authored angle marks layered on top of ordinary `path` + `text`
- narrow technical-geometry authoring helpers for circular sweep reasoning and label placement

VizX does not now provide:

- a full annotation system
- a computational geometry engine
- parser syntax for this surface
- JSON Core IR or parser AST parity for this surface

This is a practical geometry-authoring milestone, not a general-purpose curve/annotation completion milestone.

## 2. What Is Now Implemented

### 2.1 Arc Path Surface

Current path command surface includes:

- `moveTo`
- `lineTo`
- `quadraticCurveTo`
- `cubicCurveTo`
- `arc`
- `closePath`

Current circular arc command shape:

```ts
{
  kind: "arc",
  center: Point,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  clockwise?: boolean,
}
```

Builder support includes:

- `arc(center, radius, startAngleDegrees, endAngleDegrees, options?)`

### 2.2 Circular Arc Bbox Strategy

Current arc bbox behavior is conservative rather than tight.

For circular arcs, VizX includes:

- the arc start point
- the arc end point
- the cardinal points at `0`, `90`, `180`, and `270` degrees when they lie inside the chosen sweep

This behavior is implemented through the geometry helpers:

- `normalizeAngleDegrees(...)`
- `angleDeltaDegrees(...)`
- `isAngleWithinSweep(...)`
- `bboxFromCircularArc(...)`

This keeps the bbox policy consistent with the current conservative path/curve posture.

### 2.3 SVG Rendering

Resolver-owned arc serialization maps the circular center/radius/angle command to SVG path `A` output.

Current renderer path output therefore supports SVG path segments:

- `M`
- `L`
- `Q`
- `C`
- `A`
- `Z`

The renderer itself still emits final path data strings and does not reinterpret arc geometry at render time.

### 2.4 Resolver Diagnostics

Current arc diagnostics include:

- error: `arc` before `moveTo`
- error: non-finite `center`, `radius`, `startAngleDegrees`, or `endAngleDegrees`
- error: negative radius
- warning: arc start does not match current point within tolerance
- warning: `radius == 0` degenerates to a line segment
- warning: zero sweep, with full-circle arcs explicitly deferred in v0
- warning: non-uniform scale on arc paths is skipped to preserve circular semantics in v0

Current point semantics remain path-relative:

- `arc` requires an active subpath
- the current point advances to the computed arc end point

### 2.5 Transform Behavior

Current transform behavior for arc paths is:

- `translate`: supported
- `rotate`: supported
- uniform `scale`: supported
- non-uniform `scale`: warned and skipped for arc paths

This preserves the v0 circular-arc contract instead of silently converting circular arcs into ellipse-like geometry.

### 2.6 Geometry Helper Layer

Current geometry helpers relevant to arcs and angle marks include:

- `normalizeAngleDegrees(...)`
- `angleDeltaDegrees(...)`
- `isAngleWithinSweep(...)`
- `bboxFromCircularArc(...)`
- `angleBetweenPoints(...)`
- `angleLabelPoint(...)`

Current helper intent:

- stay pure and dependency-free
- produce plain values and points
- remain layered below `ObjectScene` builders

### 2.7 Builder Helper Layer

Current builder helper support now includes:

- `angleMarkPath(id, options)`

`angleMarkPath(...)`:

- returns plain `PathObject` data
- emits `moveTo(...)` + `arc(...)`
- does not introduce a new drawable kind
- remains ordinary builder convenience on top of the canonical `ObjectScene` model

### 2.8 Example And Test Coverage

Current focused example coverage:

- `technical-angle-arc`

Current test coverage includes:

- geometry helper tests for angle normalization, sweep checks, circular arc bbox behavior, `angleBetweenPoints(...)`, and `angleLabelPoint(...)`
- builder helper tests for `arc(...)` and `angleMarkPath(...)`
- resolver arc tests for valid circular arc resolution, diagnostics, and transform behavior
- renderer tests for SVG `A` path serialization
- example harness validation for `technical-angle-arc`

## 3. What The Implementation Enables

Current VizX can now express:

- angle marks between two rays
- circular annotation arcs
- simple curved arrows or curved geometry paths that use circular arc segments
- geometry labels positioned around circular sweeps
- more faithful versions of simple geometry and math diagrams

This meaningfully improves the practical technical-illustration path for examples that need visible angle structure, not just straight-edge constructions.

Examples now closer to feasible include:

- Asymptote `labeled_polygon`
- Asymptote `fig0810.asy`
- TikZ `projectile_motion`
- MetaPost `pendagon.mp`

The improvement is real but still narrow: VizX now covers basic circular arc authoring, not the broader geometry operations that many higher-fidelity reproductions still need.

## 4. Current Limitations

Still deferred:

- no elliptical arc public command
- no SVG endpoint-style public arc command
- no full-circle convenience beyond the current zero-sweep warning path
- no arc length
- no point-at-length
- no flattening or sampling helpers
- no intersections
- no `cutbefore` / `cutafter`
- no connector routing
- no angle-mark style variants
- no multi-arc angle marks
- no automatic right-angle mark helper
- no parser syntax support for this surface
- no JSON Core IR support for this surface
- no parser AST support for this surface

Also still out of scope for this milestone:

- clipping
- gradients
- plotting/data-coordinate models
- 3D or projection support
- graph layout or routing systems

## 5. Relationship To Aspirational Examples

Milestone 3 materially improves the technical-geometry branch of the aspirational roadmap, but it does not by itself solve other roadmap branches.

What it improves directly:

- diagrams with visible circular marks
- diagrams with angle labels placed relative to circular sweeps
- geometry examples that previously had to approximate angle marks with text alone

What it does not solve by itself:

- plotting or data-coordinate examples
- clipping or gradient-heavy examples
- 3D or projection examples
- graph layout or routing examples

Likely near-term follow-up examples for this branch are:

- update `aspirational-labeled-polygon` to use real angle marks
- add a simplified projectile-motion-style example
- add a simple `pendagon`-like polygon-and-arc example

Current state of the existing aspirational examples:

- `aspirational-labeled-polygon` is the clearest immediate beneficiary and still explicitly approximates angle annotations with plain text
- `aspirational-android-lifecycle` and `aspirational-arrow-label` do not currently depend on arc support
- `technical-angle-arc` is currently the only registry example using real angle-mark arc geometry

## 6. Next Branch Options

Reasonable next branches from here are:

1. Apply arc/angle support to existing aspirational examples
   - update `aspirational-labeled-polygon`
   - add `aspirational-projectile-motion-lite`
   - add `aspirational-pendagon-lite`

2. Style expansion
   - `strokeDasharray`
   - `lineCap`
   - `lineJoin`
   - `fillRule`
   - richer visual fidelity

3. Plot/data-coordinate model planning
   - axes
   - scales
   - ticks
   - data series
   - annotations

4. Geometry precision
   - full-circle arc behavior
   - arc length / point-at-length
   - curve and arc flattening
   - tight Bezier bounds

5. Interchange catch-up
   - JSON Core IR support for newer primitives, paths, transforms, markers, and arcs
   - parser AST support for newer primitives, paths, transforms, markers, and arcs

## 7. Recommendation

Default recommendation:

- do one small application slice next by updating `aspirational-labeled-polygon` to use `angleMarkPath(...)` and real arc marks
- then start Milestone 4 planning for fill, dash, and style expansion

Rationale:

- applying the new helper immediately validates the feature against a real aspirational reproduction rather than leaving it isolated in a technical example
- the slice stays small and uses the exact surface that just landed
- style expansion is the next major fidelity branch in the roadmap once basic geometry and angle-mark support are in place

## 8. Out Of Scope In This Pass

Explicitly not done in this checkpoint pass:

- runtime implementation changes
- parser syntax changes
- JSON Core IR changes
- parser AST changes
- dependency additions
- new example implementations
- style-system expansion
- computational geometry expansion

This pass is checkpointing the current Milestone 3 state only.

## Related Documents

- [ARC_AND_ANGLE_MARK_MODEL_PLAN.md](./ARC_AND_ANGLE_MARK_MODEL_PLAN.md)
- [TECHNICAL_GEOMETRY_HELPER_PLAN.md](./TECHNICAL_GEOMETRY_HELPER_PLAN.md)
- [PATH_CURVE_CHECKPOINT.md](./PATH_CURVE_CHECKPOINT.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)