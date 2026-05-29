import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const pathPrimitiveExample: VizxExample = {
  id: "path-primitive",
  title: "Path primitive",
  description: "A first-class straight-segment path object rendered alongside a label box.",
  expectedCapabilities: ["path primitive", "bbox anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "path",
        id: "contour",
        commands: [
          { kind: "moveTo", point: point(0, 30) },
          { kind: "lineTo", point: point(34, 0) },
          { kind: "lineTo", point: point(84, 18) },
          { kind: "lineTo", point: point(90, 58) },
          { kind: "lineTo", point: point(18, 72) },
          { kind: "closePath" },
        ],
        placement: { kind: "absolute", position: point(92, 84) },
      },
      createLabelBox("note", "Path primitive", { kind: "absolute", position: point(196, 64) }),
    ],
  }),
};
