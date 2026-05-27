import { point } from "@vizx/geometry";
import type { VizxExample } from "./types";
import { createLabelBox } from "./helpers";

export const alignmentFamilyExample: VizxExample = {
  id: "alignment-family",
  title: "Alignment Family",
  description: "Demonstrates center-axis and corresponding-edge alignment operations.",
  expectedCapabilities: [
    "alignX",
    "alignY",
    "alignLeft",
    "alignRight",
    "alignTop",
    "alignBottom",
    "rect anchors",
    "group bbox",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => ({
    objects: [
      createLabelBox("Reference", "Reference nucleus", { kind: "absolute", position: point(260, 180) }),
      {
        ...createLabelBox("AxisX", "Axis X target", { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 88 }),
        align: { relation: "alignX", reference: { objectId: "Reference", anchor: "center" } },
      },
      {
        ...createLabelBox("AxisY", "Axis Y receiver with wider text", { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 96 }),
        align: { relation: "alignY", reference: { objectId: "Reference", anchor: "center" } },
      },
      {
        ...createLabelBox("EdgeLeft", "Left edge", { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 24 }),
        align: { relation: "alignLeft", reference: { objectId: "Reference", anchor: "west" } },
      },
      {
        ...createLabelBox("EdgeRight", "Right edge with longer text", { kind: "above", reference: { objectId: "Reference", anchor: "north" }, gap: 24 }),
        align: { relation: "alignRight", reference: { objectId: "Reference", anchor: "east" } },
      },
      {
        ...createLabelBox("EdgeTop", "Top edge target", { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 48 }),
        align: { relation: "alignTop", reference: { objectId: "Reference", anchor: "north" } },
      },
      {
        ...createLabelBox("EdgeBottom", "Bottom edge", { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 48 }),
        align: { relation: "alignBottom", reference: { objectId: "Reference", anchor: "south" } },
      },
    ],
    connectors: [
      { kind: "connector", id: "reference-axis-x", from: { objectId: "Reference", anchor: "center" }, to: { objectId: "AxisX", anchor: "center" } },
      { kind: "connector", id: "reference-axis-y", from: { objectId: "Reference", anchor: "center" }, to: { objectId: "AxisY", anchor: "center" } },
      { kind: "connector", id: "reference-edge-left", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "EdgeLeft", anchor: "west" } },
      { kind: "connector", id: "reference-edge-right", from: { objectId: "Reference", anchor: "east" }, to: { objectId: "EdgeRight", anchor: "east" } },
      { kind: "connector", id: "reference-edge-top", from: { objectId: "Reference", anchor: "north" }, to: { objectId: "EdgeTop", anchor: "north" } },
      { kind: "connector", id: "reference-edge-bottom", from: { objectId: "Reference", anchor: "south" }, to: { objectId: "EdgeBottom", anchor: "south" } },
    ],
  }),
};
