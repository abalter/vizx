import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const arrowheadsExample: VizxExample = {
  id: "arrowheads",
  title: "Arrowheads",
  description: "Demonstrates the built-in arrow marker on line, polyline, path, and connector output.",
  expectedCapabilities: ["built-in arrow marker", "line marker", "polyline marker", "path marker", "connector arrow", "inspect output", "debug overlay"],
  createScene: () => ({
    objects: [
      {
        kind: "line",
        id: "arrow.line",
        start: point(0, 0),
        end: point(88, 0),
        placement: { kind: "absolute", position: point(52, 50) },
        style: { markerEnd: "arrow" },
      },
      {
        kind: "polyline",
        id: "arrow.polyline",
        points: [point(0, 18), point(24, -4), point(54, 14), point(86, -2)],
        placement: { kind: "absolute", position: point(44, 98) },
        style: { markerEnd: "arrow" },
      },
      {
        kind: "path",
        id: "arrow.path",
        commands: [
          { kind: "moveTo", point: point(0, 20) },
          { kind: "lineTo", point: point(34, 0) },
          { kind: "lineTo", point: point(76, 18) },
        ],
        placement: { kind: "absolute", position: point(166, 84) },
        style: { markerEnd: "arrow" },
      },
      createLabelBox("Source", "Source", { kind: "absolute", position: point(88, 160) }),
      createLabelBox("Target", "Target", { kind: "absolute", position: point(248, 160) }),
    ],
    connectors: [
      {
        kind: "connector",
        id: "arrow.connector",
        from: { objectId: "Source", anchor: "east" },
        to: { objectId: "Target", anchor: "west" },
      },
    ],
  }),
};