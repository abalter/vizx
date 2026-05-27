import { describe, expect, it } from "vitest";
import { point } from "@vizx/geometry";
import type { AnchorName, ObjectScene } from "@vizx/object-model";
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

  it("applies alignY after placement by matching target center.y to the reference center.y", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Center",
          placement: { kind: "absolute", position: point(200, 140) },
          children: [
            { kind: "text", id: "Center.label", center: point(0, 0), text: "Center" },
            { kind: "rect", id: "Center.frame", fitToText: { textId: "Center.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "below", reference: { objectId: "Center", anchor: "south" }, gap: 40 },
          align: { relation: "alignY", reference: { objectId: "Center", anchor: "center" } },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "edge-center-target", from: { objectId: "Center", anchor: "south" }, to: { objectId: "Target", anchor: "north" } },
      ],
    };

    const result = resolveScene(scene);
    const center = requireResolvedObject(result, "Center");
    const target = requireResolvedObject(result, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");

    expect(result.diagnostics).toEqual([]);
    expect(target.anchors.center?.y).toBe(center.anchors.center?.y);
    expect(target.anchors.center?.x).toBe(center.anchors.center?.x);
    expect(target.anchors.north?.y).toBeLessThan(center.anchors.south!.y);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.y).toBe(target.anchors.center?.y);
    expect(result.resolved.connectors[0]?.end).toEqual(target.anchors.north);
  });

  it("alignY can match target center.y to a reference north anchor", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-center", from: { objectId: "Reference", anchor: "north" }, to: { objectId: "Target", anchor: "center" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignY", reference: { objectId: "Reference", anchor: "north" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-center");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.center?.y).toBe(reference.anchors.north?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.y).toBe(target.anchors.center?.y);
    expect(connector?.end).toEqual(target.anchors.center);
  });

  it("alignY can match target center.y to a reference south anchor", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 52 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-south", from: { objectId: "Reference", anchor: "south" }, to: { objectId: "Target", anchor: "south" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignY", reference: { objectId: "Reference", anchor: "south" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-south");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.center?.y).toBe(reference.anchors.south?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.y).toBe(target.anchors.center?.y);
    expect(connector?.end).toEqual(target.anchors.south);
  });

  it("alignY can match target center.y to a reference east anchor", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-east", from: { objectId: "Reference", anchor: "east" }, to: { objectId: "Target", anchor: "east" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignY", reference: { objectId: "Reference", anchor: "east" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-east");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.center?.y).toBe(reference.anchors.east?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.y).toBe(target.anchors.center?.y);
    expect(connector?.end).toEqual(target.anchors.east);
  });

  it("alignY can match target center.y to a reference west anchor", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 52 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-west", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "Target", anchor: "west" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignY", reference: { objectId: "Reference", anchor: "west" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-west");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.center?.y).toBe(reference.anchors.west?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.y).toBe(target.anchors.center?.y);
    expect(connector?.end).toEqual(target.anchors.west);
  });

  it("alignX can match target center.x to a reference center anchor", () => {
    assertAlignXAgainstReferenceAnchor("center");
  });

  it("alignX can match target center.x to a reference north anchor", () => {
    assertAlignXAgainstReferenceAnchor("north");
  });

  it("alignX can match target center.x to a reference south anchor", () => {
    assertAlignXAgainstReferenceAnchor("south");
  });

  it("alignX can match target center.x to a reference east anchor", () => {
    assertAlignXAgainstReferenceAnchor("east");
  });

  it("alignX can match target center.x to a reference west anchor", () => {
    assertAlignXAgainstReferenceAnchor("west");
  });

  it("alignLeft can match target west.x to a reference west.x", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-left", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "Target", anchor: "west" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignLeft", reference: { objectId: "Reference", anchor: "west" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-left");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.west?.x).toBe(reference.anchors.west?.x);
    expect(target.anchors.center?.y).toBe(unalignedTarget.anchors.center?.y);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.west?.x).toBe(target.anchors.west?.x);
    expect(connector?.end).toEqual(target.anchors.west);
  });

  it("alignRight can match target east.x to a reference east.x", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-right", from: { objectId: "Reference", anchor: "east" }, to: { objectId: "Target", anchor: "east" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignRight", reference: { objectId: "Reference", anchor: "east" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-right");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.east?.x).toBe(reference.anchors.east?.x);
    expect(target.anchors.center?.y).toBe(unalignedTarget.anchors.center?.y);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.east?.x).toBe(target.anchors.east?.x);
    expect(connector?.end).toEqual(target.anchors.east);
  });

  it("alignTop can match target north.y to a reference north.y", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-top", from: { objectId: "Reference", anchor: "north" }, to: { objectId: "Target", anchor: "north" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignTop", reference: { objectId: "Reference", anchor: "north" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-top");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.north?.y).toBe(reference.anchors.north?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.north?.y).toBe(target.anchors.north?.y);
    expect(connector?.end).toEqual(target.anchors.north);
  });

  it("alignBottom can match target south.y to a reference south.y", () => {
    const unalignedScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: point(220, 170) },
          children: [
            { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "above", reference: { objectId: "Reference", anchor: "north" }, gap: 56 },
          children: [
            {
              kind: "group",
              id: "Target.inner",
              children: [
                { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
                { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
              ],
            },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-bottom", from: { objectId: "Reference", anchor: "south" }, to: { objectId: "Target", anchor: "south" } },
      ],
    };

    const alignedScene: ObjectScene = {
      ...unalignedScene,
      objects: unalignedScene.objects.map((object) => {
        if (object.id !== "Target") {
          return object;
        }

        return {
          ...object,
          align: { relation: "alignBottom", reference: { objectId: "Reference", anchor: "south" } },
        };
      }),
    };

    const unaligned = resolveScene(unalignedScene);
    const aligned = resolveScene(alignedScene);
    const reference = requireResolvedObject(aligned, "Reference");
    const target = requireResolvedObject(aligned, "Target");
    const unalignedTarget = requireResolvedObject(unaligned, "Target");
    const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
    const connector = aligned.resolved.connectors.find((entry) => entry.id === "reference-to-target-bottom");

    expect(aligned.diagnostics).toEqual([]);
    expect(target.anchors.south?.y).toBe(reference.anchors.south?.y);
    expect(target.anchors.center?.x).toBe(unalignedTarget.anchors.center?.x);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.south?.y).toBe(target.anchors.south?.y);
    expect(connector?.end).toEqual(target.anchors.south);
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

  it("reports a diagnostic when an alignY reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignY", reference: { objectId: "Missing", anchor: "center" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an alignY reference anchor is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 80) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "Center" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "B",
          align: { relation: "alignY", reference: { objectId: "A", anchor: "baseline" } },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Target" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toEqual([
      {
        severity: "error",
        message: "Could not align B: missing reference anchor A.baseline",
      },
    ]);
  });

  it("reports a diagnostic when an alignX reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignX", reference: { objectId: "Missing", anchor: "center" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an alignX reference anchor is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 80) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "Center" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "B",
          align: { relation: "alignX", reference: { objectId: "A", anchor: "baseline" } },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Target" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toEqual([
      {
        severity: "error",
        message: "Could not align B: missing reference anchor A.baseline",
      },
    ]);
  });

  it("reports a diagnostic when an alignLeft reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignLeft", reference: { objectId: "Missing", anchor: "west" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an alignRight reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignRight", reference: { objectId: "Missing", anchor: "east" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an alignTop reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignTop", reference: { objectId: "Missing", anchor: "north" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an alignBottom reference object is missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignBottom", reference: { objectId: "Missing", anchor: "south" } },
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
        message: "Could not align B: missing reference object Missing",
      },
    ]);
  });

  it("reports a diagnostic when an unsupported alignment relation is provided", () => {
    const scene = {
      objects: [
        {
          kind: "group",
          id: "B",
          align: { relation: "alignUnknown", reference: { objectId: "B", anchor: "west" } },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Target" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    } as unknown as ObjectScene;

    const result = resolveScene(scene);

    expect(result.diagnostics).toEqual([
      {
        severity: "error",
        message: "Unsupported alignment relation alignUnknown for B",
      },
    ]);
  });
});

function assertAlignXAgainstReferenceAnchor(referenceAnchor: AnchorName): void {
  const unalignedScene: ObjectScene = {
    objects: [
      {
        kind: "group",
        id: "Reference",
        placement: { kind: "absolute", position: point(220, 170) },
        children: [
          { kind: "text", id: "Reference.label", center: point(0, 0), text: "Reference" },
          { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
        ],
      },
      {
        kind: "group",
        id: "Target",
        placement: { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 48 },
        children: [
          {
            kind: "group",
            id: "Target.inner",
            children: [
              { kind: "text", id: "Target.inner.label", center: point(0, 0), text: "Target" },
              { kind: "rect", id: "Target.inner.frame", fitToText: { textId: "Target.inner.label", paddingX: 14, paddingY: 10 }, rx: 8, ry: 8 },
            ],
          },
        ],
      },
    ],
    connectors: [
      {
        kind: "connector",
        id: `reference-to-target-${referenceAnchor}-x`,
        from: { objectId: "Reference", anchor: referenceAnchor },
        to: { objectId: "Target", anchor: "center" },
      },
    ],
  };

  const alignedScene: ObjectScene = {
    ...unalignedScene,
    objects: unalignedScene.objects.map((object) => {
      if (object.id !== "Target") {
        return object;
      }

      return {
        ...object,
        align: { relation: "alignX", reference: { objectId: "Reference", anchor: referenceAnchor } },
      };
    }),
  };

  const unaligned = resolveScene(unalignedScene);
  const aligned = resolveScene(alignedScene);
  const reference = requireResolvedObject(aligned, "Reference");
  const target = requireResolvedObject(aligned, "Target");
  const unalignedTarget = requireResolvedObject(unaligned, "Target");
  const nestedGroup = target.children?.find((child) => child.id === "Target.inner");
  const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Target.inner.frame");
  const connector = aligned.resolved.connectors.find((entry) => entry.id === `reference-to-target-${referenceAnchor}-x`);
  const expectedReference = reference.anchors[referenceAnchor];

  expect(aligned.diagnostics).toEqual([]);
  expect(expectedReference?.x).toBeDefined();
  expect(target.anchors.center?.x).toBe(expectedReference?.x);
  expect(target.anchors.center?.y).toBe(unalignedTarget.anchors.center?.y);
  expect(nestedGroup?.children?.length).toBeGreaterThan(0);
  expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
  expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
  expect(nestedFrame?.anchors.center?.x).toBe(target.anchors.center?.x);
  expect(connector?.end).toEqual(target.anchors.center);
}

function requireResolvedObject(result: ReturnType<typeof resolveScene>, id: string) {
  const object = result.resolved.objects.find((entry) => entry.id === id);

  if (!object) {
    throw new Error(`Expected resolved object ${id}`);
  }

  return object;
}