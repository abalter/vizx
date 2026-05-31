import { angleLabelPoint, circleCircleTangents, labelAlongSegment, point, tangentPointsFromPointToCircle } from "@vizx/geometry";
import {
  angleMarkPath,
  arrowEnd,
  circle,
  circleToCircleLine,
  line,
  openBeltPath,
  rect,
  sceneOf,
  segmentTickMarks,
  text,
  trimmedLine,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original source: examples/aspirational_gallery/metapost/pullys.mp
  - Reproduction level: Level 1-2
  - Helper families: primitives, tangents, common tangents, annotation helpers,
    circular arcs / angle marks, belt/pulley path, style fields
  - Compromises: manual coordinates, no source translation, no solver,
    no mechanics/physics simulation, no full visual fidelity, no clipping/gradients,
    no parser/JSON/AST support
*/
export const aspirationalPullysLiteExample: VizxExample = {
  id: "aspirational-pullys-lite",
  title: "Aspirational pullys lite",
  description:
    "Manual Level 1-2 approximation of MetaPost pullys using the current belt, tangent, annotation, and style helper stack.",
  sourcePath: "examples/aspirational_gallery/metapost/pullys.mp",
  reproductionLevel: "Level 1-2",
  helperFamilies: [
    "primitives",
    "tangents",
    "common tangents",
    "annotation helpers",
    "circular arcs / angle marks",
    "belt/pulley path",
    "style fields",
  ],
  compromises: [
    "manual coordinates",
    "no source translation",
    "no solver",
    "no mechanics/physics simulation",
    "no full visual fidelity",
    "no clipping/gradients",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "builder helpers",
    "technical geometry helpers",
    "common tangent helpers",
    "technical annotation helpers",
    "circle primitive",
    "rect primitive",
    "line primitive",
    "path arc command",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const leftCenter = point(148, 86);
    const rightCenter = point(332, 86);
    const pulleyRadius = 28;
    const hookPoint = point(240, 208);
    const verticalReferenceTop = point(hookPoint.x, hookPoint.y - 72);
    const leftMassTop = point(leftCenter.x, 236);
    const rightMassTop = point(rightCenter.x, 230);
    const centerMassTop = point(hookPoint.x, 238);

    const externalTangents = [...circleCircleTangents(leftCenter, pulleyRadius, rightCenter, pulleyRadius)
      .filter((entry) => entry.kind === "external")]
      .sort((a, b) => a.pointA.y - b.pointA.y);

    if (externalTangents.length < 2) {
      throw new Error("Expected two external tangents for aspirational-pullys-lite");
    }

    const upperBelt = externalTangents[0];
    const lowerBelt = externalTangents[1];

    if (!upperBelt || !lowerBelt) {
      throw new Error("Expected sorted external tangents for aspirational-pullys-lite");
    }

    const leftBranchCandidates = tangentPointsFromPointToCircle(hookPoint, leftCenter, pulleyRadius);
    const rightBranchCandidates = tangentPointsFromPointToCircle(hookPoint, rightCenter, pulleyRadius);

    const leftBranchPoint = [...leftBranchCandidates]
      .sort((a, b) => (b.x - a.x) || (b.y - a.y))[0];
    const rightBranchPoint = [...rightBranchCandidates]
      .sort((a, b) => (a.x - b.x) || (b.y - a.y))[0];

    if (!leftBranchPoint || !rightBranchPoint) {
      throw new Error("Expected tangent branches from the hook point to both pulleys");
    }

    const upperLabelPoint = labelAlongSegment(upperBelt.pointA, upperBelt.pointB, 0.5, -16);
    const leftAngleLabel = angleLabelPoint(hookPoint, verticalReferenceTop, leftBranchPoint, 24, {
      clockwise: true,
      offset: 10,
    });
    const rightAngleLabel = angleLabelPoint(hookPoint, verticalReferenceTop, rightBranchPoint, 36, {
      clockwise: false,
      offset: 10,
    });

    return sceneOf([
      circle("apl.pulley.left", {
        center: leftCenter,
        radius: pulleyRadius,
        style: { stroke: "#0f172a", strokeWidth: 2.1, fill: "none" },
      }),
      circle("apl.pulley.right", {
        center: rightCenter,
        radius: pulleyRadius,
        style: { stroke: "#0f172a", strokeWidth: 2.1, fill: "none" },
      }),
      openBeltPath("apl.belt.main", {
        centerA: leftCenter,
        radiusA: pulleyRadius,
        centerB: rightCenter,
        radiusB: pulleyRadius,
        style: {
          stroke: "#0f766e",
          strokeWidth: 2.5,
          fill: "none",
          strokeLineCap: "round",
          strokeLineJoin: "round",
        },
      }),
      line("apl.belt.direction", {
        start: point(198, upperBelt.pointA.y),
        end: point(278, upperBelt.pointB.y),
        style: arrowEnd({ stroke: "#0f766e", strokeWidth: 1.5, strokeLineCap: "round" }),
      }),
      line("apl.guide.radius.left.upper", {
        start: leftCenter,
        end: upperBelt.pointA,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("apl.guide.radius.right.upper", {
        start: rightCenter,
        end: upperBelt.pointB,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("apl.guide.branch.left.radius", {
        start: leftCenter,
        end: leftBranchPoint,
        style: { stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("apl.guide.branch.right.radius", {
        start: rightCenter,
        end: rightBranchPoint,
        style: { stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("apl.guide.hook.vertical", {
        start: verticalReferenceTop,
        end: point(hookPoint.x, centerMassTop.y + 32),
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [5, 4], strokeLineCap: "round" },
      }),
      line("apl.rope.left.drop", {
        start: lowerBelt.pointA,
        end: leftMassTop,
        style: { stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      line("apl.rope.right.drop", {
        start: lowerBelt.pointB,
        end: rightMassTop,
        style: { stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      circleToCircleLine("apl.rope.left.branch", {
        centerA: leftBranchPoint,
        radiusA: 2.4,
        centerB: hookPoint,
        radiusB: 2.6,
        style: { stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      circleToCircleLine("apl.rope.right.branch", {
        centerA: rightBranchPoint,
        radiusA: 2.4,
        centerB: hookPoint,
        radiusB: 2.6,
        style: { stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      trimmedLine("apl.rope.center.drop", {
        a: hookPoint,
        b: centerMassTop,
        startDistance: 2.6,
        style: { stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" },
      }),
      ...segmentTickMarks("apl.tick.left", {
        a: lowerBelt.pointA,
        b: leftMassTop,
        count: 1,
        size: 10,
        style: { stroke: "#334155", strokeWidth: 1.2, strokeLineCap: "round" },
      }),
      ...segmentTickMarks("apl.tick.right", {
        a: lowerBelt.pointB,
        b: rightMassTop,
        count: 1,
        size: 10,
        style: { stroke: "#334155", strokeWidth: 1.2, strokeLineCap: "round" },
      }),
      angleMarkPath("apl.angle.left", {
        vertex: hookPoint,
        fromPoint: verticalReferenceTop,
        toPoint: leftBranchPoint,
        radius: 24,
        clockwise: true,
        style: { stroke: "#b45309", strokeWidth: 1.6, fill: "none", strokeLineCap: "round" },
      }),
      angleMarkPath("apl.angle.right", {
        vertex: hookPoint,
        fromPoint: verticalReferenceTop,
        toPoint: rightBranchPoint,
        radius: 36,
        style: { stroke: "#b45309", strokeWidth: 1.6, fill: "none", strokeLineCap: "round" },
      }),
      circle("apl.point.left.branch", {
        center: leftBranchPoint,
        radius: 2.4,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("apl.point.right.branch", {
        center: rightBranchPoint,
        radius: 2.4,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("apl.point.hook", {
        center: hookPoint,
        radius: 2.6,
        style: { stroke: "#b91c1c", fill: "#b91c1c" },
      }),
      rect("apl.mass.left", {
        center: point(leftMassTop.x, leftMassTop.y + 18),
        width: 26,
        height: 36,
        style: { stroke: "#334155", strokeWidth: 1.5, fill: "#e2e8f0" },
      }),
      rect("apl.mass.center", {
        center: point(centerMassTop.x, centerMassTop.y + 20),
        width: 34,
        height: 40,
        style: { stroke: "#334155", strokeWidth: 1.5, fill: "#fee2e2" },
      }),
      rect("apl.mass.right", {
        center: point(rightMassTop.x, rightMassTop.y + 18),
        width: 30,
        height: 36,
        style: { stroke: "#334155", strokeWidth: 1.5, fill: "#e2e8f0" },
      }),
      text("apl.label.left", {
        center: point(leftCenter.x - 14, leftCenter.y + 14),
        text: "O1",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("apl.label.right", {
        center: point(rightCenter.x + 14, rightCenter.y + 14),
        text: "O2",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("apl.label.branch.left", {
        center: point(leftBranchPoint.x - 12, leftBranchPoint.y + 16),
        text: "T1",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("apl.label.branch.right", {
        center: point(rightBranchPoint.x + 12, rightBranchPoint.y + 16),
        text: "T2",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("apl.label.belt", {
        center: upperLabelPoint,
        text: "belt path",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("apl.label.alpha1", {
        center: leftAngleLabel,
        text: "alpha1",
        style: { fill: "#b45309", fontSize: 10 },
      }),
      text("apl.label.alpha2", {
        center: rightAngleLabel,
        text: "alpha2",
        style: { fill: "#b45309", fontSize: 10 },
      }),
      text("apl.label.mass.left", {
        center: point(leftMassTop.x, leftMassTop.y + 18),
        text: "m1",
        style: { fill: "#334155", fontSize: 11 },
      }),
      text("apl.label.mass.center", {
        center: point(centerMassTop.x, centerMassTop.y + 20),
        text: "m",
        style: { fill: "#7f1d1d", fontSize: 11 },
      }),
      text("apl.label.mass.right", {
        center: point(rightMassTop.x, rightMassTop.y + 18),
        text: "m2",
        style: { fill: "#334155", fontSize: 11 },
      }),
      text("apl.caption", {
        center: point(240, 30),
        text: "Pullys lite (manual static reproduction, not mechanics simulation)",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ]);
  },
};