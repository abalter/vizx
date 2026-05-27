import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const distributeXExample: VizxExample = {
  id: "distribute-x",
  title: "Distribute X",
  description: "Demonstrates even horizontal center distribution across ordered objects.",
  expectedCapabilities: [
    "distributeX",
    "rect anchors",
    "group bbox",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      createLabelBox("A", "First", { kind: "absolute", position: point(120, 150) }),
      createLabelBox("B", "Middle", { kind: "below", reference: { objectId: "A", anchor: "south" }, gap: 52 }),
      createLabelBox("C", "Last", { kind: "absolute", position: point(420, 190) }),
    ],
    connectors: [
      { kind: "connector", id: "a-b", from: { objectId: "A", anchor: "center" }, to: { objectId: "B", anchor: "center" } },
      { kind: "connector", id: "b-c", from: { objectId: "B", anchor: "center" }, to: { objectId: "C", anchor: "center" } },
    ],
    distribution: [{ relation: "distributeX", objectIds: ["A", "B", "C"] }],
  }),
};
