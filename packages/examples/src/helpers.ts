import { point } from "@vizx/geometry";
import type { GroupObject, ObjectPlacement } from "@vizx/object-model";

export function createLabelBox(id: string, label: string, placement: ObjectPlacement): GroupObject {
  return {
    kind: "group",
    id,
    placement,
    children: [
      {
        kind: "text",
        id: `${id}.label`,
        center: point(0, 0),
        text: label,
      },
      {
        kind: "rect",
        id: `${id}.frame`,
        fitToText: { textId: `${id}.label`, paddingX: 12, paddingY: 10 },
        rx: 6,
        ry: 6,
      },
    ],
  };
}