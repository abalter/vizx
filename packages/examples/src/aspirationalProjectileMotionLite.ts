import { angleLabelPoint, point, polar } from "@vizx/geometry";
import { angleMarkPath, arrowEnd, line, moveTo, path, quadraticCurveTo, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/tikz/projectile_motion
  - Target level: Level 1 to Level 2
  - Compromises: manual coordinates; no plot/data-coordinate model; no source translation;
    no physics simulation; no automatic scale/axis system
*/
export const aspirationalProjectileMotionLiteExample: VizxExample = {
  id: "aspirational-projectile-motion-lite",
  title: "Aspirational projectile motion lite",
  description:
    "Manual Level 1-2 approximation of TikZ projectile_motion using current VizX geometry, arcs, paths, arrows, labels, and v0 style fields.",
  expectedCapabilities: [
    "builder helpers",
    "technical geometry helpers",
    "bezier path",
    "path arc command",
    "built-in arrow markers",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const launch = point(72, 180);
    const trajectoryControl = point(206, 78);
    const landing = point(334, 180);
    const launchAngleDegrees = -52;
    const launchVectorTip = polar(launch, 74, launchAngleDegrees);
    const angleRadius = 26;
    const angleGuidePoint = point(launch.x + 90, launch.y);

    const t = 0.38;
    const oneMinusT = 1 - t;
    const sample = point(
      oneMinusT * oneMinusT * launch.x + 2 * oneMinusT * t * trajectoryControl.x + t * t * landing.x,
      oneMinusT * oneMinusT * launch.y + 2 * oneMinusT * t * trajectoryControl.y + t * t * landing.y,
    );

    return sceneOf([
      line("proj.ground", {
        start: point(24, 180),
        end: point(362, 180),
        style: { stroke: "#334155", strokeWidth: 2, strokeLineCap: "round" },
      }),
      path("proj.trajectory", {
        commands: [
          moveTo(launch),
          quadraticCurveTo(trajectoryControl, landing),
        ],
        style: {
          stroke: "#0f766e",
          strokeWidth: 2.4,
          fill: "none",
          strokeLineCap: "round",
        },
      }),
      line("proj.launch.vector", {
        start: launch,
        end: launchVectorTip,
        style: arrowEnd({ stroke: "#0f172a", strokeWidth: 2, strokeLineCap: "round" }),
      }),
      line("proj.guide.drop", {
        start: point(sample.x, 180),
        end: sample,
        style: { stroke: "#94a3b8", strokeWidth: 1.4, strokeDasharray: [6, 4], strokeLineCap: "round" },
      }),
      line("proj.guide.level", {
        start: point(launch.x, sample.y),
        end: sample,
        style: { stroke: "#94a3b8", strokeWidth: 1.4, strokeDasharray: [6, 4], strokeLineCap: "round" },
      }),
      angleMarkPath("proj.angle.arc", {
        vertex: launch,
        fromPoint: angleGuidePoint,
        toPoint: launchVectorTip,
        radius: angleRadius,
        clockwise: true,
        style: { stroke: "#0f766e", strokeWidth: 2, fill: "none", strokeLineCap: "round" },
      }),
      text("proj.angle.label", {
        center: angleLabelPoint(launch, angleGuidePoint, launchVectorTip, angleRadius, {
          clockwise: true,
          offset: 11,
        }),
        text: "theta",
        style: { fill: "#0f766e", fontSize: 12 },
      }),
      text("proj.label.launch", {
        center: point(launch.x - 18, launch.y + 15),
        text: "launch",
        style: { fill: "#334155", fontSize: 11 },
      }),
      text("proj.label.range", {
        center: point(sample.x + 2, 194),
        text: "x",
        style: { fill: "#334155", fontSize: 11 },
      }),
      text("proj.label.height", {
        center: point(59, sample.y - 2),
        text: "y",
        style: { fill: "#334155", fontSize: 11 },
      }),
      text("proj.caption", {
        center: point(194, 30),
        text: "Projectile motion (lite approximation)",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ]);
  },
};