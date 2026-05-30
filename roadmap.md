# VizX Roadmap

This is the top-level development roadmap from the repository root.

It connects the original inside-out architecture strategy with the current milestone path for aspirational example reproduction.

See also:

- [README.md](./README.md)
- [DESIGN.md](./DESIGN.md)
- [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [docs/CAPABILITY_MATRIX.md](./docs/CAPABILITY_MATRIX.md)
- [docs/TECHNICAL_MATH_DRAWING_TRACK.md](./docs/TECHNICAL_MATH_DRAWING_TRACK.md)

## A. Current Completed Foundation

Current implemented or substantially established foundation areas:

- package structure for core model, geometry, object model, resolver, renderer, CLI, examples, and parser scaffold
- pure geometry kernel for points/bboxes/transforms and technical helper functions
- ObjectScene/object model with typed primitives, groups, connectors, placements, alignments, and distribution
- resolver pipeline for geometry resolution and diagnostics
- SVG renderer backend for current render scene output
- debug and inspect tooling, including debug overlays
- ObjectScene builder helper layer in TypeScript
- primitive geometry family: line/polyline/ellipse/polygon/path/rect/circle/text/group
- path commands: moveTo/lineTo/quadraticCurveTo/cubicCurveTo/arc/closePath
- transforms: ordered translate/rotate/scale
- markers: built-in arrow marker support via markerStart/markerEnd
- style v0 expansion: strokeDasharray/strokeLineCap/strokeLineJoin/fillRule
- aspirational example registry slices and semantic tests

Practical state:

- active authoring is TypeScript ObjectScene + builder helpers
- parser syntax is still deferred
- SVG is the current rendering target

## B. Active Roadmap Toward Aspirational Examples

Milestones are example-driven and documented in detail in [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md).

### Priority Note: Technical/Math Drawing First

Near-term roadmap priority is technical/mathematical construction drawing using existing geometry/path/arc/style capabilities.

- Plot/data-coordinate planning and helper slices remain useful.
- Plot expansion is not the immediate branch focus.
- Immediate example pressure should come from geometry/math/physics-style drawings.

See [docs/TECHNICAL_MATH_DRAWING_TRACK.md](./docs/TECHNICAL_MATH_DRAWING_TRACK.md).

### 1. Current-capability aspirational mini-gallery

Goal:

- prove what VizX can reproduce now with existing primitives and builder helpers

Current status:

- initial slices implemented

Representative examples:

- aspirational-android-lifecycle
- aspirational-labeled-polygon
- aspirational-arrow-label
- aspirational-projectile-motion-lite
- aspirational-geometry-1-lite

Next likely slice:

- add one more Level 1-2 aspirational geometry/math example in an adjacent family

### 2. Technical geometry helper layer

Goal:

- improve technical geometry authoring ergonomics in plain TypeScript

Current status:

- first pure-helper slice implemented

Representative examples:

- technical-angle-arc
- aspirational-labeled-polygon (helper-assisted construction)

Next likely slice:

- add a small helper-focused technical example for another geometry pattern

### 3. Arc and angle-mark support

Goal:

- support circular angle marks and arc-based technical annotations

Current status:

- circular arc path command and angle-mark helpers implemented

Representative examples:

- technical-angle-arc
- aspirational-labeled-polygon

Next likely slice:

- incremental precision/planning work for future arc/curve geometry branches (without broad runtime expansion)

### 4. Fill, dash, and style expansion

Goal:

- improve visual distinction and fidelity for technical illustration scenes

Current status:

- v0 style fields implemented: strokeDasharray/strokeLineCap/strokeLineJoin/fillRule

Representative examples:

- styled-primitives
- aspirational-labeled-polygon (style fields applied)

Next likely slice:

- style expansion checkpoint now documented in [docs/STYLE_EXPANSION_CHECKPOINT.md](./docs/STYLE_EXPANSION_CHECKPOINT.md)

### 5. Plot/data coordinate model

Goal:

- introduce axes/scales/data-mark substrate for plot-like examples

Current status:

- first helper slice implemented; broader plot/data model still planned
- Milestone 5 planning docs now exist: [docs/PLOT_DATA_COORDINATE_MODEL_PLAN.md](./docs/PLOT_DATA_COORDINATE_MODEL_PLAN.md) and [docs/PLOT_DATA_ASPIRATIONAL_TARGETS.md](./docs/PLOT_DATA_ASPIRATIONAL_TARGETS.md)

Priority clarification:

- technical/math drawing work is currently prioritized over further plot infrastructure slices

Representative targets:

- timeline/schedule and simple plotted technical examples

Next likely slice:

- docs-first model plan for coordinate systems, axes, ticks, and mark generation boundaries (completed)
- first implementation slice landed (`linearScale`, `PlotFrame` + `mapDataPoint`, minimal `xAxis`/`yAxis`, `technical-linear-plot`)
- next bounded follow-up: scatter/series helper refinement and one additional plot-like aspirational-lite example

### 6. 2.5D/projection helpers

Goal:

- support projected technical illustrations without full 3D-engine scope

Current status:

- planned, not implemented

Representative targets:

- isometric/projection-style gallery figures

Next likely slice:

- projection-helper design note after plot/data model planning

## C. Next Likely Slices

Recommended near-term sequence after this docs pass:

1. Add one additional geometry/math aspirational-lite example using current capabilities.
2. Continue technical construction examples that expose geometry helper gaps.
3. Evaluate narrow technical helper additions only when repeatedly justified by examples.
4. Expand plot/data helper slices only after technical/math-example pressure subsides.
5. Consider JSON Core IR and parser AST catch-up only when interchange priorities justify it.

Current note:

- one additional current-capability aspirational example (`aspirational-projectile-motion-lite`) now exists and remains deliberately outside any plot/data-coordinate model scope.
- one additional current-capability geometry example (`aspirational-geometry-1-lite`) now exists and emphasizes technical/math construction drawing.

## D. Deferred Work

Still deferred or out-of-scope categories:

- parser syntax as a primary authoring surface
- JSON Core IR catch-up for newer path/transform/marker/helper/style features
- parser AST catch-up for newer path/transform/marker/helper/style features
- clipping/gradients/themes/style inheritance/class systems
- source-language translation (TikZ/Asymptote/MetaPost import/transpile)
- plotting/data model implementation until milestone planning lands
- 2.5D/projection helpers until milestone 6 work is active
- graph layout/routing systems
- nonlinear solver/constraint system
- visual editor

## Related Documents

- [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [docs/CAPABILITY_MATRIX.md](./docs/CAPABILITY_MATRIX.md)
- [docs/TECHNICAL_GEOMETRY_HELPER_PLAN.md](./docs/TECHNICAL_GEOMETRY_HELPER_PLAN.md)
- [docs/ARC_AND_ANGLE_MARK_CHECKPOINT.md](./docs/ARC_AND_ANGLE_MARK_CHECKPOINT.md)
- [docs/STYLE_EXPANSION_MODEL_PLAN.md](./docs/STYLE_EXPANSION_MODEL_PLAN.md)
- [docs/JS_TS_BUILDER_API_COOKBOOK.md](./docs/JS_TS_BUILDER_API_COOKBOOK.md)
- [docs/SPEC_INDEX.md](./docs/SPEC_INDEX.md)
