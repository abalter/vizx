import { angleLabelPoint, circleCircleIntersections, labelAlongSegment, point } from "@vizx/geometry";
import { angleMarkPath, circle, circleToCircleLine, line, sceneOf, segmentTickMarks, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original source: examples/aspirational_gallery/metapost/mechanism.mp
  - Reproduction level: Level 1-2
  - Helper families: primitives, intersections, annotation helpers,
    circular arcs / angle marks, style fields
  - Compromises: manual coordinates, no source translation, no solver,
    no mechanics/physics simulation, no full visual fidelity,
    no clipping/gradients, no parser/JSON/AST support
*/
export const aspirationalMechanismLiteExample: VizxExample = {
  id: "aspirational-mechanism-lite",
  title: "Aspirational mechanism lite",
  description:
    "Manual Level 1-2 approximation of the MetaPost mechanism aspirational example using current VizX intersections, labels, angle marks, and style helpers.",
  sourcePath: "examples/aspirational_gallery/metapost/mechanism.mp",
  reproductionLevel: "Level 1-2",
  helperFamilies: [
    "primitives",
    "intersections",
    "annotation helpers",
    "circular arcs / angle marks",
    "style fields",
  ],
  compromises: [
    "manual coordinates",
    "no solver",
    "no mechanics/physics simulation",
    "no source translation",
    "no full visual fidelity",
    "no clipping/gradients",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "builder helpers",
    "technical geometry helpers",
    "intersection helpers",
    "technical annotation helpers",
    "circle primitive",
    "line primitive",
    "text labels",
    "path arc command",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const baseO = point(112, 274);
    const baseA = point(184, 274);
    const baseLength = 72;
    const couplerRadius = 108;
    const frameRadius = 216;
    const angleDegrees = -54;

    const movingP = point(
      baseA.x + baseLength * Math.cos((angleDegrees * Math.PI) / 180),
      baseA.y + baseLength * Math.sin((angleDegrees * Math.PI) / 180),
    );

    const outerIntersections = circleCircleIntersections(baseO, frameRadius, movingP, couplerRadius);
    if (outerIntersections.length !== 2) {
      throw new Error("Expected two intersections between the guide circles in aspirational-mechanism-lite");
    }

    const sortedOuterIntersections = [...outerIntersections].sort((a, b) => a.y - b.y);
    const jointN1 = sortedOuterIntersections[0];
    const jointN2 = sortedOuterIntersections[1];

    if (!jointN1 || !jointN2) {
      throw new Error("Expected sorted outer intersections N1 and N2");
    }

    const linkIntersections = circleCircleIntersections(jointN1, couplerRadius, jointN2, couplerRadius);
    if (linkIntersections.length !== 2) {
      throw new Error("Expected two intersections between the linkage circles in aspirational-mechanism-lite");
    }

    const sortedLinkIntersections = [...linkIntersections].sort((a, b) => a.y - b.y);
    const mechanismJoint = sortedLinkIntersections[0];

    if (!mechanismJoint) {
      throw new Error("Expected a mechanism joint M from the linkage circles");
    }

    const crankLabel = labelAlongSegment(baseA, movingP, 0.5, -18);
    const baseLabel = labelAlongSegment(baseO, baseA, 0.5, -16);
    const upperAngleLabel = angleLabelPoint(baseA, baseO, movingP, 26, { clockwise: false, offset: 10 });
    const mGuideX = mechanismJoint.x;

    return sceneOf([
      line("mek.axis.base", {
        start: point(52, 274),
        end: point(360, 274),
        style: { stroke: "#94a3b8", strokeWidth: 1.2, strokeDasharray: [6, 4], strokeLineCap: "round" },
      }),
      line("mek.axis.m", {
        start: point(mGuideX, 108),
        end: point(mGuideX, 352),
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 4], strokeLineCap: "round" },
      }),
      circle("mek.guide.outer", {
        center: baseO,
        radius: frameRadius,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [7, 5], fill: "none" },
      }),
      circle("mek.guide.coupler", {
        center: movingP,
        radius: couplerRadius,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [7, 5], fill: "none" },
      }),
      circle("mek.guide.n1", {
        center: jointN1,
        radius: couplerRadius,
        style: { stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: [4, 4], fill: "none" },
      }),
      circle("mek.guide.n2", {
        center: jointN2,
        radius: couplerRadius,
        style: { stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: [4, 4], fill: "none" },
      }),
      circleToCircleLine("mek.bar.base", {
        centerA: baseO,
        radiusA: 4.4,
        centerB: baseA,
        radiusB: 4.4,
        style: { stroke: "#d97706", strokeWidth: 3.2, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.crank", {
        centerA: baseA,
        radiusA: 4.4,
        centerB: movingP,
        radiusB: 4.4,
        style: { stroke: "#d97706", strokeWidth: 3.2, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.left.upper", {
        centerA: movingP,
        radiusA: 4.4,
        centerB: jointN1,
        radiusB: 3.6,
        style: { stroke: "#b91c1c", strokeWidth: 2.4, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.left.lower", {
        centerA: movingP,
        radiusA: 4.4,
        centerB: jointN2,
        radiusB: 3.6,
        style: { stroke: "#b91c1c", strokeWidth: 2.4, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.right.upper", {
        centerA: mechanismJoint,
        radiusA: 4.2,
        centerB: jointN1,
        radiusB: 3.6,
        style: { stroke: "#166534", strokeWidth: 2.4, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.right.lower", {
        centerA: mechanismJoint,
        radiusA: 4.2,
        centerB: jointN2,
        radiusB: 3.6,
        style: { stroke: "#166534", strokeWidth: 2.4, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.support.upper", {
        centerA: baseO,
        radiusA: 4.4,
        centerB: jointN1,
        radiusB: 3.6,
        style: { stroke: "#0f766e", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      circleToCircleLine("mek.bar.support.lower", {
        centerA: baseO,
        radiusA: 4.4,
        centerB: jointN2,
        radiusB: 3.6,
        style: { stroke: "#0f766e", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      ...segmentTickMarks("mek.tick.base", {
        a: baseO,
        b: baseA,
        count: 1,
        size: 10,
        style: { stroke: "#334155", strokeWidth: 1.2, strokeLineCap: "round" },
      }),
      ...segmentTickMarks("mek.tick.crank", {
        a: baseA,
        b: movingP,
        count: 1,
        size: 10,
        style: { stroke: "#334155", strokeWidth: 1.2, strokeLineCap: "round" },
      }),
      angleMarkPath("mek.angle.crank", {
        vertex: baseA,
        fromPoint: baseO,
        toPoint: movingP,
        radius: 28,
        clockwise: false,
        style: { stroke: "#b45309", strokeWidth: 1.8, fill: "none", strokeLineCap: "round" },
      }),
      circle("mek.pivot.o", {
        center: baseO,
        radius: 4.4,
        style: { stroke: "#0f172a", fill: "#0f172a" },
      }),
      circle("mek.pivot.a", {
        center: baseA,
        radius: 4.4,
        style: { stroke: "#0f172a", fill: "#0f172a" },
      }),
      circle("mek.pivot.p", {
        center: movingP,
        radius: 4.4,
        style: { stroke: "#b45309", fill: "#b45309" },
      }),
      circle("mek.joint.n1", {
        center: jointN1,
        radius: 3.6,
        style: { stroke: "#b91c1c", fill: "#b91c1c" },
      }),
      circle("mek.joint.n2", {
        center: jointN2,
        radius: 3.6,
        style: { stroke: "#b91c1c", fill: "#b91c1c" },
      }),
      circle("mek.joint.m", {
        center: mechanismJoint,
        radius: 4.2,
        style: { stroke: "#166534", fill: "#166534" },
      }),
      text("mek.label.o", {
        center: point(baseO.x - 14, baseO.y + 14),
        text: "O",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("mek.label.a", {
        center: point(baseA.x + 12, baseA.y + 14),
        text: "A",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("mek.label.p", {
        center: point(movingP.x + 12, movingP.y - 12),
        text: "P",
        style: { fill: "#b45309", fontSize: 11 },
      }),
      text("mek.label.n1", {
        center: point(jointN1.x + 14, jointN1.y - 10),
        text: "N1",
        style: { fill: "#b91c1c", fontSize: 10 },
      }),
      text("mek.label.n2", {
        center: point(jointN2.x + 14, jointN2.y + 16),
        text: "N2",
        style: { fill: "#b91c1c", fontSize: 10 },
      }),
      text("mek.label.m", {
        center: point(mechanismJoint.x + 14, mechanismJoint.y + 12),
        text: "M",
        style: { fill: "#166534", fontSize: 10 },
      }),
      text("mek.label.base", {
        center: baseLabel,
        text: "a",
        style: { fill: "#d97706", fontSize: 10 },
      }),
      text("mek.label.crank", {
        center: crankLabel,
        text: "a",
        style: { fill: "#d97706", fontSize: 10 },
      }),
      text("mek.label.frame", {
        center: point(224, 40),
        text: "Aspirational mechanism lite",
        style: { fill: "#334155", fontSize: 12 },
      }),
      text("mek.label.angle", {
        center: upperAngleLabel,
        text: "rot",
        style: { fill: "#b45309", fontSize: 10 },
      }),
    ]);
  },
};