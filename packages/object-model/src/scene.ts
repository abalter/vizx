import type { DrawableObject, ConnectorObject } from "./objects";

export interface DistributeXOperation {
  readonly relation: "distributeX";
  readonly objectIds: readonly string[];
}

export interface DistributeYOperation {
  readonly relation: "distributeY";
  readonly objectIds: readonly string[];
}

export type SceneDistribution = DistributeXOperation | DistributeYOperation;

export interface ObjectScene {
  readonly objects: readonly DrawableObject[];
  readonly connectors?: readonly ConnectorObject[];
  readonly distribution?: readonly SceneDistribution[];
}