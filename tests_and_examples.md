# VizX Tests and Examples Strategy

## Purpose

VizX should eventually have a test suite that covers every intended capability, but it should not treat every visual output as a fragile SVG snapshot.

The project now has enough infrastructure to expand examples in a disciplined way. The current architecture can build, test, render a demo, inspect the resolved scene, and generate a debug SVG overlay from resolved model data. The debug overlay now has a programmatic options surface, so future examples can be tested with both dense and selective debug views without changing the command-line interface.

The core principle is:

> Every new core capability should get at least one focused example and at least one real test.

Examples are for humans. Fixtures are stable inputs. Tests are guarantees.

---

## Current Baseline

As of the latest development slice, the project baseline is:

- `npm run build` passes.
- `npm run test` passes.
- `npm run demo` passes.
- `npm run inspect` passes.
- `npm run debug` passes.
- `npm run demo` writes `examples/basic.svg`.
- `npm run debug` writes `examples/basic.debug.svg`.
- `npm run inspect` reports resolved object counts, ids, kinds, bounding boxes, anchors, connector endpoint points, nested children, and diagnostics.
- Bounding boxes, anchors, and geometry summaries all use resolved scene coordinates.
- Debug overlays are generated from resolved model data using normal render nodes.
- `DebugOverlayOptions` exists in the resolver layer.
- `createDebugOverlay(...)` and `createDebugRenderScene(...)` accept optional debug overlay options.
- Debug overlay options are programmatic only for now.
- The default debug overlay remains dense: bounding boxes, anchors, labels, connector endpoints, and nested children are all enabled.
- `.tsbuildinfo` is ignored.

This means VizX is ready for a small example registry and capability-oriented test harness.

---

## Keep the Three Roles Separate

VizX should distinguish among three related but different artifacts:

```text
examples/       Human-readable generated SVGs and debug SVGs
examples-src/   TypeScript scene builders used to generate examples
tests/          Assertions that capabilities work correctly
```

Eventually the project may also include JSON fixtures or parser-driven examples, but the project is not ready for parser-driven examples yet. For now, TypeScript scene builders are the right level because the parser is intentionally not driving the architecture.

The most important rule is:

> Do not rely on examples alone as tests.

Examples show what the system can do. Tests prove it continues to work.

---

## When to Expand Examples

Start expanding examples now, but modestly.

Add examples whenever a new architectural capability becomes meaningful, such as:

```text
anchors
nested groups
relative placement
connectors
debug overlays
inspection
styles
text boxes
circles
custom components
```

Avoid creating a large gallery before the core model stabilizes.

When new placement capabilities are added, such as `leftOf`, `above`, `below`, `align`, or `distribute`, each should get:

```text
1. unit or resolver tests
2. one integration fixture or scene builder
3. one focused visual example if it teaches something
4. inspection/debug assertions where relevant
```

---

## Recommended Example Tiers

### 1. Smoke Examples

These prove the system works end to end.

```text
examples/basic.svg
examples/basic.debug.svg
```

Purpose:

```text
Can VizX produce output at all?
Can demo, inspect, and debug work?
```

The existing `basic` example should remain the canonical smoke example.

### 2. Capability Examples

These should each focus on one concept.

```text
examples/anchors.svg
examples/anchors.debug.svg
examples/relative-placement.svg
examples/relative-placement.debug.svg
examples/nested-groups.svg
examples/nested-groups.debug.svg
examples/connectors.svg
examples/connectors.debug.svg
examples/debug-overlay.svg
examples/styles.svg
```

Purpose:

```text
Show one feature clearly.
Make regressions obvious.
Help contributors understand the model.
```

### 3. Integration Examples

These combine several features.

```text
examples/pipeline.svg
examples/pipeline.debug.svg
examples/labeled-geometry.svg
examples/component-demo.svg
```

Purpose:

```text
Demonstrate that features compose.
```

### 4. Showcase Examples

These should come later.

```text
examples/showcase/compiler-pipeline.svg
examples/showcase/geometry-construction.svg
examples/showcase/document-diagram.svg
```

Purpose:

```text
Make the project look impressive.
```

Do not build showcase examples too early.

---

## Recommended Example Registry

Create a small registry that can be used by the CLI and tests.

A possible structure:

```text
examples-src/
  index.ts
  basic.scene.ts
  anchors.scene.ts
  nested-groups.scene.ts
  connectors.scene.ts
```

Or, if the monorepo structure suggests a package:

```text
packages/examples/src/
  index.ts
  basic.ts
  anchors.ts
  nestedGroups.ts
  connectors.ts
```

Each registered example should include enough metadata for tests and generation:

```ts
export interface VizxExample {
  id: string;
  title: string;
  description: string;
  scene: VizxScene;
  expectedCapabilities: string[];
}
```

The exact type names should match the current project types.

Minimum initial examples:

```text
basic
anchors
nested-groups
connectors
```

The `basic` example should reuse or replace the existing shared demo scene so these commands preserve their current behavior:

```text
npm run demo
npm run inspect
npm run debug
```

---

## Test Suite Strategy

The test suite should eventually cover all capabilities, but different capabilities need different kinds of tests.

### 1. Unit Tests

For pure logic.

Examples:

```text
geometry:
  midpoint
  distance
  bboxUnion
  bboxTranslate
  transformPoint

anchors:
  rect.center
  rect.east
  group bbox anchors

styles:
  style normalization
  default style behavior
```

These should be exact and boring.

### 2. Resolver Tests

For object graph behavior.

Examples:

```text
TextBox resolves to group with rect + text
rightOf placement moves target correctly
connector endpoints attach to anchors
nested children remain inspectable
geometry, bbox, and anchors stay in scene coordinates
```

These are the most important tests right now.

### 3. Inspection and Debug Tests

For observability.

Examples:

```text
inspect includes top-level objects
inspect includes nested children
inspect includes anchors
inspect includes connector endpoint points
debug overlay includes bbox nodes
debug overlay includes anchor markers
debug overlay includes object id labels
debug overlay includes connector endpoint markers
debug overlay does not mutate original render scene
debug overlay options can disable individual categories
```

Because `DebugOverlayOptions` now exists, the example harness should test both the default dense debug render scene and at least one programmatic minimal debug render scene.

### 4. Renderer Tests

For SVG serialization.

These should test structure, not pixel appearance.

Good structural tests:

```text
SVG contains <svg>
rect node serializes x/y/width/height
text node serializes content
path node serializes d attribute
group serializes children
```

Avoid making every whitespace detail a fragile snapshot.

### 5. Golden Output Tests

Use sparingly.

A few golden SVG snapshots may be useful, but they become annoying if every harmless formatting change breaks them.

Possible limited golden outputs:

```text
goldens/basic.svg
goldens/basic.debug.svg
```

If used, normalize the SVG before comparison.

### 6. Example Generation Tests

Every registered example should be renderable by CI.

The test harness should verify something like:

```text
for every registered example:
  resolve it
  assert no fatal diagnostics
  render it
  assert render scene is nonempty
  serialize it to SVG
  assert SVG is nonempty
  inspect it
  assert inspection is nonempty
  create default debug render scene
  assert debug render scene is nonempty
  create minimal debug render scene using DebugOverlayOptions
  assert minimal debug render scene is nonempty
```

This catches breakage without requiring visual perfection.

---

## Suggested Folder Structure

A reasonable near-term structure is:

```text
examples/
  basic.svg
  basic.debug.svg
  anchors.svg
  anchors.debug.svg
  nested-groups.svg
  nested-groups.debug.svg
  connectors.svg
  connectors.debug.svg

examples-src/
  index.ts
  basic.scene.ts
  anchors.scene.ts
  nested-groups.scene.ts
  connectors.scene.ts

packages/
  geometry/
    src/*.test.ts
  object-model/
    src/*.test.ts
  resolver/
    src/*.test.ts
  renderer-svg/
    src/*.test.ts
  cli/
    src/*.test.ts

docs/
  CAPABILITY_MATRIX.md

test-fixtures/
  expected/
    basic.inspect.json
```

Since VizX is still intentionally before the parser stage, `examples-src/*.scene.ts` is better than parser examples or raw user syntax. Parser examples can be added later.

---

## Capability Matrix

Add a document:

```text
docs/CAPABILITY_MATRIX.md
```

With columns like:

```text
Capability | Unit test | Resolver test | Example | Debug overlay | Notes
```

Initial matrix:

| Capability | Unit test | Resolver test | Example | Debug overlay | Notes |
|---|---:|---:|---:|---:|---|
| Rect bbox | yes | yes | basic / anchors | yes | stable |
| Rect anchors | yes | yes | anchors | yes | stable |
| Group bbox | partial | yes | nested-groups | yes | stable |
| Nested group children | no | yes | nested-groups | yes | inspection supports children |
| rightOf placement | partial | yes | basic | yes | v0 placement only |
| Straight connector | partial | yes | connectors | yes | no routing yet |
| Inspect output | no | yes | basic | n/a | includes nested children |
| Debug overlay | no | yes | basic.debug | yes | configurable programmatically |
| Debug overlay options | no | yes | basic.debug | yes | programmatic only |
| SVG rendering | yes | partial | all | n/a | structural tests preferred |

Not yet implemented:

| Capability | Unit test | Resolver test | Example | Debug overlay | Notes |
|---|---:|---:|---:|---:|---|
| leftOf placement | no | no | no | no | not built |
| above/below placement | no | no | no | no | not built |
| align | no | no | no | no | not built |
| distribute | no | no | no | no | not built |
| graph layout | no | no | no | no | intentionally deferred |
| parser-driven examples | no | no | no | no | intentionally deferred |

This matrix should keep Copilot and future contributors honest.

---

## Next Milestone

The next milestone should be:

> Create an example registry and capability test harness so every example can be generated, inspected, debug-rendered, and validated consistently.

This should happen before adding more layout features.

That way, when `leftOf`, `above`, `below`, `align`, and `distribute` are added, each new capability fits into the same pattern.

---

## What Not To Do Yet

Do not create a large visual gallery.

Do not add parser-based examples.

Do not make SVG snapshots the main testing method.

Do not require every visual detail to be pixel-perfect.

Do not add flowchart semantics.

Do not add plotting.

Do not add graph layout.

Do not add a full CLI argument parser.

Do not expose debug overlay options through CLI flags yet.

The core question for the current stage is:

```text
Does the resolved model say the right thing?
Do anchors resolve correctly?
Do placements move objects correctly?
Do connectors attach correctly?
Can the renderer serialize it?
Can inspection expose the model?
Can the debug overlay expose mistakes visually?
```

That is more important than visual polish.

---

## Recommended Rule for Future Features

For each new feature:

```text
one focused example
one resolver test
one inspection/debug assertion
optional SVG output
capability matrix update
```

The test suite should eventually cover every capability, but at several levels: unit tests for pure geometry, resolver tests for object behavior, structural renderer tests for SVG output, and a small number of golden/example tests for end-to-end confidence.
