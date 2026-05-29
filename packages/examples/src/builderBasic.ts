import {
  absolute,
  alignY,
  anchor,
  arrowEnd,
  connector,
  group,
  type ObjectPlacement,
  rect,
  rightOf,
  sceneOf,
  text,
} from "@vizx/object-model";
import type { VizxExample } from "./types";

function createBuilderLabelBox(id: string, label: string, placement: ObjectPlacement) {
  return group(id, {
    placement,
    children: [
      text(`${id}.label`, {
        center: { x: 0, y: 0 },
        text: label,
      }),
      rect(`${id}.frame`, {
        fitToText: { textId: `${id}.label`, paddingX: 12, paddingY: 10 },
        rx: 6,
        ry: 6,
      }),
    ],
  });
}

export const builderBasicExample: VizxExample = {
  id: "builder-basic",
  title: "Builder helpers",
  description: "Constructs a simple two-node flow with first-slice ObjectScene builder helpers.",
  expectedCapabilities: [
    "builder helpers",
    "group bbox",
    "rightOf placement",
    "alignY alignment",
    "straight connector",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf(
      [
        createBuilderLabelBox("A", "Source", absolute({ x: 90, y: 70 })),
        createBuilderLabelBox("B", "Target", rightOf("A", "east", 96)),
        text("title", {
          center: { x: 176, y: 24 },
          text: "Builder API v0",
          align: alignY("A"),
          style: { fill: "#0f172a", fontSize: 12 },
        }),
      ],
      {
        connectors: [
          connector("A->B", anchor("A", "east"), anchor("B", "west"), {
            style: arrowEnd({ stroke: "#0f766e", strokeWidth: 1.8 }),
          }),
        ],
      }
    ),
};
