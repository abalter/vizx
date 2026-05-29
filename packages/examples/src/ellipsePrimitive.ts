import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const ellipsePrimitiveExample: VizxExample = {
  id: "ellipse-primitive",
  title: "Ellipse Primitive",
  description: "A first-class ellipse object rendered alongside a label box.",
  expectedCapabilities: ["ellipse primitive", "bbox anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "ellipse",
        id: "orbital",
        center: point(0, 0),
        rx: 60,
        ry: 30,
        placement: { kind: "absolute", position: point(120, 106) },
      },
      createLabelBox("note", "Ellipse primitive", { kind: "absolute", position: point(184, 64) }),
    ],
  }),
};