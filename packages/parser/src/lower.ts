import type { CoreCommand, CoreProgram } from "@vizx/core";
import type { ConnectorObject, DrawableObject, ObjectPlacement, ObjectScene } from "@vizx/object-model";
import type { AstProgram } from "./ast";
import type { VizxAstConnector, VizxAstObject, VizxAstPlacement, VizxAstScene } from "./ast";

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
  };
}

function lowerAstObject(object: VizxAstObject): DrawableObject {
  switch (object.kind) {
    case "group":
      return {
        kind: "group",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        children: object.children.map((child) => lowerAstObject(child)),
      };
    case "text":
      return {
        kind: "text",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        center: { x: object.center.x, y: object.center.y },
        text: object.text,
      };
    case "rect":
      return {
        kind: "rect",
        id: object.id,
        placement: lowerAstPlacement(object.placement),
        fitToText: {
          textId: object.fitToText.textId,
          paddingX: object.fitToText.paddingX,
          paddingY: object.fitToText.paddingY,
        },
        rx: object.rx,
        ry: object.ry,
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
  };
}
