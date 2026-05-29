# Primitive Geometry Checkpoint

This document is a docs-only checkpoint after completing the current 2D primitive foundation in VizX.

It summarizes what is now implemented, clarifies the current architectural and rendering boundaries, and frames the next major branch choices.

No runtime behavior changes are made in this pass.

## 1. What Is Now Implemented

The current implemented 2D drawing foundation includes:

- drawable object kinds: `rect`, `circle`, `text`, `line`, `polyline`, `ellipse`, `polygon`, and `path` (v0: `moveTo`, `lineTo`, `closePath`)
- `group` as the container/composition object
- straight `connector` objects resolved from named object anchors
- built-in v0 arrow markers via the semantic marker value `arrow`
- compatibility alias `arrowhead` mapped to the same built-in SVG marker output
- minimal shared style support through `Style`:
  - `stroke`, `fill`, `strokeWidth`
  - `fontFamily`, `fontSize`, `textAnchor`, `dominantBaseline`
  - `opacity`
  - `markerStart`, `markerEnd`
- primitive defaults:
  - line-family primitives (`line`, `polyline`, `ellipse`, `polygon`, `path`) default to stroke-only rendering
  - `rect` defaults to stroke + fill
  - `connector` defaults preserve arrowheaded output through `markerEnd: arrow`
- placement compatibility through:
  - `absolute`
  - `rightOf`, `leftOf`, `above`, `below`
- alignment compatibility through:
  - `alignX`, `alignY`
  - `alignLeft`, `alignRight`, `alignTop`, `alignBottom`
- scene-level distribution through:
  - `distributeX`
  - `distributeY`
- bbox-derived anchors as the current general anchor model
- inspect/debug compatibility through the resolved object graph and render scene
- registry-backed examples covering primitive geometry, style propagation, markers, connectors, alignment, distribution, inspect, and debug overlay
- test coverage across geometry, resolver, renderer, examples, CLI/demo, JSON Core IR validation fixtures, and parser-lowering scaffold tests

Practical summary:

- VizX now has a usable 2D primitive substrate for straight-line and simple closed-shape diagramming.
- The current baseline is materially stronger for box-and-arrow diagrams, lifecycle/process diagrams, simple geometry sketches, straight outlines, and simple physics/load diagrams than it was before the primitive and marker slices.

## 2. Current Architectural Boundary

VizX is still a JavaScript/TypeScript graphics and layout library, not a standalone programming language.

That boundary remains important:

- JS/TS is the host-language layer for loops, functions, modules, recursion, data loading, math libraries, and parametric generation.
- VizX provides the object/layout/rendering substrate that those JS/TS programs generate and render.
- The object model, resolver, examples, inspect flow, and SVG renderer are the current source of truth for what exists today.

Parser and interchange boundaries remain explicit:

- parser syntax is still optional and deferred
- the parser package currently provides a limited AST/lowering scaffold rather than a full source-language surface
- JSON Core IR remains a separate interchange-oriented layer and currently covers earlier core diagram fixtures, not all newly added primitive or marker features unless a later catch-up branch extends that schema and fixture set

In other words:

- host-language programmability already exists through JS/TS
- VizX still needs more drawing/model features before it should be judged against richer TikZ, Asymptote, or MetaPost examples
- this checkpoint does not change that architecture

## 3. Current Rendering And Model Boundaries

The current foundation is intentionally limited. The following remain unimplemented or intentionally incomplete:

- curves
- arcs
- the full SVG path command language
- transforms beyond the current v0 translate+rotate slice
- general local coordinate systems or nested coordinate frames
- clipping
- gradients
- advanced marker shapes or custom marker libraries
- stroke-matched or paint-aware markers
- plotting and data coordinate systems
- 3D and projection
- graph layout or connector routing
- constraint solving

Related current boundaries worth stating directly:

- path v0 supports only `moveTo`, `lineTo`, and `closePath`
- connector rendering is still straight-line only
- bbox and anchors remain bbox-derived; markers do not expand bbox
- ordered transform operations now support `translate` and `rotate` in resolver-driven scene coordinates
- scale and broader affine/local-frame features remain deferred
- rotate support for `text` and `ellipse` remains deferred in v0

These omissions are deliberate. They keep the primitive foundation legible and testable without conflating it with later geometry, plotting, or language-design work.

## 4. Relationship To The Aspirational Gallery

The new primitive foundation changes the aspirational-gallery picture in a meaningful way.

With `line`, `polyline`, `ellipse`, `polygon`, `path` v0, and built-in arrow markers now implemented, the following example clusters are much more plausible inside the current architecture:

- box-and-arrow diagrams
- lifecycle and process diagrams
- UML/component-style diagrams
- simple geometry diagrams
- straight-line outlines and multi-segment silhouettes
- simple physics/load and annotation diagrams

This matters because many gallery examples were previously blocked on missing straight-segment geometry and directional markers rather than on missing host-language programmability.

At the same time, a large portion of the aspirational gallery still depends on capabilities that VizX does not yet have, especially:

- curves and arcs
- broader path semantics
- transforms and local coordinate systems
- clipping and gradient/fill effects
- plotting/data coordinates
- 3D and projection

So this checkpoint should be read as a real milestone, not as gallery parity. The 2D primitive substrate is now substantially better, but it is still the foundation rather than the finished drawing model.

## 5. Next Branch Options

This is now a genuine choice point. Reasonable next branches include:

### Option 1: Curves And Arcs

Focus:

- add quadratic and cubic Bezier commands
- add arc or ellipse-arc support
- extend path bbox behavior beyond explicit straight-segment points

Why choose it:

- completes the next major part of the path family
- unlocks a larger class of drawing-heavy gallery examples
- makes `path` more than a straight-command substrate

### Option 2: Transform And Local Coordinate Model

Focus:

- add translate / rotate / scale semantics as first-class model concepts
- define local coordinate frames
- support nested coordinate spaces explicitly rather than only bbox translation

Why choose it:

- affects almost every future geometry feature
- unlocks many examples that depend more on coordinate frames than on any single primitive
- gives future path, diagram, plotting, and geometry helpers a better long-term substrate

### Option 3: JSON Core IR And Parser AST Catch-Up

Focus:

- add `line`, `polyline`, `ellipse`, `polygon`, `path`, and marker fixture support to JSON Core IR
- extend parser AST/lowering coverage to match the currently implemented primitive set
- maintain schema, converter, lowering, and parity tests

Why choose it:

- improves internal consistency across model layers
- reduces the growing gap between implemented runtime capabilities and interchange/parser scaffolding
- makes later syntax or tooling work less brittle

### Option 4: Diagram Semantics

Focus:

- arrowed connectors as a higher-level diagram concept
- routed connectors
- directed-edge helpers
- flowchart or UML-component conveniences

Why choose it:

- directly targets the diagram families VizX is already closest to
- improves ergonomics without requiring a full drawing-language jump
- can compound well with the new marker foundation

### Option 5: Plot And Data Coordinate Model

Focus:

- axes
- scales
- data series
- ticks and labels

Why choose it:

- opens a distinct charting and annotation family
- addresses a major aspirational-gallery cluster that current primitives alone do not solve

## 6. Recommendation

This remains a choice point, so the recommendation should stay conditional:

- if the immediate goal is to unlock more aspirational-gallery examples broadly, choose transforms/local coordinate systems next
- if the immediate goal is to complete the path family, choose curves/arcs next
- if the immediate goal is internal consistency across layers, choose JSON Core IR / parser AST catch-up next

Default recommendation:

- do a design pass for transforms/local coordinate systems next, before curves

Reasoning:

- transforms affect almost every future geometry feature
- many TikZ, Asymptote, and MetaPost examples depend on coordinate frames, local rotations, or scalable repeated geometry
- a clearer transform/local-frame model should make later curve/path work, plotting, and diagram helpers less ad hoc

That recommendation is not a claim that curves are less important. It is a sequencing recommendation for the next design pass.

## 7. Out Of Scope In This Pass

Explicitly deferred in this checkpoint pass:

- any runtime implementation work
- parser syntax additions
- JSON Core IR schema expansion
- parser AST expansion
- curves, arcs, or broader path commands
- transforms/local coordinate implementation
- plotting/chart features
- 3D/projection
- graph layout or routing
- constraint solving
- broader marker customization

This pass is documentation only.

## 8. Related Documents

- [PRIMITIVE_GEOMETRY_MODEL_PLAN.md](./PRIMITIVE_GEOMETRY_MODEL_PLAN.md) records the geometry expansion plan that led to the current primitive slices.
- [TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md](./TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md) defines the docs-only transform and local-coordinate design recommended as the next foundation pass.
- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md) records the v0 path model and its deferred follow-up work.
- [MARKER_ARROWHEAD_MODEL_PLAN.md](./MARKER_ARROWHEAD_MODEL_PLAN.md) records the v0 built-in arrow marker model.
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) records the current effective model shape and current boundaries.
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md) describes the gallery-driven capability gaps that this primitive foundation partially addresses.