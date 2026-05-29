# JS TS Builder API Plan

This document tracks the first implemented slice of an ergonomic JavaScript/TypeScript builder API for VizX scene construction.

Status:

- first builder helper slice is implemented
- runtime changes are limited to object-model helper exports and tests/examples using those helpers
- no dependency additions
- no parser/JSON Core IR/AST changes

## 1. Purpose

A builder API matters now because VizX has a growing object model and relation surface.

Current object literals are explicit and robust, but can become verbose in host code.

Goals of a builder API:

- keep JS/TS as the host programming layer
- reduce repetitive literal boilerplate
- improve discoverability and autocomplete for common scene patterns
- preserve current Core IR/ObjectScene/resolver architecture

Non-goal:

- replacing `ObjectScene` as the canonical model
- creating a new programming language or parser syntax

## 2. Current Baseline

Current model baseline (from object model, resolver, examples, and docs):

- `ObjectScene` with `objects`, optional `connectors`, optional `distribution`
- object kinds:
  - `group`
  - `rect`
  - `circle`
  - `text`
  - `line`
  - `polyline`
  - `ellipse`
  - `polygon`
  - `path`
- relation and behavior fields:
  - `placement`
  - `align`
  - scene-level `distribution`
  - semantic `connectors` via anchor refs
  - ordered `transform` operations (`translate`, `rotate`, `scale`)
  - shared `style` fields plus markers
- current examples are primarily object-literal construction
- parser AST/lowering exists but is separate
- JSON Core IR exists but is separate

Implication for builder design:

- builder output should target `ObjectScene` directly
- parser and JSON interchange are separate concerns

## 3. Design Principles

Builder API principles:

- `ObjectScene` remains canonical internal data
- builder API is optional convenience, not required infrastructure
- builder output is plain ObjectScene-compatible data
- no hidden global state
- no browser/DOM dependency
- no custom programming language semantics
- TypeScript-friendly by default
- composable with ordinary JS functions, loops, arrays, and data loading
- easy to test with structural equality
- easy to inspect/debug through existing resolver/inspect/debug flows
- does not bypass resolver diagnostics
- does not leak renderer-specific concepts into Core IR

## 4. API Style Options

### Option A: Simple Factory Functions

Example sketch (proposed API, not implemented):

```ts
const scene = sceneOf([
  rect("box", { center: { x: 0, y: 0 }, width: 100, height: 40 }),
  text("label", { text: "Hello", center: { x: 0, y: 0 } }),
  line("arrow", {
    start: { x: 0, y: 0 },
    end: { x: 100, y: 0 },
    style: { markerEnd: "arrow" },
  }),
]);
```

Pros:

- transparent output
- easy to serialize and snapshot test
- low API magic
- natural with host JS/TS generation

Cons:

- can still be verbose for chained relation edits

### Option B: Fluent Builders

Example sketch (proposed API, not implemented):

```ts
const scene = vizx.scene()
  .rect("box").center(0, 0).size(100, 40)
  .text("label").at(0, 0).content("Hello")
  .connect("box", "east").to("other", "west").arrow()
  .build();
```

Pros:

- compact, discoverable interaction flow
- can feel approachable for interactive authoring

Cons:

- hidden intermediate state
- harder type design and maintenance
- can evolve into DSL-like surface too early

### Option C: Hybrid Factories Plus Fluent Modifiers

Example sketch (proposed API, not implemented):

```ts
const box = rect("box").center(0, 0).size(100, 40).style({ fill: "white" });
const label = text("label").center(0, 0).content("Hello");

const scene = sceneOf([box, label]);
```

Pros:

- balances composability and ergonomics

Cons:

- still incurs fluent complexity in type system and behavior contracts

## 5. Recommended API Direction

Recommended direction for first implementation phase:

- start with simple typed factory functions
- return plain object data compatible with existing model types
- add focused helper functions for common relations and command construction
- defer full fluent chain API until usage patterns stabilize

Why this direction:

- less magic and easier debugging
- straightforward testing via equality and resolver results
- naturally serializable
- avoids premature DSL design
- aligns with current object-literal examples

## 6. Object Factory Coverage

Implemented initial object factory coverage:

- `scene(...)` / `sceneOf(...)`
- `group(...)`
- `rect(...)`
- `circle(...)`
- `text(...)`
- `line(...)`
- `polyline(...)`
- `ellipse(...)`
- `polygon(...)`
- `path(...)`

Implemented path command helpers:

- `moveTo(...)`
- `lineTo(...)`
- `quadraticCurveTo(...)`
- `cubicCurveTo(...)`
- `closePath()`

## 7. Relation Helpers

Implemented helper coverage:

Placement:

- `rightOf(...)`
- `leftOf(...)`
- `above(...)`
- `below(...)`
- `absolute(...)`

Alignment:

- `alignX(...)`
- `alignY(...)`
- `alignLeft(...)`
- `alignRight(...)`
- `alignTop(...)`
- `alignBottom(...)`

Distribution:

- `distributeX(...)`
- `distributeY(...)`

Connectors:

- `connector(...)`
- `anchor(...)`
- `arrowStart(...)` and `arrowEnd(...)`

Transforms:

- `translate(...)`
- `rotate(...)`
- `scale(...)`

Styles:

- style option pass-through for `stroke`, `fill`, `strokeWidth`, `opacity`
- marker convenience helpers (for example `arrowEnd()`), as pure style sugar

Implementation location:

- `packages/object-model/src/builder.ts`
- exported via `packages/object-model/src/index.ts`
- covered by `packages/object-model/src/builder.test.ts`
- exercised by `builder-basic`, `builder-relative-placement`, and `builder-bezier-path` in the examples registry

## 8. TypeScript Ergonomics

TypeScript guidance:

- preserve literal types where practical
- optimize for autocomplete on options objects
- avoid over-engineered generic chains in first slice
- prefer clear options-object parameters over heavy overload sets
- keep return types transparent and inspectable
- ensure output types remain assignable to existing `ObjectScene` contracts
- strongly typed object-id references can be explored later, not required in first slice

## 9. Data-Driven Generation

Builder API should support host-driven generation patterns:

- JS arrays/map/filter/reduce produce VizX object arrays
- host code may use D3 scales or other math libraries before builder calls
- builder remains composition-friendly rather than data-binding framework

Example sketch (proposed API):

```ts
const rows = data.map((d, i) =>
  rect(`row-${i}`, {
    center: { x: 120, y: 40 + i * 28 },
    width: d.value,
    height: 20,
    style: { fill: "#fff", stroke: "#000" },
  })
);

const scene = sceneOf(rows);
```

VizX should not implement a D3 clone; JS/TS host code remains the generation layer.

## 10. Example Sketches

All examples below follow the implemented first-slice helper style.

Simple box-and-arrow diagram:

```ts
const scene = sceneOf([
  rect("A", { center: point(80, 60), width: 90, height: 36 }),
  rect("B", { center: point(240, 60), width: 90, height: 36, placement: rightOf("A", "east", 40) }),
  connector("A->B", { objectId: "A", anchor: "east" }, { objectId: "B", anchor: "west" }, {
    style: { markerEnd: "arrow" },
  }),
]);
```

Generated row of repeated objects:

```ts
const boxes = Array.from({ length: 5 }, (_, i) =>
  rect(`box-${i}`, {
    center: point(80 + i * 110, 80),
    width: 90,
    height: 32,
  })
);
const scene = sceneOf(boxes);
```

Generated path from command helpers:

```ts
const wave = path("wave", {
  commands: [
    moveTo(point(20, 60)),
    quadraticCurveTo(point(80, 10), point(140, 60)),
    cubicCurveTo(point(180, 90), point(220, 20), point(260, 60)),
  ],
  style: { stroke: "black", fill: "none" },
});
```

Transform usage:

```ts
const tilted = rect("tilted", {
  center: point(120, 90),
  width: 100,
  height: 40,
  transform: [translate(10, -5), rotate(15), scale(1.1)],
});
```

Style/arrow usage:

```ts
const edge = line("edge", {
  start: point(40, 40),
  end: point(180, 40),
  style: { stroke: "black", strokeWidth: 1.5, markerEnd: "arrow" },
});
```

## 11. Relationship To Parser Syntax

Builder API is ordinary TypeScript construction, not parser syntax.

Clarifications:

- builder API may inform future parser ergonomics conceptually
- parser syntax remains deferred
- builder API can ship independently of parser work

## 12. Relationship To JSON Core IR

Builder output target:

- ObjectScene-compatible data

Clarifications:

- JSON Core IR remains an interchange/fixture layer
- builder API does not need to emit JSON Core IR in first slice
- any JSON bridge should be a separate explicit design decision

## 13. Implemented First Slice

The implemented first builder slice includes:

- a builder module in the existing object-model package
- simple factory functions only:
  - scene
  - object factories for all implemented kinds
  - path command helpers
  - connector helper
  - transform helpers
- tests asserting factory output equals expected ObjectScene snippets
- one example using builder helpers (`builder-basic`) with resolver/example coverage
- no fluent API in this slice
- no parser syntax work
- no JSON Core IR changes

## 14. Out Of Scope In This Pass

Explicitly deferred in this planning pass:

- implementation
- fluent chain DSL implementation
- parser syntax
- JSON Core IR bridge
- parser AST bridge
- runtime validation overhaul
- DOM/SVG wrapper API
- D3 clone behavior
- dependency additions
- source-language translation

## Related Documents

- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
- [JS_TS_BUILDER_API_CHECKPOINT.md](./JS_TS_BUILDER_API_CHECKPOINT.md)
- [JS_TS_BUILDER_API_COOKBOOK.md](./JS_TS_BUILDER_API_COOKBOOK.md)
- [PATH_CURVE_CHECKPOINT.md](./PATH_CURVE_CHECKPOINT.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
