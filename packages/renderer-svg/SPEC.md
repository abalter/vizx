# @vizx/renderer-svg Specification

`@vizx/renderer-svg` renders a backend-neutral `RenderScene` from `@vizx/core` to SVG markup.

## Responsibilities

- Serialize render scene graph nodes to SVG elements.
- Serialize styles to SVG attributes.
- Escape text and attribute values.
- Emit `<defs>` for reusable SVG definitions.

## Non-responsibilities

- Parsing source syntax.
- Evaluating commands.
- Resolving geometry.
- Measuring text.

## Current supported render nodes

```ts
RenderScene
RenderGroupNode
RenderRectNode
RenderTextNode
RenderPathNode
RenderCircleNode
RenderMarkerDef
```

## Future work

- Symbols and `<use>` instances.
- Gradients.
- Patterns.
- Clip paths.
- Masks.
- Accessibility metadata.
- Pretty-print/minify options.
