import {
  absolute,
  anchor,
  arrowEnd,
  below,
  connector,
  group,
  leftOf,
  rect,
  rightOf,
  sceneOf,
  text,
  type ObjectPlacement,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

function lifecycleNode(id: string, label: string, placement: ObjectPlacement, fill: string) {
  return group(id, {
    placement,
    children: [
      text(`${id}.label`, {
        center: { x: 0, y: 0 },
        text: label,
        style: { fill: "#0f172a", fontSize: 12 },
      }),
      rect(`${id}.frame`, {
        fitToText: { textId: `${id}.label`, paddingX: 14, paddingY: 10 },
        rx: 8,
        ry: 8,
        style: { fill, stroke: "#0f172a", strokeWidth: 1.4 },
      }),
    ],
  });
}

/*
  Aspirational reproduction note:
  - Original source: examples/aspirational_gallery/tikz/Diagram of Android activity life cycle
  - Reproduction level: Level 2
  - Helper families: primitives, connectors/placement
  - Compromises: no source translation, no solver, no automatic layout,
    no full visual fidelity, no clipping/gradients, no parser/JSON/AST support
*/
export const aspirationalAndroidLifecycleExample: VizxExample = {
  id: "aspirational-android-lifecycle",
  title: "Aspirational: Android activity lifecycle",
  description:
    "Manual builder-authored Level 2 approximation of the TikZ Android activity lifecycle with rounded lifecycle nodes and arrowed flow connectors.",
  sourcePath: "examples/aspirational_gallery/tikz/Diagram of Android activity life cycle",
  reproductionLevel: "Level 2",
  helperFamilies: [
    "primitives",
    "connectors/placement",
  ],
  compromises: [
    "no source translation",
    "no solver",
    "no automatic layout",
    "no full visual fidelity",
    "no clipping/gradients",
    "no parser/JSON/AST support",
  ],
  expectedCapabilities: [
    "builder helpers",
    "group bbox",
    "relative placement",
    "straight connector",
    "built-in arrow markers",
    "inspect output",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf(
      [
        lifecycleNode("start", "Activity starts", absolute({ x: 260, y: 56 }), "#bfdbfe"),
        lifecycleNode("onCreate", "onCreate()", below("start", "south", 34), "#fed7aa"),
        lifecycleNode("onStart", "onStart()", below("onCreate", "south", 28), "#fed7aa"),
        lifecycleNode("onResume", "onResume()", below("onStart", "south", 28), "#fed7aa"),
        lifecycleNode("running", "Activity is running", below("onResume", "south", 34), "#bbf7d0"),
        lifecycleNode("onPause", "onPause()", below("running", "south", 52), "#fed7aa"),
        lifecycleNode("onStop", "onStop()", below("onPause", "south", 52), "#fed7aa"),
        lifecycleNode("onDestroy", "onDestroy()", below("onStop", "south", 52), "#fed7aa"),
        lifecycleNode("onRestart", "onRestart()", rightOf("onStart", "east", 176), "#fed7aa"),
        lifecycleNode("killed", "Process is killed", leftOf("running", "west", 182), "#fecaca"),
        lifecycleNode("shutdown", "Activity is shut down", below("onDestroy", "south", 38), "#fecaca"),
        text("note.foreground", {
          center: { x: 420, y: 206 },
          text: "Comes to foreground",
          style: { fill: "#334155", fontSize: 11 },
        }),
        text("note.pause", {
          center: { x: 370, y: 272 },
          text: "Another activity in front",
          style: { fill: "#334155", fontSize: 11 },
        }),
        text("title", {
          center: { x: 260, y: 18 },
          text: "Android activity lifecycle (approximation)",
          style: { fill: "#0f172a", fontSize: 13 },
        }),
        text("subtitle", {
          center: { x: 260, y: 36 },
          text: "Level 2 builder reproduction",
          style: { fill: "#475569", fontSize: 11 },
        }),
      ],
      {
        connectors: [
          connector("lifecycle.start-create", anchor("start", "south"), anchor("onCreate", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.create-start", anchor("onCreate", "south"), anchor("onStart", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.start-resume", anchor("onStart", "south"), anchor("onResume", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.resume-running", anchor("onResume", "south"), anchor("running", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.running-pause", anchor("running", "south"), anchor("onPause", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.pause-stop", anchor("onPause", "south"), anchor("onStop", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.stop-destroy", anchor("onStop", "south"), anchor("onDestroy", "north"), {
            style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.destroy-shutdown", anchor("onDestroy", "south"), anchor("shutdown", "north"), {
            style: arrowEnd({ stroke: "#b91c1c", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.stop-restart", anchor("onStop", "east"), anchor("onRestart", "south"), {
            style: arrowEnd({ stroke: "#0369a1", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.restart-start", anchor("onRestart", "west"), anchor("onStart", "east"), {
            style: arrowEnd({ stroke: "#0369a1", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.pause-killed", anchor("onPause", "west"), anchor("killed", "east"), {
            style: arrowEnd({ stroke: "#b91c1c", strokeWidth: 1.8 }),
          }),
          connector("lifecycle.killed-create", anchor("killed", "north"), anchor("onCreate", "west"), {
            style: arrowEnd({ stroke: "#b91c1c", strokeWidth: 1.8 }),
          }),
        ],
      }
    ),
};
