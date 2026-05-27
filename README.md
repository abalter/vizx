# VizX

VizX is an experimental TypeScript project for a precise, programmable 2D drawing language built around geometry, objects, anchors, reusable components, and backend-neutral rendering.

The goal is not to replace higher-level diagram languages such as Mermaid, Graphviz, PGFPlots, TikZ, or Asymptote directly. The goal is to define the layer underneath those systems: a coherent mid-level drawing model where objects have geometry, anchors, styles, transforms, reusable components, and eventually constraints.

VizX starts from a simple premise:

> A drawing should be a resolved graph of geometric objects, not merely a sequence of drawing commands.

That means a user should be able to say things like:

```vizx
box A "Raw data" at 60 40
box B "Clean / transform" right_of A by 120
connect A.east -> B.west
```

and the system should preserve the meaning long enough to compute object sizes, anchors, connector paths, and final renderable output.

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

This repository is a design scaffold and early TypeScript prototype. It includes:

- a proposed architecture in [`DESIGN.md`](./DESIGN.md),
- a capability matrix in [`docs/CAPABILITY_MATRIX.md`](./docs/CAPABILITY_MATRIX.md),
- package-level specifications in each package's `SPEC.md`,
- a small geometry kernel,
- a minimal unresolved object model,
- a small TypeScript example registry used by the CLI and tests,
- a simple resolver,
- an SVG renderer,
- tests for the core pipeline,
- and a CLI demo path.

The current syntax is intentionally provisional. The active development path is the core model and pipeline, built from the inside out.

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
    core/          Shared diagnostics, style types, and common interfaces
    examples/      TypeScript example registry and capability harness
    geometry/      Pure geometry primitives and operations
    object-model/  Unresolved drawable objects and anchor references
    resolver/      Object graph → resolved geometry → render scene
    renderer-svg/  Render scene types and SVG serialization
    cli/           Command-line demo entry point
    parser/        Provisional syntax experiment, not the primary development path
    interpreter/   Legacy compatibility scaffold
```

## Pipeline

```text
core IR or object graph
  ↓
unresolved object graph
  ↓
resolver
  ↓
resolved scene
  ↓
render scene graph
  ↓
renderer backend: SVG first, others later
```

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

Examples are currently TypeScript scene builders collected in `@vizx/examples`, not parser-driven source files. `npm run demo` writes [`examples/basic.svg`](./examples/basic.svg) for the built-in basic example. `npm run examples` renders normal and debug SVGs for every registered example into `examples/`, including focused placement fixtures such as `relative-placement`, `mixed-nested-placement`, `alignment-reference`, `alignment-family`, and `distribute-x`. `npm run inspect` prints resolved geometry, anchors, connector endpoints, diagnostics, and nested group children for the basic example as JSON when available. Bounding boxes, anchors, and geometry summaries all use resolved scene coordinates. `npm run debug` writes `examples/basic.debug.svg`, overlaying resolved bounding boxes, anchor points, object ids, and connector endpoints on the normal diagram. The same example registry also feeds the capability-oriented test harness, and the current capability coverage is summarized in [`docs/CAPABILITY_MATRIX.md`](./docs/CAPABILITY_MATRIX.md), including deterministic alignment support for `alignLeft`, `alignRight`, `alignTop`, `alignBottom`, `alignX`, `alignY`, and `distributeX`. The debug overlay is configurable programmatically through `createDebugOverlay(..., options)` and `createDebugRenderScene(..., options)` in the resolver package. The parser scaffold remains in the repository, but it is not the primary driver of the architecture.

## Design principles

1. **Meaning before marks.** Preserve objects, anchors, and relationships before lowering to paths and text.
2. **Backend-neutral core.** The interpreter should not know whether the final target is SVG, Canvas, PDF, or TikZ.
3. **SVG first.** SVG is the first backend because it naturally represents groups, paths, text, markers, styles, symbols, and transforms.
4. **Typed geometry.** Points, vectors, lengths, transforms, paths, and boxes should be explicit concepts.
5. **Deferred resolution.** Text size, bounding boxes, anchors, and connector paths may not be known when objects are first declared.
6. **Composable objects.** Reusable components should be first-class.
7. **Inspectability.** Debug output should expose the AST, core IR, object graph, anchors, and resolved scene.

## Non-goals for the first prototype

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
