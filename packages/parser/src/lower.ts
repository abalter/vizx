import type { Style } from "@vizx/core";
import type { Point, Transform } from "@vizx/geometry";
import type { CoreCommand, CoreProgram } from "@vizx/core";
import type { PathCommand } from "@vizx/object-model";
import type { ConnectorObject, DrawableObject, ObjectAlignment, ObjectPlacement, ObjectScene, SceneDistribution } from "@vizx/object-model";
import type { AstProgram } from "./ast";
import type {
  VizxAstAlignment,
  VizxAstConnector,
  VizxAstDistributionOperation,
  VizxAstLegacyTranslateTransform,
  VizxAstObject,
  VizxAstPathCommand,
  VizxAstPlacement,
  VizxAstPoint,
  VizxAstScene,
  VizxAstStyle,
  VizxAstTransform,
  VizxAstTransformOperation,
} from "./ast";

export function lowerAstToCore(ast: AstProgram): CoreProgram {
  const commands: CoreCommand[] = [];

  for (const statement of ast.statements) {
    if (statement.kind === "box") {
      commands.push({
        kind: "createTextBox",
        id: statement.id,
        label: statement.label,
        at: statement.placement.kind === "absolute"
          ? { x: statement.placement.x, y: statement.placement.y }
          : undefined,
        span: statement.span,
      });

      if (statement.placement.kind === "rightOf") {
        commands.push({
          kind: "placeRightOf",
          targetId: statement.id,
          referenceId: statement.placement.referenceId,
          distance: statement.placement.distance,
          span: statement.span,
        });
      }

      continue;
    }

    if (statement.kind === "connect") {
      commands.push({
        kind: "connect",
        from: {
          objectId: statement.fromObjectId,
          anchorName: statement.fromAnchorName,
        },
        to: {
          objectId: statement.toObjectId,
          anchorName: statement.toAnchorName,
        },
        span: statement.span,
      });
    }
  }

  return { commands };
}

export function lowerAstToObjectScene(ast: VizxAstScene): ObjectScene {
  if (ast.kind !== "scene") {
    throw new Error(`Unsupported AST root kind: ${(ast as { kind?: unknown }).kind ?? "unknown"}`);
  }

  return {
    objects: ast.objects.map((object) => lowerAstObject(object)),
    connectors: ast.connectors?.map((connector) => lowerAstConnector(connector)),
    distribution: ast.distribution?.map((operation) => lowerAstDistribution(operation)),
  };
}

function lowerAstObject(object: VizxAstObject): DrawableObject {
  switch (object.kind) {
    case "group":
      return {
        kind: "group",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        children: object.children.map((child) => lowerAstObject(child)),
      };
    case "text":
      return {
        kind: "text",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        center: lowerAstPoint(object.center),
        text: object.text,
      };
    case "rect":
      return {
        kind: "rect",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        fitToText: object.fitToText ? {
          textId: object.fitToText.textId,
          paddingX: object.fitToText.paddingX,
          paddingY: object.fitToText.paddingY,
        } : undefined,
        center: object.center ? lowerAstPoint(object.center) : undefined,
        width: object.width,
        height: object.height,
        rx: object.rx,
        ry: object.ry,
      };
    case "line":
      return {
        kind: "line",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        start: lowerAstPoint(object.start),
        end: lowerAstPoint(object.end),
      };
    case "polyline":
      return {
        kind: "polyline",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        points: object.points.map((point) => lowerAstPoint(point)),
      };
    case "ellipse":
      return {
        kind: "ellipse",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        center: lowerAstPoint(object.center),
        rx: object.rx,
        ry: object.ry,
      };
    case "polygon":
      return {
        kind: "polygon",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        points: object.points.map((point) => lowerAstPoint(point)),
      };
    case "circle":
      return {
        kind: "circle",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        center: lowerAstPoint(object.center),
        radius: object.radius,
      };
    case "path":
      return {
        kind: "path",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        align: lowerAstAlignment(object.align),
        style: lowerAstStyle(object.style),
        transform: lowerAstTransform(object.transform),
        commands: object.commands.map((command) => lowerAstPathCommand(command)),
      };
    default:
      throw new Error(`Unsupported AST object kind: ${(object as { kind?: unknown }).kind ?? "unknown"}`);
  }
}

function lowerAstPlacement(placement: VizxAstPlacement | undefined): ObjectPlacement | undefined {
  if (!placement) {
    return undefined;
  }

  if (placement.kind === "absolute") {
    return {
      kind: "absolute",
      position: { x: placement.position.x, y: placement.position.y },
    };
  }

  return {
    kind: placement.kind,
    reference: {
      objectId: placement.reference.objectId,
      anchor: placement.reference.anchor,
    },
    gap: placement.gap,
  };
}

function lowerAstAlignment(alignment: VizxAstAlignment | undefined): ObjectAlignment | undefined {
  if (!alignment) {
    return undefined;
  }

  if (alignment.relation === "alignX"
    || alignment.relation === "alignY"
    || alignment.relation === "alignLeft"
    || alignment.relation === "alignRight"
    || alignment.relation === "alignTop"
    || alignment.relation === "alignBottom") {
    return {
      relation: alignment.relation,
      reference: {
        objectId: alignment.reference.objectId,
        anchor: alignment.reference.anchor,
      },
    };
  }

  throw new Error(`Unsupported AST alignment relation: ${(alignment as { relation?: unknown }).relation ?? "unknown"}`);
}

function lowerAstConnector(connector: VizxAstConnector): ConnectorObject {
  if (connector.kind !== "connector") {
    throw new Error(`Unsupported AST connector kind: ${(connector as { kind?: unknown }).kind ?? "unknown"}`);
  }

  return {
    kind: "connector",
    id: connector.id,
    from: {
      objectId: connector.from.objectId,
      anchor: connector.from.anchor,
    },
    to: {
      objectId: connector.to.objectId,
      anchor: connector.to.anchor,
    },
    style: lowerAstStyle(connector.style),
  };
}

function lowerAstDistribution(operation: VizxAstDistributionOperation): SceneDistribution {
  if (operation.relation === "distributeX" || operation.relation === "distributeY") {
    return {
      relation: operation.relation,
      objectIds: [...operation.objectIds],
    };
  }

  throw new Error(`Unsupported AST distribution relation: ${(operation as { relation?: unknown }).relation ?? "unknown"}`);
}

function lowerAstPathCommand(command: VizxAstPathCommand): PathCommand {
  switch (command.kind) {
    case "moveTo":
      return {
        kind: "moveTo",
        point: lowerAstPoint(command.point),
      };
    case "lineTo":
      return {
        kind: "lineTo",
        point: lowerAstPoint(command.point),
      };
    case "quadraticCurveTo":
      return {
        kind: "quadraticCurveTo",
        control: lowerAstPoint(command.control),
        point: lowerAstPoint(command.point),
      };
    case "cubicCurveTo":
      return {
        kind: "cubicCurveTo",
        control1: lowerAstPoint(command.control1),
        control2: lowerAstPoint(command.control2),
        point: lowerAstPoint(command.point),
      };
    case "arc":
      return {
        kind: "arc",
        center: lowerAstPoint(command.center),
        radius: command.radius,
        startAngleDegrees: command.startAngleDegrees,
        endAngleDegrees: command.endAngleDegrees,
        clockwise: command.clockwise,
      };
    case "closePath":
      return { kind: "closePath" };
    default:
      throw new Error(`Unsupported AST path command kind: ${(command as { kind?: unknown }).kind ?? "unknown"}`);
  }
}

function lowerAstPoint(point: VizxAstPoint): Point {
  return {
    x: point.x,
    y: point.y,
  };
}

function lowerAstStyle(style: VizxAstStyle | undefined): Style | undefined {
  if (!style) {
    return undefined;
  }

  return {
    stroke: style.stroke,
    fill: style.fill,
    strokeWidth: style.strokeWidth,
    strokeDasharray: style.strokeDasharray,
    strokeLineCap: style.strokeLineCap,
    strokeLineJoin: style.strokeLineJoin,
    fillRule: style.fillRule,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    textAnchor: style.textAnchor,
    dominantBaseline: style.dominantBaseline,
    opacity: style.opacity,
    markerStart: style.markerStart,
    markerEnd: style.markerEnd,
  };
}

function lowerAstTransform(transform: VizxAstTransform | undefined): Transform | readonly Transform[] | undefined {
  if (!transform) {
    return undefined;
  }

  if (Array.isArray(transform)) {
    return transform.map((operation) => lowerAstTransformOperation(operation));
  }

  if (isLegacyTranslateTransform(transform)) {
    return {
      translateX: transform.translateX,
      translateY: transform.translateY,
    };
  }

  if (!isTransformOperation(transform)) {
    throw new Error("Unsupported AST transform shape.");
  }

  return lowerAstTransformOperation(transform);
}

function lowerAstTransformOperation(transform: VizxAstTransformOperation): Transform {
  if (transform.kind === "translate") {
    return {
      kind: "translate",
      x: transform.x,
      y: transform.y,
    };
  }

  if (transform.kind === "rotate") {
    return {
      kind: "rotate",
      angleDegrees: transform.angleDegrees,
      around: transform.around ? lowerAstPoint(transform.around) : undefined,
    };
  }

  if (transform.kind === "scale") {
    return {
      kind: "scale",
      sx: transform.sx,
      sy: transform.sy,
      around: transform.around ? lowerAstPoint(transform.around) : undefined,
    };
  }

  throw new Error(`Unsupported AST transform kind: ${(transform as { kind?: unknown }).kind ?? "unknown"}`);
}

function isLegacyTranslateTransform(transform: VizxAstTransform): transform is VizxAstLegacyTranslateTransform {
  return !Array.isArray(transform)
    && "translateX" in transform
    && "translateY" in transform
    && typeof transform.translateX === "number"
    && typeof transform.translateY === "number";
}

function isTransformOperation(transform: VizxAstTransform): transform is VizxAstTransformOperation {
  return !Array.isArray(transform) && "kind" in transform;
}
