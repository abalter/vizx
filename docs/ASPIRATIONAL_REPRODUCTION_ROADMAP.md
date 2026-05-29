# Aspirational Reproduction Roadmap

This document defines a milestone-based roadmap for reproducing selected examples from TikZ, Asymptote, and MetaPost within VizX.

Scope:

- docs-only roadmap
- no runtime changes
- no parser/JSON/AST implementation changes
- no dependency additions

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
- `path` with `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `closePath`
- built-in arrow markers via `markerStart` / `markerEnd`
- style baseline: `stroke`, `fill`, `strokeWidth`, `opacity`
- ordered transforms: `translate`, `rotate`, `scale`
- placement, alignment, and distribution relations
- connector objects
- bbox-derived anchors
- builder helpers as ergonomic authoring layer
- inspect/debug/render pipeline

Current limitations and intentional deferrals:

- arcs
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
- implemented as manual builder-authored Level 1-2 reproductions
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
