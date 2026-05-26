import { describe, expect, it } from "vitest";
import { point } from "@vizx/geometry";
import type { ObjectScene } from "@vizx/object-model";
import { resolveScene } from "./resolveScene";

describe("resolveScene", () => {
  it("resolves group anchors for a label box", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(100, 80) },
          children: [
            {
              kind: "text",
              id: "A.label",
              center: point(0, 0),
              text: "Raw data",
            },
            {
              kind: "rect",
              id: "A.frame",
              fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 },
              rx: 6,
              ry: 6,
            },
          ],
        },
      ],
    };

    const result = resolveScene(scene);
    const group = result.resolved.objects[0];

    expect(result.diagnostics).toEqual([]);
    expect(group?.anchors.center).toEqual(point(100, 80));
    expect(group?.anchors.east?.x).toBeGreaterThan(100);
    expect(group?.anchors.west?.x).toBeLessThan(100);
  });

  it("places two groups with a connector using anchor references", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(80, 60) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "Raw data" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "B",
          placement: { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 80 },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Clean" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "edge-1",
          from: { objectId: "A", anchor: "east" },
          to: { objectId: "B", anchor: "west" },
        },
      ],
    };

    const result = resolveScene(scene);
    const connector = result.resolved.connectors[0];
    const a = result.resolved.objects.find((object) => object.id === "A");
    const b = result.resolved.objects.find((object) => object.id === "B");

    expect(result.diagnostics).toEqual([]);
    expect(a?.anchors.east).toEqual(connector?.start);
    expect(b?.anchors.west).toEqual(connector?.end);
    expect(result.renderScene.children.some((child) => child.kind === "path")).toBe(true);
  });
});