import type { CoreCommand, CoreProgram } from "@vizx/core";
import type { AstProgram } from "./ast";

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
