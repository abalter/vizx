# VizX Design

VizX is a layered drawing language/runtime. Its central idea is that a drawing should preserve structure and relationships until the system has enough information to resolve geometry and render output.

This document describes both the intended long-term architecture and the currently implemented inside-out pipeline.

## 1. Conceptual model

VizX has four core conceptual layers:

```text
1. Geometry model
2. Object/anchor model
3. Reuse/component model
4. Rendering model
```

Higher-level diagram systems—plots, flowcharts, graph diagrams, commutative diagrams, circuits, trees, timelines—should eventually compile into these lower-level layers.

## 2. Processing pipeline

Long-term intended pipeline:

```text
source syntax
  ↓
parser
  ↓
AST
  ↓
semantic/core IR
  ↓
evaluated object graph
  ↓
resolved geometry/layout graph
  ↓
render scene graph
  ↓
backend renderer
```

Current implemented pipeline:

```text
TypeScript ObjectScene / builder helpers
  ↓
resolver
  ↓
resolved scene
  ↓
render scene graph
  ↓
SVG renderer
```

Each stage has a different responsibility.

### 2.1 Source syntax

The source syntax is the human-facing language. It is deliberately not settled yet and remains deferred in active implementation work.

A provisional sketch might look like:

```vizx
box A "Raw data" at 60 40
box B "Clean / transform" right_of A by 120
connect A.east -> B.west
```

The exact syntax is less important than the core model.

### 2.2 AST

The parser produces an AST that mirrors what the user wrote.

Example AST concepts:

```text
Program
  BoxStatement
  PlacementStatement
  ConnectStatement
  ComponentDeclaration
  StyleDeclaration
```

The AST should preserve source locations for diagnostics.

### 2.3 Core IR

The AST is lowered into a small canonical instruction set.

Example core commands:

```text
CreateTextBox
PlaceRightOf
ConnectAnchors
DefineStyle
ApplyStyle
CreateGroup
```

The core IR should not contain surface-language quirks. Many surface syntaxes could compile to the same IR.

### 2.4 Evaluated object graph

The interpreter evaluates core commands into an object graph.

The object graph preserves named objects and relationships:

```text
Scene
  Object A : TextBox
    children: A.rect, A.text
    anchors: center, east, west, north, south

  Object B : TextBox
    children: B.rect, B.text
    anchors: center, east, west, north, south

  Connector edge1
    from: A.east
    to: B.west
```

At this stage, some geometry may still be unresolved.

### 2.5 Resolved geometry graph

The resolver computes actual geometry:

- text dimensions,
- intrinsic object sizes,
- bounding boxes,
- anchors,
- relative placement,
- transforms,
- connector endpoints,
- connector routes,
- z-order.

After this phase, all objects intended for rendering should have concrete geometry.

### 2.6 Render scene graph

The resolved geometry is lowered into a backend-neutral scene graph.

The scene graph is intentionally SVG-like:

```text
Scene
  Defs
    Marker
    Symbol
  Group
    Rect
    Text
    Path
```

Only renderable primitives should appear here.

### 2.7 Backend renderers

Backends consume the render scene graph.

Initial backend:

```text
SVG
```

Possible later backends:

```text
Canvas
PDF
TikZ
Typst
PNG via SVG conversion
```

## 3. Geometry model

Implemented geometry/model surface currently includes:

```text
Point
BoundingBox
line / polyline / ellipse / polygon primitives
path commands: moveTo, lineTo, quadraticCurveTo, cubicCurveTo, arc, closePath
ordered transforms: translate, rotate, scale
pure helper functions: midpoint, distance, angleOf, polar, circlePoint, regularPolygonPoints, angleBetweenPoints, angleLabelPoint
```

Longer-term geometry model should eventually include:

```text
Scalar
Length
Angle
Point
Vector
Frame
Transform
Line
Ray
Segment
Circle
Arc
Bezier
Spline
Path
Polygon
Region
BoundingBox
```

Current implementation remains conservative for geometry precision and advanced operations.

### 3.1 Units

The core should distinguish numeric scalar values from physical lengths.

Early implementation uses numeric user units approximating CSS pixels. Later versions should support explicit units:

```text
px
pt
cm
mm
in
em
```

### 3.2 Geometry operations

Important operations:

```text
add(point, vector) -> point
subtract(point, point) -> vector
midpoint(point, point) -> point
distance(point, point) -> number
rectFromCenter(center, width, height) -> bounding box
anchor(box, name) -> point
```

Later operations:

```text
line_through(A, B)
parallel(line, through=P)
perpendicular(line, through=P)
intersect(object1, object2)
project(P, onto=line)
rotate(object, angle, around=C)
offset(path, distance)
```

Future/deferred geometry items include:

```text
intersections
projection helpers
path length / point-at-length
flattening / sampling
clipping/regions
full computational geometry
```

## 4. Object and anchor model

Objects are not merely render marks. They have identity, children, style, geometry, and anchors.

A resolved object should expose anchors such as:

```text
center
north
south
east
west
north_east
north_west
south_east
south_west
baseline
```

An anchor is a computed point, not necessarily a stored coordinate.

```text
anchor = function(resolved object geometry) -> point
```

For example:

```text
rect.east = rect.center + (rect.width / 2, 0)
group.east = east edge of group bounding box
text.baseline = derived from text metrics
```

## 5. Reuse model

VizX should eventually support two kinds of reuse.

### 5.1 Functions

Functions compute values or geometry:

```text
regularPolygon(center, radius, sides) -> Path
```

### 5.2 Components

Components create reusable object graphs:

```text
component Box(label):
  text = Text(label)
  rect = Rect.around(text, padding=6pt)
  return Group(rect, text)
```

A component instance should be a normal object with anchors and styles.

## 6. Styles

Current implemented style model supports:

```text
stroke
fill
strokeWidth
opacity
markerStart
markerEnd
strokeDasharray
strokeLineCap
strokeLineJoin
fillRule
fontFamily
fontSize
textAnchor
dominantBaseline
```

Later versions may add:

```text
strokeOpacity / fillOpacity
style inheritance
classes
themes
gradients
clipping
masks
pattern fills
```

These later style items remain intentionally deferred.

## 6.1 Aspirational Example Roadmap Fit

The aspirational examples are currently architecture stress tests, not source-language translation.

- examples are manual TypeScript builder-authored reproductions
- they validate object model + resolver + renderer behavior under realistic diagram pressure
- they are currently aimed at Level 1-2 approximation, not Level 3 fidelity parity

See [docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./docs/ASPIRATIONAL_REPRODUCTION_ROADMAP.md).

## 7. Constraints and layout

The first implementation should avoid general constraint solving.

Allowed early constraints:

```text
place object at point
place target anchor right_of reference anchor by distance
align anchors
manual connector endpoints
```

Later possible constraints:

```text
same width
same height
align centers
distribute horizontally
distribute vertically
simple grid layout
orthogonal connector routing
obstacle avoidance
```

General nonlinear constraint solving is intentionally deferred.

## 8. Text measurement

Text measurement is one of the hardest practical problems.

Initial implementation may use approximate text metrics:

```text
width ≈ character_count × font_size × factor
height ≈ font_size × line_height
```

Browser implementation can later use DOM or Canvas measurement APIs. LaTeX-quality output may require a LaTeX measuring backend or treating LaTeX-rendered labels as opaque boxes.

## 9. Error model

The interpreter should produce clear diagnostics for:

```text
unknown identifiers
unknown anchors
invalid geometry operations
cycles in dependency graph
unresolved geometry
invalid units
unsupported render features
```

Errors should include source locations when available.

## 10. Browser strategy

VizX should be able to run in the browser.

Recommended initial implementation:

```text
TypeScript parser
TypeScript interpreter/resolver
SVG renderer
browser preview
optional Web Worker for heavy resolving
```

Possible long-term implementation:

```text
Rust core compiled to WebAssembly
TypeScript UI and renderer shell
```

## 11. Package boundaries

```text
@vizx/core
  shared types, geometry, commands, scene graph

@vizx/parser
  source syntax → AST → core commands

@vizx/interpreter
  core commands → resolved object graph → render scene

@vizx/renderer-svg
  render scene → SVG string

@vizx/cli
  command-line demo and development utility
```

## 12. Development priorities

1. Stabilize core geometry and scene graph types.
2. Make the SVG renderer reliable and testable.
3. Add an object graph inspector.
4. Improve text measurement.
5. Add reusable components.
6. Add limited constraints.
7. Consider browser preview package.
8. Consider Rust/WASM core only after the TypeScript model stabilizes.
