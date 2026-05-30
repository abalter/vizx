import {
  circleCircleIntersections,
  distance,
  midpoint,
  point,
  rayCircleIntersections,
} from "@vizx/geometry";
import { circle, line, polygon, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/metapost/pendagon.mp
  - Target level: Level 1 to Level 2
  - Compromises: manual coordinates and simplified styling; explicit helper-called construction points only,
    including clipped ray-circle construction for L/T on OU;
    no source translation; no construction solver; no automatic label placement; no full visual fidelity
*/
export const aspirationalPendagonLiteExample: VizxExample = {
  id: "aspirational-pendagon-lite",
  title: "Aspirational pendagon lite",
  description:
    "Manual Level 1-2 approximation of MetaPost pendagon using current VizX intersection helpers and primitive geometry.",
  expectedCapabilities: [
    "builder helpers",
    "technical geometry helpers",
    "circle primitive",
    "line primitive",
    "polygon primitive",
    "text labels",
    "strokeDasharray",
    "strokeLineCap",
    "strokeLineJoin",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const r = 72;
    const centerO = point(188, 162);
    const pointA = point(188, centerO.y - r);
    const pointU = point(centerO.x + r, centerO.y);

    const smallRadius = (2 * r) / 3;
    const helperCircleCenter = midpoint(pointU, centerO);
    const helperCircleRadius = distance(helperCircleCenter, pointA);

    const pIntersections = circleCircleIntersections(centerO, smallRadius, pointU, smallRadius);
    if (pIntersections.length !== 2) {
      throw new Error("Expected two intersections between helper circles C1 and C2");
    }

    const sortedP = [...pIntersections].sort((a, b) => a.y - b.y);
    const pointP1 = sortedP[0];
    const pointP2 = sortedP[1];

    if (!pointP1 || !pointP2) {
      throw new Error("Expected sorted helper intersections P1 and P2");
    }

    const rightRayIntersections = rayCircleIntersections(
      centerO,
      pointU,
      helperCircleCenter,
      helperCircleRadius,
    );

    const leftRayIntersections = rayCircleIntersections(
      pointU,
      centerO,
      helperCircleCenter,
      helperCircleRadius,
    );

    if (rightRayIntersections.length !== 1 || leftRayIntersections.length !== 1) {
      throw new Error("Expected one clipped intersection for each opposing ray on OU and circle C_KA");
    }

    const pointL = leftRayIntersections[0];
    const pointT = rightRayIntersections[0];

    if (!pointL || !pointT) {
      throw new Error("Expected sorted line-circle intersections L and T");
    }

    const circleALRadius = distance(pointA, pointL);
    const circleATRadius = distance(pointA, pointT);

    const intersectionsAL = circleCircleIntersections(centerO, r, pointA, circleALRadius);
    const intersectionsAT = circleCircleIntersections(centerO, r, pointA, circleATRadius);

    if (intersectionsAL.length !== 2 || intersectionsAT.length !== 2) {
      throw new Error("Expected two circle-circle intersections for pentagon vertices");
    }

    const sortedAL = [...intersectionsAL].sort((a, b) => a.y - b.y);
    const sortedAT = [...intersectionsAT].sort((a, b) => a.y - b.y);

    const pointB = sortedAL[0];
    const pointE = sortedAL[1];
    const pointC = sortedAT[0];
    const pointD = sortedAT[1];

    if (!pointB || !pointC || !pointD || !pointE) {
      throw new Error("Expected pentagon vertices B, C, D, and E");
    }

    return sceneOf([
      circle("pend.main.circle", {
        center: centerO,
        radius: r,
        style: { stroke: "#ef4444", strokeWidth: 1.8, fill: "none" },
      }),
      circle("pend.helper.c1", {
        center: centerO,
        radius: smallRadius,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, fill: "none", strokeDasharray: [4, 3] },
      }),
      circle("pend.helper.c2", {
        center: pointU,
        radius: smallRadius,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, fill: "none", strokeDasharray: [4, 3] },
      }),
      circle("pend.helper.cka", {
        center: helperCircleCenter,
        radius: helperCircleRadius,
        style: { stroke: "#a78bfa", strokeWidth: 1.1, fill: "none", strokeDasharray: [6, 4] },
      }),
      circle("pend.helper.cal", {
        center: pointA,
        radius: circleALRadius,
        style: { stroke: "#38bdf8", strokeWidth: 1.1, fill: "none" },
      }),
      circle("pend.helper.cat", {
        center: pointA,
        radius: circleATRadius,
        style: { stroke: "#38bdf8", strokeWidth: 1.1, fill: "none" },
      }),
      line("pend.guide.ou", {
        start: centerO,
        end: pointU,
        style: { stroke: "#475569", strokeWidth: 1.1, strokeDasharray: [5, 4], strokeLineCap: "round" },
      }),
      line("pend.guide.oa", {
        start: centerO,
        end: pointA,
        style: { stroke: "#475569", strokeWidth: 1.1, strokeDasharray: [5, 4], strokeLineCap: "round" },
      }),
      line("pend.guide.ap", {
        start: pointA,
        end: pointT,
        style: { stroke: "#64748b", strokeWidth: 1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("pend.guide.p1p2", {
        start: pointP1,
        end: pointP2,
        style: { stroke: "#64748b", strokeWidth: 1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      polygon("pend.pentagon", {
        points: [pointA, pointB, pointC, pointD, pointE],
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "none", strokeLineJoin: "round" },
      }),
      circle("pend.point.o", { center: centerO, radius: 2.5, style: { stroke: "#0f172a", fill: "#0f172a" } }),
      circle("pend.point.a", { center: pointA, radius: 2.5, style: { stroke: "#0f172a", fill: "#0f172a" } }),
      circle("pend.point.u", { center: pointU, radius: 2.5, style: { stroke: "#0f172a", fill: "#0f172a" } }),
      circle("pend.point.p1", { center: pointP1, radius: 2.4, style: { stroke: "#2563eb", fill: "#2563eb" } }),
      circle("pend.point.p2", { center: pointP2, radius: 2.4, style: { stroke: "#2563eb", fill: "#2563eb" } }),
      circle("pend.point.l", { center: pointL, radius: 2.4, style: { stroke: "#7c3aed", fill: "#7c3aed" } }),
      circle("pend.point.t", { center: pointT, radius: 2.4, style: { stroke: "#7c3aed", fill: "#7c3aed" } }),
      text("pend.label.o", { center: point(centerO.x - 12, centerO.y + 14), text: "O", style: { fill: "#0f172a", fontSize: 11 } }),
      text("pend.label.a", { center: point(pointA.x - 12, pointA.y - 10), text: "A", style: { fill: "#0f172a", fontSize: 11 } }),
      text("pend.label.u", { center: point(pointU.x + 12, pointU.y + 12), text: "U", style: { fill: "#0f172a", fontSize: 11 } }),
      text("pend.label.p1", { center: point(pointP1.x - 14, pointP1.y - 10), text: "P1", style: { fill: "#2563eb", fontSize: 10 } }),
      text("pend.label.p2", { center: point(pointP2.x - 14, pointP2.y + 12), text: "P2", style: { fill: "#2563eb", fontSize: 10 } }),
      text("pend.label.l", { center: point(pointL.x - 10, pointL.y + 12), text: "L", style: { fill: "#7c3aed", fontSize: 10 } }),
      text("pend.label.t", { center: point(pointT.x + 10, pointT.y + 12), text: "T", style: { fill: "#7c3aed", fontSize: 10 } }),
      text("pend.caption", {
        center: point(206, 34),
        text: "Pendagon lite (manual intersection construction)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ]);
  },
};
