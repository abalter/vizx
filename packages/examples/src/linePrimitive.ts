import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const linePrimitiveExample: VizxExample = {
  id: "line-primitive",
  title: "Line Primitive",
  description: "A first-class line object rendered alongside a label box.",
  expectedCapabilities: ["line primitive", "bbox anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "line",
        id: "baseline",
        start: point(0, 0),
        end: point(180, 40),
        placement: { kind: "absolute", position: point(80, 110) },
      },
      createLabelBox("note", "Line primitive", { kind: "absolute", position: point(164, 62) }),
    ],
  }),
};