import type { Style } from "@vizx/core";
import type { Transform } from "@vizx/geometry";
import type { AnchorName, AnchorRef } from "./anchors";
import type {
  ArcPathCommand,
  ConnectorObject,
  CubicCurveToPathCommand,
  DrawableObject,
  ObjectAlignment,
  ObjectPlacement,
  PathCommand,
  QuadraticCurveToPathCommand,
} from "./objects";
import type { ObjectScene, SceneDistribution } from "./scene";

export interface JsonCoreIrV0ConversionResult {
  readonly scene?: ObjectScene;
  readonly diagnostics: string[];
}

type JsonRecord = Record<string, unknown>;

export function convertJsonCoreIrV0ToObjectScene(input: unknown): JsonCoreIrV0ConversionResult {
  const diagnostics: string[] = [];

  if (!isRecord(input)) {
    return fail("Input must be an object.");
  }

  const objectsValue = input.objects;

  if (!Array.isArray(objectsValue)) {
    return fail("Scene objects must be an array.");
  }

  const convertedObjects: DrawableObject[] = [];

  for (let index = 0; index < objectsValue.length; index += 1) {
    const objectResult = convertDrawableObject(objectsValue[index], `objects[${index}]`);
    diagnostics.push(...objectResult.diagnostics);

    if (objectResult.object) {
      convertedObjects.push(objectResult.object);
    }
  }

  const connectorsValue = input.connectors;
  const convertedConnectors: ConnectorObject[] = [];

  if (connectorsValue !== undefined) {
    if (!Array.isArray(connectorsValue)) {
      diagnostics.push("Scene connectors must be an array.");
    } else {
      for (let index = 0; index < connectorsValue.length; index += 1) {
        const connectorResult = convertConnector(connectorsValue[index], `connectors[${index}]`);
        diagnostics.push(...connectorResult.diagnostics);

        if (connectorResult.connector) {
          convertedConnectors.push(connectorResult.connector);
        }
      }
    }
  }

  const distributionValue = input.distribution;
  const convertedDistribution: SceneDistribution[] = [];

  if (distributionValue !== undefined) {
    if (!Array.isArray(distributionValue)) {
      diagnostics.push("Scene distribution must be an array.");
    } else {
      for (let index = 0; index < distributionValue.length; index += 1) {
        const distributionResult = convertDistribution(distributionValue[index], `distribution[${index}]`);
        diagnostics.push(...distributionResult.diagnostics);

        if (distributionResult.operation) {
          convertedDistribution.push(distributionResult.operation);
        }
      }
    }
  }

  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  const scene: ObjectScene = {
    objects: convertedObjects,
    connectors: convertedConnectors,
    distribution: convertedDistribution.length > 0 ? convertedDistribution : undefined,
  };

  return { scene, diagnostics };
}

function convertDrawableObject(value: unknown, path: string): { object?: DrawableObject; diagnostics: string[] } {
  const diagnostics: string[] = [];

  if (!isRecord(value)) {
    return failAt(path, "Object must be an object.");
  }

  const id = readString(value.id, `${path}.id`, diagnostics);
  const kind = readString(value.kind, `${path}.kind`, diagnostics);
  const placement = convertPlacement(value.placement, `${path}.placement`, diagnostics);
  const align = convertAlignment(value.align, `${path}.align`, diagnostics);
  const style = readStyle(value.style, `${path}.style`, diagnostics);
  const transform = readTransform(value.transform, `${path}.transform`, diagnostics);

  if (!kind || !id || diagnostics.length > 0) {
    return { diagnostics };
  }

  if (kind === "group") {
    const childrenValue = value.children;

    if (!Array.isArray(childrenValue)) {
      diagnostics.push(`${path}.children must be an array.`);
      return { diagnostics };
    }

    const children: DrawableObject[] = [];

    for (let index = 0; index < childrenValue.length; index += 1) {
      const childResult = convertDrawableObject(childrenValue[index], `${path}.children[${index}]`);
      diagnostics.push(...childResult.diagnostics);

      if (childResult.object) {
        children.push(childResult.object);
      }
    }

    if (diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "group",
        id,
        placement,
        align,
        style,
        transform,
        children,
      },
      diagnostics,
    };
  }

  if (kind === "text") {
    const center = readPoint(value.center, `${path}.center`, diagnostics);
    const text = readString(value.text, `${path}.text`, diagnostics);

    if (!center || !text || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "text",
        id,
        center,
        text,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "rect") {
    const fitToText = readFitToText(value.fitToText, `${path}.fitToText`, diagnostics);
    const center = readOptionalPoint(value.center, `${path}.center`, diagnostics);
    const width = readOptionalNumber(value.width, `${path}.width`, diagnostics);
    const height = readOptionalNumber(value.height, `${path}.height`, diagnostics);
    const rx = readOptionalNumber(value.rx, `${path}.rx`, diagnostics);
    const ry = readOptionalNumber(value.ry, `${path}.ry`, diagnostics);

    if (!fitToText && !center) {
      diagnostics.push(`${path} rect object requires fitToText or center.`);
    }

    if (fitToText && center) {
      diagnostics.push(`${path} rect object cannot use fitToText and center together.`);
    }

    if (center && width === undefined) {
      diagnostics.push(`${path}.width must be a finite number when center is provided.`);
    }

    if (center && height === undefined) {
      diagnostics.push(`${path}.height must be a finite number when center is provided.`);
    }

    if (diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "rect",
        id,
        fitToText,
        center,
        width,
        height,
        rx,
        ry,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "line") {
    const start = readPoint(value.start, `${path}.start`, diagnostics);
    const end = readPoint(value.end, `${path}.end`, diagnostics);

    if (!start || !end || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "line",
        id,
        start,
        end,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "polyline") {
    const points = readPointArray(value.points, `${path}.points`, diagnostics);

    if (!points || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "polyline",
        id,
        points,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "ellipse") {
    const center = readPoint(value.center, `${path}.center`, diagnostics);
    const rx = readNumber(value.rx, `${path}.rx`, diagnostics);
    const ry = readNumber(value.ry, `${path}.ry`, diagnostics);

    if (!center || rx === undefined || ry === undefined || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "ellipse",
        id,
        center,
        rx,
        ry,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "polygon") {
    const points = readPointArray(value.points, `${path}.points`, diagnostics);

    if (!points || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "polygon",
        id,
        points,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "circle") {
    const center = readPoint(value.center, `${path}.center`, diagnostics);
    const radius = readNumber(value.radius, `${path}.radius`, diagnostics);

    if (!center || radius === undefined || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "circle",
        id,
        center,
        radius,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  if (kind === "path") {
    const commands = readPathCommands(value.commands, `${path}.commands`, diagnostics);

    if (!commands || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "path",
        id,
        commands,
        placement,
        align,
        style,
        transform,
      },
      diagnostics,
    };
  }

  diagnostics.push(`${path}.kind must be one of group, text, rect, line, polyline, ellipse, polygon, circle, or path.`);
  return { diagnostics };
}

function convertPlacement(value: unknown, path: string, diagnostics: string[]): ObjectPlacement | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const kind = readString(value.kind, `${path}.kind`, diagnostics);

  if (kind === "absolute") {
    const position = readPoint(value.position, `${path}.position`, diagnostics);

    if (!position) {
      return undefined;
    }

    return {
      kind: "absolute",
      position,
    };
  }

  if (kind === "rightOf" || kind === "leftOf" || kind === "above" || kind === "below") {
    const reference = readAnchorRef(value.reference, `${path}.reference`, diagnostics);
    const gap = readNumber(value.gap, `${path}.gap`, diagnostics);

    if (!reference || gap === undefined) {
      return undefined;
    }

    return {
      kind,
      reference,
      gap,
    };
  }

  diagnostics.push(`${path}.kind must be absolute, rightOf, leftOf, above, or below.`);
  return undefined;
}

function convertAlignment(value: unknown, path: string, diagnostics: string[]): ObjectAlignment | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const relation = readString(value.relation, `${path}.relation`, diagnostics);

  if (relation === "alignX"
    || relation === "alignY"
    || relation === "alignLeft"
    || relation === "alignRight"
    || relation === "alignTop"
    || relation === "alignBottom") {
    const reference = readAnchorRef(value.reference, `${path}.reference`, diagnostics);

    if (!reference) {
      return undefined;
    }

    return {
      relation,
      reference,
    };
  }

  diagnostics.push(`${path}.relation must be alignX, alignY, alignLeft, alignRight, alignTop, or alignBottom.`);
  return undefined;
}

function convertDistribution(value: unknown, path: string): { operation?: SceneDistribution; diagnostics: string[] } {
  const diagnostics: string[] = [];

  if (!isRecord(value)) {
    return failAt(path, "Distribution operation must be an object.");
  }

  const relation = readString(value.relation, `${path}.relation`, diagnostics);
  const objectIds = readStringArray(value.objectIds, `${path}.objectIds`, diagnostics);

  if (!relation || !objectIds || diagnostics.length > 0) {
    return { diagnostics };
  }

  if (relation !== "distributeX" && relation !== "distributeY") {
    diagnostics.push(`${path}.relation must be distributeX or distributeY.`);
    return { diagnostics };
  }

  return {
    operation: {
      relation,
      objectIds,
    },
    diagnostics,
  };
}

function convertConnector(value: unknown, path: string): { connector?: ConnectorObject; diagnostics: string[] } {
  const diagnostics: string[] = [];

  if (!isRecord(value)) {
    return failAt(path, "Connector must be an object.");
  }

  const id = readString(value.id, `${path}.id`, diagnostics);
  const kind = readString(value.kind, `${path}.kind`, diagnostics);

  if (kind !== "connector") {
    diagnostics.push(`${path}.kind must be connector.`);
  }

  const from = readAnchorRef(value.from, `${path}.from`, diagnostics);
  const to = readAnchorRef(value.to, `${path}.to`, diagnostics);
  const style = readStyle(value.style, `${path}.style`, diagnostics);

  if (!id || !from || !to || diagnostics.length > 0) {
    return { diagnostics };
  }

  return {
    connector: {
      kind: "connector",
      id,
      from,
      to,
      style,
    },
    diagnostics,
  };
}

function readFitToText(value: unknown, path: string, diagnostics: string[]) {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const textId = readString(value.textId, `${path}.textId`, diagnostics);
  const paddingX = readNumber(value.paddingX, `${path}.paddingX`, diagnostics);
  const paddingY = readNumber(value.paddingY, `${path}.paddingY`, diagnostics);

  if (!textId || paddingX === undefined || paddingY === undefined) {
    return undefined;
  }

  return { textId, paddingX, paddingY };
}

function readStyle(value: unknown, path: string, diagnostics: string[]): Style | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const stroke = readOptionalString(value.stroke, `${path}.stroke`, diagnostics);
  const fill = readOptionalString(value.fill, `${path}.fill`, diagnostics);
  const strokeWidth = readOptionalNumber(value.strokeWidth, `${path}.strokeWidth`, diagnostics);
  const strokeDasharray = readOptionalNumberArray(value.strokeDasharray, `${path}.strokeDasharray`, diagnostics, {
    minimum: 0,
  });
  const strokeLineCap = readOptionalEnum(value.strokeLineCap, `${path}.strokeLineCap`, diagnostics, ["butt", "round", "square"]);
  const strokeLineJoin = readOptionalEnum(value.strokeLineJoin, `${path}.strokeLineJoin`, diagnostics, ["miter", "round", "bevel"]);
  const fillRule = readOptionalEnum(value.fillRule, `${path}.fillRule`, diagnostics, ["nonzero", "evenodd"]);
  const fontFamily = readOptionalString(value.fontFamily, `${path}.fontFamily`, diagnostics);
  const fontSize = readOptionalNumber(value.fontSize, `${path}.fontSize`, diagnostics);
  const textAnchor = readOptionalEnum(value.textAnchor, `${path}.textAnchor`, diagnostics, ["start", "middle", "end"]);
  const dominantBaseline = readOptionalString(value.dominantBaseline, `${path}.dominantBaseline`, diagnostics);
  const opacity = readOptionalNumber(value.opacity, `${path}.opacity`, diagnostics);
  const markerStart = readOptionalString(value.markerStart, `${path}.markerStart`, diagnostics);
  const markerEnd = readOptionalString(value.markerEnd, `${path}.markerEnd`, diagnostics);

  if (diagnostics.length > 0) {
    return undefined;
  }

  return {
    stroke,
    fill,
    strokeWidth,
    strokeDasharray,
    strokeLineCap,
    strokeLineJoin,
    fillRule,
    fontFamily,
    fontSize,
    textAnchor,
    dominantBaseline,
    opacity,
    markerStart,
    markerEnd,
  };
}

function readTransform(value: unknown, path: string, diagnostics: string[]): Transform | readonly Transform[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const operations: Transform[] = [];

    for (let index = 0; index < value.length; index += 1) {
      const operation = readTransformOperation(value[index], `${path}[${index}]`, diagnostics);

      if (operation) {
        operations.push(operation);
      }
    }

    if (diagnostics.length > 0) {
      return undefined;
    }

    return operations;
  }

  const operation = readTransformOperation(value, path, diagnostics);

  if (!operation || diagnostics.length > 0) {
    return undefined;
  }

  return operation;
}

function readTransformOperation(value: unknown, path: string, diagnostics: string[]): Transform | undefined {
  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  if (value.kind === "translate") {
    const x = readNumber(value.x, `${path}.x`, diagnostics);
    const y = readNumber(value.y, `${path}.y`, diagnostics);

    if (x === undefined || y === undefined) {
      return undefined;
    }

    return { kind: "translate", x, y };
  }

  if (value.kind === "rotate") {
    const angleDegrees = readNumber(value.angleDegrees, `${path}.angleDegrees`, diagnostics);
    const around = readOptionalPoint(value.around, `${path}.around`, diagnostics);

    if (angleDegrees === undefined) {
      return undefined;
    }

    return {
      kind: "rotate",
      angleDegrees,
      around,
    };
  }

  if (value.kind === "scale") {
    const sx = readNumber(value.sx, `${path}.sx`, diagnostics);
    const sy = readOptionalNumber(value.sy, `${path}.sy`, diagnostics);
    const around = readOptionalPoint(value.around, `${path}.around`, diagnostics);

    if (sx === undefined) {
      return undefined;
    }

    return {
      kind: "scale",
      sx,
      sy,
      around,
    };
  }

  if (value.translateX !== undefined || value.translateY !== undefined) {
    const translateX = readNumber(value.translateX, `${path}.translateX`, diagnostics);
    const translateY = readNumber(value.translateY, `${path}.translateY`, diagnostics);

    if (translateX === undefined || translateY === undefined) {
      return undefined;
    }

    return {
      translateX,
      translateY,
    };
  }

  diagnostics.push(`${path} must be a translate/rotate/scale or legacy translate transform.`);
  return undefined;
}

function readPathCommands(value: unknown, path: string, diagnostics: string[]): readonly PathCommand[] | undefined {
  if (!Array.isArray(value)) {
    diagnostics.push(`${path} must be an array.`);
    return undefined;
  }

  const commands: PathCommand[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const command = readPathCommand(value[index], `${path}[${index}]`, diagnostics);

    if (command) {
      commands.push(command);
    }
  }

  if (diagnostics.length > 0) {
    return undefined;
  }

  return commands;
}

function readPathCommand(value: unknown, path: string, diagnostics: string[]): PathCommand | undefined {
  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const kind = readString(value.kind, `${path}.kind`, diagnostics);

  if (!kind) {
    return undefined;
  }

  if (kind === "moveTo" || kind === "lineTo") {
    const point = readPoint(value.point, `${path}.point`, diagnostics);

    if (!point) {
      return undefined;
    }

    return { kind, point };
  }

  if (kind === "quadraticCurveTo") {
    const control = readPoint(value.control, `${path}.control`, diagnostics);
    const point = readPoint(value.point, `${path}.point`, diagnostics);

    if (!control || !point) {
      return undefined;
    }

    const command: QuadraticCurveToPathCommand = { kind, control, point };
    return command;
  }

  if (kind === "cubicCurveTo") {
    const control1 = readPoint(value.control1, `${path}.control1`, diagnostics);
    const control2 = readPoint(value.control2, `${path}.control2`, diagnostics);
    const point = readPoint(value.point, `${path}.point`, diagnostics);

    if (!control1 || !control2 || !point) {
      return undefined;
    }

    const command: CubicCurveToPathCommand = { kind, control1, control2, point };
    return command;
  }

  if (kind === "arc") {
    const center = readPoint(value.center, `${path}.center`, diagnostics);
    const radius = readNumber(value.radius, `${path}.radius`, diagnostics);
    const startAngleDegrees = readNumber(value.startAngleDegrees, `${path}.startAngleDegrees`, diagnostics);
    const endAngleDegrees = readNumber(value.endAngleDegrees, `${path}.endAngleDegrees`, diagnostics);
    const clockwise = readOptionalBoolean(value.clockwise, `${path}.clockwise`, diagnostics);

    if (!center || radius === undefined || startAngleDegrees === undefined || endAngleDegrees === undefined) {
      return undefined;
    }

    const command: ArcPathCommand = {
      kind,
      center,
      radius,
      startAngleDegrees,
      endAngleDegrees,
      clockwise,
    };

    return command;
  }

  if (kind === "closePath") {
    return { kind };
  }

  diagnostics.push(`${path}.kind must be moveTo, lineTo, quadraticCurveTo, cubicCurveTo, arc, or closePath.`);
  return undefined;
}

function readAnchorRef(value: unknown, path: string, diagnostics: string[]): AnchorRef | undefined {
  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const objectId = readString(value.objectId, `${path}.objectId`, diagnostics);
  const anchor = readString(value.anchor, `${path}.anchor`, diagnostics);

  if (!objectId || !anchor) {
    return undefined;
  }

  if (!isAnchorName(anchor)) {
    diagnostics.push(`${path}.anchor is not a valid anchor name.`);
    return undefined;
  }

  return { objectId, anchor };
}

function readPoint(value: unknown, path: string, diagnostics: string[]) {
  if (!isRecord(value)) {
    diagnostics.push(`${path} must be an object.`);
    return undefined;
  }

  const x = readNumber(value.x, `${path}.x`, diagnostics);
  const y = readNumber(value.y, `${path}.y`, diagnostics);

  if (x === undefined || y === undefined) {
    return undefined;
  }

  return { x, y };
}

function readOptionalPoint(value: unknown, path: string, diagnostics: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return readPoint(value, path, diagnostics);
}

function readPointArray(value: unknown, path: string, diagnostics: string[]) {
  if (!Array.isArray(value)) {
    diagnostics.push(`${path} must be an array.`);
    return undefined;
  }

  const points: Array<{ x: number; y: number }> = [];

  for (let index = 0; index < value.length; index += 1) {
    const point = readPoint(value[index], `${path}[${index}]`, diagnostics);

    if (point) {
      points.push(point);
    }
  }

  if (diagnostics.length > 0) {
    return undefined;
  }

  return points;
}

function readString(value: unknown, path: string, diagnostics: string[]) {
  if (typeof value !== "string" || value.length === 0) {
    diagnostics.push(`${path} must be a non-empty string.`);
    return undefined;
  }

  return value;
}

function readOptionalString(value: unknown, path: string, diagnostics: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return readString(value, path, diagnostics);
}

function readStringArray(value: unknown, path: string, diagnostics: string[]) {
  if (!Array.isArray(value)) {
    diagnostics.push(`${path} must be an array.`);
    return undefined;
  }

  const entries: string[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const entry = readString(value[index], `${path}[${index}]`, diagnostics);

    if (entry) {
      entries.push(entry);
    }
  }

  if (diagnostics.length > 0) {
    return undefined;
  }

  return entries;
}

function readNumber(value: unknown, path: string, diagnostics: string[]) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    diagnostics.push(`${path} must be a finite number.`);
    return undefined;
  }

  return value;
}

function readOptionalNumber(value: unknown, path: string, diagnostics: string[]) {
  if (value === undefined) {
    return undefined;
  }

  return readNumber(value, path, diagnostics);
}

function readOptionalNumberArray(
  value: unknown,
  path: string,
  diagnostics: string[],
  options: { minimum?: number } = {},
): readonly number[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    diagnostics.push(`${path} must be an array.`);
    return undefined;
  }

  const entries: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const entry = readNumber(value[index], `${path}[${index}]`, diagnostics);

    if (entry === undefined) {
      continue;
    }

    if (options.minimum !== undefined && entry < options.minimum) {
      diagnostics.push(`${path}[${index}] must be >= ${options.minimum}.`);
      continue;
    }

    entries.push(entry);
  }

  if (diagnostics.length > 0) {
    return undefined;
  }

  return entries;
}

function readOptionalBoolean(value: unknown, path: string, diagnostics: string[]) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    diagnostics.push(`${path} must be a boolean.`);
    return undefined;
  }

  return value;
}

function readOptionalEnum<T extends string>(
  value: unknown,
  path: string,
  diagnostics: string[],
  options: readonly T[],
): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    diagnostics.push(`${path} must be one of: ${options.join(", ")}.`);
    return undefined;
  }

  if (!options.includes(value as T)) {
    diagnostics.push(`${path} must be one of: ${options.join(", ")}.`);
    return undefined;
  }

  return value as T;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnchorName(value: string): value is AnchorName {
  return value === "center"
    || value === "north"
    || value === "south"
    || value === "east"
    || value === "west"
    || value === "northEast"
    || value === "northWest"
    || value === "southEast"
    || value === "southWest"
    || value === "baseline";
}

function fail(message: string): JsonCoreIrV0ConversionResult {
  return { diagnostics: [message] };
}

function failAt(path: string, message: string): { diagnostics: string[] } {
  return { diagnostics: [`${path}: ${message}`] };
}
