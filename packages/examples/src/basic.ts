import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const basicExample: VizxExample = {
  id: "basic",
  title: "Basic Pipeline",
  description: "Three labeled groups with rightOf placement and straight connectors.",
  expectedCapabilities: ["group bbox", "nested group children", "rightOf placement", "straight connector", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      createLabelBox("A", "Raw data", { kind: "absolute", position: point(80, 60) }),
      createLabelBox("B", "Clean", { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 90 }),
      createLabelBox("C", "Model", { kind: "rightOf", reference: { objectId: "B", anchor: "east" }, gap: 90 }),
    ],
    connectors: [
      { kind: "connector", id: "edge-1", from: { objectId: "A", anchor: "east" }, to: { objectId: "B", anchor: "west" } },
      { kind: "connector", id: "edge-2", from: { objectId: "B", anchor: "east" }, to: { objectId: "C", anchor: "west" } },
    ],
  }),
};