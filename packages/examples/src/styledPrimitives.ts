import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";

export const styledPrimitivesExample: VizxExample = {
  id: "styled-primitives",
  title: "Styled primitives",
  description: "Demonstrates minimal stroke, fill, strokeWidth, and opacity styling on primitive objects.",
  expectedCapabilities: ["primitive style", "stroke/fill", "strokeWidth", "opacity", "inspect output"],
  createScene: () => ({
    objects: [
      {
        kind: "line",
        id: "styled.line",
        start: point(0, 0),
        end: point(86, 0),
        placement: { kind: "absolute", position: point(44, 56) },
        style: { stroke: "#ef4444", strokeWidth: 2 },
      },
      {
        kind: "polyline",
        id: "styled.polyline",
        points: [point(0, 12), point(24, -8), point(48, 12), point(72, -4)],
        placement: { kind: "absolute", position: point(44, 98) },
        style: { stroke: "#f97316", strokeWidth: 2, fill: "none" },
      },
      {
        kind: "ellipse",
        id: "styled.ellipse",
        center: point(0, 0),
        rx: 26,
        ry: 14,
        placement: { kind: "absolute", position: point(168, 58) },
        style: { stroke: "#0ea5e9", strokeWidth: 2, fill: "none", opacity: 0.8 },
      },
      {
        kind: "polygon",
        id: "styled.polygon",
        points: [point(0, 26), point(26, 0), point(56, 20), point(42, 52), point(8, 48)],
        placement: { kind: "absolute", position: point(148, 102) },
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "#ecfeff" },
      },
      {
        kind: "circle",
        id: "styled.circle",
        center: point(0, 0),
        radius: 12,
        placement: { kind: "absolute", position: point(238, 92) },
        style: { stroke: "#7c3aed", strokeWidth: 2, fill: "#f3e8ff" },
      },
      {
        kind: "text",
        id: "styled.label",
        center: point(164, 20),
        text: "Styled primitives",
        style: { fill: "#0f172a", fontSize: 12 },
      },
    ],
  }),
};