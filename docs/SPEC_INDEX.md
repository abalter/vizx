# VizX Specification Index

This directory and each package-level `SPEC.md` describe the contracts that implementation code should follow.

## Package specs

- [`packages/core/SPEC.md`](../packages/core/SPEC.md) — shared geometry, units, command IR, object graph, scene graph.
- [`packages/parser/SPEC.md`](../packages/parser/SPEC.md) — source syntax, AST, lowering to core IR.
- [`packages/interpreter/SPEC.md`](../packages/interpreter/SPEC.md) — evaluation, resolution, anchors, object graph, scene graph generation.
- [`packages/renderer-svg/SPEC.md`](../packages/renderer-svg/SPEC.md) — SVG output backend.
- [`packages/cli/SPEC.md`](../packages/cli/SPEC.md) — CLI behavior and debugging output.

## Design docs

- [`README.md`](../README.md) — top-level current status, capability highlights, and recommended entry points.
- [`roadmap.md`](../roadmap.md) — root milestone roadmap connecting implemented foundation to aspirational-example progression.
- [`DESIGN.md`](../DESIGN.md) — overall architecture.
- [`LANGUAGE_SKETCH.md`](./LANGUAGE_SKETCH.md) — provisional syntax ideas.
- [`JS_GRAPHICS_LIBRARY_LANDSCAPE.md`](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md) — comparative design note across VizX, Two.js, Raphaël, Snap.svg, D3, and Three.js.
- [`JS_TS_BUILDER_API_PLAN.md`](./JS_TS_BUILDER_API_PLAN.md) — design and status note for the implemented first builder helper slice.
- [`JS_TS_BUILDER_API_COOKBOOK.md`](./JS_TS_BUILDER_API_COOKBOOK.md) — practical usage/cookbook examples for the current builder helper surface.
- [`JS_TS_BUILDER_API_CHECKPOINT.md`](./JS_TS_BUILDER_API_CHECKPOINT.md) — post-parity checkpoint summary of implemented builder scope, identity, limits, and next branches.
- [`ASPIRATIONAL_REPRODUCTION_ROADMAP.md`](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md) — milestone-driven, example-first roadmap for reproducing selected aspirational gallery examples.
- [`TECHNICAL_MATH_DRAWING_TRACK.md`](./TECHNICAL_MATH_DRAWING_TRACK.md) — near-term technical/mathematical drawing track note that re-centers geometry-first example pressure while keeping plot/data planning documented.
- [`TECHNICAL_MATH_DRAWING_CHECKPOINT.md`](./TECHNICAL_MATH_DRAWING_CHECKPOINT.md) — docs-only medium-depth checkpoint consolidating implemented technical/math helper surface, aspirational example coverage, remaining gaps, and recommended next branch.
- [`TECHNICAL_GEOMETRY_HELPER_PLAN.md`](./TECHNICAL_GEOMETRY_HELPER_PLAN.md) — Milestone 2 docs-only plan for a JS/TS technical geometry helper layer that complements builder-based scene authoring.
- [`GEOMETRY_INTERSECTION_HELPER_PLAN.md`](./GEOMETRY_INTERSECTION_HELPER_PLAN.md) — implementation-facing v0 plan for pure line-line, line-circle, and circle-circle intersection helpers with explicit non-solver boundaries.
- [`GEOMETRY_TANGENT_HELPER_PLAN.md`](./GEOMETRY_TANGENT_HELPER_PLAN.md) — implementation-facing v0 plan for pure tangent helpers (circle-point tangent line and external-point circle tangency points) with explicit no-solver boundaries.
- [`ARC_AND_ANGLE_MARK_MODEL_PLAN.md`](./ARC_AND_ANGLE_MARK_MODEL_PLAN.md) — Milestone 3 docs-only model plan for first-class arc path commands, diagnostics, and angle-mark composition strategy.
- [`ARC_AND_ANGLE_MARK_CHECKPOINT.md`](./ARC_AND_ANGLE_MARK_CHECKPOINT.md) — post-implementation checkpoint for Milestone 3 circular arc and angle-mark helper support, current limits, and next branch options.
- [`STYLE_EXPANSION_MODEL_PLAN.md`](./STYLE_EXPANSION_MODEL_PLAN.md) — Milestone 4 docs-only model plan for dash/cap/join/fill-rule style expansion and resolver/renderer contracts.
- [`STYLE_EXPANSION_CHECKPOINT.md`](./STYLE_EXPANSION_CHECKPOINT.md) — post-implementation checkpoint for Milestone 4 style expansion, current limits, and next branch options.
- [`PLOT_DATA_COORDINATE_MODEL_PLAN.md`](./PLOT_DATA_COORDINATE_MODEL_PLAN.md) — Milestone 5 docs-only implementation-ready plan for a small plot/data-coordinate model (`CoordinateFrame`, linear scales, axis helpers, and first-slice boundaries).
- [`PLOT_DATA_ASPIRATIONAL_TARGETS.md`](./PLOT_DATA_ASPIRATIONAL_TARGETS.md) — Milestone 5 target audit of plot/timeline/radar-like aspirational gallery examples with feasibility triage and first-slice prioritization.
