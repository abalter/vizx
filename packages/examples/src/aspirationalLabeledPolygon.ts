import { line, polygon, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/asymptote/labeled_polygon
  - Target level: Level 1 to Level 2
  - Compromises: edge-angle arc annotations are approximated with plain text labels
  - Missing features: no arc primitives for exact angle marks
*/
export const aspirationalLabeledPolygonExample: VizxExample = {
  id: "aspirational-labeled-polygon",
  title: "Aspirational: Labeled polygon",
  description:
    "Manual builder-authored approximation of an Asymptote labeled polygon with vertex labels and simple interior guide segments.",
  expectedCapabilities: [
    "builder helpers",
    "polygon primitive",
    "line primitive",
    "text labels",
    "inspect output",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf([
      polygon("poly.main", {
        points: [
          { x: 74, y: 148 },
          { x: 142, y: 70 },
          { x: 236, y: 80 },
          { x: 298, y: 158 },
          { x: 188, y: 232 },
        ],
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      line("poly.diagonal.ac", {
        start: { x: 74, y: 148 },
        end: { x: 236, y: 80 },
        style: { stroke: "#94a3b8", strokeWidth: 1.4 },
      }),
      line("poly.diagonal.ce", {
        start: { x: 236, y: 80 },
        end: { x: 188, y: 232 },
        style: { stroke: "#94a3b8", strokeWidth: 1.4 },
      }),
      text("vertex.A", {
        center: { x: 54, y: 154 },
        text: "A",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.B", {
        center: { x: 138, y: 52 },
        text: "B",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.C", {
        center: { x: 250, y: 66 },
        text: "C",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.D", {
        center: { x: 318, y: 162 },
        text: "D",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.E", {
        center: { x: 188, y: 252 },
        text: "E",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("beta.0", {
        center: { x: 114, y: 116 },
        text: "beta0",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("beta.1", {
        center: { x: 188, y: 98 },
        text: "beta1",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("beta.2", {
        center: { x: 242, y: 148 },
        text: "beta2",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("caption", {
        center: { x: 188, y: 24 },
        text: "Labeled polygon (approximation)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ]),
};
