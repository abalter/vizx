import { VizxError, type SourceSpan } from "@vizx/core";
import type { AstProgram, AstStatement } from "./ast";

const boxAtPattern = /^box\s+([A-Za-z_][\w-]*)\s+"([^"]*)"\s+at\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*$/;
const boxRightOfPattern = /^box\s+([A-Za-z_][\w-]*)\s+"([^"]*)"\s+right_of\s+([A-Za-z_][\w-]*)\s+by\s+(-?\d+(?:\.\d+)?)\s*$/;
const boxBarePattern = /^box\s+([A-Za-z_][\w-]*)\s+"([^"]*)"\s*$/;
const connectPattern = /^connect\s+([A-Za-z_][\w-]*)\.([A-Za-z_][\w-]*)\s*->\s*([A-Za-z_][\w-]*)\.([A-Za-z_][\w-]*)\s*$/;

export function parseVizxSource(source: string, file?: string): AstProgram {
  const statements: AstStatement[] = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.replace(/#.*$/, "").trim();
    const span: SourceSpan = { file, line: index + 1, column: 1, length: rawLine.length };

    if (line.length === 0) continue;

    const boxAt = boxAtPattern.exec(line);
    if (boxAt) {
      statements.push({
        kind: "box",
        id: boxAt[1]!,
        label: boxAt[2]!,
        placement: { kind: "absolute", x: Number(boxAt[3]), y: Number(boxAt[4]) },
        span,
      });
      continue;
    }

    const boxRightOf = boxRightOfPattern.exec(line);
    if (boxRightOf) {
      statements.push({
        kind: "box",
        id: boxRightOf[1]!,
        label: boxRightOf[2]!,
        placement: { kind: "rightOf", referenceId: boxRightOf[3]!, distance: Number(boxRightOf[4]) },
        span,
      });
      continue;
    }

    const boxBare = boxBarePattern.exec(line);
    if (boxBare) {
      statements.push({
        kind: "box",
        id: boxBare[1]!,
        label: boxBare[2]!,
        placement: { kind: "none" },
        span,
      });
      continue;
    }

    const connect = connectPattern.exec(line);
    if (connect) {
      statements.push({
        kind: "connect",
        fromObjectId: connect[1]!,
        fromAnchorName: connect[2]!,
        toObjectId: connect[3]!,
        toAnchorName: connect[4]!,
        span,
      });
      continue;
    }

    throw new VizxError(`Could not parse line: ${rawLine}`, span);
  }

  return { kind: "program", statements };
}
