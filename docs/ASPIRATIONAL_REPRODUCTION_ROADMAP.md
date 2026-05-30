# Aspirational Reproduction Roadmap

This document defines a milestone-based roadmap for reproducing selected examples from TikZ, Asymptote, and MetaPost within VizX.

Scope:

- docs-only roadmap
- no runtime changes
- no parser/JSON/AST implementation changes
- no dependency additions

Top-level navigation:

- [README.md](../README.md) for current status and entry points
- [roadmap.md](../roadmap.md) for root milestone sequencing and deferred work
- [ASPIRATIONAL_EXAMPLE_GALLERY_INDEX.md](./ASPIRATIONAL_EXAMPLE_GALLERY_INDEX.md) for the current aspirational example comparison index by source, helper families, and compromises
- [TECHNICAL_MATH_DRAWING_TRACK.md](./TECHNICAL_MATH_DRAWING_TRACK.md) for technical/mathematical drawing priority guidance
- [TECHNICAL_MATH_DRAWING_CHECKPOINT.md](./TECHNICAL_MATH_DRAWING_CHECKPOINT.md) for consolidated post-intersection/tangent/application checkpoint status and next-branch recommendation

## Technical Track Priority Note

Plot/data-coordinate planning is documented and remains useful, but near-term implementation pressure should prioritize technical/mathematical construction drawings.

Priority guidance:

- favor geometry/math/physics-style Level 1-2 examples
- treat `aspirational-projectile-motion-lite` as a bridge example, not evidence of a chart subsystem
- avoid expanding plot infrastructure unless example pressure requires it

## 1. Purpose

This roadmap is example-driven, not feature-count-driven.

Key clarifications:

- this is not a source-language translation roadmap yet
- this is not a parser roadmap
- this is a capability-driven reproduction roadmap
- near-term reproductions should be authored manually in JS/TS using builder helpers first
- the goal is to test VizX’s niche: semantic, inspectable, programmable technical illustration in TypeScript

## 2. Reproduction Levels

### Level 1 - Semantic approximation

The VizX version captures the same conceptual diagram while simplifying visual detail.

### Level 2 - Visual resemblance

The VizX version is recognizable compared with the original, with similar labels, arrows, layout, and major geometry.

### Level 3 - Fidelity fixture

The VizX version closely matches layout, styling, curves, fills, annotations, and geometry.

### Level 4 - Source translation

VizX imports or transpiles TikZ, Asymptote, or MetaPost source.

Near-term target:

- focus on Level 1 and Level 2
- keep Level 4 deferred

## 3. Current Implementation Baseline

Current supported model and pipeline surface:

- `rect`, `circle`, `text`, `group`
- `line`, `polyline`, `ellipse`, `polygon`
- `path` with `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `arc`, `closePath`
- built-in arrow markers via `markerStart` / `markerEnd`
- style baseline: `stroke`, `fill`, `strokeWidth`, `opacity`
- ordered transforms: `translate`, `rotate`, `scale`
- placement, alignment, and distribution relations
- connector objects
- bbox-derived anchors
- builder helpers as ergonomic authoring layer
- inspect/debug/render pipeline

Current limitations and intentional deferrals:

- elliptical arcs
- tight Bezier bounds
- path length / point-at-length
- flattening / sampling
- intersections
- clipping
- gradients
- plotting/data coordinate model
- 3D/projection engine features
- graph layout/routing
- source-language translation

Current note:

- first segment/ray clipped construction helpers now exist in `@vizx/geometry` (`pointOnSegment`, `pointOnRay`, `segmentSegmentIntersection`, `segmentCircleIntersections`, `rayCircleIntersections`)
- these helpers remain pure, explicit, and solver-free
- first technical annotation helpers now exist across `@vizx/geometry`/`@vizx/object-model` (`labelAlongSegment`, `rightAngleMarkPath`, `segmentTickMarkPath`, `segmentTickMarks`) and remain explicit path/point conveniences, not runtime semantics

## 4. Milestone 1 - Current-Capability Aspirational Mini-Gallery

Goal:

- prove what VizX can reproduce now using existing capabilities and builder helpers

Target gallery examples:

- TikZ/Diagram of Android activity life cycle
- TikZ/Database decimation process
- MetaPost/example_umlcomponent.mp
- MetaPost/arrow_label.mp
- Asymptote/labeled_polygon
- Asymptote/geometry_1

Suggested VizX registry examples:

- `aspirational-android-lifecycle`
- `aspirational-database-decimation`
- `aspirational-uml-component`
- `aspirational-arrow-label`
- `aspirational-labeled-polygon`
- `aspirational-geometry-basic`

Current status:

- first-slice examples now implemented:
  - `aspirational-android-lifecycle`
  - `aspirational-labeled-polygon`
  - `aspirational-arrow-label`
  - `aspirational-projectile-motion-lite`
  - `aspirational-geometry-1-lite`
  - `aspirational-pendagon-lite`
  - `aspirational-pullys-lite`
- implemented as manual builder-authored Level 1-2 reproductions
- `aspirational-labeled-polygon` now uses real circular angle marks for its beta labels
- `aspirational-projectile-motion-lite` combines Bezier trajectory pathing, launch-angle arc annotation, arrowed vector styling, and dashed construction guides using existing capabilities only
- `aspirational-geometry-1-lite` provides a manual coordinate-frame geometry sketch with labeled axes, mapped points, dashed guides, and an angle mark using existing capabilities only
- `aspirational-pendagon-lite` provides a manual intersection-driven construction sketch using explicit helper-called `circleCircleIntersections(...)` and `lineCircleIntersections(...)` results for derived geometry points
- `aspirational-pendagon-lite` now additionally uses clipped `rayCircleIntersections(...)` for finite-direction construction points on `OU`
- `aspirational-pullys-lite` provides a manual static pulley-system sketch using `openBeltPath(...)`, `circleCircleTangents(...)`, `tangentPointsFromPointToCircle(...)`, label/tick helpers, and angle-mark arcs
- no mechanics simulation, solver behavior, or source translation is added for this example
- no source-language translation added
- no parser/JSON Core IR/AST expansion added

Acceptance criteria:

- registry-backed example
- authored with builder helpers
- resolves cleanly
- renders SVG
- inspect/debug works
- includes a short reproduction note with:
  - original gallery source
  - reproduction level
  - compromises
  - missing features
- tests avoid brittle full-SVG snapshots

Recommended first slice scope:

- implement 2 to 3 examples first, not all six
- recommended first three:
  - `aspirational-android-lifecycle`
  - `aspirational-labeled-polygon`
  - `aspirational-arrow-label`

Current extension note:

- a bounded current-capability extension example (`aspirational-projectile-motion-lite`) now exists without introducing a plot/data-coordinate model
- aspirational examples now also expose standardized source/level/helper/compromise metadata, and the comparison view is documented in [ASPIRATIONAL_EXAMPLE_GALLERY_INDEX.md](./ASPIRATIONAL_EXAMPLE_GALLERY_INDEX.md)

## 5. Milestone 2 - Geometry Helper Layer For Math Diagrams

Goal:

- make technical geometry diagrams pleasant to author in TS without adding a new language

Potential helper functions:

- `point(x, y)`
- `midpoint(a, b)`
- `distance(a, b)`
- `angleBetween(a, b)`
- `polar(origin, radius, angle)`
- `regularPolygonPoints(center, radius, n, rotation?)`
- `circlePoint(center, radius, angle)`
- `lineThrough(a, b)`
- `labelAt(id, text, point, offset?)`

Target gallery examples:

- Asymptote/labeled_polygon
- Asymptote/geometry_1
- Asymptote/fig0110.asy
- Asymptote/fig0140.asy
- Asymptote/fig0210.asy
- MetaPost/pappus.mp
- MetaPost/mechanism.mp

Acceptance criteria:

- helpers remain ordinary JS/TS functions
- no new programming language
- no external dependency unless explicitly justified later
- examples demonstrate point-based construction
- docs clearly separate helper authoring from renderer features

Detailed Milestone 2 plan:

- [TECHNICAL_GEOMETRY_HELPER_PLAN.md](./TECHNICAL_GEOMETRY_HELPER_PLAN.md)

Current status:

- first pure geometry-helper slice implemented in `@vizx/geometry`
- implemented helpers: `point`, `offsetPoint`, `distance`, `midpoint`, `angleOf`, `polar`, `circlePoint`, `regularPolygonPoints`
- common tangent helper follow-on now implemented: `circleCircleTangents`
- focused technical application now implemented: `technical-common-tangents`
- first bounded belt/pulley bridge helper now implemented in builder layer: `openBeltPath`
- focused technical bridge example now implemented: `technical-belt-pulley`
- no arc helpers, angle-arc helpers, parser/JSON work, or runtime rendering features added in this slice

## 6. Milestone 3 - Arc And Angle-Mark Support

Goal:

- unlock common geometry and physics illustrations with circular arcs and angle annotations

Potential features:

- arc path model design
- v0 arc command
- conservative arc bbox behavior
- angle marker helper
- arc label helper

Target gallery examples:

- TikZ/Diagram for the Bernoulli Principle
- TikZ/Flipping a coin
- TikZ/projectile_motion
- MetaPost/pendagon.mp
- Asymptote/fig0810.asy

Acceptance criteria:

- at least one arc example renders
- at least one angle diagram renders
- transformed arcs behave predictably
- tight arc bounds may remain deferred if documented clearly

Detailed Milestone 3 plan:

- [ARC_AND_ANGLE_MARK_MODEL_PLAN.md](./ARC_AND_ANGLE_MARK_MODEL_PLAN.md)

Milestone 3 implementation checkpoint:

- [ARC_AND_ANGLE_MARK_CHECKPOINT.md](./ARC_AND_ANGLE_MARK_CHECKPOINT.md)

## 7. Milestone 4 - Fill, Dash, And Style Expansion

Goal:

- improve visual resemblance for technical-illustration examples

Potential features:

- `strokeDasharray`
- line cap / line join controls
- fill-rule / winding-rule controls
- opacity refinements
- later clipping
- later gradients

Target gallery examples:

- TikZ/Coffee cup
- TikZ/Totoro sitting in the snow
- MetaPost/dominos.mp
- MetaPost/paintball.mp
- Asymptote/fig0040.asy

Acceptance criteria:

- examples reach recognizable visual resemblance
- clipping/gradients remain separate follow-up slices unless explicitly prioritized

Detailed Milestone 4 plan:

- [STYLE_EXPANSION_MODEL_PLAN.md](./STYLE_EXPANSION_MODEL_PLAN.md)

Current status:

- first implementation slice landed for `strokeDasharray`, `strokeLineCap`, `strokeLineJoin`, and `fillRule`
- style serialization support is now present in the SVG renderer with resolver pass-through
- `aspirational-labeled-polygon` now applies `strokeDasharray`, `strokeLineCap`, and `strokeLineJoin` for clearer technical-geometry distinction
- `strokeOpacity`/`fillOpacity` remain deferred

Milestone 4 implementation checkpoint:

- [STYLE_EXPANSION_CHECKPOINT.md](./STYLE_EXPANSION_CHECKPOINT.md)

## 8. Milestone 5 - Plot/Data Coordinate Model

Goal:

- support annotated plot-like and timeline/schedule examples

Potential features:

- coordinate systems and scales
- axes
- ticks and labels
- data series marks
- line/scatter helpers
- annotation layers

Target gallery examples:

- TikZ/Linear regression
- TikZ/projectile_motion
- TikZ/Time course of events in an experiment
- MetaPost/example_timeline.mp
- MetaPost/example_schedule.mp
- MetaPost/waves.mp
- MetaPost/kiviat.mp

Acceptance criteria:

- host JS/TS remains the data processing layer
- VizX provides coordinate/mark/rendering model only
- D3 scales may be used by host code, but VizX does not become a D3 clone

Current status:

- planning docs now exist
- first narrow helper slice implemented (`linearScale`, `PlotFrame` + `mapDataPoint`, minimal axis helpers, `technical-linear-plot`)
- `aspirational-projectile-motion-lite` remains a manual bridge example, not a plot model implementation

Milestone 5 planning documents:

- [PLOT_DATA_COORDINATE_MODEL_PLAN.md](./PLOT_DATA_COORDINATE_MODEL_PLAN.md)
- [PLOT_DATA_ASPIRATIONAL_TARGETS.md](./PLOT_DATA_ASPIRATIONAL_TARGETS.md)

## 9. Milestone 6 - 2.5D Projection Helpers (Not Full 3D)

Goal:

- support simple projected technical illustrations without becoming a 3D engine

Potential features:

- isometric projection helper
- 3D-point to 2D-point projection helpers
- cube/prism wireframe helpers
- hidden-edge style helpers

Target gallery examples:

- Asymptote/labeled_cube
- MetaPost/isometric_projection.mp
- TikZ/regular_hexagonal_prism
- TikZ/retular_tetrahedron

Acceptance criteria:

- helper-layer approach first
- no full 3D engine scope
- no camera/material pipeline
- examples render as projected 2D scenes

## 10. Milestone Table

| Milestone | Goal | Target gallery examples | New features needed | Reproduction level target | Suggested first slice |
| --- | --- | --- | --- | --- | --- |
| 1. Mini-gallery now | Prove current capability reach | Android lifecycle, database decimation, UML component, arrow label, labeled polygon, geometry_1 | No runtime feature additions required for first subset | Level 1 to Level 2 | 2 to 3 examples first: android lifecycle, labeled polygon, arrow label |
| 2. Geometry helpers | Improve math-diagram authoring ergonomics | labeled_polygon, geometry_1, fig0110, fig0140, fig0210, pappus, mechanism | JS/TS helper utilities only | Level 2 | Add helper module + 1 to 2 geometry examples |
| 3. Arcs/angles | Unlock curved geometry annotations | Bernoulli, flipping coin, projectile_motion, pendagon, fig0810 | Arc command/model, angle mark helpers | Level 2 | Arc model design + one arc example |
| 4. Style expansion | Improve fidelity | Coffee cup, Totoro, dominos, paintball, fig0040 | Dash/cap/join/fill-rule refinements | Level 2 to Level 3 | Dash + cap/join with one style-heavy example |
| 5. Plot model | Support data-coordinate figures | Linear regression, projectile_motion, time-course, timeline, schedule, waves, kiviat | Axes/scales/ticks/series model | Level 2 | One plot + one timeline example |
| 6. 2.5D projections | Support projected technical sketches | labeled_cube, isometric_projection, regular_hexagonal_prism, retular_tetrahedron | Projection helpers, wireframe helpers | Level 1 to Level 2 | Isometric helper + labeled cube |

## 11. Roadmap Ordering

Recommended order:

1. Current-capability aspirational mini-gallery
2. Geometry helper layer
3. Arc and angle-mark support
4. Fill/dash/style expansion
5. Plot/data coordinate model
6. 2.5D projection helpers

Why this order:

- starts with examples that current VizX can plausibly reproduce now
- validates builder ergonomics against real technical-illustration tasks
- keeps parser and source translation deferred
- avoids jumping directly into 3D/fractal/animation domains
- lets missing features emerge from concrete reproduction attempts

## 12. Recommended Next Implementation Slice

Recommended immediate slice:

- add 2 to 3 current-capability aspirational examples first:
  - `aspirational-android-lifecycle`
  - `aspirational-labeled-polygon`
  - `aspirational-arrow-label`

Implementation constraints for that slice:

- registry-backed builder examples
- tests covering resolve/inspect/debug and non-brittle semantic checks
- brief reproduction notes stating compromises and missing capabilities

## 13. Out Of Scope

Explicitly deferred by this roadmap pass:

- translating TikZ/Asymptote/MetaPost source
- parser syntax work
- JSON Core IR catch-up
- parser AST catch-up
- full 3D engine features
- animation systems
- graph layout/routing engines
- nonlinear solver behavior
- automatic visual matching against originals

## Related Documents

- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
- [ASPIRATIONAL_GALLERY_INVENTORY.json](./ASPIRATIONAL_GALLERY_INVENTORY.json)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [JS_TS_BUILDER_API_COOKBOOK.md](./JS_TS_BUILDER_API_COOKBOOK.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [PATH_CURVE_CHECKPOINT.md](./PATH_CURVE_CHECKPOINT.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
