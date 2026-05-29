import { arrowEnd, arrowStart, circle, line, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/metapost/arrow_label.mp
  - Target level: Level 2
  - Compromises: cutbefore/cutafter is approximated by manually shortening the arrow segment
  - Missing features: no native cutbefore/cutafter path operations
*/
export const aspirationalArrowLabelExample: VizxExample = {
  id: "aspirational-arrow-label",
  title: "Aspirational: Arrow with label",
  description:
    "Manual builder-authored approximation of MetaPost arrow_label with a shortened double-arrow segment and centered label.",
  expectedCapabilities: [
    "builder helpers",
    "line primitive",
    "text labels",
    "built-in arrow markers",
    "inspect output",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf([
      circle("arrow.endpoint.left", {
        center: { x: 84, y: 128 },
        radius: 10,
        style: { stroke: "#0f172a", fill: "#ffffff", strokeWidth: 1.5 },
      }),
      circle("arrow.endpoint.right", {
        center: { x: 316, y: 128 },
        radius: 10,
        style: { stroke: "#0f172a", fill: "#ffffff", strokeWidth: 1.5 },
      }),
      line("arrow.segment", {
        start: { x: 102, y: 112 },
        end: { x: 298, y: 112 },
        style: arrowStart(arrowEnd({ stroke: "#0f172a", strokeWidth: 2 })),
      }),
      text("arrow.label", {
        center: { x: 200, y: 93 },
        text: "S",
        style: { fill: "#0f172a", fontSize: 14 },
      }),
      text("arrow.label.left", {
        center: { x: 84, y: 148 },
        text: "A",
        style: { fill: "#334155", fontSize: 12 },
      }),
      text("arrow.label.right", {
        center: { x: 316, y: 148 },
        text: "B",
        style: { fill: "#334155", fontSize: 12 },
      }),
      text("caption", {
        center: { x: 200, y: 44 },
        text: "Arrow label (manual approximation)",
        style: { fill: "#475569", fontSize: 12 },
      }),
    ]),
};
