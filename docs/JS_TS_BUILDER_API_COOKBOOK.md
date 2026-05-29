# JS TS Builder API Cookbook

This cookbook documents the currently implemented builder helpers for VizX.

Scope:

- docs-only usage guidance
- no runtime changes
- no dependency additions
- no parser/JSON Core IR/AST changes

## 1. Purpose

The builder API is ordinary TypeScript convenience for constructing ObjectScene-compatible data.

Key points:

- builder helpers are optional
- ObjectScene remains canonical
- resolver still owns layout semantics and diagnostics
- builder is not parser syntax
- builder is not a fluent DSL
- builder is not JSON Core IR

If you prefer, you can always write raw ObjectScene literals directly.

## 2. Current Implemented Surface

All helper names below are implemented in [packages/object-model/src/builder.ts](../packages/object-model/src/builder.ts).

Scene helpers:

- `sceneOf(objects, options?)`
- `scene` (alias of `sceneOf`)

Object factories:

- `group(id, options)`
- `rect(id, options)`
- `circle(id, options)`
- `text(id, options)`
- `line(id, options)`
- `polyline(id, options)`
- `ellipse(id, options)`
- `polygon(id, options)`
- `path(id, options)`

Path command helpers:

- `moveTo(point)`
- `lineTo(point)`
- `quadraticCurveTo(control, point)`
- `cubicCurveTo(control1, control2, point)`
- `angleMarkPath(id, options)`
- `closePath()`

Placement helpers:

- `absolute(position)`
- `rightOf(objectId, anchorName?, gap?)`
- `leftOf(objectId, anchorName?, gap?)`
- `above(objectId, anchorName?, gap?)`
- `below(objectId, anchorName?, gap?)`

Alignment helpers:

- `alignX(objectId, anchorName?)`
- `alignY(objectId, anchorName?)`
- `alignLeft(objectId, anchorName?)`
- `alignRight(objectId, anchorName?)`
- `alignTop(objectId, anchorName?)`
- `alignBottom(objectId, anchorName?)`

Distribution helpers:

- `distributeX(objectIds)`
- `distributeY(objectIds)`

Connector and anchor helpers:

- `anchor(objectId, name?)`
- `connector(id, from, to, options?)`

Transform helpers:

- `translate(x, y)`
- `rotate(angleDegrees, around?)`
- `scale(sx, sy?, around?)`

Style and arrow helpers:

- `arrowStart(style?)`
- `arrowEnd(style?)`

## 3. Basic Object Construction Example

Illustrative example using implemented helper names:

```ts
import { circle, line, rect, sceneOf, text } from "@vizx/object-model";

const scene = sceneOf([
  rect("panel", {
    center: { x: 120, y: 80 },
    width: 180,
    height: 90,
    rx: 8,
    ry: 8,
  }),
  text("title", {
    center: { x: 120, y: 56 },
    text: "Builder basics",
  }),
  circle("dot", {
    center: { x: 82, y: 96 },
    radius: 8,
  }),
  line("underline", {
    start: { x: 52, y: 70 },
    end: { x: 188, y: 70 },
  }),
]);
```

## 4. Box-and-Arrow Example

This is the intended diagram-authoring niche: semantic placement plus connectors.

```ts
import {
  alignY,
  anchor,
  arrowEnd,
  connector,
  rect,
  rightOf,
  sceneOf,
  text,
} from "@vizx/object-model";

const scene = sceneOf(
  [
    rect("A", { center: { x: 90, y: 70 }, width: 110, height: 44 }),
    text("A.label", { center: { x: 90, y: 70 }, text: "Source" }),

    rect("B", {
      center: { x: 90, y: 70 },
      width: 110,
      height: 44,
      placement: rightOf("A", "east", 88),
      align: alignY("A"),
    }),
    text("B.label", {
      center: { x: 0, y: 0 },
      text: "Target",
      placement: rightOf("A", "east", 88),
      align: alignY("A"),
    }),
  ],
  {
    connectors: [
      connector("A->B", anchor("A", "east"), anchor("B", "west"), {
        style: arrowEnd({ stroke: "#0f766e", strokeWidth: 1.8 }),
      }),
    ],
  }
);
```

## 5. Path and Bezier Example

```ts
import {
  closePath,
  cubicCurveTo,
  lineTo,
  moveTo,
  path,
  quadraticCurveTo,
  sceneOf,
} from "@vizx/object-model";

const scene = sceneOf([
  path("curve-demo", {
    commands: [
      moveTo({ x: 20, y: 40 }),
      lineTo({ x: 64, y: 40 }),
      quadraticCurveTo({ x: 92, y: 8 }, { x: 126, y: 36 }),
      cubicCurveTo({ x: 154, y: 66 }, { x: 196, y: 10 }, { x: 232, y: 38 }),
      closePath(),
    ],
    style: { stroke: "#0f172a", fill: "none" },
  }),
]);
```

Conservative Bezier bounding-box behavior remains a resolver/path-model detail, not a builder concern.

## 6. Angle-Mark Convenience Example

The builder surface also includes a thin helper for the common geometry-diagram pattern "derive arc angles from two rays and emit a path mark".

```ts
import { angleLabelPoint, point } from "@vizx/geometry";
import { angleMarkPath, line, sceneOf, text } from "@vizx/object-model";

const vertex = point(168, 136);
const rayA = point(266, 136);
const rayB = point(224, 62);
const radius = 42;

const scene = sceneOf([
  line("ray.a", { start: vertex, end: rayA }),
  line("ray.b", { start: vertex, end: rayB }),
  angleMarkPath("angle.mark", {
    vertex,
    fromPoint: rayA,
    toPoint: rayB,
    radius,
    clockwise: true,
    style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
  }),
  text("angle.label", {
    center: angleLabelPoint(vertex, rayA, rayB, radius, { clockwise: true, offset: 14 }),
    text: "theta",
  }),
]);
```

The helper still returns an ordinary `PathObject`; it does not add a new runtime drawable type.

## 7. Transforms Example

Transforms are ordered operations. The resolver applies them in list order.

```ts
import { rect, rotate, scale, sceneOf, translate } from "@vizx/object-model";

const scene = sceneOf([
  rect("tilted", {
    center: { x: 120, y: 90 },
    width: 100,
    height: 40,
    transform: [translate(8, -4), rotate(12), scale(1.1, 0.9)],
  }),
]);
```

## 8. Data-Driven Generation Example

Use ordinary JS/TS arrays and functions for repetition and parameterization.

```ts
import { circle, sceneOf } from "@vizx/object-model";

const values = [12, 18, 9, 14, 20];

const nodes = values.map((value, index) =>
  circle(`n-${index}`, {
    center: { x: 60 + index * 56, y: 80 },
    radius: value,
  })
);

const scene = sceneOf(nodes);
```

If a host app already uses D3 scales, compute coordinates/sizes in host code first, then pass plain numbers into builder helpers.

## 9. Builder Versus ObjectScene Literals

Use builder helpers when:

- authoring scenes by hand in TypeScript
- generating diagrams from app data
- reducing repetitive boilerplate
- benefiting from autocomplete/discoverability

Use raw ObjectScene literals when:

- testing exact IR shape
- writing fixtures and schema-facing examples
- debugging model boundaries
- serializing/importing data with explicit structure control

Both approaches produce ObjectScene-compatible data.

## 10. Builder Versus Parser Syntax

Current state:

- builder API is implemented now
- parser syntax remains deferred for expansion
- builder ergonomics may inform future parser design
- builder does not require a custom VizX programming language

## 10. Builder Versus JSON Core IR

Current state:

- builder outputs ObjectScene-compatible data
- JSON Core IR remains an interchange/fixture path
- a builder-to-JSON bridge is not implemented in this slice

## 11. Best Practices

- keep object IDs explicit and stable across refactors
- prefer small local helper functions for reusable object clusters
- use JS/TS functions and data transforms for repetition/parameterization
- validate generated scenes with resolve, inspect, and debug outputs
- keep renderer-specific assumptions out of construction when possible
- treat builder helpers as convenience constructors, not alternate semantics

## 12. Current Limitations

Not implemented in this builder pass:

- fluent chain DSL
- strongly typed object-id relation checking
- automatic layout/graph routing
- DOM/SVG wrapper API
- D3-like data joins in VizX core
- parser syntax expansion
- JSON Core IR bridge from builder helpers

## 13. Recommended Next Implementation Options

1. Add more builder-based examples.
- Mirror or convert relative-placement, alignment-family, and bezier-path scenes with builder helpers.

2. Builder API polish.
- Naming cleanup, option-shape consistency, and stronger TypeScript literal inference.

3. Stronger relation typing.
- Explore object-id typing constraints if practical without over-complicating ergonomics.

4. JSON/parser catch-up.
- Revisit only if interchange or source syntax becomes the immediate priority.

Default recommendation:

- add builder parity examples for relative-placement and Bezier/path scenes before changing API shape further.

## 14. Builder Parity Examples

Current registry-backed parity examples:

- `builder-basic`
- `builder-relative-placement` (parity with `relative-placement`)
- `builder-bezier-path` (parity with `bezier-path`)

Parity tests validate:

- object ids and connector reference ids
- placement relation semantics for relative layout
- clean resolver diagnostics
- path command kind sequence (`moveTo`, `quadraticCurveTo`, `cubicCurveTo`)
- non-brittle SVG command presence (`Q` and `C`) for Bezier scenes

No builder helper gaps were required for these parity examples.

## Related Documents

- [JS_TS_BUILDER_API_CHECKPOINT.md](./JS_TS_BUILDER_API_CHECKPOINT.md)
- [JS_TS_BUILDER_API_PLAN.md](./JS_TS_BUILDER_API_PLAN.md)
- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
