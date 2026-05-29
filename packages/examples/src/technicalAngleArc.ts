import { circlePoint, point } from "@vizx/geometry";
import { arc, line, moveTo, path, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalAngleArcExample: VizxExample = {
  id: "technical-angle-arc",
  title: "Technical angle arc",
  description: "A focused circular arc angle-mark example using the v0 center/radius/angle path command.",
  expectedCapabilities: [
    "path arc command",
    "line primitive",
    "text labels",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const vertex = point(168, 136);
    const firstRayEnd = point(266, 136);
    const secondRayEnd = point(224, 62);
    const arcRadius = 42;
    const startAngle = 0;
    const endAngle = -58;
    const arcStart = circlePoint(vertex, arcRadius, startAngle);

    return sceneOf([
      line("angle.ray.1", {
        start: vertex,
        end: firstRayEnd,
        style: { stroke: "#0f172a", strokeWidth: 2 },
      }),
      line("angle.ray.2", {
        start: vertex,
        end: secondRayEnd,
        style: { stroke: "#0f172a", strokeWidth: 2 },
      }),
      path("angle.mark", {
        commands: [
          moveTo(arcStart),
          arc(vertex, arcRadius, startAngle, endAngle, { clockwise: true }),
        ],
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
      }),
      text("angle.label", {
        center: point(206, 112),
        text: "theta",
        style: { fill: "#0f172a", fontSize: 13 },
      }),
      text("angle.caption", {
        center: point(168, 38),
        text: "Technical angle arc",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ]);
  },
};