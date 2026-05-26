I would develop **VizX from the inside out**, not from the syntax inward.

The most important roadmap principle is:

> First build a core drawing compiler that consumes a structured object model, resolves geometry/anchors/layout, and emits SVG. Only later worry about the human-facing syntax.

That keeps the architecture honest. The parser should eventually become just one front end that produces the same core IR as hand-written JSON fixtures or programmatic TypeScript builders.

---

# Recommended development roadmap

## Phase 0 — Lock the architecture vocabulary

Before writing much code, define the major internal layers and the names you will use consistently.

I would settle on this pipeline:

```text
Source syntax
  ↓
AST
  ↓
Core IR
  ↓
Unresolved object graph
  ↓
Resolved scene
  ↓
Render scene graph
  ↓
Backend output
```

For early development, skip the source syntax and AST. Start here:

```text
Core IR fixture
  ↓
Unresolved object graph
  ↓
Resolved scene
  ↓
SVG output
```

The first real goal is not “parse a language.” It is:

> Given a structured drawing description, can VizX resolve geometry and render a correct SVG?

---

# Phase 1 — Define the core packages and contracts

I would structure the repo around packages like this:

```text
packages/
  core/
  geometry/
  object-model/
  resolver/
  renderer-svg/
  testing/
  cli/
  parser/          later
  language-server/ much later
```

## `@vizx/core`

Defines shared types and schemas.

Responsibilities:

```text
ids
units
styles
colors
errors
diagnostics
source locations
common IR types
result types
```

This package should avoid depending on any renderer.

## `@vizx/geometry`

Defines mathematical primitives.

Responsibilities:

```text
Point
Vector
Length
Angle
Transform
Line
Segment
Circle
Arc
Bezier
Path
BoundingBox
intersection helpers
transform helpers
```

This should be pure and heavily tested.

## `@vizx/object-model`

Defines drawable and layout-aware objects.

Responsibilities:

```text
Rect
Circle
Ellipse
PathObject
TextObject
Group
Symbol
Instance
Connector
Anchor
AnchorRef
Port
```

This package knows about objects and anchors but not final SVG serialization.

## `@vizx/resolver`

Turns unresolved objects into resolved geometry.

Responsibilities:

```text
component instantiation
text measurement interface
bounding-box resolution
anchor resolution
relative placement
simple constraints
connector path generation
diagnostics
```

This is the heart of the system.

## `@vizx/renderer-svg`

Turns a resolved render scene into SVG.

Responsibilities:

```text
SVG scene serialization
groups
paths
rectangles
circles
text
markers
defs
symbols
styles
viewBox calculation
```

## `@vizx/testing`

Shared test fixtures and golden-output utilities.

Responsibilities:

```text
fixture loading
snapshot normalization
geometry assertions
SVG comparison helpers
diagnostic assertions
```

## `@vizx/cli`

Lets you run examples.

Responsibilities:

```text
vizx render input.json --out output.svg
vizx inspect input.json
vizx validate input.json
```

The parser should come later. Early examples should be JSON or TypeScript fixture objects.

---

# Phase 2 — Write specifications before implementation

I would add these files before building too much:

```text
docs/
  ARCHITECTURE.md
  CORE_IR_SPEC.md
  GEOMETRY_SPEC.md
  OBJECT_MODEL_SPEC.md
  ANCHOR_SPEC.md
  RESOLVER_SPEC.md
  RENDER_SCENE_SPEC.md
  SVG_BACKEND_SPEC.md
  ERROR_MODEL.md
```

Each spec should define what counts as valid input/output for that layer.

For example, `ANCHOR_SPEC.md` should answer:

```text
What is an anchor?
Is an anchor always a point?
Can an anchor be unresolved?
Can anchors depend on bounding boxes?
Can groups define inherited anchors?
How are custom anchors declared?
What happens if an anchor is missing?
```

`RESOLVER_SPEC.md` should answer:

```text
What gets resolved first?
How are dependencies represented?
How are cycles detected?
How are text boxes measured?
What constraints are supported in v0?
What produces diagnostics instead of throwing?
```

This matters because otherwise “resolver” becomes a grab bag.

---

# Phase 3 — Build the geometry kernel first

Start with the lowest layer.

Minimum useful geometry types:

```ts
type Scalar = number;

interface Point {
  x: number;
  y: number;
}

interface Vector {
  dx: number;
  dy: number;
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
```

Then add richer constructors and operations:

```text
point(x, y)
vector(dx, dy)
add(point, vector)
subtract(point, point) -> vector
distance(a, b)
midpoint(a, b)
bboxUnion(...)
bboxTranslate(...)
transformPoint(...)
```

Do **not** start with everything: splines, boolean paths, complex intersections, nonlinear solving. Start with rectangles, circles, line segments, and transforms.

Definition of done for this phase:

```text
geometry package has pure functions
unit tests cover all operations
no renderer dependency
no object-model dependency
```

---

# Phase 4 — Define the render scene graph

Before resolving high-level objects, define the final backend-neutral scene model.

This should be SVG-like but not identical to SVG.

Example:

```ts
type RenderNode =
  | RenderGroup
  | RenderRect
  | RenderCircle
  | RenderPath
  | RenderText;

interface RenderScene {
  type: "scene";
  width?: number;
  height?: number;
  viewBox: BoundingBox;
  defs: RenderDef[];
  children: RenderNode[];
}
```

Keep this layer boring. It should only include things that can actually be drawn.

Important principle:

> The render scene should not contain unresolved anchors, relative placement, components, or semantic constraints.

By the time something reaches the render scene, it should be drawable.

Definition of done:

```text
can construct a RenderScene manually
can serialize it to SVG
basic SVG opens correctly in browser
```

---

# Phase 5 — Build SVG renderer early

This gives you visual feedback quickly.

Start with:

```text
scene
group
rect
circle
path
text
style
transform
```

Then add:

```text
markers
arrowheads
defs
symbols
clip paths
```

A simple SVG renderer is not hard, and it helps validate every later layer.

Definition of done:

```text
manual RenderScene fixture renders to valid SVG
output can be viewed in browser
snapshot tests normalize irrelevant whitespace
```

---

# Phase 6 — Build unresolved objects

Now define the object model above the render scene.

Core objects:

```text
RectObject
CircleObject
TextObject
PathObject
GroupObject
ConnectorObject
```

Each object should support:

```text
id
style
transform
children
intrinsic geometry
computed bounding box
anchors
```

A rectangle object, for example, might know:

```text
center
north
south
east
west
northEast
northWest
southEast
southWest
```

A group object might compute anchors from its children’s bounding box.

This layer should **not** immediately render. It should produce unresolved object structures.

Definition of done:

```text
can create object graph manually
can ask which anchors an object supports
can lower simple resolved objects to render scene
```

---

# Phase 7 — Implement the resolver

This is the main compiler stage.

The resolver should take:

```text
Core IR or object graph
```

and produce:

```text
ResolvedScene
```

A `ResolvedScene` should include both:

```text
resolved object graph
render scene graph
diagnostics
```

Early resolver responsibilities:

```text
assign ids
instantiate objects
measure text using a simple placeholder measurer
compute bounding boxes
compute anchors
apply absolute placement
apply relative placement
create simple connector paths
lower to render scene
```

For v0, use a simple deterministic text measurement interface:

```ts
interface TextMeasurer {
  measureText(input: TextMeasureInput): TextMetrics;
}
```

Then provide:

```text
ApproximateTextMeasurer
BrowserSvgTextMeasurer later
LatexTextMeasurer much later
```

Do not block on perfect text measurement.

Definition of done:

```text
Box("Raw data") can resolve to rect + text
A.east and B.west compute correctly
connect A.east to B.west creates a path
SVG output works
```

---

# Phase 8 — Implement a tiny Core IR

Only now define a minimal input IR.

Not syntax. Just JSON-like structured objects.

Example:

```json
{
  "type": "scene",
  "objects": [
    {
      "type": "textBox",
      "id": "a",
      "text": "Raw data",
      "position": { "x": 0, "y": 0 }
    },
    {
      "type": "textBox",
      "id": "b",
      "text": "Clean",
      "place": {
        "targetAnchor": "west",
        "relation": "rightOf",
        "reference": { "object": "a", "anchor": "east" },
        "distance": 48
      }
    },
    {
      "type": "connector",
      "from": { "object": "a", "anchor": "east" },
      "to": { "object": "b", "anchor": "west" }
    }
  ]
}
```

This becomes the first contract that any future parser must emit.

Definition of done:

```text
JSON fixture validates
resolver consumes fixture
SVG output generated
parser is still unnecessary
```

---

# Phase 9 — Add components and reuse

Once boxes and connectors work, add reusable components.

There are two kinds of reuse:

## Functional reuse

```text
regularPolygon(center, radius, sides)
braceBetween(a, b)
```

## Object/component reuse

```text
TextBox(label)
Callout(label, target)
LabeledCircle(label)
```

Internally, a component should be a function that returns an object graph.

In TypeScript, this might look like:

```ts
function textBox(id: string, text: string): VizxObject[] {
  // returns group with rect + text + anchors
}
```

Later, user syntax can define components. But early on, hard-coded TypeScript component constructors are enough.

Definition of done:

```text
component constructors create valid object graphs
components expose anchors
components can be nested
custom anchors can be defined
```

---

# Phase 10 — Add simple constraints

Add only the constraints that are deterministic and easy to debug.

Start with:

```text
place anchor relative to anchor
align x
align y
same width
same height
distribute horizontally
distribute vertically
```

Avoid at first:

```text
general nonlinear constraints
automatic graph layout
force-directed layout
collision avoidance
complex routing
```

The first constraint solver can be very simple: a dependency resolver plus ordered placement operations.

Definition of done:

```text
detects missing references
detects cycles
reports useful diagnostics
resolves ordered relative placement
```

---

# Phase 11 — Add connector routing

Start with straight connectors.

Then:

```text
polyline with waypoints
orthogonal h-v route
orthogonal v-h route
curved connector
arrowheads
labels on connectors
```

Later:

```text
obstacle avoidance
automatic routing
edge bundling
```

Definition of done:

```text
connectors attach to anchors
connectors update when object position changes
arrowheads render correctly
connector labels have positions
```

---

# Phase 12 — Add debug/inspection tooling

This is important enough to be its own milestone.

A diagram language like this will be hard to debug unless the user can inspect:

```text
object tree
computed bounding boxes
anchors
placement constraints
dependency graph
resolved render nodes
diagnostics
```

Add a CLI command:

```bash
vizx inspect examples/basic.json
```

Possible outputs:

```text
a:
  type: TextBox
  bbox: x=0 y=0 w=72 h=24
  anchors:
    east: 72,12
    west: 0,12
    center: 36,12

b:
  type: TextBox
  bbox: x=120 y=0 w=54 h=24
```

Also add an optional debug SVG overlay:

```text
show bounding boxes
show anchor points
show object ids
show connector endpoints
```

Definition of done:

```text
debug SVG overlay renders anchors and bboxes
CLI can inspect resolved scene
errors include object ids and source/IR paths
```

---

# Phase 13 — Only then build a parser

Once the IR is stable, the parser becomes much easier.

The parser’s job is simply:

```text
source syntax → AST → Core IR
```

It should not know how to render.

This avoids the common failure mode where syntax decisions infect the core architecture.

For the parser package:

```text
parser/
  lexer
  parser
  AST types
  AST-to-CoreIR lowering
  syntax diagnostics
```

Definition of done:

```text
one small syntax example lowers to existing Core IR
existing resolver/render tests still pass
syntax can change without touching resolver
```

---

# Phase 14 — Browser playground

After the SVG renderer and resolver work, a browser playground becomes straightforward.

Architecture:

```text
editor pane
IR/debug pane
SVG preview pane
diagnostics pane
```

Browser app can call:

```text
parse source
lower to IR
resolve scene
render SVG
insert SVG into DOM
```

Since this is TypeScript, this should be natural.

Definition of done:

```text
edit source or JSON fixture
live SVG preview
show diagnostics
download SVG
toggle debug overlay
```

---

# Phase 15 — Additional backends

Only after SVG is solid:

```text
renderer-canvas
renderer-pdf
renderer-tikz
renderer-typst
```

I would treat TikZ export as useful but not core. SVG should remain the first-class reference backend.

Definition of done:

```text
same ResolvedScene can render to SVG and at least one other target
backend differences documented
unsupported features produce clear diagnostics
```

---

# Suggested MVP milestone

The first meaningful MVP should be:

> VizX can read a JSON Core IR file describing labeled boxes, relative anchor placement, and connectors; resolve all geometry; render clean SVG; and optionally render a debug overlay showing anchors and bounding boxes.

Example target:

```text
[Raw data] ---> [Clean] ---> [Model]
                    |
                    v
                [Report]
```

But internally this is not a flowchart language yet. It is just:

```text
objects
anchors
relative placement
connectors
SVG rendering
```

That is the right core MVP.

---

# Recommended order of implementation

I would implement in this order:

```text
1. Geometry primitives
2. Render scene graph
3. SVG renderer
4. Object model
5. Anchor model
6. Approximate text measurement
7. Resolver
8. Core IR JSON schema
9. CLI render command
10. Test fixtures
11. Components/reuse
12. Simple constraints
13. Connector routing
14. Debug overlay
15. Parser
16. Browser playground
17. Additional backends
```

The parser is intentionally late.

---

# What not to build yet

I would explicitly defer:

```text
plots
flowcharts as semantic objects
graph layout
grammar-of-graphics layer
3D
animation
interactive editing
general constraint solver
full LaTeX text measurement
TikZ backend
visual editor
```

Those are future layers. The core should first prove that objects, geometry, anchors, reuse, and rendering work cleanly.

---

# The roadmap in one sentence

Build VizX first as a **TypeScript geometry/object compiler** that turns a structured core IR into a resolved SVG scene; then add components, constraints, debug tooling, parser syntax, browser playground, and only later high-level semantic diagram languages.
