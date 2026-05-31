import { circleCircleTangents, point } from "@vizx/geometry";
import {
  circle,
  crossedBeltPath,
  line,
  openBeltPath,
  sceneOf,
  text,
  type CircleObject,
  type LineObject,
  type PathObject,
  type TextObject,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalBeltPulleyExample: VizxExample = {
  id: "technical-belt-pulley",
  title: "Technical belt pulley",
  description:
    "Demonstrates open-belt and crossed-belt loop paths around pulley pairs using external/internal common tangents and circular wrap arcs.",
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: [
    "primitives",
    "tangents",
    "common tangents",
    "belt/pulley path",
    "circular arcs / angle marks",
    "annotation helpers",
    "style fields",
  ],
  compromises: [
    "no source translation",
    "no solver",
    "no mechanics/physics simulation",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "technical geometry helpers",
    "common tangent helpers",
    "builder path helpers",
    "circle primitive",
    "path arc command",
    "text labels",
    "strokeDasharray",
    "strokeLineCap",
    "strokeLineJoin",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const centerA = point(136, 162);
    const centerB = point(310, 138);
    const radiusA = 44;
    const radiusB = 28;
    const centerC = point(136, 308);
    const centerD = point(310, 292);
    const radiusC = 36;
    const radiusD = 22;

    const externalTangents = circleCircleTangents(centerA, radiusA, centerB, radiusB)
      .filter((entry) => entry.kind === "external");

    if (externalTangents.length < 2) {
      throw new Error("Expected two external tangents for technical-belt-pulley");
    }

    const upper = externalTangents[0];
    const lower = externalTangents[1];

    if (!upper || !lower) {
      throw new Error("Expected two external tangents for technical-belt-pulley");
    }

    const internalTangents = circleCircleTangents(centerC, radiusC, centerD, radiusD)
      .filter((entry) => entry.kind === "internal");

    if (internalTangents.length < 2) {
      throw new Error("Expected two internal tangents for technical-belt-pulley");
    }

    const crossedUpper = internalTangents[0];
    const crossedLower = internalTangents[1];

    if (!crossedUpper || !crossedLower) {
      throw new Error("Expected sorted internal tangents for technical-belt-pulley");
    }

    const objects: (CircleObject | LineObject | PathObject | TextObject)[] = [
      circle("tbp.pulley.a", {
        center: centerA,
        radius: radiusA,
        style: { stroke: "#0f172a", strokeWidth: 2, fill: "none" },
      }),
      circle("tbp.pulley.b", {
        center: centerB,
        radius: radiusB,
        style: { stroke: "#1d4ed8", strokeWidth: 2, fill: "none" },
      }),
      openBeltPath("tbp.belt", {
        centerA,
        radiusA,
        centerB,
        radiusB,
        style: {
          stroke: "#0f766e",
          strokeWidth: 2.4,
          fill: "none",
          strokeLineCap: "round",
          strokeLineJoin: "round",
        },
      }),
      crossedBeltPath("tbp.crossed.belt", {
        centerA: centerC,
        radiusA: radiusC,
        centerB: centerD,
        radiusB: radiusD,
        style: {
          stroke: "#7c3aed",
          strokeWidth: 2.4,
          fill: "none",
          strokeLineCap: "round",
          strokeLineJoin: "round",
          strokeDasharray: [7, 4],
        },
      }),
      line("tbp.guide.radius.a.upper", {
        start: centerA,
        end: upper.pointA,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("tbp.guide.radius.a.lower", {
        start: centerA,
        end: lower.pointA,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("tbp.guide.radius.b.upper", {
        start: centerB,
        end: upper.pointB,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("tbp.guide.radius.b.lower", {
        start: centerB,
        end: lower.pointB,
        style: { stroke: "#64748b", strokeWidth: 1.1, strokeDasharray: [4, 4], strokeLineCap: "round" },
      }),
      line("tbp.cross.guide.radius.c.upper", {
        start: centerC,
        end: crossedUpper.pointA,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3], strokeLineCap: "round" },
      }),
      line("tbp.cross.guide.radius.c.lower", {
        start: centerC,
        end: crossedLower.pointA,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3], strokeLineCap: "round" },
      }),
      line("tbp.cross.guide.radius.d.upper", {
        start: centerD,
        end: crossedUpper.pointB,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3], strokeLineCap: "round" },
      }),
      line("tbp.cross.guide.radius.d.lower", {
        start: centerD,
        end: crossedLower.pointB,
        style: { stroke: "#94a3b8", strokeWidth: 1.1, strokeDasharray: [5, 3], strokeLineCap: "round" },
      }),
      circle("tbp.contact.a.upper", {
        center: upper.pointA,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("tbp.contact.a.lower", {
        center: lower.pointA,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("tbp.contact.b.upper", {
        center: upper.pointB,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("tbp.contact.b.lower", {
        center: lower.pointB,
        radius: 2.2,
        style: { stroke: "#0f766e", fill: "#0f766e" },
      }),
      circle("tbp.cross.contact.c.upper", {
        center: crossedUpper.pointA,
        radius: 2.2,
        style: { stroke: "#7c3aed", fill: "#7c3aed" },
      }),
      circle("tbp.cross.contact.c.lower", {
        center: crossedLower.pointA,
        radius: 2.2,
        style: { stroke: "#7c3aed", fill: "#7c3aed" },
      }),
      circle("tbp.cross.contact.d.upper", {
        center: crossedUpper.pointB,
        radius: 2.2,
        style: { stroke: "#7c3aed", fill: "#7c3aed" },
      }),
      circle("tbp.cross.contact.d.lower", {
        center: crossedLower.pointB,
        radius: 2.2,
        style: { stroke: "#7c3aed", fill: "#7c3aed" },
      }),
      text("tbp.label.a", {
        center: point(centerA.x - 12, centerA.y + 14),
        text: "O1",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("tbp.label.b", {
        center: point(centerB.x + 12, centerB.y + 12),
        text: "O2",
        style: { fill: "#1d4ed8", fontSize: 11 },
      }),
      text("tbp.cross.label.c", {
        center: point(centerC.x - 12, centerC.y + 14),
        text: "O3",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("tbp.cross.label.d", {
        center: point(centerD.x + 12, centerD.y + 12),
        text: "O4",
        style: { fill: "#1d4ed8", fontSize: 11 },
      }),
      text("tbp.label.contact.upper", {
        center: point((upper.pointA.x + upper.pointB.x) / 2, (upper.pointA.y + upper.pointB.y) / 2 - 12),
        text: "T_upper",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("tbp.label.contact.lower", {
        center: point((lower.pointA.x + lower.pointB.x) / 2, (lower.pointA.y + lower.pointB.y) / 2 + 14),
        text: "T_lower",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("tbp.caption", {
        center: point(222, 28),
        text: "Technical belt pulley (open + crossed helper)",
        style: { fill: "#334155", fontSize: 12 },
      }),
      text("tbp.caption.open", {
        center: point(222, 62),
        text: "Open belt (external tangents)",
        style: { fill: "#0f766e", fontSize: 10 },
      }),
      text("tbp.caption.crossed", {
        center: point(222, 214),
        text: "Crossed belt (internal tangents)",
        style: { fill: "#7c3aed", fontSize: 10 },
      }),
    ];

    return sceneOf(objects);
  },
};
