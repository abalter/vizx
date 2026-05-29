import {
  above,
  absolute,
  anchor,
  below,
  connector,
  group,
  leftOf,
  rightOf,
  sceneOf,
  text,
  type ObjectPlacement,
  rect,
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

export const builderRelativePlacementExample: VizxExample = {
  id: "builder-relative-placement",
  title: "Builder relative placement",
  description: "Builder-helper parity version of the relative placement scene.",
  expectedCapabilities: [
    "builder helpers",
    "rightOf placement",
    "leftOf placement",
    "above placement",
    "below placement",
    "straight connector",
    "inspect output",
    "debug overlay",
  ],
  createScene: () =>
    sceneOf(
      [
        createBuilderLabelBox("Center", "Center", absolute({ x: 180, y: 120 })),
        createBuilderLabelBox("Right", "Right", rightOf("Center", "east", 44)),
        createBuilderLabelBox("Left", "Left", leftOf("Center", "west", 44)),
        createBuilderLabelBox("Above", "Above", above("Center", "north", 36)),
        createBuilderLabelBox("Below", "Below", below("Center", "south", 36)),
      ],
      {
        connectors: [
          connector("center-right", anchor("Center", "east"), anchor("Right", "west")),
          connector("center-left", anchor("Center", "west"), anchor("Left", "east")),
          connector("center-above", anchor("Center", "north"), anchor("Above", "south")),
          connector("center-below", anchor("Center", "south"), anchor("Below", "north")),
        ],
      }
    ),
};