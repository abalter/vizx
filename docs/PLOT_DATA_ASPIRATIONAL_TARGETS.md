# Plot/Data Aspirational Targets Audit

This audit supports Milestone 5 planning by reviewing real aspirational gallery sources that are plot-like, timeline-like, schedule-like, or coordinate-heavy.

Scope for this pass:

- docs-only audit
- no runtime changes
- no parser/JSON/AST changes

## 1. Purpose

The goal is to map gallery examples to the minimum feature slices needed for practical Level 1/Level 2 reproductions.

This audit is used together with:

- [PLOT_DATA_COORDINATE_MODEL_PLAN.md](./PLOT_DATA_COORDINATE_MODEL_PLAN.md)
- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)

## 2. Current Baseline Lens

Current VizX can manually approximate many scenes using existing primitives, paths, labels, markers, and style fields.

However, for plot-like examples it lacks first-class helpers for:

- data-domain to scene-coordinate mapping
- axis/tick generation
- reusable series-generation patterns
- timeline/schedule lane semantics

`aspirational-projectile-motion-lite` is the bridge case: feasible today manually, but still lacking a reusable coordinate model.

## 3. Target Audit Table

| Target | Source path | Category | Current feasibility | Required features | Recommended reproduction target |
| --- | --- | --- | --- | --- | --- |
| Linear regression | `examples/aspirational_gallery/tikz/Linear regression` | axes/plot | v0 plot helpers needed | scales, axes, ticks, labels, line series, guide lines, shaded region/fill | Level 2 |
| Projectile motion | `examples/aspirational_gallery/tikz/projectile_motion` | projectile/physics coordinate diagram | current manual approximation possible (already implemented as lite) | optional frame/scale helpers, axis helpers, labels, line/path series, guides | Level 2 |
| Time course of events in an experiment | `examples/aspirational_gallery/tikz/Time course of events in an experiment` | timeline/schedule | v0 plot helpers needed | timeline layout, lane/step placement, duration labels, connectors/arrows | Level 1 to Level 2 |
| Example timeline | `examples/aspirational_gallery/metapost/example_timeline.mp` | timeline/schedule | later advanced feature needed | timeline domain model, milestones, phases, annotation tracks, richer lane layout | Defer (after v0) |
| Example schedule | `examples/aspirational_gallery/metapost/example_schedule.mp` | timeline/schedule | later advanced feature needed | timescale helpers, domain lanes, activity bars, milestone marks, schedule layout | Defer (after v0) |
| Waves | `examples/aspirational_gallery/metapost/waves.mp` | waveform/function | v0 plot helpers needed | scales, axes, ticks, line series, repeated transformed series, legend labels | Level 2 |
| Kiviat | `examples/aspirational_gallery/metapost/kiviat.mp` | graph/kiviat/radar | later advanced feature needed | polar/radar geometry, radial axes, polygonal series, fills, radar labels | Defer |
| Graph | `examples/aspirational_gallery/metapost/graph.mp` | graph/kiviat/radar | current manual approximation possible | node/edge drawing, label placement, optional graph layout later | Level 1 |

## 4. Example Notes

Linear regression (TikZ):

- combines axes, smooth curve, secant, projected guides, and annotation labels
- good first candidate for `technical-linear-plot` or `aspirational-linear-regression-lite`

Projectile motion (TikZ):

- already represented by `aspirational-projectile-motion-lite`
- should be retained as a before/after benchmark when frame/scale/axis helpers arrive

Time-course experiment (TikZ):

- resembles a timeline with staged screens and duration labels
- likely needs helper-level timeline conventions in a later Milestone 5 slice, but can be approximated with existing placement primitives

MetaPost timeline and schedule examples:

- both rely on higher-level domain constructs (phases, milestones, activities, domains)
- good milestone targets, but beyond the first v0 coordinate-slice implementation

Waves (MetaPost):

- strongly suggests value of reusable axes + series helpers
- supports Milestone 5 priority on line-series plotting helpers

Kiviat (MetaPost):

- implies a polar/radar sub-model, which should follow linear frame/axis work rather than precede it

Graph (MetaPost):

- mainly a graph drawing pattern, not strictly a plot model
- useful as a control to avoid overfitting Milestone 5 to every diagram family

## 5. Data File Note

`examples/aspirational_gallery/metapost/data1` appears as a compact numeric sequence and can be reused as a lightweight host-side data fixture for line/wave-style examples in future Milestone 5 examples.

## 6. Recommended Milestone 5 Sequencing From Audit

Recommended first implementation slice (after this docs pass):

1. v0 linear scale helper
2. frame/data-point mapping helper
3. minimal x/y axis helper outputting existing ObjectScene objects
4. one linear plot example (regression-lite or technical-linear-plot)

Recommended second slice:

1. grid/tick refinement
2. line/scatter helper expansion
3. wave-style example

Recommended later slices:

1. timeline/schedule lane helpers
2. polar/radar helpers for kiviat-like examples

## 7. Out Of Scope In This Audit

Explicitly not claimed as implemented:

- plot/data-coordinate runtime model
- timeline/schedule runtime model
- polar/radar runtime model
- parser or JSON support for these families

This document is planning and triage only.