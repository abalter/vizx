import { requireVizxExample } from "@vizx/examples";
import type { ObjectScene } from "@vizx/object-model";

export function createBasicDemoScene(): ObjectScene {
  return requireVizxExample("basic").createScene();
}