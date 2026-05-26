import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const relativePlacementExample: VizxExample = {
  id: "relative-placement",
  title: "Relative Placement",
  description: "A central object with neighbors placed rightOf, leftOf, above, and below using anchor-relative gaps.",
  expectedCapabilities: [
    "rightOf placement",
    "leftOf placement",
    "above placement",
    "below placement",
    "straight connector",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      createLabelBox("Center", "Center", { kind: "absolute", position: point(180, 120) }),
      createLabelBox("Right", "Right", { kind: "rightOf", reference: { objectId: "Center", anchor: "east" }, gap: 44 }),
      createLabelBox("Left", "Left", { kind: "leftOf", reference: { objectId: "Center", anchor: "west" }, gap: 44 }),
      createLabelBox("Above", "Above", { kind: "above", reference: { objectId: "Center", anchor: "north" }, gap: 36 }),
      createLabelBox("Below", "Below", { kind: "below", reference: { objectId: "Center", anchor: "south" }, gap: 36 }),
    ],
    connectors: [
      { kind: "connector", id: "center-right", from: { objectId: "Center", anchor: "east" }, to: { objectId: "Right", anchor: "west" } },
      { kind: "connector", id: "center-left", from: { objectId: "Center", anchor: "west" }, to: { objectId: "Left", anchor: "east" } },
      { kind: "connector", id: "center-above", from: { objectId: "Center", anchor: "north" }, to: { objectId: "Above", anchor: "south" } },
      { kind: "connector", id: "center-below", from: { objectId: "Center", anchor: "south" }, to: { objectId: "Below", anchor: "north" } },
    ],
  }),
};