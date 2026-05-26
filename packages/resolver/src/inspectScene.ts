import type { Diagnostic } from "@vizx/core";
import type { BoundingBox, Point } from "@vizx/geometry";
import type { AnchorMap, AnchorName, ObjectScene } from "@vizx/object-model";
import { resolveScene, type ResolveSceneResult, type ResolvedObject } from "./resolveScene";

export interface InspectionObject {
  readonly id: string;
  readonly kind: string;
  readonly bbox: BoundingBox;
  readonly anchors: Partial<Record<AnchorName, Point>>;
  readonly children?: readonly InspectionObject[];
  readonly style?: Record<string, string | number>;
  readonly text?: string;
  readonly geometry?: Record<string, string | number>;
}

export interface InspectSceneOptions {
  readonly includeChildren?: boolean;
}

export interface InspectionConnectorEndpoint {
  readonly objectId: string;
  readonly anchor: AnchorName;
  readonly point: Point;
}

export interface InspectionConnector {
  readonly id: string;
  readonly from: InspectionConnectorEndpoint;
  readonly to: InspectionConnectorEndpoint;
}

export interface SceneInspection {
  readonly objectCount: number;
  readonly connectorCount: number;
  readonly objects: readonly InspectionObject[];
  readonly connectors: readonly InspectionConnector[];
  readonly diagnostics: readonly Diagnostic[];
}

export function inspectScene(scene: ObjectScene, options: InspectSceneOptions = {}): SceneInspection {
  return inspectionFromResolved(resolveScene(scene), options);
}

export function inspectionFromResolved(result: ResolveSceneResult, options: InspectSceneOptions = {}): SceneInspection {
  return {
    objectCount: result.resolved.objects.length,
    connectorCount: result.resolved.connectors.length,
    objects: result.resolved.objects.map((object) => inspectResolvedObject(object, options)),
    connectors: result.resolved.connectors.map((connector) => ({
      id: connector.id,
      from: {
        objectId: connector.from.objectId,
        anchor: connector.from.anchor,
        point: connector.start,
      },
      to: {
        objectId: connector.to.objectId,
        anchor: connector.to.anchor,
        point: connector.end,
      },
    })),
    diagnostics: result.diagnostics,
  };
}

function inspectResolvedObject(object: ResolvedObject, options: InspectSceneOptions): InspectionObject {
  return {
    id: object.id,
    kind: object.kind,
    bbox: object.bbox,
    anchors: cloneAnchors(object.anchors),
    children: options.includeChildren === false ? undefined : object.children?.map((child) => inspectResolvedObject(child, options)),
    style: cloneSummary(object.style),
    text: object.text,
    geometry: cloneSummary(object.geometry),
  };
}

function cloneAnchors(anchors: AnchorMap): Partial<Record<AnchorName, Point>> {
  return Object.fromEntries(
    Object.entries(anchors)
      .filter(([, point]) => point !== undefined)
      .map(([name, point]) => [name, point]),
  ) as Partial<Record<AnchorName, Point>>;
}

function cloneSummary<T extends object>(value: T | undefined): Record<string, string | number> | undefined {
  if (!value) {
    return undefined;
  }

  const entries = Object.entries(value)
    .filter(([, entry]) => typeof entry === "string" || typeof entry === "number") as [string, string | number][];

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}