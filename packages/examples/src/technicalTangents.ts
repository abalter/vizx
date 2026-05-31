import {
  addPointVector,
  point,
  tangentLineAtCirclePoint,
  tangentPointsFromPointToCircle,
} from "@vizx/geometry";
import {
  circle,
  line,
  sceneOf,
  text,
  trimmedLine,
  type CircleObject,
  type LineObject,
  type TextObject,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalTangentsExample: VizxExample = {
  id: "technical-tangents",
  title: "Technical tangents",
  description: "A focused tangent-construction example using the v0 circle tangent helpers.",
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: ["primitives", "tangents", "annotation helpers", "style fields"],
  compromises: [
    "no source translation",
    "no solver",
    "no mechanics/physics simulation",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "technical geometry helpers",
    "circle primitive",
    "line primitive",
    "text labels",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const center = point(176, 132);
    const radius = 62;
    const externalPoint = point(316, 96);
    const tangentPoints = tangentPointsFromPointToCircle(externalPoint, center, radius);

    if (tangentPoints.length !== 2) {
      throw new Error("Expected exactly two tangent points for external point construction");
    }

    const [tangentA, tangentB] = tangentPoints;

    if (!tangentA || !tangentB) {
      throw new Error("Expected tangent points to be defined");
    }

    const tangentLineA = tangentLineAtCirclePoint(center, tangentA);
    const tangentDirectionScale = 54;

    const objects: (CircleObject | LineObject | TextObject)[] = [
      circle("tg.circle", {
        center,
        radius,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      circle("tg.center.point", {
        center,
        radius: 2.5,
        style: { stroke: "#0f172a", fill: "#0f172a" },
      }),
      circle("tg.external.point", {
        center: externalPoint,
        radius: 3,
        style: { stroke: "#b91c1c", fill: "#b91c1c" },
      }),
      trimmedLine("tg.segment.0", {
        a: externalPoint,
        b: tangentA,
        startDistance: 3,
        endDistance: 2.5,
        style: { stroke: "#0f766e", strokeWidth: 2 },
      }),
      trimmedLine("tg.segment.1", {
        a: externalPoint,
        b: tangentB,
        startDistance: 3,
        endDistance: 2.5,
        style: { stroke: "#0f766e", strokeWidth: 2 },
      }),
      trimmedLine("tg.radius.0", {
        a: center,
        b: tangentA,
        startDistance: 2.5,
        endDistance: 2.5,
        style: { stroke: "#64748b", strokeWidth: 1.4, strokeDasharray: [5, 4] },
      }),
      trimmedLine("tg.radius.1", {
        a: center,
        b: tangentB,
        startDistance: 2.5,
        endDistance: 2.5,
        style: { stroke: "#64748b", strokeWidth: 1.4, strokeDasharray: [5, 4] },
      }),
      line("tg.tangent.line.atA", {
        start: addPointVector(
          tangentLineA.point,
          { dx: -tangentLineA.direction.dx * tangentDirectionScale, dy: -tangentLineA.direction.dy * tangentDirectionScale },
        ),
        end: addPointVector(
          tangentLineA.point,
          { dx: tangentLineA.direction.dx * tangentDirectionScale, dy: tangentLineA.direction.dy * tangentDirectionScale },
        ),
        style: { stroke: "#1d4ed8", strokeWidth: 1.6, strokeDasharray: [4, 4] },
      }),
      circle("tg.tangent.point.0", {
        center: tangentA,
        radius: 2.5,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("tg.tangent.point.1", {
        center: tangentB,
        radius: 2.5,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      text("tg.label.center", {
        center: point(center.x - 14, center.y + 14),
        text: "O",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      text("tg.label.external", {
        center: point(externalPoint.x + 14, externalPoint.y - 10),
        text: "P",
        style: { fill: "#b91c1c", fontSize: 12 },
      }),
      text("tg.label.t0", {
        center: point(tangentA.x - 14, tangentA.y - 10),
        text: "T1",
        style: { fill: "#0f766e", fontSize: 12 },
      }),
      text("tg.label.t1", {
        center: point(tangentB.x - 14, tangentB.y + 12),
        text: "T2",
        style: { fill: "#0f766e", fontSize: 12 },
      }),
      text("tg.caption", {
        center: point(196, 34),
        text: "Technical tangents (v0 helper slice)",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ];

    return sceneOf(objects);
  },
};
