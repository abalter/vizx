import { angleLabelPoint, point } from "@vizx/geometry";
import { angleMarkPath, line, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalAngleArcExample: VizxExample = {
  id: "technical-angle-arc",
  title: "Technical angle arc",
  description: "A focused circular arc angle-mark example using the v0 center/radius/angle path command.",
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: ["primitives", "circular arcs / angle marks", "annotation helpers", "style fields"],
  compromises: [
    "no source translation",
    "no solver",
    "no mechanics/physics simulation",
    "no parser/JSON/AST support",
  ],
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
    const labelCenter = angleLabelPoint(vertex, firstRayEnd, secondRayEnd, arcRadius, {
      clockwise: true,
      offset: 14,
    });

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
      angleMarkPath("angle.mark", {
        vertex,
        fromPoint: firstRayEnd,
        toPoint: secondRayEnd,
        radius: arcRadius,
        clockwise: true,
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
      }),
      text("angle.label", {
        center: labelCenter,
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