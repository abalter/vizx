# Aspirational Gallery Capability Audit

This audit compares `examples/aspirational_gallery/` against the current VizX baseline in `packages/object-model`, `packages/resolver`, `packages/renderer-svg`, `packages/examples`, and `packages/geometry`.

The inventory is intentionally heuristic. It uses file names plus representative source sampling to estimate which gallery examples are close to the current VizX model and which ones imply larger future capability clusters.

## Current VizX Baseline

VizX currently models a small diagramming core: `group`, `rect`, `circle`, and `text` objects; straight `connector`s; relative placement; alignment; and X/Y distribution. The resolver turns that into resolved geometry and SVG output, including path output for connectors, but the source object model still does not expose a general path, curve, fill, clip, or charting language.

That means the current baseline is strongest for box-and-label diagrams, simple nested groups, and straight connector layouts. Anything requiring arbitrary paths, line caps, fills, clipping, curves, plotting, 3D projection, or programmatic recursion still needs more primitives or a broader scene model.

## Audit Rubric

- `B` = diagram-like and conceptually close, but still simplified relative to the gallery source.
- `C` = needs modest new primitives such as circles, polygons, arrowheads, or coordinate-geometry helpers.
- `D` = needs a general 2D path model, curves, clip/fill operations, decorations, or richer transforms.
- `E` = needs charting/data conventions such as axes, scales, plots, regression, or timeline semantics.
- `F` = needs 3D/projection/fractal/animation/procedural drawing capability.
- `G` = useful inspiration, but not a near-term target for the current architecture.

No gallery file is an exact drop-in match for the current VizX baseline, so `A` is empty in this audit.

## Gallery Inventory

Heuristic inventory counts by family and category:

| Family | B | C | D | E | F | G | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| TikZ | 2 | 0 | 7 | 6 | 6 | 0 | 21 |
| Asymptote | 0 | 6 | 7 | 0 | 15 | 0 | 28 |
| MetaPost | 2 | 4 | 4 | 6 | 10 | 2 | 28 |
| Total | 4 | 10 | 18 | 12 | 31 | 2 | 77 |

The inventory file is available at [docs/ASPIRATIONAL_GALLERY_INVENTORY.json](docs/ASPIRATIONAL_GALLERY_INVENTORY.json).

## Family Observations

### TikZ

The TikZ samples split into three broad groups. A small set is diagram-like and close to the current model in spirit, especially the Android activity lifecycle and database decimation examples. A larger cluster depends on path operations, blending, clipping, or repeated decorative structure, and another cluster needs plotting, axes, or 3D support.

The most important gap in TikZ is not aesthetics; it is the lack of a general path and styling model. Once the core can express lines, arrowheads, curves, and fills, a large fraction of the family becomes much more plausible.

### Asymptote

Asymptote is the most geometry-heavy family in the gallery. Even the lighter examples often rely on coordinate systems, point math, rotation, and projection. The heavier examples move quickly into surfaces, 3D scenes, and explicit geometry construction.

The closest current-fit examples are the simple label-and-geometry pieces, but the dominant signal is still a need for richer primitives and coordinate geometry before the gallery becomes a comfortable target.

### MetaPost

MetaPost spans the widest range of diagram styles. Some files are simple enough to read as connector diagrams or label sketches, but many others lean on macros, cycles, filldraw, graph or timeline conventions, or programmatic repetition.

This family is the clearest argument for separating “basic diagram composition” from “full drawing language” in the roadmap. There is a meaningful middle tier before the 3D and fractal examples.

## Host-language Programmability Versus VizX Language Features

VizX should not try to become a full programming language like Asymptote or MetaPost. The intended architecture is a composable JavaScript/TypeScript graphics and layout library, where JS/TS supplies the programming layer and VizX supplies the graphics model that generated objects lower into.

JavaScript/TypeScript can already provide the parts that make many gallery examples look "programmable": loops, conditionals, functions, modules, reusable components, recursion, random generation, data loading, external math libraries, and other parametric generation patterns. Those capabilities belong to the host language, not to VizX itself.

VizX should provide the graphics and layout substrate: object model, layout model, geometry primitives, paths and marks and shapes, coordinate systems, styling, and rendering backends. When a gallery example relies on fractals, phyllotaxy, snowflakes, repeated geometry, procedural decorations, or data-driven diagrams, the missing capability is usually a graphics/model/rendering gap if JS/TS could generate the objects.

That distinction matters for prioritization. This audit should not treat every loop-heavy or macro-heavy source file as evidence that VizX needs its own macro system or programming language. The first question is whether the source language is just generating drawing objects, or whether VizX still lacks the actual geometric or rendering primitive those objects need.

In practical terms, there are two separate buckets:

1. Host-language generation needs, already supplied by JS/TS.
2. VizX model/rendering gaps, such as path, curve, polygon, fill, transform, plot, 3D, or animation support.

## Most Reachable Examples

These are the examples that look closest to the current architecture, even though they still exceed it in at least one direction:

- TikZ/Diagram of Android activity life cycle
- TikZ/Database decimation process
- MetaPost/example_umlcomponent.mp
- MetaPost/arrow_label.mp
- Asymptote/labeled_polygon
- Asymptote/geometry_1

These are useful because they expose the first missing primitives very clearly: line segments, arrowheads, path routing, and simple geometry helpers.

## Highest-Value Gaps

The ranking below is intentionally about VizX capabilities, not about whether the source gallery file contains loops or macros. JS/TS can already handle the generation layer.

1. Basic geometric primitives: line, polyline, circle, ellipse, polygon.
2. Path model: move, line, and curve commands; stroke and fill; arrowheads.
3. Styling model: stroke width, fill, opacity, dash patterns.
4. Transform and local coordinate model: translate, rotate, scale, nested or local coordinate systems.
5. Plot and data coordinate model: axes, numeric scales, data series, labels, ticks.
6. 3D and projection model.
7. Optional surface syntax or import and transpilation, long-term only.

These are the high-value gaps because they let JS-generated objects express a much wider slice of the gallery without requiring VizX to grow into a standalone language.

## Roadmap Implications

The audit suggests a capability order rather than a gallery-by-gallery chase:

1. diagram primitives: lines, arrows, and simple path routing
2. path language: polylines, curves, arcs, closures, and clipping
3. styling: fills, dashes, opacity, markers, and transforms
4. geometry helpers: circles, polygons, angle helpers, and coordinate frames
5. charting: axes, scales, plots, and annotation layers
6. 3D and projection: only after the 2D path model is stable

That ordering keeps the parser and lowerer architecture syntax-neutral while still making future gallery parity incremental and testable.

The first four primitive slices, `line`, `polyline`, `ellipse`, and `polygon`, have now been implemented; the remaining ordering still applies for the next geometry primitives.

For the concrete next-step design, see [Primitive Geometry Model Plan](./PRIMITIVE_GEOMETRY_MODEL_PLAN.md).
For the minimal arrowhead and marker design that follows the current line/polyline/path baseline, see [Marker Arrowhead Model Plan](./MARKER_ARROWHEAD_MODEL_PLAN.md).
For the docs-only checkpoint after the current 2D primitive foundation landed, see [Primitive Geometry Checkpoint](./PRIMITIVE_GEOMETRY_CHECKPOINT.md).
For the docs-only transform/local-coordinate design pass that follows that checkpoint, see [Transform Local Coordinate Model Plan](./TRANSFORM_LOCAL_COORDINATE_MODEL_PLAN.md).

## Future Fixture Recommendations

The next fixture sets should be chosen by capability slice, not by source language.

- For `B`, add box-and-arrow workflows, lifecycle diagrams, and component diagrams.
- For `C`, add circles, polygons, coordinate frames, and label placement around geometry.
- For `D`, add path, curve, clipping, and fill-focused fixtures.
- For `E`, add axes, regression, timeline, and annotated chart fixtures.
- For `F`, add one small 3D/projection example and one programmatic/fractal example.

## Out of Scope For Now

The gallery also contains a small number of pieces that are best treated as inspiration only for now: macro-heavy drawing systems, elaborate artistic renderings, and deep language-specific examples that depend on broad runtime behavior rather than a declarative scene model. Those examples may still be useful as references for JS/TS-side generation patterns, but they are not evidence that VizX needs to absorb that programming layer itself.

That does not make them unimportant; it just means they are not a good first target for the current VizX architecture.