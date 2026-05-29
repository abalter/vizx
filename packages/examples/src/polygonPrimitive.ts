import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const polygonPrimitiveExample: VizxExample = {
  id: "polygon-primitive",
  title: "Polygon Primitive",
  description: "A first-class polygon object rendered alongside a label box.",
  expectedCapabilities: ["polygon primitive", "bbox anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "polygon",
        id: "badge",
        points: [point(0, 26), point(34, 0), point(84, 16), point(90, 58), point(18, 72)],
        placement: { kind: "absolute", position: point(92, 84) },
      },
      createLabelBox("note", "Polygon primitive", { kind: "absolute", position: point(196, 64) }),
    ],
  }),
};