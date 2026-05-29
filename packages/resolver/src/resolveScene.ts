import { type Diagnostic, type Style, defaultBoxStyle, defaultConnectorStyle, defaultLineStyle } from "@vizx/core";
import {
  addPointVector,
  bboxFromEllipse,
  bboxFromPolygon,
  bboxFromPathCommands,
  bboxFromRect,
  bboxFromLine,
  bboxFromPoints,
  bboxFromTransformedCorners,
  bboxTranslate,
  bboxUnion,
  normalizeTransforms,
  point,
  rotatePoint,
  scalePoint,
  transformPoint,
  transformPoints,
  type BoundingBox,
  type Point,
  type TransformOperation,
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
  type PathCommand,
  type PlacementRelation,
  type RectObject,
  type SceneDistribution,
  type TextObject,
} from "@vizx/object-model";
import type { RenderNode, RenderScene } from "@vizx/renderer-svg";
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
    const transformedObject = applyObjectTransforms(localObject, object, diagnostics);
    const placedObject = applyPlacement(transformedObject, object, objectMap, diagnostics);
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

  // Distribution runs after placement/alignment, before connectors.
  applyDistribution(resolvedObjects, objectMap, scene.distribution, diagnostics);

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
    case "line": {
      const bbox = bboxFromLine(object.start, object.end);

      return {
        id: object.id,
        kind: object.kind,
        bbox,
        anchors: anchorsForBoundingBox(bbox),
        style: { ...defaultLineStyle, ...object.style },
        geometry: {
          x1: object.start.x,
          y1: object.start.y,
          x2: object.end.x,
          y2: object.end.y,
        },
        renderNode: {
          kind: "line",
          id: object.id,
          x1: object.start.x,
          y1: object.start.y,
          x2: object.end.x,
          y2: object.end.y,
          style: { ...defaultLineStyle, ...object.style },
        },
      };
    }
    case "polyline": {
      const bbox = bboxFromPoints(object.points);

      return {
        id: object.id,
        kind: object.kind,
        bbox,
        anchors: anchorsForBoundingBox(bbox),
        style: { ...defaultLineStyle, ...object.style },
        geometry: {
          pointCount: object.points.length,
        },
        renderNode: {
          kind: "polyline",
          id: object.id,
          points: object.points.map((pt) => ({ x: pt.x, y: pt.y })),
          style: { ...defaultLineStyle, ...object.style },
        },
      };
    }
    case "polygon": {
      if (object.points.length < 3) {
        diagnostics.push({
          severity: "error",
          message: `Polygon ${object.id} requires at least 3 points`,
        });
      }

      const bbox = bboxFromPolygon(object.points);

      return {
        id: object.id,
        kind: object.kind,
        bbox,
        anchors: anchorsForBoundingBox(bbox),
        style: { ...defaultLineStyle, ...object.style },
        geometry: {
          pointCount: object.points.length,
        },
        renderNode: {
          kind: "polygon",
          id: object.id,
          points: object.points.map((pt) => ({ x: pt.x, y: pt.y })),
          style: { ...defaultLineStyle, ...object.style },
        },
      };
    }
    case "ellipse": {
      const bbox = bboxFromEllipse(object.center, object.rx, object.ry);

      return {
        id: object.id,
        kind: object.kind,
        bbox,
        anchors: anchorsForBoundingBox(bbox),
        style: { ...defaultLineStyle, ...object.style },
        geometry: {
          cx: object.center.x,
          cy: object.center.y,
          rx: object.rx,
          ry: object.ry,
        },
        renderNode: {
          kind: "ellipse",
          id: object.id,
          cx: object.center.x,
          cy: object.center.y,
          rx: object.rx,
          ry: object.ry,
          style: { ...defaultLineStyle, ...object.style },
        },
      };
    }
    case "path":
      return resolvePathLocal(object.id, object.commands, object.style, diagnostics);
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

function resolvePathLocal(
  objectId: string,
  commands: readonly PathCommand[],
  style: Style | undefined,
  diagnostics: Diagnostic[],
): ResolvedObject {
  if (commands.length === 0) {
    diagnostics.push({
      severity: "error",
      message: `Path ${objectId} must include at least one command`,
    });
  }

  const dParts: string[] = [];
  let hasSubpath = false;
  let hasDrawableSegment = false;

  const pushNonFinitePathPointDiagnostic = (commandKind: string, pointRole: string): void => {
    diagnostics.push({
      severity: "error",
      message: `Path ${objectId} requires finite ${pointRole} coordinates for ${commandKind}`,
    });
  };

  const hasFinitePoint = (candidate: Point, commandKind: string, pointRole: string): boolean => {
    if (Number.isFinite(candidate.x) && Number.isFinite(candidate.y)) {
      return true;
    }

    pushNonFinitePathPointDiagnostic(commandKind, pointRole);
    return false;
  };

  for (const command of commands) {
    if (command.kind === "moveTo") {
      hasFinitePoint(command.point, command.kind, "point");
      hasSubpath = true;
      dParts.push(`M ${command.point.x} ${command.point.y}`);
      continue;
    }

    if (command.kind === "lineTo") {
      if (!hasSubpath) {
        diagnostics.push({
          severity: "error",
          message: `Path ${objectId} cannot use lineTo before moveTo`,
        });
        continue;
      }

      hasFinitePoint(command.point, command.kind, "point");
      hasDrawableSegment = true;
      dParts.push(`L ${command.point.x} ${command.point.y}`);
      continue;
    }

    if (command.kind === "quadraticCurveTo") {
      if (!hasSubpath) {
        diagnostics.push({
          severity: "error",
          message: `Path ${objectId} cannot use quadraticCurveTo before moveTo`,
        });
        continue;
      }

      hasFinitePoint(command.control, command.kind, "control");
      hasFinitePoint(command.point, command.kind, "point");
      hasDrawableSegment = true;
      dParts.push(`Q ${command.control.x} ${command.control.y} ${command.point.x} ${command.point.y}`);
      continue;
    }

    if (command.kind === "cubicCurveTo") {
      if (!hasSubpath) {
        diagnostics.push({
          severity: "error",
          message: `Path ${objectId} cannot use cubicCurveTo before moveTo`,
        });
        continue;
      }

      hasFinitePoint(command.control1, command.kind, "control1");
      hasFinitePoint(command.control2, command.kind, "control2");
      hasFinitePoint(command.point, command.kind, "point");
      hasDrawableSegment = true;
      dParts.push(`C ${command.control1.x} ${command.control1.y} ${command.control2.x} ${command.control2.y} ${command.point.x} ${command.point.y}`);
      continue;
    }

    if (!hasSubpath) {
      diagnostics.push({
        severity: "error",
        message: `Path ${objectId} cannot use closePath before moveTo`,
      });
      continue;
    }

    dParts.push("Z");
  }

  const explicitPointBBox = bboxFromPathCommands(commands);
  const explicitPointCount = commands.reduce((count, command) => {
    if (command.kind === "moveTo" || command.kind === "lineTo") {
      return count + 1;
    }

    if (command.kind === "quadraticCurveTo") {
      return count + 2;
    }

    if (command.kind === "cubicCurveTo") {
      return count + 3;
    }

    return count;
  }, 0);

  if (explicitPointCount === 0) {
    diagnostics.push({
      severity: "error",
      message: `Path ${objectId} must include at least one explicit point`,
    });
  }

  if (!hasDrawableSegment) {
    diagnostics.push({
      severity: "error",
      message: `Path ${objectId} must include at least one drawable segment`,
    });
  }

  return {
    id: objectId,
    kind: "path",
    bbox: explicitPointBBox,
    anchors: anchorsForBoundingBox(explicitPointBBox),
    style: { ...defaultLineStyle, ...style },
    geometry: {
      commandCount: commands.length,
      explicitPointCount,
      drawableSegmentCount: hasDrawableSegment ? 1 : 0,
    },
    renderNode: {
      kind: "path",
      id: objectId,
      d: dParts.join(" "),
      style: { ...defaultLineStyle, ...style },
    },
  };
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
  let offset: Vector = { dx: 0, dy: 0 };
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

  let offset: Vector;

  if (alignment.relation === "alignY") {
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

    offset = {
      dx: 0,
      dy: referenceAnchor.y - targetAnchor.y,
    };
  } else if (alignment.relation === "alignX") {
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

    offset = {
      dx: referenceAnchor.x - targetAnchor.x,
      dy: 0,
    };
  } else if (alignment.relation === "alignLeft") {
    const referenceAnchor = referenceObject.anchors.west;

    if (!referenceAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing reference anchor ${alignment.reference.objectId}.west`,
      });
      return object;
    }

    const targetAnchor = object.anchors.west;

    if (!targetAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing target anchor west`,
      });
      return object;
    }

    offset = {
      dx: referenceAnchor.x - targetAnchor.x,
      dy: 0,
    };
  } else if (alignment.relation === "alignRight") {
    const referenceAnchor = referenceObject.anchors.east;

    if (!referenceAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing reference anchor ${alignment.reference.objectId}.east`,
      });
      return object;
    }

    const targetAnchor = object.anchors.east;

    if (!targetAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing target anchor east`,
      });
      return object;
    }

    offset = {
      dx: referenceAnchor.x - targetAnchor.x,
      dy: 0,
    };
  } else if (alignment.relation === "alignTop") {
    const referenceAnchor = referenceObject.anchors.north;

    if (!referenceAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing reference anchor ${alignment.reference.objectId}.north`,
      });
      return object;
    }

    const targetAnchor = object.anchors.north;

    if (!targetAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing target anchor north`,
      });
      return object;
    }

    offset = {
      dx: 0,
      dy: referenceAnchor.y - targetAnchor.y,
    };
  } else if (alignment.relation === "alignBottom") {
    const referenceAnchor = referenceObject.anchors.south;

    if (!referenceAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing reference anchor ${alignment.reference.objectId}.south`,
      });
      return object;
    }

    const targetAnchor = object.anchors.south;

    if (!targetAnchor) {
      diagnostics.push({
        severity: "error",
        message: `Could not align ${source.id}: missing target anchor south`,
      });
      return object;
    }

    offset = {
      dx: 0,
      dy: referenceAnchor.y - targetAnchor.y,
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

function applyDistribution(
  resolvedObjects: ResolvedObject[],
  objectMap: Map<string, ResolvedObject>,
  distributions: readonly SceneDistribution[] | undefined,
  diagnostics: Diagnostic[],
): void {
  for (const distribution of distributions ?? []) {
    if (distribution.relation === "distributeX") {
      applyDistributeX(distribution, resolvedObjects, objectMap, diagnostics);
      continue;
    }

    if (distribution.relation === "distributeY") {
      applyDistributeY(distribution, resolvedObjects, objectMap, diagnostics);
      continue;
    }

    const unsupported = distribution as { relation: string };
    diagnostics.push({
      severity: "error",
      message: `Unsupported distribution relation ${unsupported.relation}`,
    });
  }
}

function applyDistributeX(
  distribution: SceneDistribution,
  resolvedObjects: ResolvedObject[],
  objectMap: Map<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): void {
  if (distribution.objectIds.length < 2) {
    diagnostics.push({
      severity: "error",
      message: "Could not distributeX: expected at least 2 object ids",
    });
    return;
  }

  const duplicateObjectId = findDuplicateObjectId(distribution.objectIds);

  if (duplicateObjectId) {
    diagnostics.push({
      severity: "error",
      message: `Could not distributeX: duplicate object id ${duplicateObjectId}`,
    });
    return;
  }

  const resolvedIndexes = new Map<string, number>();

  for (const [index, object] of resolvedObjects.entries()) {
    resolvedIndexes.set(object.id, index);
  }

  const targets: Array<{ objectId: string; object: ResolvedObject; index: number }> = [];

  for (const objectId of distribution.objectIds) {
    const resolvedObject = objectMap.get(objectId);
    const resolvedIndex = resolvedIndexes.get(objectId);

    if (!resolvedObject || resolvedIndex === undefined) {
      diagnostics.push({
        severity: "error",
        message: `Could not distributeX: missing object ${objectId}`,
      });
      return;
    }

    if (!resolvedObject.anchors.center) {
      diagnostics.push({
        severity: "error",
        message: `Could not distributeX: missing center anchor for ${objectId}`,
      });
      return;
    }

    targets.push({ objectId, object: resolvedObject, index: resolvedIndex });
  }

  const firstCenterX = targets[0]?.object.anchors.center?.x;
  const lastCenterX = targets[targets.length - 1]?.object.anchors.center?.x;

  if (firstCenterX === undefined || lastCenterX === undefined) {
    return;
  }

  const denominator = targets.length - 1;

  for (let index = 1; index < targets.length - 1; index += 1) {
    const target = targets[index];
    const targetCenter = target?.object.anchors.center;

    if (!target || !targetCenter) {
      continue;
    }

    const expectedCenterX = firstCenterX + ((lastCenterX - firstCenterX) * index) / denominator;
    const offset = {
      dx: expectedCenterX - targetCenter.x,
      dy: 0,
    };

    if (offset.dx === 0) {
      continue;
    }

    const translated = translateResolvedObject(target.object, offset);
    resolvedObjects[target.index] = translated;
    objectMap.set(target.objectId, translated);
  }
}

function applyDistributeY(
  distribution: SceneDistribution,
  resolvedObjects: ResolvedObject[],
  objectMap: Map<string, ResolvedObject>,
  diagnostics: Diagnostic[],
): void {
  if (distribution.objectIds.length < 2) {
    diagnostics.push({
      severity: "error",
      message: "Could not distributeY: expected at least 2 object ids",
    });
    return;
  }

  const duplicateObjectId = findDuplicateObjectId(distribution.objectIds);

  if (duplicateObjectId) {
    diagnostics.push({
      severity: "error",
      message: `Could not distributeY: duplicate object id ${duplicateObjectId}`,
    });
    return;
  }

  const resolvedIndexes = new Map<string, number>();

  for (const [index, object] of resolvedObjects.entries()) {
    resolvedIndexes.set(object.id, index);
  }

  const targets: Array<{ objectId: string; object: ResolvedObject; index: number }> = [];

  for (const objectId of distribution.objectIds) {
    const resolvedObject = objectMap.get(objectId);
    const resolvedIndex = resolvedIndexes.get(objectId);

    if (!resolvedObject || resolvedIndex === undefined) {
      diagnostics.push({
        severity: "error",
        message: `Could not distributeY: missing object ${objectId}`,
      });
      return;
    }

    if (!resolvedObject.anchors.center) {
      diagnostics.push({
        severity: "error",
        message: `Could not distributeY: missing center anchor for ${objectId}`,
      });
      return;
    }

    targets.push({ objectId, object: resolvedObject, index: resolvedIndex });
  }

  const firstCenterY = targets[0]?.object.anchors.center?.y;
  const lastCenterY = targets[targets.length - 1]?.object.anchors.center?.y;

  if (firstCenterY === undefined || lastCenterY === undefined) {
    return;
  }

  const denominator = targets.length - 1;

  for (let index = 1; index < targets.length - 1; index += 1) {
    const target = targets[index];
    const targetCenter = target?.object.anchors.center;

    if (!target || !targetCenter) {
      continue;
    }

    const expectedCenterY = firstCenterY + ((lastCenterY - firstCenterY) * index) / denominator;
    const offset = {
      dx: 0,
      dy: expectedCenterY - targetCenter.y,
    };

    if (offset.dy === 0) {
      continue;
    }

    const translated = translateResolvedObject(target.object, offset);
    resolvedObjects[target.index] = translated;
    objectMap.set(target.objectId, translated);
  }
}

function findDuplicateObjectId(objectIds: readonly string[]): string | undefined {
  const seen = new Set<string>();

  for (const objectId of objectIds) {
    if (seen.has(objectId)) {
      return objectId;
    }

    seen.add(objectId);
  }

  return undefined;
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

function applyObjectTransforms(
  object: ResolvedObject,
  source: DrawableObject,
  diagnostics: Diagnostic[],
): ResolvedObject {
  const transforms = normalizeTransforms(source.transform);

  let transformed = object;

  for (const operation of transforms) {
    if (operation.kind === "translate") {
      if (!Number.isFinite(operation.x) || !Number.isFinite(operation.y)) {
        diagnostics.push({
          severity: "error",
          message: `Could not apply transform for ${source.id}: translate requires finite x/y`,
        });
        continue;
      }

      transformed = translateResolvedObject(transformed, { dx: operation.x, dy: operation.y });
      continue;
    }

    if (operation.kind === "rotate") {
      if (!Number.isFinite(operation.angleDegrees)) {
        diagnostics.push({
          severity: "error",
          message: `Could not apply transform for ${source.id}: rotate requires a finite angleDegrees`,
        });
        continue;
      }

      if (operation.around && (!Number.isFinite(operation.around.x) || !Number.isFinite(operation.around.y))) {
        diagnostics.push({
          severity: "error",
          message: `Could not apply transform for ${source.id}: rotate around requires finite point coordinates`,
        });
        continue;
      }

      if (!canRotateResolvedObject(transformed)) {
        diagnostics.push({
          severity: "error",
          message: `Could not apply rotate transform for ${source.id}: rotation is not supported for this object kind in v0`,
        });
        continue;
      }

      const around = operation.around ?? transformed.anchors.center ?? point(0, 0);
      transformed = rotateResolvedObject(transformed, operation.angleDegrees, around);
      continue;
    }

    if (!Number.isFinite(operation.sx) || (operation.sy !== undefined && !Number.isFinite(operation.sy))) {
      diagnostics.push({
        severity: "error",
        message: `Could not apply transform for ${source.id}: scale requires finite sx/sy`,
      });
      continue;
    }

    if (operation.around && (!Number.isFinite(operation.around.x) || !Number.isFinite(operation.around.y))) {
      diagnostics.push({
        severity: "error",
        message: `Could not apply transform for ${source.id}: scale around requires finite point coordinates`,
      });
      continue;
    }

    if (!canScaleResolvedObject(transformed)) {
      diagnostics.push({
        severity: "error",
        message: `Could not apply scale transform for ${source.id}: scaling is not supported for this object kind in v0`,
      });
      continue;
    }

    const around = operation.around ?? transformed.anchors.center ?? point(0, 0);
    const sy = operation.sy ?? operation.sx;
    transformed = scaleResolvedObject(transformed, operation.sx, sy, around);
    continue;

    diagnostics.push({
      severity: "error",
      message: `Unsupported transform operation for ${source.id}`,
    });
  }

  return transformed;
}

function canRotateResolvedObject(object: ResolvedObject): boolean {
  return canRotateRenderNode(object.renderNode)
    && (object.children?.every((child) => canRotateResolvedObject(child)) ?? true);
}

function canScaleResolvedObject(object: ResolvedObject): boolean {
  return canScaleRenderNode(object.renderNode)
    && (object.children?.every((child) => canScaleResolvedObject(child)) ?? true);
}

function canRotateRenderNode(node: RenderNode): boolean {
  switch (node.kind) {
    case "text":
    case "ellipse":
      return false;
    case "group":
      return node.children.every((child) => canRotateRenderNode(child));
    default:
      return true;
  }
}

function canScaleRenderNode(node: RenderNode): boolean {
  switch (node.kind) {
    case "text":
      return false;
    case "group":
      return node.children.every((child) => canScaleRenderNode(child));
    default:
      return true;
  }
}

function rotateResolvedObject(object: ResolvedObject, angleDegrees: number, around: Point): ResolvedObject {
  const rotatedRenderNode = rotateRenderNode(object.renderNode, angleDegrees, around);

  if (!rotatedRenderNode) {
    return object;
  }

  const rotatedChildren = object.children?.map((child) => rotateResolvedObject(child, angleDegrees, around));
  const rotatedBounds = getNodeBounds([rotatedRenderNode]);
  const rotatedBBox = bboxFromRect(
    rotatedBounds.minX,
    rotatedBounds.minY,
    Math.max(0, rotatedBounds.maxX - rotatedBounds.minX),
    Math.max(0, rotatedBounds.maxY - rotatedBounds.minY),
  );

  return {
    ...object,
    bbox: rotatedBBox,
    anchors: anchorsForBoundingBox(rotatedBBox),
    geometry: rotateGeometry(object.geometry, angleDegrees, around),
    children: rotatedChildren,
    renderNode: rotatedRenderNode,
  };
}

function scaleResolvedObject(object: ResolvedObject, sx: number, sy: number, around: Point): ResolvedObject {
  const scaledRenderNode = scaleRenderNode(object.renderNode, sx, sy, around);

  if (!scaledRenderNode) {
    return object;
  }

  const scaledChildren = object.children?.map((child) => scaleResolvedObject(child, sx, sy, around));
  const scaledBounds = getNodeBounds([scaledRenderNode]);
  const scaledBBox = bboxFromRect(
    scaledBounds.minX,
    scaledBounds.minY,
    Math.max(0, scaledBounds.maxX - scaledBounds.minX),
    Math.max(0, scaledBounds.maxY - scaledBounds.minY),
  );

  return {
    ...object,
    bbox: scaledBBox,
    anchors: anchorsForBoundingBox(scaledBBox),
    geometry: scaleGeometry(object.geometry, sx, sy, around),
    children: scaledChildren,
    renderNode: scaledRenderNode,
  };
}

function rotateRenderNode(node: RenderNode, angleDegrees: number, around: Point): RenderNode | undefined {
  switch (node.kind) {
    case "group": {
      const children: RenderNode[] = [];

      for (const child of node.children) {
        const rotatedChild = rotateRenderNode(child, angleDegrees, around);

        if (!rotatedChild) {
          return undefined;
        }

        children.push(rotatedChild);
      }

      return {
        ...node,
        children,
      };
    }
    case "rect": {
      const transformedCorners = transformPoints([
        point(node.x, node.y),
        point(node.x + node.width, node.y),
        point(node.x + node.width, node.y + node.height),
        point(node.x, node.y + node.height),
      ], [{ kind: "rotate", angleDegrees, around }]);

      return {
        kind: "polygon",
        id: node.id,
        points: transformedCorners,
        style: node.style,
      };
    }
    case "circle": {
      const center = rotatePoint(point(node.cx, node.cy), angleDegrees, around);
      return {
        ...node,
        cx: center.x,
        cy: center.y,
      };
    }
    case "ellipse":
      return undefined;
    case "line": {
      const start = rotatePoint(point(node.x1, node.y1), angleDegrees, around);
      const end = rotatePoint(point(node.x2, node.y2), angleDegrees, around);

      return {
        ...node,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      };
    }
    case "polyline":
      return {
        ...node,
        points: transformPoints(node.points, [{ kind: "rotate", angleDegrees, around }]),
      };
    case "polygon":
      return {
        ...node,
        points: transformPoints(node.points, [{ kind: "rotate", angleDegrees, around }]),
      };
    case "path":
      return {
        ...node,
        d: rotatePath(node.d, angleDegrees, around),
      };
    case "text":
      return undefined;
  }
}

function scaleRenderNode(node: RenderNode, sx: number, sy: number, around: Point): RenderNode | undefined {
  switch (node.kind) {
    case "group": {
      const children: RenderNode[] = [];

      for (const child of node.children) {
        const scaledChild = scaleRenderNode(child, sx, sy, around);

        if (!scaledChild) {
          return undefined;
        }

        children.push(scaledChild);
      }

      return {
        ...node,
        children,
      };
    }
    case "rect": {
      const transformedCorners = transformPoints([
        point(node.x, node.y),
        point(node.x + node.width, node.y),
        point(node.x + node.width, node.y + node.height),
        point(node.x, node.y + node.height),
      ], [{ kind: "scale", sx, sy, around }]);
      const bounds = bboxFromPoints(transformedCorners);

      return {
        ...node,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };
    }
    case "circle": {
      const center = scalePoint(point(node.cx, node.cy), sx, sy, around);
      const absSx = Math.abs(sx);
      const absSy = Math.abs(sy);

      if (Math.abs(absSx - absSy) < 1e-9) {
        return {
          ...node,
          cx: center.x,
          cy: center.y,
          r: node.r * absSx,
        };
      }

      return {
        kind: "ellipse",
        id: node.id,
        cx: center.x,
        cy: center.y,
        rx: node.r * absSx,
        ry: node.r * absSy,
        style: node.style,
      };
    }
    case "ellipse": {
      const center = scalePoint(point(node.cx, node.cy), sx, sy, around);
      return {
        ...node,
        cx: center.x,
        cy: center.y,
        rx: node.rx * Math.abs(sx),
        ry: node.ry * Math.abs(sy),
      };
    }
    case "line": {
      const start = scalePoint(point(node.x1, node.y1), sx, sy, around);
      const end = scalePoint(point(node.x2, node.y2), sx, sy, around);

      return {
        ...node,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      };
    }
    case "polyline":
      return {
        ...node,
        points: transformPoints(node.points, [{ kind: "scale", sx, sy, around }]),
      };
    case "polygon":
      return {
        ...node,
        points: transformPoints(node.points, [{ kind: "scale", sx, sy, around }]),
      };
    case "path":
      return {
        ...node,
        d: scalePath(node.d, sx, sy, around),
      };
    case "text":
      return undefined;
  }
}

function rotatePath(d: string, angleDegrees: number, around: Point): string {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);

  if (!numbers) {
    return d;
  }

  let index = 0;

  return d.replace(/-?\d+(?:\.\d+)?/g, (match) => {
    const value = Number(match);

    if (!Number.isFinite(value)) {
      index += 1;
      return match;
    }

    const axisIndex = index % 2;
    const pairIndex = index - axisIndex;
    const xSource = Number(numbers[pairIndex]);
    const ySource = Number(numbers[pairIndex + 1]);

    if (!Number.isFinite(xSource) || !Number.isFinite(ySource)) {
      index += 1;
      return match;
    }

    const rotated = rotatePoint(point(xSource, ySource), angleDegrees, around);
    index += 1;
    return String(axisIndex === 0 ? rotated.x : rotated.y);
  });
}

function scalePath(d: string, sx: number, sy: number, around: Point): string {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);

  if (!numbers) {
    return d;
  }

  let index = 0;

  return d.replace(/-?\d+(?:\.\d+)?/g, (match) => {
    const value = Number(match);

    if (!Number.isFinite(value)) {
      index += 1;
      return match;
    }

    const axisIndex = index % 2;
    const pairIndex = index - axisIndex;
    const xSource = Number(numbers[pairIndex]);
    const ySource = Number(numbers[pairIndex + 1]);

    if (!Number.isFinite(xSource) || !Number.isFinite(ySource)) {
      index += 1;
      return match;
    }

    const scaled = scalePoint(point(xSource, ySource), sx, sy, around);
    index += 1;
    return String(axisIndex === 0 ? scaled.x : scaled.y);
  });
}

function rotateGeometry(
  geometry: Record<string, number | string | undefined> | undefined,
  angleDegrees: number,
  around: Point,
): Record<string, number | string | undefined> | undefined {
  if (!geometry) {
    return undefined;
  }

  const rotated = { ...geometry };

  rotateGeometryPair(rotated, "x", "y", angleDegrees, around);
  rotateGeometryPair(rotated, "cx", "cy", angleDegrees, around);
  rotateGeometryPair(rotated, "x1", "y1", angleDegrees, around);
  rotateGeometryPair(rotated, "x2", "y2", angleDegrees, around);

  return rotated;
}

function rotateGeometryPair(
  geometry: Record<string, number | string | undefined>,
  xKey: string,
  yKey: string,
  angleDegrees: number,
  around: Point,
): void {
  const x = geometry[xKey];
  const y = geometry[yKey];

  if (typeof x !== "number" || typeof y !== "number") {
    return;
  }

  const rotated = rotatePoint(point(x, y), angleDegrees, around);
  geometry[xKey] = rotated.x;
  geometry[yKey] = rotated.y;
}

function scaleGeometry(
  geometry: Record<string, number | string | undefined> | undefined,
  sx: number,
  sy: number,
  around: Point,
): Record<string, number | string | undefined> | undefined {
  if (!geometry) {
    return undefined;
  }

  const scaled = { ...geometry };

  scaleGeometryPair(scaled, "x", "y", sx, sy, around);
  scaleGeometryPair(scaled, "cx", "cy", sx, sy, around);
  scaleGeometryPair(scaled, "x1", "y1", sx, sy, around);
  scaleGeometryPair(scaled, "x2", "y2", sx, sy, around);

  if (typeof scaled.width === "number") {
    scaled.width = scaled.width * Math.abs(sx);
  }

  if (typeof scaled.height === "number") {
    scaled.height = scaled.height * Math.abs(sy);
  }

  if (typeof scaled.r === "number") {
    scaled.r = scaled.r * Math.max(Math.abs(sx), Math.abs(sy));
  }

  if (typeof scaled.rx === "number") {
    scaled.rx = scaled.rx * Math.abs(sx);
  }

  if (typeof scaled.ry === "number") {
    scaled.ry = scaled.ry * Math.abs(sy);
  }

  return scaled;
}

function scaleGeometryPair(
  geometry: Record<string, number | string | undefined>,
  xKey: string,
  yKey: string,
  sx: number,
  sy: number,
  around: Point,
): void {
  const x = geometry[xKey];
  const y = geometry[yKey];

  if (typeof x !== "number" || typeof y !== "number") {
    return;
  }

  const scaled = scalePoint(point(x, y), sx, sy, around);
  geometry[xKey] = scaled.x;
  geometry[yKey] = scaled.y;
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

      if (key === "x1" || key === "x2") {
        return [key, value + offset.dx];
      }

      if (key === "y" || key === "cy") {
        return [key, value + offset.dy];
      }

      if (key === "rx" || key === "ry") {
        return [key, value];
      }

      if (key === "y1" || key === "y2") {
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
    case "ellipse":
      return { ...node, cx: node.cx + offset.dx, cy: node.cy + offset.dy };
    case "line":
      return {
        ...node,
        x1: node.x1 + offset.dx,
        y1: node.y1 + offset.dy,
        x2: node.x2 + offset.dx,
        y2: node.y2 + offset.dy,
      };
    case "polyline":
      return {
        ...node,
        points: node.points.map((pt) => ({ x: pt.x + offset.dx, y: pt.y + offset.dy })),
      };
    case "polygon":
      return {
        ...node,
        points: node.points.map((pt) => ({ x: pt.x + offset.dx, y: pt.y + offset.dy })),
      };
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
      case "ellipse":
        points.push(point(node.cx - node.rx, node.cy - node.ry), point(node.cx + node.rx, node.cy + node.ry));
        break;
      case "line":
        points.push(point(node.x1, node.y1), point(node.x2, node.y2));
        break;
      case "polyline":
        points.push(...node.points.map((pt) => point(pt.x, pt.y)));
        break;
      case "polygon":
        points.push(...node.points.map((pt) => point(pt.x, pt.y)));
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