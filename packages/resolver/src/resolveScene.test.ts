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

  it("supports rightOf, leftOf, above, and below placements with scene-space anchors", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Center",
          placement: { kind: "absolute", position: point(160, 120) },
          children: [
            { kind: "text", id: "Center.label", center: point(0, 0), text: "Center" },
            { kind: "rect", id: "Center.frame", fitToText: { textId: "Center.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Right",
          placement: { kind: "rightOf", reference: { objectId: "Center", anchor: "east" }, gap: 40 },
          children: [
            { kind: "text", id: "Right.label", center: point(0, 0), text: "Right" },
            { kind: "rect", id: "Right.frame", fitToText: { textId: "Right.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Left",
          placement: { kind: "leftOf", reference: { objectId: "Center", anchor: "west" }, gap: 50 },
          children: [
            { kind: "text", id: "Left.label", center: point(0, 0), text: "Left" },
            { kind: "rect", id: "Left.frame", fitToText: { textId: "Left.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Above",
          placement: { kind: "above", reference: { objectId: "Center", anchor: "north" }, gap: 36 },
          children: [
            { kind: "text", id: "Above.label", center: point(0, 0), text: "Above" },
            { kind: "rect", id: "Above.frame", fitToText: { textId: "Above.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Below",
          placement: { kind: "below", reference: { objectId: "Center", anchor: "south" }, gap: 44 },
          children: [
            { kind: "text", id: "Below.label", center: point(0, 0), text: "Below" },
            { kind: "rect", id: "Below.frame", fitToText: { textId: "Below.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "edge-right", from: { objectId: "Center", anchor: "east" }, to: { objectId: "Right", anchor: "west" } },
        { kind: "connector", id: "edge-left", from: { objectId: "Center", anchor: "west" }, to: { objectId: "Left", anchor: "east" } },
        { kind: "connector", id: "edge-above", from: { objectId: "Center", anchor: "north" }, to: { objectId: "Above", anchor: "south" } },
        { kind: "connector", id: "edge-below", from: { objectId: "Center", anchor: "south" }, to: { objectId: "Below", anchor: "north" } },
      ],
    };

    const result = resolveScene(scene);
    const center = requireResolvedObject(result, "Center");
    const right = requireResolvedObject(result, "Right");
    const left = requireResolvedObject(result, "Left");
    const above = requireResolvedObject(result, "Above");
    const below = requireResolvedObject(result, "Below");

    expect(result.diagnostics).toEqual([]);
    expect(right.anchors.west?.x).toBe(center.anchors.east!.x + 40);
    expect(right.anchors.west?.y).toBe(center.anchors.east!.y);
    expect(left.anchors.east?.x).toBe(center.anchors.west!.x - 50);
    expect(left.anchors.east?.y).toBe(center.anchors.west!.y);
    expect(above.anchors.south?.y).toBe(center.anchors.north!.y - 36);
    expect(above.anchors.south?.x).toBe(center.anchors.north!.x);
    expect(below.anchors.north?.y).toBe(center.anchors.south!.y + 44);
    expect(below.anchors.north?.x).toBe(center.anchors.south!.x);

    const rightConnector = result.resolved.connectors.find((connector) => connector.id === "edge-right");
    const aboveConnector = result.resolved.connectors.find((connector) => connector.id === "edge-above");

    expect(rightConnector?.end).toEqual(right.anchors.west);
    expect(aboveConnector?.end).toEqual(above.anchors.south);

    const aboveChild = above.children?.find((child) => child.id === "Above.frame");
    const belowChild = below.children?.find((child) => child.id === "Below.label");

    expect(aboveChild?.bbox.y).toBe(aboveChild?.geometry?.y);
    expect(belowChild?.anchors.center?.y).toBeGreaterThan(center.anchors.south!.y);
    expect(aboveChild?.bbox.y).toBeLessThan(center.bbox.y);
  });

  it("reports a diagnostic when a relative placement reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          placement: { kind: "leftOf", reference: { objectId: "Missing", anchor: "west" }, gap: 32 },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Orphan" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toEqual([
      {
        severity: "error",
        message: "Could not place B: missing reference object Missing",
      },
    ]);
  });
});

function requireResolvedObject(result: ReturnType<typeof resolveScene>, id: string) {
  const object = result.resolved.objects.find((entry) => entry.id === id);

  if (!object) {
    throw new Error(`Expected resolved object ${id}`);
  }

  return object;
}