# VizX

VizX is an experimental TypeScript project for precise, programmable 2D drawing built around geometry, objects, anchors, and an inspectable resolver/render pipeline.

VizX is not trying to directly replace TikZ, Asymptote, MetaPost, D3, Mermaid, Graphviz, or similar tools. The goal is a distinct niche: semantic, inspectable, programmable technical illustration in TypeScript.

VizX starts from a simple premise:

> A drawing should be a resolved graph of geometric objects, not merely a sequence of drawing commands.

## Why this exists

Many graphics systems each get part of the design right:

- **TikZ/PGF** has excellent node/anchor concepts and LaTeX-native styling.
- **Asymptote** treats technical drawing as real programming with mathematical geometry.
- **MetaPost** has elegant constructive geometry and equation-like thinking.
- **SVG** has a strong scene graph, grouping, symbols, references, and web-native rendering.
- **Graphviz and Mermaid** show the value of preserving relationships and meaning before layout.
- **PGFPlots and grammar-of-graphics systems** show the importance of separating semantics, coordinates, and rendered marks.

VizX is an attempt to build a clean lower/mid-level core that can eventually support many higher-level diagram grammars without forcing them to reinvent geometry, anchors, layout, styles, or rendering.

## Current status

Development is currently inside-out.

- Primary authoring surface is TypeScript `ObjectScene` plus builder helpers in `@vizx/object-model`.
- The parser/language surface remains deferred.
- SVG is the current renderer backend.
- Examples are registry-backed TypeScript scenes in `@vizx/examples`.
- `demo`, `inspect`, `debug`, and `examples` CLI/test flows are active and used as behavior contracts.

See [CORE_IR_SPEC.md](./docs/CORE_IR_SPEC.md) for the current structured model consumed by the resolver.

## Repository layout

```text
vizx/
  README.md
  DESIGN.md
  roadmap.md
  tsconfig.json
  docs/
    LANGUAGE_SKETCH.md
    SPEC_INDEX.md
  examples/
    basic.vizx
    basic.svg
  packages/
    core/          Shared style/diagnostic/core contracts
    geometry/      Pure geometry types and helper functions
    object-model/  ObjectScene types and builder helpers
    resolver/      Object graph -> resolved geometry -> render scene
    renderer-svg/  SVG serialization backend
    examples/      Registry-backed TypeScript scenes and harness
    cli/           Demo/inspect/debug/examples commands
    parser/        Deferred/frontier parser-lowering scaffold
    interpreter/   Legacy compatibility scaffold
```

## Current Implemented Capability Highlights

- Primitive geometry: `rect`, `circle`, `text`, `group`, `line`, `polyline`, `ellipse`, `polygon`.
- Paths: `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `arc`, `closePath`.
- Conservative path bbox behavior, including circular arc bbox handling.
- Ordered transforms: `translate`, `rotate`, `scale`.
- Connectors and built-in arrow markers.
- Technical geometry helpers (`point`, `midpoint`, `distance`, `polar`, `regularPolygonPoints`, etc.).
- Angle-mark helpers (`angleBetweenPoints`, `angleLabelPoint`, `angleMarkPath`).
- v0 technical style fields (`strokeDasharray`, `strokeLineCap`, `strokeLineJoin`, `fillRule`).
- Builder helpers for ObjectScene authoring.
- Inspect/debug/render tooling with registry-backed example validation.
- Aspirational reproduction examples (manual TS builder-authored Level 1-2 slices).

Current non-goals/deferrals include parser-driven language authoring, full plotting grammar, source translation, general graph layout, clipping/gradients/themes, and full 3D.

## Milestones Toward Aspirational Examples

Milestone path (docs-first, example-driven):

1. Current-capability aspirational mini-gallery.
2. Technical geometry helper layer.
3. Arc and angle-mark support.
4. Fill, dash, and style expansion.
5. Plot/data coordinate model.
6. 2.5D/projection helpers.

Current implementation status:

- Milestone 1: first aspirational reproductions exist.
- Milestone 2: first pure technical geometry helper slice exists.
- Milestone 3: circular arcs and angle-mark helpers exist and are applied to `aspirational-labeled-polygon`.
- Milestone 4: first v0 technical style fields exist.

See [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md) and [roadmap.md](./roadmap.md) for milestone status and next slices.

## Recommended Entry Points

- [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [docs/CAPABILITY_MATRIX.md](./docs/CAPABILITY_MATRIX.md)
- [docs/JS_TS_BUILDER_API_COOKBOOK.md](./docs/JS_TS_BUILDER_API_COOKBOOK.md)
- [docs/ARC_AND_ANGLE_MARK_CHECKPOINT.md](./docs/ARC_AND_ANGLE_MARK_CHECKPOINT.md)
- [docs/STYLE_EXPANSION_MODEL_PLAN.md](./docs/STYLE_EXPANSION_MODEL_PLAN.md)
- [docs/SPEC_INDEX.md](./docs/SPEC_INDEX.md)

## Quick start

Use Node 22 LTS with npm 10.x. The repository includes an `engines` range and `.nvmrc` for that toolchain.

```bash
nvm use
npm install
npm run build
npm run demo
npm run examples
npm run inspect
npm run debug
```

Examples are currently TypeScript scene builders collected in `@vizx/examples`, not parser-driven source files. `npm run demo` writes [examples/basic.svg](./examples/basic.svg). `npm run examples` renders normal and debug SVGs for every registered example into `examples/`. `npm run inspect` outputs resolved scene details as JSON, and `npm run debug` emits overlay SVG output for geometry inspection.

## Design Principles

1. **Meaning before marks.** Preserve objects, anchors, and relationships before lowering to paths and text.
2. **Backend-neutral core.** The interpreter should not know whether the final target is SVG, Canvas, PDF, or TikZ.
3. **SVG first.** SVG is the first backend because it naturally represents groups, paths, text, markers, styles, symbols, and transforms.
4. **Typed geometry.** Points, vectors, lengths, transforms, paths, and boxes should be explicit concepts.
5. **Deferred resolution.** Text size, bounding boxes, anchors, and connector paths may not be known when objects are first declared.
6. **Composable objects.** Reusable components should be first-class.
7. **Inspectability.** Debug output should expose the AST, core IR, object graph, anchors, and resolved scene.

## Non-Goals For The First Prototype

- Full plotting grammar.
- Flowchart semantics.
- General graph layout.
- General nonlinear constraint solving.
- Full LaTeX text measurement.
- 3D geometry.
- Visual editor.

These can become higher-level layers later.

## Name

The project is currently called **VizX**. The name is provisional.

## License

No final license decision has been made. A placeholder MIT license can be added when the project is ready to publish.
