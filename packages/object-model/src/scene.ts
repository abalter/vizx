import type { DrawableObject, ConnectorObject } from "./objects";

export interface ObjectScene {
  readonly objects: readonly DrawableObject[];
  readonly connectors?: readonly ConnectorObject[];
}