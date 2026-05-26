import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";

export const anchorsExample: VizxExample = {
  id: "anchors",
  title: "Anchor Reference Box",
  description: "A simple box and label for inspecting resolved center and edge anchors.",
  expectedCapabilities: ["rect bbox", "rect anchors", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "rect",
        id: "anchor-box",
        center: point(0, 0),
        width: 140,
        height: 72,
        rx: 8,
        ry: 8,
        placement: { kind: "absolute", position: point(120, 90) },
      },
      {
        kind: "text",
        id: "anchor-label",
        center: point(0, 0),
        text: "Anchors",
        placement: { kind: "absolute", position: point(120, 90) },
      },
    ],
  }),
};