import { point } from "@vizx/geometry";
import type { ObjectScene } from "@vizx/object-model";

export function createBasicDemoScene(): ObjectScene {
  return {
    objects: [
      createLabelBox("A", "Raw data", { kind: "absolute", position: point(80, 60) }),
      createLabelBox("B", "Clean", { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 90 }),
      createLabelBox("C", "Model", { kind: "rightOf", reference: { objectId: "B", anchor: "east" }, gap: 90 }),
    ],
    connectors: [
      { kind: "connector", id: "edge-1", from: { objectId: "A", anchor: "east" }, to: { objectId: "B", anchor: "west" } },
      { kind: "connector", id: "edge-2", from: { objectId: "B", anchor: "east" }, to: { objectId: "C", anchor: "west" } },
    ],
  };
}

function createLabelBox(id: string, label: string, placement: NonNullable<ObjectScene["objects"]>[number]["placement"]) {
  return {
    kind: "group" as const,
    id,
    placement,
    children: [
      {
        kind: "text" as const,
        id: `${id}.label`,
        center: point(0, 0),
        text: label,
      },
      {
        kind: "rect" as const,
        id: `${id}.frame`,
        fitToText: { textId: `${id}.label`, paddingX: 12, paddingY: 10 },
        rx: 6,
        ry: 6,
      },
    ],
  };
}