import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const mixedNestedPlacementExample: VizxExample = {
  id: "mixed-nested-placement",
  title: "Mixed Nested Placement",
  description: "Demonstrates rightOf, leftOf, above, and below placement involving nested group objects.",
  expectedCapabilities: [
    "group bbox",
    "nested group children",
    "rightOf placement",
    "leftOf placement",
    "above placement",
    "below placement",
    "straight connector",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      {
        kind: "group",
        id: "Hub",
        placement: { kind: "absolute", position: point(200, 140) },
        children: [
          {
            kind: "rect",
            id: "Hub.frame",
            center: point(0, 0),
            width: 190,
            height: 116,
            rx: 12,
            ry: 12,
            style: { stroke: "#374151", fill: "none", strokeWidth: 1.25 },
          },
          {
            kind: "text",
            id: "Hub.title",
            center: point(0, -34),
            text: "Central hub",
          },
          {
            kind: "group",
            id: "Hub.inner",
            children: [
              {
                kind: "text",
                id: "Hub.inner.label",
                center: point(0, 8),
                text: "Nested core",
              },
              {
                kind: "rect",
                id: "Hub.inner.frame",
                fitToText: { textId: "Hub.inner.label", paddingX: 14, paddingY: 10 },
                rx: 8,
                ry: 8,
              },
            ],
          },
        ],
      },
      createLabelBox("Right", "Right node", { kind: "rightOf", reference: { objectId: "Hub", anchor: "east" }, gap: 54 }),
      createLabelBox("Left", "Left node", { kind: "leftOf", reference: { objectId: "Hub", anchor: "west" }, gap: 54 }),
      createLabelBox("Above", "Top node", { kind: "above", reference: { objectId: "Hub", anchor: "north" }, gap: 44 }),
      createLabelBox("Below", "Bottom node", { kind: "below", reference: { objectId: "Hub", anchor: "south" }, gap: 44 }),
    ],
    connectors: [
      { kind: "connector", id: "hub-right", from: { objectId: "Hub", anchor: "east" }, to: { objectId: "Right", anchor: "west" } },
      { kind: "connector", id: "hub-left", from: { objectId: "Hub", anchor: "west" }, to: { objectId: "Left", anchor: "east" } },
      { kind: "connector", id: "hub-above", from: { objectId: "Hub", anchor: "north" }, to: { objectId: "Above", anchor: "south" } },
      { kind: "connector", id: "hub-below", from: { objectId: "Hub", anchor: "south" }, to: { objectId: "Below", anchor: "north" } },
    ],
  }),
};