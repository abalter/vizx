# VizX Specification Index

This directory and each package-level `SPEC.md` describe the contracts that implementation code should follow.

## Package specs

- [`packages/core/SPEC.md`](../packages/core/SPEC.md) — shared geometry, units, command IR, object graph, scene graph.
- [`packages/parser/SPEC.md`](../packages/parser/SPEC.md) — source syntax, AST, lowering to core IR.
- [`packages/interpreter/SPEC.md`](../packages/interpreter/SPEC.md) — evaluation, resolution, anchors, object graph, scene graph generation.
- [`packages/renderer-svg/SPEC.md`](../packages/renderer-svg/SPEC.md) — SVG output backend.
- [`packages/cli/SPEC.md`](../packages/cli/SPEC.md) — CLI behavior and debugging output.

## Design docs

- [`DESIGN.md`](../DESIGN.md) — overall architecture.
- [`LANGUAGE_SKETCH.md`](./LANGUAGE_SKETCH.md) — provisional syntax ideas.
- [`JS_GRAPHICS_LIBRARY_LANDSCAPE.md`](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md) — comparative design note across VizX, Two.js, Raphaël, Snap.svg, D3, and Three.js.
