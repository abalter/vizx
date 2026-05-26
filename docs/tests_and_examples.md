Yes — you should absolutely have a test suite that tests **all intended capabilities**, but you should not make every test an SVG snapshot test.

And I think you are **at the point now** where examples should start expanding, but in a disciplined way.

The project now has enough infrastructure to support meaningful examples: build/test/demo/inspect/debug all pass, the debug overlay is generated from resolved model data, and the overlay already visualizes bounding boxes, anchors, labels, connector endpoints, and nested children. 

## The distinction I would make

There should be **three related but different things**:

```text
examples/       Human-readable examples and generated SVGs
fixtures/       Machine-readable input scenes used by tests
tests/          Assertions that capabilities work correctly
```

Examples are for humans.
Fixtures are stable inputs.
Tests are guarantees.

Do not rely on examples alone as tests.

---

# When to expand examples

I would start expanding examples **now**, but modestly.

Right now you should add examples whenever you add a new architectural capability, such as:

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

But avoid creating a gallery of 30 examples before the core model stabilizes.

The rule I’d use:

> Every new core capability should get at least one small example and one real test.

So when you add `above`, `below`, `leftOf`, `align`, or `distribute`, each should get:

```text
1. unit tests
2. one integration fixture
3. one visual example if it teaches something
```

---

# Recommended example tiers

## 1. Smoke examples

These prove the system works end to end.

```text
examples/basic.svg
examples/basic.debug.svg
```

You already have this.

Purpose:

```text
Can VizX produce output at all?
Can demo/inspect/debug work?
```

## 2. Capability examples

These should each focus on one concept.

```text
examples/anchors.svg
examples/relative-placement.svg
examples/nested-groups.svg
examples/connectors.svg
examples/debug-overlay.svg
examples/styles.svg
```

Purpose:

```text
Show one feature clearly.
Make regressions obvious.
Help future contributors understand the model.
```

## 3. Integration examples

These combine several features.

```text
examples/pipeline.svg
examples/labeled-geometry.svg
examples/component-demo.svg
```

Purpose:

```text
Demonstrate that features compose.
```

## 4. Showcase examples

These come later.

```text
examples/showcase/compiler-pipeline.svg
examples/showcase/geometry-construction.svg
examples/showcase/document-diagram.svg
```

Purpose:

```text
Make the project look impressive.
```

Do not build these too early.

---

# Test suite strategy

Yes, you want a test suite that eventually covers **all capabilities**, but different capabilities need different kinds of tests.

## 1. Unit tests

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

## 2. Resolver tests

For object graph behavior.

Examples:

```text
TextBox resolves to group with rect + text
rightOf placement moves target correctly
connector endpoints attach to anchors
nested children remain inspectable
geometry/bbox/anchors stay in scene coordinates
```

These are the most important tests right now.

## 3. Inspection/debug tests

For observability.

Examples:

```text
inspect includes top-level objects
inspect includes nested children
inspect includes anchors
debug overlay includes bbox nodes
debug overlay includes anchor markers
debug overlay does not mutate original render scene
```

You already started down this path, which is good.

## 4. Renderer tests

For SVG serialization.

These should test structure, not pixel appearance.

Good:

```text
SVG contains <svg>
rect node serializes x/y/width/height
text node serializes content
path node serializes d attribute
group serializes children
```

Avoid making every whitespace/detail a fragile snapshot.

## 5. Golden output tests

Use sparingly.

A few golden SVG snapshots are useful, but they become annoying if every harmless formatting change breaks them.

I would have maybe:

```text
goldens/basic.svg
goldens/basic.debug.svg
```

and use normalization before comparison.

## 6. Example generation tests

This is important.

Every example source/fixture should be renderable by CI.

So you eventually want a test like:

```text
for every examples-src/*.json:
  resolve it
  render it
  assert no fatal diagnostics
  assert output SVG is nonempty
```

That catches breakage without requiring visual perfection.

---

# Suggested folder structure

I would evolve toward this:

```text
examples/
  basic.svg
  basic.debug.svg
  anchors.svg
  relative-placement.svg
  nested-groups.svg

examples-src/
  basic.scene.ts
  anchors.scene.ts
  relative-placement.scene.ts
  nested-groups.scene.ts

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

test-fixtures/
  scenes/
    basic.json
    anchors.json
    relative-placement.json
  expected/
    basic.inspect.json
```

Since you are still working before the parser, `examples-src/*.scene.ts` may be better than JSON for now. Later, parser examples can be added separately.

---

# Capability matrix

I would add a document like:

```text
docs/CAPABILITY_MATRIX.md
```

With columns like:

```text
Capability | Unit test | Resolver test | Example | Debug overlay | Notes
```

Example:

| Capability            | Unit test | Resolver test |       Example | Notes         |
| --------------------- | --------: | ------------: | ------------: | ------------- |
| Rect bbox             |       yes |           yes |         basic | stable        |
| Rect anchors          |       yes |           yes |       anchors | stable        |
| Group children        |       yes |           yes | nested-groups | stable        |
| rightOf placement     |       yes |           yes |         basic | v0 only       |
| connectors            |   partial |           yes |    connectors | straight only |
| debug overlay         |       yes |           yes |   basic.debug | dense         |
| leftOf placement      |        no |            no |            no | not built     |
| above/below placement |        no |            no |            no | not built     |
| distribute            |        no |            no |            no | not built     |

That will keep Copilot honest.

---

# What I would do next

After the debug-overlay options pass, I would add a **test/example harness** before adding more layout features.

The next milestone should be:

> Create an example registry and capability test harness so every example can be generated, inspected, debug-rendered, and validated consistently.

That way, when you add `leftOf`, `above`, `below`, `align`, and `distribute`, each new capability fits into the same pattern.

---

# What not to do

I would not yet create a huge visual gallery.

I would not yet add parser-based examples.

I would not yet make SVG snapshots the main testing method.

I would not require every visual detail to be pixel-perfect.

The core thing you want is:

```text
Does the resolved model say the right thing?
Do anchors resolve correctly?
Do placements move objects correctly?
Do connectors attach correctly?
Can the renderer serialize it?
Can the debug overlay expose mistakes?
```

That is more important than visual polish at this stage.

---

# My recommendation

Start expanding examples **now**, but make them capability-driven.

For each new feature:

```text
one focused example
one resolver test
one inspection/debug assertion
optional SVG output
```

The test suite should eventually cover every capability, but at several levels: unit tests for pure geometry, resolver tests for object behavior, structural renderer tests for SVG output, and a small number of golden/example tests for end-to-end confidence.
