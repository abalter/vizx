import { circleCircleTangents, point } from "@vizx/geometry";
import {
  circle,
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
    "Demonstrates a first open-belt loop path around two pulleys using external common tangents and circular wrap arcs.",
  expectedCapabilities: [
    "technical geometry helpers",
    "common tangent helpers",
    "builder path helpers",
    "circle primitive",
    "path arc command",
    "text labels",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const centerA = point(136, 162);
    const centerB = point(310, 138);
    const radiusA = 44;
    const radiusB = 28;

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
        center: point(222, 34),
        text: "Technical belt pulley (open-belt helper)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ];

    return sceneOf(objects);
  },
};
