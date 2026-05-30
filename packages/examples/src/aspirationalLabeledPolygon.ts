import { angleLabelPoint, offsetPoint, point, regularPolygonPoints } from "@vizx/geometry";
import { angleMarkPath, line, polygon, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/asymptote/labeled_polygon
  - Target level: Level 1 to Level 2
  - Compromises: some label placement and styling remain simplified relative to the original
  - Missing features: no full annotation subsystem, and no multi-style or right-angle mark helpers
*/
export const aspirationalLabeledPolygonExample: VizxExample = {
  id: "aspirational-labeled-polygon",
  title: "Aspirational: Labeled polygon",
  description:
    "Manual builder-authored approximation of an Asymptote labeled polygon with vertex labels, real circular angle marks, and technical style distinctions.",
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
    const angleMarkRadius = 22;
    const angleLabelOffset = 10;

    if (!a || !b || !c || !d || !e) {
      throw new Error("Expected a 5-point regular polygon");
    }

    const angleMarks = [
      {
        id: "beta.arc.0",
        vertex: a,
        fromPoint: e,
        toPoint: b,
        labelId: "beta.0",
        labelCenter: angleLabelPoint(a, e, b, angleMarkRadius, { clockwise: true, offset: angleLabelOffset }),
        labelText: "beta0",
      },
      {
        id: "beta.arc.1",
        vertex: c,
        fromPoint: b,
        toPoint: d,
        labelId: "beta.1",
        labelCenter: angleLabelPoint(c, b, d, angleMarkRadius, { clockwise: true, offset: angleLabelOffset }),
        labelText: "beta1",
      },
      {
        id: "beta.arc.2",
        vertex: e,
        fromPoint: d,
        toPoint: a,
        labelId: "beta.2",
        labelCenter: angleLabelPoint(e, d, a, angleMarkRadius, { clockwise: true, offset: angleLabelOffset }),
        labelText: "beta2",
      },
    ] as const;

    return sceneOf([
      polygon("poly.main", {
        points: polygonPoints,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none", strokeLineJoin: "round" },
      }),
      line("poly.diagonal.ac", {
        start: a,
        end: c,
        style: { stroke: "#94a3b8", strokeWidth: 1.4, strokeDasharray: [6, 4], strokeLineCap: "round" },
      }),
      line("poly.diagonal.ce", {
        start: c,
        end: e,
        style: { stroke: "#94a3b8", strokeWidth: 1.4, strokeDasharray: [6, 4], strokeLineCap: "round" },
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
      ...angleMarks.flatMap((mark) => [
        angleMarkPath(mark.id, {
          vertex: mark.vertex,
          fromPoint: mark.fromPoint,
          toPoint: mark.toPoint,
          radius: angleMarkRadius,
          clockwise: true,
          style: { stroke: "#0f766e", strokeWidth: 2, fill: "none", strokeLineCap: "round" },
        }),
        text(mark.labelId, {
          center: mark.labelCenter,
          text: mark.labelText,
          style: { fill: "#0f766e", fontSize: 11 },
        }),
      ]),
      text("caption", {
        center: { x: 188, y: 24 },
        text: "Labeled polygon (approximation)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ]);
  },
};
