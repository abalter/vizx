import type { AnchorName, AnchorRef } from "./anchors";
import type { ConnectorObject, DrawableObject, ObjectAlignment, ObjectPlacement } from "./objects";
import type { ObjectScene } from "./scene";

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

  if (!Array.isArray(connectorsValue)) {
    diagnostics.push("Scene connectors must be an array.");
  }

  const convertedConnectors: ConnectorObject[] = [];

  if (Array.isArray(connectorsValue)) {
    for (let index = 0; index < connectorsValue.length; index += 1) {
      const connectorResult = convertConnector(connectorsValue[index], `connectors[${index}]`);
      diagnostics.push(...connectorResult.diagnostics);

      if (connectorResult.connector) {
        convertedConnectors.push(connectorResult.connector);
      }
    }
  }

  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  const scene: ObjectScene = {
    objects: convertedObjects,
    connectors: convertedConnectors,
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

  if (!kind) {
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

    const placement = convertPlacement(value.placement, `${path}.placement`, diagnostics);
    const align = convertAlignment(value.align, `${path}.align`, diagnostics);

    if (!id) {
      return { diagnostics };
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
        children,
      },
      diagnostics,
    };
  }

  if (kind === "text") {
    const center = readPoint(value.center, `${path}.center`, diagnostics);
    const text = readString(value.text, `${path}.text`, diagnostics);
    const align = convertAlignment(value.align, `${path}.align`, diagnostics);

    if (!id) {
      return { diagnostics };
    }

    if (!center || !text || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "text",
        id,
        center,
        text,
        align,
      },
      diagnostics,
    };
  }

  if (kind === "rect") {
    const fitToText = readFitToText(value.fitToText, `${path}.fitToText`, diagnostics);
    const rx = readOptionalNumber(value.rx, `${path}.rx`, diagnostics);
    const ry = readOptionalNumber(value.ry, `${path}.ry`, diagnostics);
    const align = convertAlignment(value.align, `${path}.align`, diagnostics);

    if (!id) {
      return { diagnostics };
    }

    if (!fitToText || diagnostics.length > 0) {
      return { diagnostics };
    }

    return {
      object: {
        kind: "rect",
        id,
        fitToText,
        rx,
        ry,
        align,
      },
      diagnostics,
    };
  }

  diagnostics.push(`${path}.kind must be one of group, text, or rect.`);
  return { diagnostics };
}

function convertPlacement(value: unknown, path: string, diagnostics: string[]): ObjectPlacement | undefined {
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

  if (!id || !from || !to || diagnostics.length > 0) {
    return { diagnostics };
  }

  return {
    connector: {
      kind: "connector",
      id,
      from,
      to,
    },
    diagnostics,
  };
}

function readFitToText(value: unknown, path: string, diagnostics: string[]) {
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

function readString(value: unknown, path: string, diagnostics: string[]) {
  if (typeof value !== "string" || value.length === 0) {
    diagnostics.push(`${path} must be a non-empty string.`);
    return undefined;
  }

  return value;
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