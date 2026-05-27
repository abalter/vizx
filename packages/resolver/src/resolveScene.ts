import { type Diagnostic, type Style, defaultBoxStyle, defaultConnectorStyle } from "@vizx/core";
import {
  addPointVector,
  bboxFromRect,
  bboxTranslate,
  bboxUnion,
  point,
  type BoundingBox,
  type Point,
  type Vector,
} from "@vizx/geometry";
import {
  anchorFromBoundingBox,
  type AnchorMap,
  type AnchorName,
  type AnchorRef,
  type DrawableObject,
  type GroupObject,
  type ObjectScene,
  type PlacementRelation,
  type RectObject,
  type TextObject,
} from "@vizx/object-model";
import type { RenderDef, RenderNode, RenderScene } from "@vizx/renderer-svg";
import { measureTextApprox } from "./textMetrics";

const placementRelationAnchors: Record<PlacementRelation, { referenceAnchor: AnchorName; targetAnchor: AnchorName }> = {
  rightOf: { referenceAnchor: "east", targetAnchor: "west" },
  leftOf: { referenceAnchor: "west", targetAnchor: "east" },
  above: { referenceAnchor: "north", targetAnchor: "south" },
  below: { referenceAnchor: "south", targetAnchor: "north" },
};

export interface ResolvedObject {
  readonly id: string;
  readonly kind: DrawableObject["kind"];
  readonly bbox: BoundingBox;
  readonly anchors: AnchorMap;
  readonly renderNode: RenderNode;
  readonly children?: readonly ResolvedObject[];
  readonly style?: Style;
  readonly text?: string;
  readonly geometry?: Record<string, number | string | undefined>;
}

export interface ResolvedConnector {
  readonly id: string;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly start: Point;
  readonly end: Point;
  readonly renderNode: RenderNode;
}

export interface ResolvedObjectGraph {
  readonly objects: readonly ResolvedObject[];
  readonly connectors: readonly ResolvedConnector[];
}

export interface ResolveSceneResult {
  readonly resolved: ResolvedObjectGraph;
  readonly renderScene: RenderScene;
  readonly diagnostics: readonly Diagnostic[];
}

export function resolveScene(scene: ObjectScene): ResolveSceneResult {
  const diagnostics: Diagnostic[] = [];
  const resolvedObjects: ResolvedObject[] = [];
  const objectMap = new Map<string, ResolvedObject>();

  for (const object of scene.objects) {
    const localObject = resolveObjectLocal(object, diagnostics);
    const placedObject = applyPlacement(localObject, object, objectMap, diagnostics);
    resolvedObjects.push(placedObject);
    objectMap.set(object.id, placedObject);
  }

  // Alignment runs after intrinsic resolution and placement, before connectors.
  for (const [index, source] of scene.objects.entries()) {
    const resolvedObject = resolvedObjects[index];

    if (!resolvedObject) {
      continue;
    }

    const alignedObject = applyAlignment(resolvedObject, source, objectMap, diagnostics);

    if (alignedObject !== resolvedObject) {
      resolvedObjects[index] = alignedObject;
      objectMap.set(source.id, alignedObject);
    }
  }

  const resolvedConnectors: ResolvedConnector[] = [];
  const connectorNodes: RenderNode[] = [];

  for (const connector of scene.connectors ?? []) {
    const start = resolveAnchorRef(objectMap, connector.from);
    const end = resolveAnchorRef(objectMap, connector.to);

    if (!start || !end) {
      diagnostics.push({
        severity: "error",
        message: `Could not resolve connector ${connector.id}`,
      });
      continue;
    }

    const renderNode: RenderNode = {
      kind: "path",
      id: connector.id,
      d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
      style: { ...defaultConnectorStyle, ...connector.style },
    };

    resolvedConnectors.push({
      id: connector.id,
      from: connector.from,
      to: connector.to,
      start,
      end,
      renderNode,
    });
    connectorNodes.push(renderNode);
  }

  const objectNodes = resolvedObjects.map((object) => object.renderNode);
  const sceneNodes = [...connectorNodes, ...objectNodes];
  const bounds = getNodeBounds(sceneNodes);
  const padding = 24;

  const defs: RenderDef[] = resolvedConnectors.length > 0
    ? [{
        kind: "marker",
        id: "arrowhead",
        viewBox: "0 0 10 10",
        path: "M 0 0 L 10 5 L 0 10 z",
        refX: 10,
        refY: 5,
        markerWidth: 8,
        markerHeight: 8,
        orient: "auto",
        style: { fill: defaultConnectorStyle.stroke },
      }]
    : [];

  return {
    resolved: {
      objects: resolvedObjects,
      connectors: resolvedConnectors,
    },
    renderScene: {
      kind: "scene",
      viewBox: {
        minX: bounds.minX - padding,
        minY: bounds.minY - padding,
        width: Math.max(1, bounds.maxX - bounds.minX + padding * 2),
        height: Math.max(1, bounds.maxY - bounds.minY + padding * 2),
      },
      defs,
      children: sceneNodes,
    },
    diagnostics,
  };
}

function resolveObjectLocal(
  object: DrawableObject,
  diagnostics: Diagnostic[],
  siblingMap: ReadonlyMap<string, ResolvedObject> = new Map(),
): ResolvedObject {
  switch (object.kind) {
    case "rect":
      return resolveRectLocal(object, siblingMap, diagnostics);
    case "circle": {
      const bbox = bboxFromRect(
        object.center.x - object.radius,
        object.center.y - object.radius,
        object.radius * 2,
        object.radius * 2,
      );

      return {
        id: object.id,
        kind: object.kind,
        bbox,
        anchors: anchorsForBoundingBox(bbox),
        style: object.style,
        geometry: {
          cx: object.center.x,
          cy: object.center.y,
          r: object.radius,
        },
        renderNode: {
          kind: "circle",
          id: object.id,
          cx: object.center.x,
          cy: object.center.y,
          r: object.radius,
          style: object.style,
        },
      };
    }
    case "text":
      return resolveTextLocal(object);
    case "group":
      return resolveGroupLocal(object, diagnostics);
  }
}

function resolveTextLocal(object: TextObject): ResolvedObject {
  const fontSize = object.style?.fontSize ?? defaultBoxStyle.fontSize ?? 14;
  const metrics = measureTextApprox(object.text, { fontSize });
  const bbox = bboxFromRect(
    object.center.x - metrics.width / 2,
    object.center.y - metrics.height / 2,
    metrics.width,
    metrics.height,
  );

  return {
    id: object.id,
    kind: object.kind,
    bbox,
    anchors: {
      ...anchorsForBoundingBox(bbox),
      baseline: point(object.center.x, object.center.y + metrics.baselineOffset),
    },
    style: {
      fontFamily: object.style?.fontFamily ?? defaultBoxStyle.fontFamily,
      fontSize,
      fill: object.style?.fill ?? "black",
      textAnchor: object.style?.textAnchor ?? "middle",
      dominantBaseline: object.style?.dominantBaseline ?? "alphabetic",
    },
    text: object.text,
    geometry: {
      x: object.center.x,
      y: object.center.y + metrics.baselineOffset,
    },
    renderNode: {
      kind: "text",
      id: object.id,
      x: object.center.x,
      y: object.center.y + metrics.baselineOffset,
      text: object.text,
      style: {
        fontFamily: object.style?.fontFamily ?? defaultBoxStyle.fontFamily,
        fontSize,
        fill: object.style?.fill ?? "black",
        textAnchor: object.style?.textAnchor ?? "middle",
        dominantBaseline: object.style?.dominantBaseline ?? "alphabetic",
      },
    },
  };
}

function resolveRectLocal(
  object: RectObject,
  siblingMap: ReadonlyMap<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): ResolvedObject {
  let center = object.center ?? point(0, 0);
  let width = object.width ?? 0;
  let height = object.height ?? 0;

  if (object.fitToText) {
    const textObject = siblingMap.get(object.fitToText.textId);

    if (!textObject) {
      diagnostics.push({
        severity: "error",
        message: `Rect ${object.id} could not find text ${object.fitToText.textId}`,
      });
    } else {
      center = textObject.anchors.center ?? center;
      width = textObject.bbox.width + object.fitToText.paddingX * 2;
      height = textObject.bbox.height + object.fitToText.paddingY * 2;
    }
  }

  const bbox = bboxFromRect(center.x - width / 2, center.y - height / 2, width, height);

  return {
    id: object.id,
    kind: object.kind,
    bbox,
    anchors: anchorsForBoundingBox(bbox),
    style: { ...defaultBoxStyle, ...object.style },
    geometry: {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      rx: object.rx,
      ry: object.ry,
    },
    renderNode: {
      kind: "rect",
      id: object.id,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      rx: object.rx,
      ry: object.ry,
      style: { ...defaultBoxStyle, ...object.style },
    },
  };
}

function resolveGroupLocal(object: GroupObject, diagnostics: Diagnostic[]): ResolvedObject {
  const localChildren: ResolvedObject[] = [];
  const localMap = new Map<string, ResolvedObject>();

  for (const child of object.children) {
    const resolvedChild = resolveObjectLocal(child, diagnostics, localMap);
    localChildren.push(resolvedChild);
    localMap.set(child.id, resolvedChild);
  }

  const bbox = bboxUnion(...localChildren.map((child) => child.bbox));

  return {
    id: object.id,
    kind: object.kind,
    bbox,
    anchors: anchorsForBoundingBox(bbox),
    children: localChildren,
    style: object.style,
    renderNode: {
      kind: "group",
      id: object.id,
      children: localChildren.map((child) => child.renderNode),
      style: object.style,
    },
  };
}

function applyPlacement(
  object: ResolvedObject,
  source: DrawableObject,
  placedObjects: ReadonlyMap<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): ResolvedObject {
  let offset: Vector = { dx: source.transform?.translateX ?? 0, dy: source.transform?.translateY ?? 0 };
  const placement = source.placement;

  if (placement?.kind === "absolute") {
    offset = addVectors(offset, { dx: placement.position.x, dy: placement.position.y });
  }

  if (placement && placement.kind !== "absolute") {
    const placementOffset = resolveRelativePlacementOffset(object, source, placedObjects, diagnostics);

    if (placementOffset) {
      offset = addVectors(offset, placementOffset);
    }
  }

  if (offset.dx === 0 && offset.dy === 0) {
    return object;
  }

  return translateResolvedObject(object, offset);
}

function applyAlignment(
  object: ResolvedObject,
  source: DrawableObject,
  placedObjects: ReadonlyMap<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): ResolvedObject {
  const alignment = source.align;

  if (!alignment) {
    return object;
  }

  const referenceObject = placedObjects.get(alignment.reference.objectId);

  if (!referenceObject) {
    diagnostics.push({
      severity: "error",
      message: `Could not align ${source.id}: missing reference object ${alignment.reference.objectId}`,
    });
    return object;
  }

  const referenceAnchor = referenceObject.anchors[alignment.reference.anchor];

  if (!referenceAnchor) {
    diagnostics.push({
      severity: "error",
      message: `Could not align ${source.id}: missing reference anchor ${alignment.reference.objectId}.${alignment.reference.anchor}`,
    });
    return object;
  }

  const targetAnchor = object.anchors.center;

  if (!targetAnchor) {
    diagnostics.push({
      severity: "error",
      message: `Could not align ${source.id}: missing target anchor center`,
    });
    return object;
  }

  let offset: Vector;

  if (alignment.relation === "alignY") {
    offset = {
      dx: 0,
      dy: referenceAnchor.y - targetAnchor.y,
    };
  } else if (alignment.relation === "alignX") {
    offset = {
      dx: referenceAnchor.x - targetAnchor.x,
      dy: 0,
    };
  } else {
    const unsupported = alignment as { relation: string };
    diagnostics.push({
      severity: "error",
      message: `Unsupported alignment relation ${unsupported.relation} for ${source.id}`,
    });
    return object;
  }

  if (offset.dy === 0) {
    if (offset.dx === 0) {
      return object;
    }
  }

  return translateResolvedObject(object, offset);
}

function resolveRelativePlacementOffset(
  object: ResolvedObject,
  source: DrawableObject,
  placedObjects: ReadonlyMap<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): Vector | undefined {
  const placement = source.placement;

  if (!placement || placement.kind === "absolute") {
    return undefined;
  }

  const anchorConfig = placementRelationAnchors[placement.kind];

  if (!anchorConfig) {
    diagnostics.push({
      severity: "error",
      message: `Unsupported placement relation ${placement.kind} for ${source.id}`,
    });
    return undefined;
  }

  const referenceObject = placedObjects.get(placement.reference.objectId);

  if (!referenceObject) {
    diagnostics.push({
      severity: "error",
      message: `Could not place ${source.id}: missing reference object ${placement.reference.objectId}`,
    });
    return undefined;
  }

  const referenceAnchor = referenceObject.anchors[placement.reference.anchor];

  if (!referenceAnchor) {
    diagnostics.push({
      severity: "error",
      message: `Could not place ${source.id}: missing reference anchor ${placement.reference.objectId}.${placement.reference.anchor}`,
    });
    return undefined;
  }

  const targetAnchor = object.anchors[anchorConfig.targetAnchor];

  if (!targetAnchor) {
    diagnostics.push({
      severity: "error",
      message: `Could not place ${source.id}: missing target anchor ${anchorConfig.targetAnchor}`,
    });
    return undefined;
  }

  switch (placement.kind) {
    case "rightOf":
      return {
        dx: referenceAnchor.x + placement.gap - targetAnchor.x,
        dy: referenceAnchor.y - targetAnchor.y,
      };
    case "leftOf":
      return {
        dx: referenceAnchor.x - placement.gap - targetAnchor.x,
        dy: referenceAnchor.y - targetAnchor.y,
      };
    case "above":
      return {
        dx: referenceAnchor.x - targetAnchor.x,
        dy: referenceAnchor.y - placement.gap - targetAnchor.y,
      };
    case "below":
      return {
        dx: referenceAnchor.x - targetAnchor.x,
        dy: referenceAnchor.y + placement.gap - targetAnchor.y,
      };
  }
}

function translateResolvedObject(object: ResolvedObject, offset: Vector): ResolvedObject {
  return {
    ...object,
    bbox: bboxTranslate(object.bbox, offset),
    anchors: translateAnchors(object.anchors, offset),
    geometry: translateGeometry(object.geometry, offset),
    children: object.children?.map((child) => translateResolvedObject(child, offset)),
    renderNode: translateRenderNode(object.renderNode, offset),
  };
}

function translateGeometry(
  geometry: Record<string, number | string | undefined> | undefined,
  offset: Vector,
): Record<string, number | string | undefined> | undefined {
  if (!geometry) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(geometry).map(([key, value]) => {
      if (typeof value !== "number") {
        return [key, value];
      }

      if (key === "x" || key === "cx") {
        return [key, value + offset.dx];
      }

      if (key === "y" || key === "cy") {
        return [key, value + offset.dy];
      }

      return [key, value];
    }),
  );
}

function resolveAnchorRef(
  objectMap: ReadonlyMap<string, ResolvedObject>,
  ref: AnchorRef,
): Point | undefined {
  return objectMap.get(ref.objectId)?.anchors[ref.anchor];
}

function anchorsForBoundingBox(box: BoundingBox): AnchorMap {
  return {
    center: anchorFromBoundingBox(box, "center"),
    north: anchorFromBoundingBox(box, "north"),
    south: anchorFromBoundingBox(box, "south"),
    east: anchorFromBoundingBox(box, "east"),
    west: anchorFromBoundingBox(box, "west"),
    northEast: anchorFromBoundingBox(box, "northEast"),
    northWest: anchorFromBoundingBox(box, "northWest"),
    southEast: anchorFromBoundingBox(box, "southEast"),
    southWest: anchorFromBoundingBox(box, "southWest"),
  };
}

function translateAnchors(anchors: AnchorMap, offset: Vector): AnchorMap {
  const translated: AnchorMap = {};

  for (const [name, anchor] of Object.entries(anchors) as [AnchorName, Point | undefined][]) {
    if (anchor) {
      translated[name] = addPointVector(anchor, offset);
    }
  }

  return translated;
}

function translateRenderNode(node: RenderNode, offset: Vector): RenderNode {
  switch (node.kind) {
    case "group":
      return {
        ...node,
        children: node.children.map((child) => translateRenderNode(child, offset)),
      };
    case "rect":
      return { ...node, x: node.x + offset.dx, y: node.y + offset.dy };
    case "circle":
      return { ...node, cx: node.cx + offset.dx, cy: node.cy + offset.dy };
    case "path":
      return { ...node, d: translatePath(node.d, offset) };
    case "text":
      return { ...node, x: node.x + offset.dx, y: node.y + offset.dy };
  }
}

function translatePath(d: string, offset: Vector): string {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);

  if (!numbers) {
    return d;
  }

  let index = 0;

  return d.replace(/-?\d+(?:\.\d+)?/g, (match) => {
    const value = Number(match);
    const translated = index % 2 === 0 ? value + offset.dx : value + offset.dy;
    index += 1;
    return String(translated);
  });
}

function getNodeBounds(nodes: readonly RenderNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const points: Point[] = [];

  const visit = (node: RenderNode): void => {
    switch (node.kind) {
      case "group":
        node.children.forEach(visit);
        break;
      case "rect":
        points.push(point(node.x, node.y), point(node.x + node.width, node.y + node.height));
        break;
      case "circle":
        points.push(point(node.cx - node.r, node.cy - node.r), point(node.cx + node.r, node.cy + node.r));
        break;
      case "text":
        points.push(point(node.x, node.y));
        break;
      case "path": {
        const numbers = node.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        for (let index = 0; index < numbers.length; index += 2) {
          const x = numbers[index];
          const y = numbers[index + 1];
          if (x !== undefined && y !== undefined) {
            points.push(point(x, y));
          }
        }
        break;
      }
    }
  };

  nodes.forEach(visit);

  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  }

  return {
    minX: Math.min(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxX: Math.max(...points.map((p) => p.x)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

function addVectors(a: Vector, b: Vector): Vector {
  return { dx: a.dx + b.dx, dy: a.dy + b.dy };
}