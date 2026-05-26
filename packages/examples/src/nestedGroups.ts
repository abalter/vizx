import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";

export const nestedGroupsExample: VizxExample = {
  id: "nested-groups",
  title: "Nested Groups",
  description: "A top-level group containing a nested group to exercise recursive inspection and debug overlays.",
  expectedCapabilities: ["group bbox", "nested group children", "inspect output", "debug overlay", "debug overlay options"],
  createScene: () => ({
    objects: [
      {
        kind: "group",
        id: "panel",
        placement: { kind: "absolute", position: point(160, 96) },
        children: [
          {
            kind: "group",
            id: "panel.inner",
            children: [
              {
                kind: "text",
                id: "panel.inner.label",
                center: point(0, 0),
                text: "Nested",
              },
              {
                kind: "rect",
                id: "panel.inner.frame",
                fitToText: { textId: "panel.inner.label", paddingX: 14, paddingY: 10 },
                rx: 6,
                ry: 6,
              },
            ],
          },
          {
            kind: "rect",
            id: "panel.frame",
            center: point(0, 0),
            width: 180,
            height: 96,
            rx: 10,
            ry: 10,
            style: { stroke: "#4b5563", fill: "none", strokeWidth: 1.25 },
          },
        ],
      },
    ],
  }),
};