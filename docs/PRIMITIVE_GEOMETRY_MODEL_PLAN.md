# Primitive Geometry Model Plan

This plan bridges the aspirational gallery audit to the next concrete 2D capability expansion in VizX.

The first four slices of that plan, `line`, `polyline`, `ellipse`, and `polygon`, are now implemented; the remaining primitives stay as the forward-looking expansion path.

It is intentionally implementation-oriented, but it does not change runtime behavior beyond the first slice already landed in code.

## 1. Purpose

The aspirational gallery audit showed that VizX is currently closest to simplified box-and-arrow diagrams, while the highest-value gaps are in basic geometric primitives, a real path model, styling, transforms/local coordinates, plot/data coordinates, and 3D/projection.

This document turns that audit into a near-term design path for the next geometry and rendering primitives.

## 2. Current Baseline

The current code baseline is narrower than the conceptual roadmap in `DESIGN.md`.

What exists today in code:

- object kinds: `line`, `polyline`, `ellipse`, `polygon`, `group`, `rect`, `circle`, `text`
- connector objects with straight-line SVG output
- placement relations: `absolute`, `rightOf`, `leftOf`, `above`, `below`
- alignment relations: `alignX`, `alignY`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom`
- scene-level distribution: `distributeX`, `distributeY`
- bbox-derived anchors: `center`, `north`, `south`, `east`, `west`, and corners, plus `baseline`
- SVG render nodes: `group`, `rect`, `circle`, `line`, `polyline`, `ellipse`, `polygon`, `path`, `text`
- SVG renderer transform support: translate only
- style support: stroke, fill, strokeWidth, font settings, opacity, markerStart, markerEnd
- primitive defaults: line/polyline/ellipse/polygon default to stroke-only; rect defaults to stroke+fill

Behavior that is already implemented:

- `rect` can be bbox-based and can fit to text.
- `circle` already resolves to a bbox and renders as SVG `<circle>`.
- `group` resolves from child bbox union.
- connectors resolve to straight paths with an arrowhead marker definition when connectors are present.
- debug/inspect views operate on the resolved object graph and render scene, not on parser syntax.

Current limitations that matter for this plan:

- no object-level `path` kind
- no path primitive in the object model, only path render nodes for connectors
- no rotation or scale transform support in the render scene
- no general local-coordinate or frame model
- no plot/data coordinate system
- no parser syntax commitment for these primitives

Documentation/code alignment note:

- `DESIGN.md` already names future geometry concepts such as `Line`, `Ray`, `Segment`, `Circle`, `Arc`, `Bezier`, `Spline`, `Path`, and `Polygon` in its conceptual geometry model.
- That list is aspirational and broader than the current code.
- The implementation plan below treats the codebase as the source of truth for what exists today.

## 3. Primitive Candidates

### Line

Status:

- implemented as the first slice in this pass

Object-model shape:

```ts
interface LineObject extends BaseObject {
  readonly kind: "line";
  readonly start: Point;
  readonly end: Point;
}
```

BBox and anchors:

- bbox is the min/max of `start` and `end`
- anchors should include `start`, `end`, and `center`
- bbox-derived anchors can still be exposed for placement convenience

Renderer needs:

- can lower directly to an SVG path `M x1 y1 L x2 y2`
- no new SVG primitive is required for the first slice because the renderer already supports `path`

Style needs:

- existing `Style` is enough for a first slice
- default should be stroke-only, with fill ignored or defaulted to `none`
- arrowheads can reuse the existing marker model later

Priority:

- implemented now; serves as the baseline for subsequent primitive work

Gallery examples helped:

- `TikZ/Diagram of Android activity life cycle`
- `TikZ/Database decimation process`
- `MetaPost/arrow_label.mp`
- many simple connector and diagram examples that currently need a semantic line object rather than a connector-only workaround

### Polyline

Status:

- implemented as the second slice in this pass

Object-model shape:

```ts
interface PolylineObject extends BaseObject {
  readonly kind: "polyline";
  readonly points: readonly Point[];
}
```

BBox and anchors:

- bbox is the union of all point coordinates
- anchors should at least include `start`, `end`, and `center`
- future vertex anchors can be added later if needed

Renderer needs:

- lower to SVG `path` using `M` followed by repeated `L` commands
- a dedicated render node kind is optional for the first slice

Style needs:

- same minimum style as line
- fill can remain `none` unless the polyline is explicitly closed later

Priority:

- implemented now; serves as the baseline for subsequent primitive work

Gallery examples helped:

- `TikZ/Linear regression`
- `TikZ/Signpost with loads applied`
- `MetaPost/example_timeline.mp`
- routing-heavy diagrams that need multi-segment connectors instead of a single line segment

### Circle

Current status:

- already implemented in the code baseline

Likely object-model shape is already present:

```ts
interface CircleObject extends BaseObject {
  readonly kind: "circle";
  readonly center: Point;
  readonly radius: number;
}
```

BBox and anchors:

- bbox and bbox-derived anchors are already supported
- the current implementation is enough for basic circle placement and inspection

Renderer needs:

- already supported through SVG `<circle>`

Style needs:

- current style support is sufficient for the baseline

Priority:

- document and test as current baseline, not a new implementation item

Gallery examples helped:

- `TikZ/Flipping a coin`
- `TikZ/Phyllotaxy`
- `TikZ/CIELAB color space`
- `MetaPost/graph.mp`

### Ellipse

Status:

- implemented as the third slice in this pass

Object-model shape:

```ts
interface EllipseObject extends BaseObject {
  readonly kind: "ellipse";
  readonly center: Point;
  readonly rx: number;
  readonly ry: number;
}
```

BBox and anchors:

- bbox is derived from the radii
- bbox-derived anchors are enough for a first slice
- center anchor is the most important semantic anchor

Renderer needs:

- add SVG `<ellipse>` support or lower to a path if that proves simpler
- keep the first slice strictly 2D

Style needs:

- existing `Style` should be enough initially

Priority:

- implemented now; serves as the baseline for subsequent primitive work

Gallery examples helped:

- Venn-style layouts and coin/ellipse-like diagram shapes
- `TikZ/A Venn diagram with PDF blending`
- `MetaPost/pappus.mp`

### Polygon

Status:

- implemented as the fourth slice in this pass

Object-model shape:

```ts
interface PolygonObject extends BaseObject {
  readonly kind: "polygon";
  readonly points: readonly Point[];
}
```

BBox and anchors:

- bbox from point union
- bbox-derived anchors are enough for the first slice
- vertex anchors can be deferred

Renderer needs:

- SVG `<polygon>` support is the cleanest target
- lowering to `path` is acceptable if the backend stays simpler that way

Style needs:

- fill and stroke both matter here
- this is the first primitive where the existing fill field becomes visibly important

Priority:

- implemented now; establishes a closed-shape primitive before the full path model

Gallery examples helped:

- `Asymptote/labeled_polygon`
- `Asymptote/fig0110.asy`
- `Asymptote/fig0160.asy`
- `TikZ/Circumscribed Parallelepiped`

### Path

Status:

- implemented as the sixth slice in this pass (v0)
- command set intentionally limited to move/line/close

Current planning source of truth:

- see `docs/PATH_MODEL_PLAN.md` for the minimal first-class path object, command set, bbox/anchor rules, diagnostics guidance, renderer mapping, and scoped first implementation slice

Likely object-model shape:

```ts
type PathCommand =
  | { kind: "moveTo"; point: Point }
  | { kind: "lineTo"; point: Point }
  | { kind: "closePath" };

interface PathObject extends BaseObject {
  readonly kind: "path";
  readonly commands: readonly PathCommand[];
}
```

BBox and anchors:

- bbox needs to be computed from the path geometry
- anchors should at minimum expose `start` and `end`
- later work can add sampled or named anchors for special cases

Renderer needs:

- SVG path serialization is required
- the renderer already knows how to emit path elements, so the new work is mostly semantic and geometric rather than backend plumbing

Style needs:

- fill, stroke, strokeWidth, dash, opacity, and markers all become important here
- the first slice should avoid overdesigning a CSS-like styling layer
- for the minimal next-step arrowhead and marker design, see `docs/MARKER_ARROWHEAD_MODEL_PLAN.md`

Priority:

- implemented now as the next geometry-model milestone after primitive style hardening
- curves/arcs and broader path language remain deferred

Gallery examples helped:

- `TikZ/Coffee cup`
- `TikZ/Diagram for the Bernoulli Principle`
- `TikZ/Rotation of sphere in 3d` style path-like geometry references, though 3D itself stays out of scope
- `MetaPost/barnsleys_fern`
- `MetaPost/example_umlcomponent.mp`

## 4. Recommended Implementation Order

Recommended order for the next primitive expansion:

1. `line`
2. `polyline`
3. `ellipse`
4. `polygon`
5. minimal style hardening for primitives
6. general `path`

Status update:

- all six items above are now implemented in v0 form
- path currently supports only moveTo/lineTo/closePath

Reasoning:

- `line` gives the smallest useful semantic primitive and unlocks many diagram examples without changing the renderer surface.
- `polyline` generalizes line routing and prepares the object model for multi-segment diagrams.
- `ellipse` and `polygon` cover the most common closed-shape needs while staying 2D and simple.
- a minimal style pass should happen before the path model so that stroke/fill behavior is stable across the new primitives.
- the general path model is the broadest and should come after the narrower primitives are proven.

## 5. First Implementation Slice

The first four implementation slices have now landed: `line`, `polyline`, `ellipse`, and `polygon`.

Why `line` first:

- it is the narrowest new object kind with immediate diagram payoff
- it can lower to SVG `path` using the current renderer surface
- it exercises bbox computation, anchors, resolver translation, and debug/inspect output without introducing a large path language

Scope of the first slice:

- object model type in `packages/object-model`
- bbox and anchors in resolver logic
- SVG render lowering through existing path support
- inspect/debug compatibility through resolved object data
- one registry-backed example in `packages/examples`
- unit tests for geometry and object shape
- resolver tests for bbox and anchors
- renderer tests for SVG output
- examples tests for registry semantics
- capability matrix update
- no parser syntax

The same slice is the template for the remaining primitive work, especially `path`.

For the dedicated path implementation design, follow `docs/PATH_MODEL_PLAN.md`.

Implementation detail:

- `line` should probably use the existing `Style` type with a stroke-only default.
- the first slice should not add a new styling system or a broader path API.

## 6. Style Boundary

The minimum style model needed for these primitives is already mostly present in `Style`.

Keep the first slice small:

- use existing `stroke`, `fill`, `strokeWidth`, `opacity`, `markerStart`, and `markerEnd`
- do not add gradients, clipping, or a CSS cascade
- do not add a new full style language just to support the first primitive

Practical guidance:

- `line` and `polyline` should default to stroke-only rendering.
- `polygon` and `ellipse` can start using the existing fill/stroke split once they exist.
- path-based work should reuse the same style fields rather than inventing a separate style stack.
- marker and arrowhead behavior should build on the existing `markerStart`/`markerEnd` style fields rather than introducing a second parallel marker surface; see `docs/MARKER_ARROWHEAD_MODEL_PLAN.md`.
- built-in v0 arrow marker support is now implemented for the line-family and connector render path using the semantic marker value `arrow`; richer marker work remains deferred.

## 7. Host-language Generation Boundary

The gallery audit should be read through the JS/TS host-language model.

JavaScript/TypeScript already provides loops, functions, modules, recursion, random generation, math libraries, and parametric generation. VizX should model and render the resulting objects, not absorb those programming features into its own language layer.

That boundary matters because it lowers pressure to create custom macros or a new embedded programming language. A large fraction of the gallery can be expressed as generated object graphs once the geometry/model/rendering primitives are available.

## 8. Future Fixture Candidates

These gallery examples become significantly more plausible once `line`, `polyline`, `ellipse`, `polygon`, and then `path` are available:

- `TikZ/Diagram of Android activity life cycle` - connector-heavy diagram with line and routing needs
- `TikZ/Database decimation process` - repeated boxes and directional connectors that benefit from first-class line and polyline support
- `TikZ/Linear regression` - line segments, axes-like geometry, and simple plotted marks
- `TikZ/Signpost with loads applied` - multi-segment structure and geometry annotations
- `TikZ/Flipping a coin` - circle and segment-heavy geometry
- `TikZ/Phyllotaxy` - repeated geometry generated by JS/TS, with circle and transform-like placement as the eventual target
- `TikZ/Coffee cup` - path-heavy silhouette that becomes much more plausible with a real path model
- `MetaPost/arrow_label.mp` - line and label composition
- `MetaPost/example_umlcomponent.mp` - connector and box layout with a geometry-first model
- `Asymptote/labeled_polygon` - direct polygon support and label placement

## 9. Out of Scope

Explicitly deferred for this plan:

- parser syntax
- source-language translation
- plotting
- 3D/projection
- animation
- clipping and gradients
- full path language implementation if not chosen as the first slice
- general graph layout
- constraint solving

## 10. Doc Follow-Up

Once the first primitive slice is implemented, `CAPABILITY_MATRIX.md` should gain a corresponding row for the new primitive and the audit should be refreshed with that implementation milestone.

For the post-foundation checkpoint after `line`, `polyline`, `ellipse`, `polygon`, `path` v0, and built-in arrow markers landed, see [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md).
For the docs-only transform/local-frame design that follows that checkpoint, see [TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md](./TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md).