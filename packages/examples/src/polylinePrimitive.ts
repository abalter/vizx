import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const polylinePrimitiveExample: VizxExample = {
  id: "polyline-primitive",
  title: "Polyline Primitive",
  description: "A first-class polyline object rendered alongside a label box.",
  expectedCapabilities: ["polyline primitive", "bbox anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "polyline",
        id: "route",
        points: [point(0, 40), point(40, 0), point(95, 20), point(150, -10)],
        placement: { kind: "absolute", position: point(70, 110) },
      },
      createLabelBox("note", "Polyline primitive", { kind: "absolute", position: point(166, 62) }),
    ],
  }),
};