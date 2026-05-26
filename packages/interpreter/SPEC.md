# @vizx/interpreter Specification

`@vizx/interpreter` evaluates core commands into a resolved diagram and lowers that diagram into a backend-neutral render scene.

## Responsibilities

- Evaluate core commands in order.
- Create object graph instances.
- Approximate intrinsic text dimensions for MVP rendering.
- Resolve bounding boxes.
- Resolve anchors.
- Apply simple relative placement.
- Resolve connectors.
- Lower resolved objects to render scene graph primitives.

## Non-responsibilities

- Parsing source syntax.
- Rendering SVG or other output formats.
- General constraint solving.
- High-quality text measurement.

## Current resolver behavior

- `createTextBox` creates a simple text box with approximate dimensions.
- `placeRightOf` shifts the target object so its west anchor is `distance` units to the right of the reference object's east anchor.
- `connect` resolves a straight-line connector between two anchors.

## Future work

- Dependency graph and cycle detection.
- Better text measurement.
- User-defined components.
- Custom anchors.
- Limited constraints such as align, distribute, same width, same height.
- Connector routing with waypoints and orthogonal paths.
