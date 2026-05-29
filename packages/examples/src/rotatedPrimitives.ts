import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";

export const rotatedPrimitivesExample: VizxExample = {
  id: "rotated-primitives",
  title: "Rotated primitives",
  description: "Demonstrates ordered translate, rotate, and scale transforms on supported primitive geometry.",
  expectedCapabilities: [
    "ordered transforms",
    "translate transform",
    "rotate transform",
    "scale transform",
    "transformed bbox anchors",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      {
        kind: "line",
        id: "rot.line",
        start: point(0, 0),
        end: point(80, 0),
        transform: [
          { kind: "translate", x: 68, y: 66 },
          { kind: "rotate", angleDegrees: 24, around: point(68, 66) },
        ],
        style: { stroke: "#1d4ed8", strokeWidth: 2 },
      },
      {
        kind: "polyline",
        id: "rot.polyline",
        points: [point(0, 18), point(20, -2), point(48, 12), point(74, -6)],
        transform: [
          { kind: "translate", x: 36, y: 128 },
          { kind: "rotate", angleDegrees: -18, around: point(72, 128) },
        ],
        style: { stroke: "#ea580c", strokeWidth: 2, fill: "none" },
      },
      {
        kind: "polygon",
        id: "rot.polygon",
        points: [point(0, 24), point(24, 0), point(56, 14), point(44, 44), point(8, 40)],
        transform: [
          { kind: "translate", x: 148, y: 96 },
          { kind: "rotate", angleDegrees: 17, around: point(176, 116) },
        ],
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "#ccfbf1" },
      },
      {
        kind: "path",
        id: "rot.path",
        commands: [
          { kind: "moveTo", point: point(0, 16) },
          { kind: "lineTo", point: point(20, -8) },
          { kind: "lineTo", point: point(52, 6) },
          { kind: "lineTo", point: point(68, 34) },
          { kind: "lineTo", point: point(12, 40) },
          { kind: "closePath" },
        ],
        transform: [
          { kind: "translate", x: 236, y: 84 },
          { kind: "rotate", angleDegrees: -22, around: point(270, 104) },
          { kind: "scale", sx: 1.15, sy: 0.8, around: point(270, 104) },
        ],
        style: { stroke: "#7c3aed", strokeWidth: 2, fill: "#f3e8ff" },
      },
      {
        kind: "rect",
        id: "rot.rect",
        center: point(0, 0),
        width: 46,
        height: 24,
        transform: [
          { kind: "translate", x: 102, y: 182 },
          { kind: "rotate", angleDegrees: 30, around: point(102, 182) },
        ],
        style: { stroke: "#111827", fill: "#f9fafb", strokeWidth: 1.5 },
      },
      {
        kind: "circle",
        id: "rot.circle",
        center: point(0, 0),
        radius: 14,
        transform: [
          { kind: "translate", x: 216, y: 172 },
          { kind: "rotate", angleDegrees: 30, around: point(180, 150) },
        ],
        style: { stroke: "#be123c", fill: "#ffe4e6", strokeWidth: 2 },
      },
      {
        kind: "text",
        id: "rot.label",
        center: point(168, 24),
        text: "rotated primitives",
        style: { fill: "#0f172a", fontSize: 12 },
      },
    ],
  }),
};