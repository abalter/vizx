import type { ObjectScene } from "@vizx/object-model";

export interface VizxExample {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly expectedCapabilities: readonly string[];
  readonly createScene: () => ObjectScene;
}