import {
  labelAlongSegment,
  point,
  trimSegment,
  trimSegmentStart,
  trimSegmentToCircle,
} from "@vizx/geometry";
import {
  circleToCircleArrow,
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

export const technicalTrimmedSegmentsExample: VizxExample = {
  id: "technical-trimmed-segments",
  title: "Technical trimmed segments",
  description: "A focused technical example showing explicit straight-segment trimming helpers for polished boundary-aware linework.",
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: ["primitives", "segment/ray clipping", "annotation helpers", "style fields"],
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
    "strokeDasharray",
    "strokeLineCap",
    "markerEnd",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const leftCenter = point(132, 142);
    const rightCenter = point(320, 142);
    const radius = 30;

    const guideStart = point(64, 142);
    const guideEnd = point(388, 142);
    const polished = trimSegment(
      leftCenter,
      rightCenter,
      radius + 10,
      radius + 10,
    );

    const diagonalGuideStart = point(64, 224);
    const diagonalGuideEnd = point(236, 54);
    const secantTrim = trimSegmentToCircle(
      diagonalGuideStart,
      diagonalGuideEnd,
      leftCenter,
      radius,
    );

    if (!secantTrim) {
      throw new Error("Expected a secant trim segment for technical-trimmed-segments");
    }

    const leftDropBase = trimSegmentStart(
      point(110, 236),
      point(110, 66),
      26,
    );

    const objects: (CircleObject | LineObject | TextObject)[] = [
      circle("tts.circle.left", {
        center: leftCenter,
        radius,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      circle("tts.circle.right", {
        center: rightCenter,
        radius,
        style: { stroke: "#1d4ed8", strokeWidth: 2, fill: "none" },
      }),
      line("tts.guide.centerline", {
        start: guideStart,
        end: guideEnd,
        style: { stroke: "#94a3b8", strokeWidth: 1.4, strokeDasharray: [6, 4], strokeLineCap: "round" },
      }),
      trimmedLine("tts.segment.trimmed", {
        a: leftCenter,
        b: rightCenter,
        startDistance: radius + 10,
        endDistance: radius + 10,
        markerEnd: "arrow",
        style: {
          stroke: "#0f766e",
          strokeWidth: 2.6,
          strokeLineCap: "round",
        },
      }),
      circleToCircleArrow("tts.segment.circle-to-circle", {
        centerA: leftCenter,
        radiusA: radius,
        centerB: rightCenter,
        radiusB: radius,
        style: {
          stroke: "#0369a1",
          strokeWidth: 2,
          strokeLineCap: "round",
          strokeDasharray: [3, 3],
        },
      }),
      line("tts.guide.diagonal", {
        start: diagonalGuideStart,
        end: diagonalGuideEnd,
        style: { stroke: "#cbd5e1", strokeWidth: 1.2, strokeDasharray: [5, 4] },
      }),
      line("tts.segment.secant", {
        start: secantTrim.a,
        end: secantTrim.b,
        style: { stroke: "#b45309", strokeWidth: 2.2, strokeLineCap: "round" },
      }),
      trimmedLine("tts.segment.start-trim", {
        a: point(110, 236),
        b: point(110, 66),
        startDistance: 26,
        style: { stroke: "#7c3aed", strokeWidth: 2, strokeDasharray: [4, 3], strokeLineCap: "round" },
      }),
      text("tts.label.main", {
        center: labelAlongSegment(polished.a, polished.b, 0.5, -14),
        text: "trimSegment(...) with boundary gap",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("tts.label.secant", {
        center: labelAlongSegment(secantTrim.a, secantTrim.b, 0.5, 12),
        text: "trimSegmentToCircle(...)",
        style: { fill: "#b45309", fontSize: 10 },
      }),
      text("tts.label.circle-to-circle", {
        center: labelAlongSegment(polished.a, polished.b, 0.5, 20),
        text: "circleToCircleLine(...)",
        style: { fill: "#0369a1", fontSize: 10 },
      }),
      text("tts.label.start", {
        center: labelAlongSegment(leftDropBase.a, leftDropBase.b, 0.5, 12),
        text: "trimSegmentStart(...)",
        style: { fill: "#7c3aed", fontSize: 10 },
      }),
      text("tts.caption", {
        center: point(226, 32),
        text: "Technical trimmed segments (bounded v0 helper slice)",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ];

    return sceneOf(objects);
  },
};
