import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";

export const bezierPathExample: VizxExample = {
  id: "bezier-path",
  title: "Bezier path",
  description: "Demonstrates quadratic and cubic Bezier path commands with bbox-derived anchors and SVG markers.",
  expectedCapabilities: [
    "bezier path",
    "quadratic curve command",
    "cubic curve command",
    "bbox anchors",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      {
        kind: "path",
        id: "bezier.demo",
        commands: [
          { kind: "moveTo", point: point(0, 24) },
          { kind: "quadraticCurveTo", control: point(28, -8), point: point(60, 14) },
          { kind: "cubicCurveTo", control1: point(88, 42), control2: point(124, -4), point: point(156, 22) },
        ],
        placement: { kind: "absolute", position: point(72, 88) },
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "none", markerEnd: "arrow" },
      },
      {
        kind: "text",
        id: "bezier.label",
        center: point(186, 46),
        text: "Bezier path",
        style: { fill: "#0f172a", fontSize: 12 },
      },
    ],
  }),
};
