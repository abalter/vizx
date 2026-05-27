# Core IR Specification (Current Effective Model)

This document defines the current effective Core IR for VizX as implemented today by TypeScript scene builders and object-model types.

Core IR here means the structured drawing model consumed by the resolver, not user-facing syntax.

## Status

- Scope: architecture and data-contract specification
- Runtime impact: none
- Source of truth for current shape:
  - `packages/object-model/src/anchors.ts`
  - `packages/object-model/src/objects.ts`
  - `packages/object-model/src/scene.ts`
  - `packages/resolver/src/resolveScene.ts`

## 1. Scene

Current scene type is `ObjectScene`.

```ts
interface ObjectScene {
  readonly objects: readonly DrawableObject[];
  readonly connectors?: readonly ConnectorObject[];
  readonly distribution?: readonly SceneDistribution[];
}
```

Notes:

- Scene id/name: not currently present in `ObjectScene`.
- Objects: required ordered list.
- Connectors: optional.
- Scene-level distribution: optional and currently supports `distributeX` and `distributeY`.
- Diagnostics: produced by the resolver as `ResolveSceneResult.diagnostics`; invalid relations and missing references produce diagnostics instead of throws in supported runtime-safety paths.

## 2. Objects

Current drawable object kinds:

- `rect`
- `circle`
- `text`
- `group`

Common object fields from `BaseObject`:

- `id: string`
- `style?: Style`
- `transform?: Transform`
- `placement?: ObjectPlacement`
- `align?: ObjectAlignment`

### 2.1 Rect

```ts
interface RectObject extends BaseObject {
  readonly kind: "rect";
  readonly center?: Point;
  readonly width?: number;
  readonly height?: number;
  readonly rx?: number;
  readonly ry?: number;
  readonly fitToText?: {
    readonly textId: string;
    readonly paddingX: number;
    readonly paddingY: number;
  };
}
```

### 2.2 Circle

```ts
interface CircleObject extends BaseObject {
  readonly kind: "circle";
  readonly center: Point;
  readonly radius: number;
}
```

### 2.3 Text

```ts
interface TextObject extends BaseObject {
  readonly kind: "text";
  readonly center: Point;
  readonly text: string;
}
```

### 2.4 Group

```ts
interface GroupObject extends BaseObject {
  readonly kind: "group";
  readonly children: readonly DrawableObject[];
}
```

Group semantics:

- Children are unresolved drawable objects.
- Group bbox is resolved as union of child bboxes.
- Group anchors are derived from resolved group bbox.

## 3. Anchors

Anchor names currently defined:

- `center`
- `north`
- `south`
- `east`
- `west`
- `northEast`
- `northWest`
- `southEast`
- `southWest`
- `baseline`

Anchor references use:

```ts
interface AnchorRef {
  readonly objectId: string;
  readonly anchor: AnchorName;
}
```

Semantics:

- Object anchors are resolved in scene coordinates.
- Primary placement/alignment usage currently exercises center/edges and corner anchors from bbox-derived maps.
- `baseline` is currently relevant for text; it is also part of `AnchorName` and appears in diagnostics when referenced but unavailable for a given object.

## 4. Placement

Placement model:

```ts
type ObjectPlacement =
  | { kind: "absolute"; position: Point }
  | { kind: PlacementRelation; reference: AnchorRef; gap: number };

type PlacementRelation = "rightOf" | "leftOf" | "above" | "below";
```

Implemented relations:

- `rightOf`
- `leftOf`
- `above`
- `below`

Current behavior:

- `absolute` adds translation in scene coordinates.
- Relative placement aligns target/reference anchor pairs with gap.
- Unsupported placement relations produce diagnostics.

## 5. Alignment

Alignment model:

```ts
type ObjectAlignment =
  | { relation: "alignY"; reference: AnchorRef }
  | { relation: "alignX"; reference: AnchorRef }
  | { relation: "alignLeft"; reference: AnchorRef }
  | { relation: "alignRight"; reference: AnchorRef }
  | { relation: "alignTop"; reference: AnchorRef }
  | { relation: "alignBottom"; reference: AnchorRef };
```

Implemented relations:

- `alignX`
- `alignY`
- `alignLeft`
- `alignRight`
- `alignTop`
- `alignBottom`

Current behavior:

- Alignment runs after placement.
- `alignX` and `alignY` move target center axis to reference anchor axis.
- Edge alignment variants align corresponding edges.
- Unsupported alignment relations produce diagnostics.

## 6. Distribution

Scene-level distribution model:

```ts
type SceneDistribution =
  | { relation: "distributeX"; objectIds: readonly string[] }
  | { relation: "distributeY"; objectIds: readonly string[] };
```

Implemented relations:

- `distributeX`
- `distributeY`

Current behavior:

- Distribution runs after placement and alignment.
- Ordered ids are interpreted as first..last fixed, intermediates evenly spaced.
- `distributeX` spaces by `center.x`; `distributeY` spaces by `center.y`.
- Invalid inputs (too few ids, duplicate ids, missing objects, missing center anchors, unsupported relation) produce diagnostics.

## 7. Connectors

Connector input shape:

```ts
interface ConnectorObject {
  readonly kind: "connector";
  readonly id: string;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly style?: Style;
}
```

Resolved connector shape includes concrete endpoints:

- `start: Point`
- `end: Point`

Current behavior:

- Connectors resolve after placement/alignment/distribution.
- Endpoint points are taken from resolved object anchors.
- Current rendered connector path is straight (`M ... L ...`).

## 8. Resolution Pipeline

Current effective pipeline:

```text
unresolved object graph
  -> intrinsic geometry and text measurement
  -> placement
  -> alignment
  -> distribution
  -> connectors and render scene generation
  -> SVG output
```

Notes:

- Resolver output includes both resolved model and render scene.
- Diagnostics are accumulated across passes.

## 9. Relationship to Future Parser

Core points:

- Core IR is not surface syntax.
- A future parser should lower source syntax into this Core IR model.
- Current TypeScript examples in `@vizx/examples` are effectively typed Core IR builders.
- Parser and language syntax layers should not depend on SVG rendering details.

Separation goal:

- Frontends (parser, programmatic builders, future JSON) target Core IR.
- Resolver and render backends consume Core IR-derived object graphs.

## 10. Future JSON Core IR

A JSON Core IR format is planned but not implemented in this pass.

Intended direction:

- Define a JSON representation equivalent to current `ObjectScene` and related object/connector/alignment/distribution types.
- Add schema-based validation as future work.
- Keep JSON schema concerns separate from resolver/render logic.

Future work (not implemented here):

- JSON schema files for scene/object/connectors.
- Validation tooling and CLI validation command.
- Parser lowering tests that target the same Core IR contracts.
