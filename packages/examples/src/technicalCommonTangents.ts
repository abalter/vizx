import {
  circleCircleTangents,
  labelAlongSegment,
  point,
} from "@vizx/geometry";
import {
  circle,
  line,
  sceneOf,
  text,
  type CircleObject,
  type LineObject,
  type TextObject,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalCommonTangentsExample: VizxExample = {
  id: "technical-common-tangents",
  title: "Technical common tangents",
  description:
    "Demonstrates explicit common tangent construction between two circles (external/internal) using pure helper math.",
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: ["primitives", "tangents", "common tangents", "annotation helpers", "style fields"],
  compromises: [
    "no source translation",
    "no solver",
    "no mechanics/physics simulation",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "technical geometry helpers",
    "common tangent helpers",
    "circle primitive",
    "line primitive",
    "text labels",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const centerA = point(132, 162);
    const centerB = point(312, 146);
    const radiusA = 50;
    const radiusB = 30;

    const tangents = circleCircleTangents(centerA, radiusA, centerB, radiusB);
    const externals = tangents.filter((entry) => entry.kind === "external");
    const internals = tangents.filter((entry) => entry.kind === "internal");

    if (externals.length < 2) {
      throw new Error("Expected at least two external common tangents");
    }

    const objects: (CircleObject | LineObject | TextObject)[] = [
      circle("tct.circle.a", {
        center: centerA,
        radius: radiusA,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      circle("tct.circle.b", {
        center: centerB,
        radius: radiusB,
        style: { stroke: "#1d4ed8", strokeWidth: 2, fill: "none" },
      }),
      circle("tct.center.a", {
        center: centerA,
        radius: 2.6,
        style: { stroke: "#0f172a", fill: "#0f172a" },
      }),
      circle("tct.center.b", {
        center: centerB,
        radius: 2.6,
        style: { stroke: "#1d4ed8", fill: "#1d4ed8" },
      }),
    ];

    for (const [index, tangent] of externals.entries()) {
      objects.push(line(`tct.tangent.external.${index}`, {
        start: tangent.pointA,
        end: tangent.pointB,
        style: { stroke: "#0f766e", strokeWidth: 2.2, strokeLineCap: "round" },
      }));
      objects.push(line(`tct.radius.external.a.${index}`, {
        start: centerA,
        end: tangent.pointA,
        style: { stroke: "#64748b", strokeWidth: 1.2, strokeDasharray: [4, 4] },
      }));
      objects.push(line(`tct.radius.external.b.${index}`, {
        start: centerB,
        end: tangent.pointB,
        style: { stroke: "#64748b", strokeWidth: 1.2, strokeDasharray: [4, 4] },
      }));
      objects.push(circle(`tct.point.external.a.${index}`, {
        center: tangent.pointA,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }));
      objects.push(circle(`tct.point.external.b.${index}`, {
        center: tangent.pointB,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }));
      objects.push(text(`tct.label.external.a.${index}`, {
        center: labelAlongSegment(centerA, tangent.pointA, 0.72, 10),
        text: `Ea${index + 1}`,
        style: { fill: "#0f766e", fontSize: 10 },
      }));
      objects.push(text(`tct.label.external.b.${index}`, {
        center: labelAlongSegment(centerB, tangent.pointB, 0.72, 10),
        text: `Eb${index + 1}`,
        style: { fill: "#0f766e", fontSize: 10 },
      }));
    }

    for (const [index, tangent] of internals.entries()) {
      objects.push(line(`tct.tangent.internal.${index}`, {
        start: tangent.pointA,
        end: tangent.pointB,
        style: { stroke: "#b45309", strokeWidth: 1.9, strokeLineCap: "round" },
      }));
      objects.push(line(`tct.radius.internal.a.${index}`, {
        start: centerA,
        end: tangent.pointA,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3] },
      }));
      objects.push(line(`tct.radius.internal.b.${index}`, {
        start: centerB,
        end: tangent.pointB,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3] },
      }));
      objects.push(circle(`tct.point.internal.a.${index}`, {
        center: tangent.pointA,
        radius: 2,
        style: { stroke: "#b45309", fill: "#b45309" },
      }));
      objects.push(circle(`tct.point.internal.b.${index}`, {
        center: tangent.pointB,
        radius: 2,
        style: { stroke: "#b45309", fill: "#b45309" },
      }));
    }

    objects.push(text("tct.label.a", {
      center: point(centerA.x - 12, centerA.y + 16),
      text: "O1",
      style: { fill: "#0f172a", fontSize: 11 },
    }));
    objects.push(text("tct.label.b", {
      center: point(centerB.x + 12, centerB.y + 12),
      text: "O2",
      style: { fill: "#1d4ed8", fontSize: 11 },
    }));
    objects.push(text("tct.caption", {
      center: point(230, 34),
      text: "Technical common tangents (external + internal)",
      style: { fill: "#334155", fontSize: 12 },
    }));

    return sceneOf(objects);
  },
};
