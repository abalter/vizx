import type { Diagnostic } from "@vizx/core";
import type { BoundingBox, Point } from "@vizx/geometry";
import type { AnchorMap, AnchorName, ObjectScene } from "@vizx/object-model";
import { resolveScene, type ResolveSceneResult } from "./resolveScene";

export interface InspectionObject {
  readonly id: string;
  readonly kind: string;
  readonly bbox: BoundingBox;
  readonly anchors: Partial<Record<AnchorName, Point>>;
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

export function inspectScene(scene: ObjectScene): SceneInspection {
  return inspectionFromResolved(resolveScene(scene));
}

export function inspectionFromResolved(result: ResolveSceneResult): SceneInspection {
  return {
    objectCount: result.resolved.objects.length,
    connectorCount: result.resolved.connectors.length,
    objects: result.resolved.objects.map((object) => ({
      id: object.id,
      kind: object.kind,
      bbox: object.bbox,
      anchors: cloneAnchors(object.anchors),
    })),
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

function cloneAnchors(anchors: AnchorMap): Partial<Record<AnchorName, Point>> {
  return Object.fromEntries(
    Object.entries(anchors)
      .filter(([, point]) => point !== undefined)
      .map(([name, point]) => [name, point]),
  ) as Partial<Record<AnchorName, Point>>;
}