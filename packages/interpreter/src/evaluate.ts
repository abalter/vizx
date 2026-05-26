import {
  anchorOnBox,
  defaultBoxStyle,
  defaultConnectorStyle,
  rectFromCenter,
  VizxError,
  type AnchorRef,
  type CoreCommand,
  type CoreProgram,
  type DiagramObject,
  type Point,
  type ResolvedDiagram,
  type TextBoxObject,
  type ConnectorObject,
} from "@vizx/core";
import { measureTextApprox } from "./textMetrics";

interface MutableTextBox {
  kind: "textBox";
  id: string;
  label: string;
  center: Point;
  padding: number;
  style: typeof defaultBoxStyle;
}

interface InterpreterState {
  readonly boxes: Map<string, MutableTextBox>;
  readonly connectorCommands: Extract<CoreCommand, { kind: "connect" }>[];
}

export function evaluateProgram(program: CoreProgram): ResolvedDiagram {
  const state: InterpreterState = {
    boxes: new Map(),
    connectorCommands: [],
  };

  for (const command of program.commands) {
    evaluateCommand(command, state);
  }

  const objects = Array.from(state.boxes.values()).map(resolveTextBox);
  const objectMap = new Map(objects.map((object) => [object.id, object]));

  const connectors = state.connectorCommands.map((command, index) => {
    const id = command.id ?? `connector_${index + 1}`;
    const start = resolveAnchor(command.from, objectMap, command.span);
    const end = resolveAnchor(command.to, objectMap, command.span);

    return {
      kind: "connector" as const,
      id,
      from: command.from,
      to: command.to,
      start,
      end,
      style: { ...defaultConnectorStyle, ...command.style },
    } satisfies ConnectorObject;
  });

  return { objects, connectors };
}

function evaluateCommand(command: CoreCommand, state: InterpreterState): void {
  switch (command.kind) {
    case "createTextBox": {
      if (state.boxes.has(command.id)) {
        throw new VizxError(`Duplicate object id: ${command.id}`, command.span);
      }

      state.boxes.set(command.id, {
        kind: "textBox",
        id: command.id,
        label: command.label,
        center: command.at ?? { x: 0, y: 0 },
        padding: command.padding ?? 8,
        style: { ...defaultBoxStyle, ...command.style },
      });
      return;
    }

    case "placeRightOf": {
      const target = state.boxes.get(command.targetId);
      const reference = state.boxes.get(command.referenceId);

      if (!target) throw new VizxError(`Unknown target object: ${command.targetId}`, command.span);
      if (!reference) throw new VizxError(`Unknown reference object: ${command.referenceId}`, command.span);

      const resolvedTarget = resolveTextBox(target);
      const resolvedReference = resolveTextBox(reference);
      const targetWest = resolvedTarget.anchors.west;
      const referenceEast = resolvedReference.anchors.east;

      if (!targetWest || !referenceEast) {
        throw new VizxError("Could not resolve anchors for relative placement", command.span);
      }

      const desiredTargetWest = {
        x: referenceEast.x + command.distance,
        y: referenceEast.y,
      };

      const shift = {
        dx: desiredTargetWest.x - targetWest.x,
        dy: desiredTargetWest.y - targetWest.y,
      };

      state.boxes.set(target.id, {
        ...target,
        center: {
          x: target.center.x + shift.dx,
          y: target.center.y + shift.dy,
        },
      });
      return;
    }

    case "connect": {
      state.connectorCommands.push(command);
      return;
    }
  }
}

function resolveTextBox(box: MutableTextBox): TextBoxObject {
  const metrics = measureTextApprox(box.label, { fontSize: box.style.fontSize });
  const width = metrics.width + box.padding * 2;
  const height = metrics.height + box.padding * 2;
  const bounds = rectFromCenter(box.center, width, height);

  const anchors = {
    center: anchorOnBox(bounds, "center"),
    north: anchorOnBox(bounds, "north"),
    south: anchorOnBox(bounds, "south"),
    east: anchorOnBox(bounds, "east"),
    west: anchorOnBox(bounds, "west"),
    north_east: anchorOnBox(bounds, "north_east"),
    north_west: anchorOnBox(bounds, "north_west"),
    south_east: anchorOnBox(bounds, "south_east"),
    south_west: anchorOnBox(bounds, "south_west"),
    baseline: { x: box.center.x, y: box.center.y + metrics.baselineOffset },
  };

  return {
    kind: "textBox",
    id: box.id,
    label: box.label,
    center: box.center,
    box: bounds,
    textPosition: { x: box.center.x, y: box.center.y + metrics.baselineOffset },
    anchors,
    style: box.style,
  };
}

function resolveAnchor(ref: AnchorRef, objectMap: ReadonlyMap<string, DiagramObject>, span?: { line?: number; column?: number }): Point {
  const object = objectMap.get(ref.objectId);
  if (!object) throw new VizxError(`Unknown object: ${ref.objectId}`, span);

  const anchor = object.anchors[ref.anchorName];
  if (!anchor) throw new VizxError(`Unknown anchor ${ref.objectId}.${ref.anchorName}`, span);

  return anchor;
}
