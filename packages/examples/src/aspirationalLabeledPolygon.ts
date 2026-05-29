import { midpoint, offsetPoint, point, regularPolygonPoints } from "@vizx/geometry";
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
    "technical geometry helpers",
    "polygon primitive",
    "line primitive",
    "text labels",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const polygonPoints = regularPolygonPoints(point(188, 152), 84, 5, -96);
    const [a, b, c, d, e] = polygonPoints;

    if (!a || !b || !c || !d || !e) {
      throw new Error("Expected a 5-point regular polygon");
    }

    return sceneOf([
      polygon("poly.main", {
        points: polygonPoints,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      line("poly.diagonal.ac", {
        start: a,
        end: c,
        style: { stroke: "#94a3b8", strokeWidth: 1.4 },
      }),
      line("poly.diagonal.ce", {
        start: c,
        end: e,
        style: { stroke: "#94a3b8", strokeWidth: 1.4 },
      }),
      text("vertex.A", {
        center: offsetPoint(a, -22, 8),
        text: "A",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.B", {
        center: offsetPoint(b, -12, -14),
        text: "B",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.C", {
        center: offsetPoint(c, 16, -10),
        text: "C",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.D", {
        center: offsetPoint(d, 18, 8),
        text: "D",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("vertex.E", {
        center: offsetPoint(e, -2, 20),
        text: "E",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("beta.0", {
        center: offsetPoint(midpoint(a, c), -10, -4),
        text: "beta0",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("beta.1", {
        center: offsetPoint(midpoint(b, d), -6, -2),
        text: "beta1",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("beta.2", {
        center: offsetPoint(midpoint(c, e), -2, -8),
        text: "beta2",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("caption", {
        center: { x: 188, y: 24 },
        text: "Labeled polygon (approximation)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ]);
  },
};
