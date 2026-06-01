# VizX Specification Index

This directory and each package-level `SPEC.md` describe the contracts that implementation code should follow.

## Package specs

- [`packages/core/SPEC.md`](../packages/core/SPEC.md) — shared geometry, units, command IR, object graph, scene graph.
- [`packages/parser/SPEC.md`](../packages/parser/SPEC.md) — source syntax, AST, lowering to core IR.
- [`packages/interpreter/SPEC.md`](../packages/interpreter/SPEC.md) — evaluation, resolution, anchors, object graph, scene graph generation.
- [`packages/renderer-svg/SPEC.md`](../packages/renderer-svg/SPEC.md) — SVG output backend.
- [`packages/cli/SPEC.md`](../packages/cli/SPEC.md) — CLI behavior and debugging output.

## Design docs

- `examples/aspirational-gallery-manifest.json` is a generated metadata index derived from `packages/examples/src/index.ts` via `npm run manifest:aspirational`.
- `examples/aspirational-gallery.html` is a generated static review page derived from aspirational manifest metadata plus existing rendered SVG outputs via `npm run gallery:aspirational`.
- `examples/example-gallery-manifest.json` is a generated metadata index derived from `packages/examples/src/index.ts` via `npm run manifest:examples` and includes `aspirational-*` + `technical-*` examples.
- `examples/example-gallery.html` is a generated static review page derived from generalized example manifest metadata plus existing rendered SVG outputs via `npm run gallery:examples`.
- [`TECHNICAL_MATH_DRAWING_CHECKPOINT.md`](./TECHNICAL_MATH_DRAWING_CHECKPOINT.md) — docs-only medium-depth checkpoint consolidating implemented technical/math helper surface, aspirational example coverage, remaining gaps, and recommended next branch.
- [`TECHNICAL_MATH_DRAWING_POST_MECHANISM_CHECKPOINT.md`](./TECHNICAL_MATH_DRAWING_POST_MECHANISM_CHECKPOINT.md) — docs-only post-mechanism decision checkpoint summarizing the current technical/math/mechanical drawing stack, example coverage, strategic gaps, next-branch options, and the recommendation to prioritize JSON Core IR / parser AST catch-up.
- [`JSON_CORE_IR_CATCHUP_AUDIT.md`](./JSON_CORE_IR_CATCHUP_AUDIT.md) — bounded runtime/Core-IR/parser comparison audit covering current catch-up status for object kinds, path commands, style fields, transform fields, and explicit deferments.
- [`PARSER_AST_CATCHUP_AUDIT.md`](./PARSER_AST_CATCHUP_AUDIT.md) — parser-model parity audit comparing runtime and JSON Core IR surfaces with current parser AST representability, syntax deferrals, and bounded next-step recommendations.
- [`TECHNICAL_GEOMETRY_HELPER_PLAN.md`](./TECHNICAL_GEOMETRY_HELPER_PLAN.md) — Milestone 2 docs-only plan for a JS/TS technical geometry helper layer that complements builder-based scene authoring.
- [`GEOMETRY_INTERSECTION_HELPER_PLAN.md`](./GEOMETRY_INTERSECTION_HELPER_PLAN.md) — implementation-facing v0 plan for pure line-line, line-circle, and circle-circle intersection helpers with explicit non-solver boundaries.
- [`GEOMETRY_TANGENT_HELPER_PLAN.md`](./GEOMETRY_TANGENT_HELPER_PLAN.md) — implementation-facing v0 plan for pure tangent helpers (circle-point tangent line and external-point circle tangency points) with explicit no-solver boundaries.
- [`GEOMETRY_COMMON_TANGENT_HELPER_PLAN.md`](./GEOMETRY_COMMON_TANGENT_HELPER_PLAN.md) — implementation-facing v0 plan for pure common tangents between two circles with deterministic ordering, simple degeneracy handling, and explicit no-solver boundaries.
- [`GEOMETRY_BELT_PULLEY_HELPER_PLAN.md`](./GEOMETRY_BELT_PULLEY_HELPER_PLAN.md) — implementation-facing v0 plan for bounded open/crossed belt helpers (`openBeltPath`, `crossedBeltPath`) built from external/internal common tangents and existing circular arc path commands.
- [`MECHANISM_LINKAGE_HELPER_PLAN.md`](./MECHANISM_LINKAGE_HELPER_PLAN.md) — implementation-facing v0 note for a bounded static mechanism/linkage authoring slice built from existing intersections, annotation helpers, and ordinary primitive objects.
- [`GEOMETRY_SEGMENT_RAY_HELPER_PLAN.md`](./GEOMETRY_SEGMENT_RAY_HELPER_PLAN.md) — implementation-facing v0 plan for pure segment/ray clipped construction helpers (`pointOnSegment`, `pointOnRay`, `segmentSegmentIntersection`, `segmentCircleIntersections`, `rayCircleIntersections`) with explicit non-solver boundaries.
- [`PATH_TRIMMING_HELPER_PLAN.md`](./PATH_TRIMMING_HELPER_PLAN.md) — implementation-facing v0 plan for bounded straight-segment trimming helpers (`trimSegment`, `trimSegmentStart`, `trimSegmentEnd`, `trimSegmentToCircle`) plus builder conveniences (`trimmedLine`, `circleToCircleLine`, `circleToCircleArrow`) with explicit no-curve/no-solver boundaries.
- [`PATH_TRIMMING_APPLICATION_CHECKPOINT.md`](./PATH_TRIMMING_APPLICATION_CHECKPOINT.md) — docs-only checkpoint recording where existing trimming helpers have been applied across technical and aspirational examples as explicit authoring polish, plus current deferred boundaries.
- [`PATH_TRIMMING_POST_APPLICATION_CHECKPOINT.md`](./PATH_TRIMMING_POST_APPLICATION_CHECKPOINT.md) — docs-only consolidation checkpoint summarizing implemented trimming stack, applied example coverage, deferred gaps, next-branch options, and recommendation for a docs-only `cutbefore` / `cutafter` design pass.
- [`TECHNICAL_ANNOTATION_HELPER_PLAN.md`](./TECHNICAL_ANNOTATION_HELPER_PLAN.md) — implementation-facing v0 plan for explicit annotation authoring helpers (`labelAlongSegment`, `rightAngleMarkPath`, `segmentTickMarkPath`, `segmentTickMarks`) that emit existing points/path objects without introducing new runtime semantics.
- [`ARC_AND_ANGLE_MARK_MODEL_PLAN.md`](./ARC_AND_ANGLE_MARK_MODEL_PLAN.md) — Milestone 3 docs-only model plan for first-class arc path commands, diagnostics, and angle-mark composition strategy.
- [`ARC_AND_ANGLE_MARK_CHECKPOINT.md`](./ARC_AND_ANGLE_MARK_CHECKPOINT.md) — post-implementation checkpoint for Milestone 3 circular arc and angle-mark helper support, current limits, and next branch options.
- [`STYLE_EXPANSION_MODEL_PLAN.md`](./STYLE_EXPANSION_MODEL_PLAN.md) — Milestone 4 docs-only model plan for dash/cap/join/fill-rule style expansion and resolver/renderer contracts.
- [`STYLE_EXPANSION_CHECKPOINT.md`](./STYLE_EXPANSION_CHECKPOINT.md) — post-implementation checkpoint for Milestone 4 style expansion, current limits, and next branch options.
- [`PLOT_DATA_COORDINATE_MODEL_PLAN.md`](./PLOT_DATA_COORDINATE_MODEL_PLAN.md) — Milestone 5 docs-only implementation-ready plan for a small plot/data-coordinate model (`CoordinateFrame`, linear scales, axis helpers, and first-slice boundaries).
- [`PLOT_DATA_ASPIRATIONAL_TARGETS.md`](./PLOT_DATA_ASPIRATIONAL_TARGETS.md) — Milestone 5 target audit of plot/timeline/radar-like aspirational gallery examples with feasibility triage and first-slice prioritization.
