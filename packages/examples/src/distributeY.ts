import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const distributeYExample: VizxExample = {
  id: "distribute-y",
  title: "Distribute Y",
  description: "Demonstrates even vertical center distribution across ordered objects.",
  expectedCapabilities: [
    "distributeY",
    "rect anchors",
    "group bbox",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      createLabelBox("Top", "Top", { kind: "absolute", position: point(200, 90) }),
      createLabelBox("Middle", "Middle", { kind: "rightOf", reference: { objectId: "Top", anchor: "east" }, gap: 74 }),
      createLabelBox("Bottom", "Bottom", { kind: "absolute", position: point(280, 360) }),
    ],
    connectors: [
      { kind: "connector", id: "top-middle", from: { objectId: "Top", anchor: "center" }, to: { objectId: "Middle", anchor: "center" } },
      { kind: "connector", id: "middle-bottom", from: { objectId: "Middle", anchor: "center" }, to: { objectId: "Bottom", anchor: "center" } },
    ],
    distribution: [{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }],
  }),
};
