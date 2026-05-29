import {
  absolute,
  arrowEnd,
  cubicCurveTo,
  moveTo,
  path,
  quadraticCurveTo,
  sceneOf,
  text,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

export const builderBezierPathExample: VizxExample = {
  id: "builder-bezier-path",
  title: "Builder Bezier path",
  description: "Builder-helper parity version of the Bezier path scene.",
  expectedCapabilities: [
    "builder helpers",
    "bezier path",
    "quadratic curve command",
    "cubic curve command",
    "bbox anchors",
    "inspect output",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf([
      path("bezier.demo", {
        commands: [
          moveTo({ x: 0, y: 24 }),
          quadraticCurveTo({ x: 28, y: -8 }, { x: 60, y: 14 }),
          cubicCurveTo({ x: 88, y: 42 }, { x: 124, y: -4 }, { x: 156, y: 22 }),
        ],
        placement: absolute({ x: 72, y: 88 }),
        style: arrowEnd({ stroke: "#0f766e", strokeWidth: 2, fill: "none" }),
      }),
      text("bezier.label", {
        center: { x: 186, y: 46 },
        text: "Bezier path",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
    ]),
};