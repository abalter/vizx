# @vizx/core Specification

`@vizx/core` defines shared concepts used by every other package.

## Responsibilities

- Geometry primitives.
- Unit helpers.
- Styles.
- Core command IR.
- Object graph types.
- Render scene graph types.
- Shared errors and diagnostics.

## Non-responsibilities

- Parsing user-facing syntax.
- Evaluating commands.
- Resolving layout.
- Rendering SVG or other output formats.

## Core command IR

The early command IR includes:

```ts
CreateTextBoxCommand
PlaceRightOfCommand
ConnectCommand
```

This is not the final language IR. It is enough to exercise the pipeline.

## Geometry conventions

Initial resolved coordinates use numeric user units. For SVG this maps to CSS pixels by default.

Later versions should support explicit physical and relative units.

## Render scene graph

The render scene graph is SVG-like and backend-neutral. It contains renderable primitives only:

```ts
RenderScene
RenderGroupNode
RenderRectNode
RenderTextNode
RenderPathNode
RenderCircleNode
```
