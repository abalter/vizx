import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const alignmentReferenceExample: VizxExample = {
  id: "alignment-reference",
  title: "Alignment Reference",
  description: "Provides a deterministic reference scene for future alignment and distribution work using existing placement relations.",
  expectedCapabilities: [
    "group bbox",
    "rect anchors",
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
        id: "Reference",
        placement: { kind: "absolute", position: point(240, 170) },
        children: [
          {
            kind: "rect",
            id: "Reference.frame",
            center: point(0, 0),
            width: 212,
            height: 124,
            rx: 12,
            ry: 12,
            style: { stroke: "#334155", fill: "none", strokeWidth: 1.25 },
          },
          {
            kind: "text",
            id: "Reference.title",
            center: point(0, -40),
            text: "Center reference",
          },
          {
            kind: "group",
            id: "Reference.inner",
            children: [
              {
                kind: "text",
                id: "Reference.inner.label",
                center: point(0, 10),
                text: "Nested guide",
              },
              {
                kind: "rect",
                id: "Reference.inner.frame",
                fitToText: { textId: "Reference.inner.label", paddingX: 14, paddingY: 10 },
                rx: 8,
                ry: 8,
              },
            ],
          },
        ],
      },
      createLabelBox("Left", "Left short", { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 52 }),
      createLabelBox("Right", "Right longer label", { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 52 }),
      createLabelBox("Above", "Above", { kind: "above", reference: { objectId: "Reference", anchor: "north" }, gap: 46 }),
      createLabelBox("Below", "Below longer label", { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 46 }),
    ],
    connectors: [
      { kind: "connector", id: "reference-left", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "Left", anchor: "east" } },
      { kind: "connector", id: "reference-right", from: { objectId: "Reference", anchor: "east" }, to: { objectId: "Right", anchor: "west" } },
      { kind: "connector", id: "reference-above", from: { objectId: "Reference", anchor: "north" }, to: { objectId: "Above", anchor: "south" } },
      { kind: "connector", id: "reference-below", from: { objectId: "Reference", anchor: "south" }, to: { objectId: "Below", anchor: "north" } },
    ],
  }),
};