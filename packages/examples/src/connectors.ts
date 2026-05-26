import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const connectorsExample: VizxExample = {
  id: "connectors",
  title: "Connector Fan Out",
  description: "Three anchored groups connected by two straight connectors.",
  expectedCapabilities: ["group bbox", "straight connector", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      createLabelBox("Source", "Source", { kind: "absolute", position: point(90, 90) }),
      createLabelBox("Upper", "Upper", { kind: "absolute", position: point(260, 48) }),
      createLabelBox("Lower", "Lower", { kind: "absolute", position: point(260, 132) }),
    ],
    connectors: [
      { kind: "connector", id: "edge-upper", from: { objectId: "Source", anchor: "east" }, to: { objectId: "Upper", anchor: "west" } },
      { kind: "connector", id: "edge-lower", from: { objectId: "Source", anchor: "east" }, to: { objectId: "Lower", anchor: "west" } },
    ],
  }),
};