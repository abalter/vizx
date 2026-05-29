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

  it("resolves a line object through the normal placement and anchor pipeline", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "rect",
          id: "reference",
          center: point(40, 40),
          width: 40,
          height: 20,
        },
        {
          kind: "line",
          id: "segment",
          start: point(0, 0),
          end: point(60, 0),
          placement: { kind: "rightOf", reference: { objectId: "reference", anchor: "east" }, gap: 10 },
        },
      ],
    };

    const result = resolveScene(scene);
    const reference = result.resolved.objects.find((object) => object.id === "reference");
    const segment = result.resolved.objects.find((object) => object.id === "segment");

    expect(result.diagnostics).toEqual([]);
    expect(segment?.kind).toBe("line");
    expect(segment?.bbox).toEqual({ x: 70, y: 40, width: 60, height: 0 });
    expect(segment?.anchors.center).toEqual(point(100, 40));
    expect(segment?.anchors.west).toEqual(point(70, 40));
    expect(segment?.anchors.east).toEqual(point(130, 40));
    expect(reference?.anchors.east).toEqual(point(60, 40));
  });

  it("resolves a polyline object through the normal placement and anchor pipeline", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "rect",
          id: "reference",
          center: point(50, 50),
          width: 30,
          height: 18,
        },
        {
          kind: "polyline",
          id: "route",
          points: [point(0, 0), point(30, 20), point(60, 5), point(100, 25)],
          placement: { kind: "rightOf", reference: { objectId: "reference", anchor: "east" }, gap: 12 },
        },
      ],
    };

    const result = resolveScene(scene);
    const route = result.resolved.objects.find((object) => object.id === "route");

    expect(result.diagnostics).toEqual([]);
    expect(route?.kind).toBe("polyline");
    expect(route?.bbox).toEqual({ x: 77, y: 37.5, width: 100, height: 25 });
    expect(route?.anchors.center).toEqual(point(127, 50));
    expect(route?.anchors.west).toEqual(point(77, 50));
    expect(route?.anchors.east).toEqual(point(177, 50));
  });

  it("resolves an ellipse object through the normal placement and anchor pipeline", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "rect",
          id: "reference",
          center: point(60, 50),
          width: 40,
          height: 20,
        },
        {
          kind: "ellipse",
          id: "oval",
          center: point(0, 0),
          rx: 25,
          ry: 10,
          placement: { kind: "rightOf", reference: { objectId: "reference", anchor: "east" }, gap: 8 },
        },
      ],
    };

    const result = resolveScene(scene);
    const oval = result.resolved.objects.find((object) => object.id === "oval");

    expect(result.diagnostics).toEqual([]);
    expect(oval?.kind).toBe("ellipse");
    expect(oval?.bbox).toEqual({ x: 88, y: 40, width: 50, height: 20 });
    expect(oval?.anchors.center).toEqual(point(113, 50));
    expect(oval?.anchors.west).toEqual(point(88, 50));
    expect(oval?.anchors.east).toEqual(point(138, 50));
  });

  it("resolves a polygon object through the normal placement and anchor pipeline", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "rect",
          id: "reference",
          center: point(56, 64),
          width: 32,
          height: 24,
        },
        {
          kind: "polygon",
          id: "shape",
          points: [point(0, 20), point(28, 0), point(56, 18), point(42, 42), point(6, 38)],
          placement: { kind: "rightOf", reference: { objectId: "reference", anchor: "east" }, gap: 10 },
        },
      ],
    };

    const result = resolveScene(scene);
    const shape = result.resolved.objects.find((object) => object.id === "shape");

    expect(result.diagnostics).toEqual([]);
    expect(shape?.kind).toBe("polygon");
    expect(shape?.bbox).toEqual({ x: 82, y: 43, width: 56, height: 42 });
    expect(shape?.anchors.center).toEqual(point(110, 64));
    expect(shape?.anchors.north).toEqual(point(110, 43));
    expect(shape?.anchors.south).toEqual(point(110, 85));
    expect(shape?.anchors.west).toEqual(point(82, 64));
    expect(shape?.anchors.east).toEqual(point(138, 64));
  });

  it("resolves a path object with bbox-derived anchors and SVG path commands", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "path",
          id: "shape",
          commands: [
            { kind: "moveTo", point: point(0, 20) },
            { kind: "lineTo", point: point(28, 0) },
            { kind: "lineTo", point: point(56, 18) },
            { kind: "lineTo", point: point(42, 42) },
            { kind: "lineTo", point: point(6, 38) },
            { kind: "closePath" },
          ],
          placement: { kind: "absolute", position: point(82, 43) },
        },
      ],
    };

    const result = resolveScene(scene);
    const shape = result.resolved.objects.find((object) => object.id === "shape");

    expect(result.diagnostics).toEqual([]);
    expect(shape?.kind).toBe("path");
    expect(shape?.bbox).toEqual({ x: 82, y: 43, width: 56, height: 42 });
    expect(shape?.anchors.center).toEqual(point(110, 64));
    expect(shape?.anchors.north).toEqual(point(110, 43));
    expect(shape?.anchors.south).toEqual(point(110, 85));
    expect(shape?.anchors.west).toEqual(point(82, 64));
    expect(shape?.anchors.east).toEqual(point(138, 64));
    expect(shape?.renderNode.kind).toBe("path");
    expect(shape?.renderNode.kind === "path" ? shape.renderNode.d : "").toContain("M 82 63");
    expect(shape?.renderNode.kind === "path" ? shape.renderNode.d : "").toContain("L 138 61");
    expect(shape?.renderNode.kind === "path" ? shape.renderNode.d : "").toContain("Z");
  });

  it("resolves a path with rightOf placement using bbox-derived anchors", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "rect",
          id: "reference",
          center: point(56, 64),
          width: 32,
          height: 24,
        },
        {
          kind: "path",
          id: "shape",
          commands: [
            { kind: "moveTo", point: point(0, 20) },
            { kind: "lineTo", point: point(28, 0) },
            { kind: "lineTo", point: point(56, 18) },
            { kind: "lineTo", point: point(42, 42) },
            { kind: "lineTo", point: point(6, 38) },
            { kind: "closePath" },
          ],
          placement: { kind: "rightOf", reference: { objectId: "reference", anchor: "east" }, gap: 10 },
        },
      ],
    };

    const result = resolveScene(scene);
    const shape = result.resolved.objects.find((object) => object.id === "shape");

    expect(result.diagnostics).toEqual([]);
    expect(shape?.anchors.west).toEqual(point(82, 64));
    expect(shape?.anchors.east).toEqual(point(138, 64));
  });

  it("applies ordered translate and rotate transforms before placement", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "line",
          id: "ordered",
          start: point(0, 0),
          end: point(20, 0),
          transform: [
            { kind: "translate", x: 10, y: 0 },
            { kind: "rotate", angleDegrees: 90, around: point(0, 0) },
          ],
        },
      ],
    };

    const result = resolveScene(scene);
    const ordered = result.resolved.objects.find((object) => object.id === "ordered");

    expect(result.diagnostics).toEqual([]);
    expect(ordered?.bbox.x).toBeCloseTo(0, 8);
    expect(ordered?.bbox.y).toBeCloseTo(10, 8);
    expect(ordered?.bbox.width).toBeCloseTo(0, 8);
    expect(ordered?.bbox.height).toBeCloseTo(20, 8);
    expect(ordered?.anchors.center?.x).toBeCloseTo(0, 8);
    expect(ordered?.anchors.center?.y).toBeCloseTo(20, 8);
    expect(ordered?.renderNode.kind).toBe("line");
    if (ordered?.renderNode.kind === "line") {
      expect(ordered.renderNode.x1).toBeCloseTo(0, 8);
      expect(ordered.renderNode.y1).toBeCloseTo(10, 8);
      expect(ordered.renderNode.x2).toBeCloseTo(0, 8);
      expect(ordered.renderNode.y2).toBeCloseTo(30, 8);
    }
  });

  it("applies scale transforms before placement and uses transformed anchors for downstream placement", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "line",
          id: "A",
          start: point(10, 10),
          end: point(30, 10),
          transform: [{ kind: "scale", sx: 2, sy: 0.5, around: point(10, 10) }],
        },
        {
          kind: "line",
          id: "B",
          start: point(0, 0),
          end: point(20, 0),
          placement: { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 10 },
        },
      ],
    };

    const result = resolveScene(scene);
    const a = result.resolved.objects.find((object) => object.id === "A");
    const b = result.resolved.objects.find((object) => object.id === "B");

    expect(result.diagnostics).toEqual([]);
    expect(a?.bbox).toEqual({ x: 10, y: 10, width: 40, height: 0 });
    expect(a?.anchors.east).toEqual(point(50, 10));
    expect(b?.anchors.west).toEqual(point(60, 10));
  });

  it("preserves ordered transform semantics when scale composes with translate and rotate", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "line",
          id: "ordered-scale",
          start: point(2, 1),
          end: point(4, 1),
          transform: [
            { kind: "translate", x: 1, y: -1 },
            { kind: "rotate", angleDegrees: 90, around: point(0, 0) },
            { kind: "scale", sx: 2, sy: 0.5, around: point(0, 0) },
          ],
        },
      ],
    };

    const result = resolveScene(scene);
    const ordered = result.resolved.objects.find((object) => object.id === "ordered-scale");

    expect(result.diagnostics).toEqual([]);
    expect(ordered?.renderNode.kind).toBe("line");
    if (ordered?.renderNode.kind === "line") {
      expect(ordered.renderNode.x1).toBeCloseTo(0, 8);
      expect(ordered.renderNode.y1).toBeCloseTo(1.5, 8);
      expect(ordered.renderNode.x2).toBeCloseTo(0, 8);
      expect(ordered.renderNode.y2).toBeCloseTo(2.5, 8);
    }
  });

  it("allows transformed objects to participate in placement and connector anchor resolution", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "line",
          id: "A",
          start: point(0, 0),
          end: point(40, 0),
          transform: [
            { kind: "translate", x: 60, y: 80 },
            { kind: "rotate", angleDegrees: 30, around: point(60, 80) },
          ],
        },
        {
          kind: "polygon",
          id: "B",
          points: [point(0, 16), point(22, 0), point(52, 12), point(40, 36), point(6, 30)],
          transform: [{ kind: "rotate", angleDegrees: -18, around: point(26, 16) }],
          placement: { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 20 },
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "A-B",
          from: { objectId: "A", anchor: "east" },
          to: { objectId: "B", anchor: "west" },
        },
      ],
    };

    const result = resolveScene(scene);
    const a = result.resolved.objects.find((object) => object.id === "A");
    const b = result.resolved.objects.find((object) => object.id === "B");
    const connector = result.resolved.connectors.find((entry) => entry.id === "A-B");

    expect(result.diagnostics).toEqual([]);
    expect(a?.anchors.east).toBeDefined();
    expect(b?.anchors.west).toBeDefined();
    expect(b?.anchors.west?.x).toBeGreaterThan(a?.anchors.east?.x ?? 0);
    expect(connector?.start).toEqual(a?.anchors.east);
    expect(connector?.end).toEqual(b?.anchors.west);
  });

  it("emits diagnostics for unsupported rotate targets and non-finite transform values", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "text",
          id: "text",
          center: point(0, 0),
          text: "Not rotated",
          transform: [{ kind: "rotate", angleDegrees: 35 }],
        },
        {
          kind: "line",
          id: "bad-translate",
          start: point(0, 0),
          end: point(20, 0),
          transform: [{ kind: "translate", x: Number.NaN, y: 10 }],
        },
        {
          kind: "line",
          id: "bad-scale",
          start: point(0, 0),
          end: point(20, 0),
          transform: [{ kind: "scale", sx: Number.POSITIVE_INFINITY, sy: 1 }],
        },
        {
          kind: "text",
          id: "text-scale",
          center: point(10, 10),
          text: "Not scaled",
          transform: [{ kind: "scale", sx: 2 }],
        },
      ],
    };

    const result = resolveScene(scene);
    const messages = result.diagnostics.map((diagnostic) => diagnostic.message);

    expect(messages.some((message) => message.includes("rotation is not supported"))).toBe(true);
    expect(messages.some((message) => message.includes("translate requires finite x/y"))).toBe(true);
    expect(messages.some((message) => message.includes("scale requires finite sx/sy"))).toBe(true);
    expect(messages.some((message) => message.includes("scaling is not supported"))).toBe(true);
  });

  it("reports invalid path diagnostics for empty commands and no explicit points", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "path",
          id: "empty",
          commands: [],
        },
        {
          kind: "path",
          id: "close-only",
          commands: [{ kind: "closePath" }],
        },
      ],
    };

    const result = resolveScene(scene);
    const messages = result.diagnostics.map((diagnostic) => diagnostic.message);

    expect(messages.some((message) => message.includes("Path empty must include at least one command"))).toBe(true);
    expect(messages.some((message) => message.includes("Path empty must include at least one explicit point"))).toBe(true);
    expect(messages.some((message) => message.includes("Path close-only must include at least one explicit point"))).toBe(true);
    expect(messages.some((message) => message.includes("Path close-only cannot use closePath before moveTo"))).toBe(true);
  });

  it("reports invalid path diagnostics for no drawable segment and bad command ordering", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "path",
          id: "move-only",
          commands: [{ kind: "moveTo", point: point(10, 10) }],
        },
        {
          kind: "path",
          id: "line-before-move",
          commands: [{ kind: "lineTo", point: point(20, 20) }],
        },
      ],
    };

    const result = resolveScene(scene);
    const messages = result.diagnostics.map((diagnostic) => diagnostic.message);

    expect(messages.some((message) => message.includes("Path move-only must include at least one drawable segment"))).toBe(true);
    expect(messages.some((message) => message.includes("Path line-before-move cannot use lineTo before moveTo"))).toBe(true);
    expect(messages.some((message) => message.includes("Path line-before-move must include at least one drawable segment"))).toBe(true);
  });

  it("reports a diagnostic for polygons with fewer than three points", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "polygon",
          id: "degenerate",
          points: [point(0, 0), point(10, 5)],
        },
      ],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes("at least 3 points"))).toBe(true);
  });

  it("preserves explicit primitive style and applies default stroke style where missing", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "line",
          id: "styled-line",
          start: point(0, 0),
          end: point(40, 0),
          style: { stroke: "#ef4444", strokeWidth: 2 },
        },
        {
          kind: "ellipse",
          id: "default-ellipse",
          center: point(60, 20),
          rx: 12,
          ry: 8,
        },
        {
          kind: "polygon",
          id: "styled-polygon",
          points: [point(0, 40), point(15, 10), point(30, 40)],
          style: { stroke: "#0f766e", strokeWidth: 3 },
        },
      ],
    };

    const result = resolveScene(scene);
    const line = result.resolved.objects.find((object) => object.id === "styled-line");
    const ellipse = result.resolved.objects.find((object) => object.id === "default-ellipse");
    const polygon = result.resolved.objects.find((object) => object.id === "styled-polygon");

    expect(result.diagnostics).toEqual([]);
    expect(line?.renderNode.style?.stroke).toBe("#ef4444");
    expect(line?.renderNode.style?.strokeWidth).toBe(2);
    expect(ellipse?.renderNode.style?.stroke).toBe("black");
    expect(ellipse?.renderNode.style?.fill).toBe("none");
    expect(ellipse?.renderNode.style?.strokeWidth).toBe(1);
    expect(polygon?.renderNode.style?.stroke).toBe("#0f766e");
    expect(polygon?.renderNode.style?.strokeWidth).toBe(3);
    expect(polygon?.renderNode.style?.fill).toBe("none");
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

  it("distributeX evenly spaces center.x across ordered objects while preserving first/last center.x", () => {
    const baselineScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 150) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "First" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "B",
          placement: { kind: "below", reference: { objectId: "A", anchor: "south" }, gap: 52 },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Middle" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "C",
          placement: { kind: "absolute", position: point(420, 190) },
          children: [
            { kind: "text", id: "C.label", center: point(0, 0), text: "Last" },
            { kind: "rect", id: "C.frame", fitToText: { textId: "C.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "a-b", from: { objectId: "A", anchor: "center" }, to: { objectId: "B", anchor: "center" } },
        { kind: "connector", id: "b-c", from: { objectId: "B", anchor: "center" }, to: { objectId: "C", anchor: "center" } },
      ],
    };

    const scene: ObjectScene = {
      ...baselineScene,
      distribution: [{ relation: "distributeX", objectIds: ["A", "B", "C"] }],
    };

    const baseline = resolveScene(baselineScene);
    const result = resolveScene(scene);
    const baselineA = requireResolvedObject(baseline, "A");
    const baselineB = requireResolvedObject(baseline, "B");
    const baselineC = requireResolvedObject(baseline, "C");
    const a = requireResolvedObject(result, "A");
    const b = requireResolvedObject(result, "B");
    const c = requireResolvedObject(result, "C");
    const baselineBFrame = baselineB.children?.find((child) => child.id === "B.frame");
    const bFrame = b.children?.find((child) => child.id === "B.frame");
    const aToB = result.resolved.connectors.find((connector) => connector.id === "a-b");
    const bToC = result.resolved.connectors.find((connector) => connector.id === "b-c");

    const expectedB = ((a.anchors.center?.x ?? 0) + (c.anchors.center?.x ?? 0)) / 2;
    const appliedDx = (b.anchors.center?.x ?? 0) - (baselineB.anchors.center?.x ?? 0);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(a.anchors.center?.x).toBe(baselineA.anchors.center?.x);
    expect(c.anchors.center?.x).toBe(baselineC.anchors.center?.x);
    expect(b.anchors.center?.x).not.toBe(baselineB.anchors.center?.x);
    expect(b.anchors.center?.x).toBeCloseTo(expectedB, 8);
    expect(b.anchors.center?.y).toBe(baselineB.anchors.center?.y);

    expect(bFrame?.geometry?.x).toBe(bFrame?.bbox.x);
    expect(bFrame?.geometry?.y).toBe(bFrame?.bbox.y);
    expect(b.anchors.west?.x).toBeCloseTo(b.bbox.x, 8);
    expect(b.anchors.east?.x).toBeCloseTo(b.bbox.x + b.bbox.width, 8);
    expect(b.anchors.north?.y).toBeCloseTo(b.bbox.y, 8);
    expect(b.anchors.south?.y).toBeCloseTo(b.bbox.y + b.bbox.height, 8);

    expect(bFrame?.anchors.center?.x).toBeCloseTo((baselineBFrame?.anchors.center?.x ?? 0) + appliedDx, 8);
    expect(bFrame?.anchors.center?.y).toBeCloseTo(baselineBFrame?.anchors.center?.y ?? 0, 8);

    expect(aToB?.start).toEqual(a.anchors.center);
    expect(aToB?.end).toEqual(b.anchors.center);
    expect(bToC?.start).toEqual(b.anchors.center);
    expect(bToC?.end).toEqual(c.anchors.center);
  });

  it("distributeY evenly spaces center.y across ordered objects while preserving first/last center.y", () => {
    const baselineScene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Top",
          placement: { kind: "absolute", position: point(200, 90) },
          children: [
            { kind: "text", id: "Top.label", center: point(0, 0), text: "Top" },
            { kind: "rect", id: "Top.frame", fitToText: { textId: "Top.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Middle",
          placement: { kind: "rightOf", reference: { objectId: "Top", anchor: "east" }, gap: 74 },
          children: [
            { kind: "text", id: "Middle.label", center: point(0, 0), text: "Middle" },
            { kind: "rect", id: "Middle.frame", fitToText: { textId: "Middle.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Bottom",
          placement: { kind: "absolute", position: point(280, 360) },
          children: [
            { kind: "text", id: "Bottom.label", center: point(0, 0), text: "Bottom" },
            { kind: "rect", id: "Bottom.frame", fitToText: { textId: "Bottom.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "top-middle", from: { objectId: "Top", anchor: "center" }, to: { objectId: "Middle", anchor: "center" } },
        { kind: "connector", id: "middle-bottom", from: { objectId: "Middle", anchor: "center" }, to: { objectId: "Bottom", anchor: "center" } },
      ],
    };

    const scene: ObjectScene = {
      ...baselineScene,
      distribution: [{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }],
    };

    const baseline = resolveScene(baselineScene);
    const result = resolveScene(scene);
    const baselineTop = requireResolvedObject(baseline, "Top");
    const baselineMiddle = requireResolvedObject(baseline, "Middle");
    const baselineBottom = requireResolvedObject(baseline, "Bottom");
    const top = requireResolvedObject(result, "Top");
    const middle = requireResolvedObject(result, "Middle");
    const bottom = requireResolvedObject(result, "Bottom");
    const baselineMiddleFrame = baselineMiddle.children?.find((child) => child.id === "Middle.frame");
    const middleFrame = middle.children?.find((child) => child.id === "Middle.frame");
    const topToMiddle = result.resolved.connectors.find((connector) => connector.id === "top-middle");
    const middleToBottom = result.resolved.connectors.find((connector) => connector.id === "middle-bottom");

    const expectedMiddle = ((top.anchors.center?.y ?? 0) + (bottom.anchors.center?.y ?? 0)) / 2;
    const appliedDy = (middle.anchors.center?.y ?? 0) - (baselineMiddle.anchors.center?.y ?? 0);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(top.anchors.center?.y).toBe(baselineTop.anchors.center?.y);
    expect(bottom.anchors.center?.y).toBe(baselineBottom.anchors.center?.y);
    expect(middle.anchors.center?.y).not.toBe(baselineMiddle.anchors.center?.y);
    expect(middle.anchors.center?.y).toBeCloseTo(expectedMiddle, 8);
    expect(middle.anchors.center?.x).toBe(baselineMiddle.anchors.center?.x);

    expect(middleFrame?.geometry?.x).toBe(middleFrame?.bbox.x);
    expect(middleFrame?.geometry?.y).toBe(middleFrame?.bbox.y);
    expect(middle.anchors.west?.x).toBeCloseTo(middle.bbox.x, 8);
    expect(middle.anchors.east?.x).toBeCloseTo(middle.bbox.x + middle.bbox.width, 8);
    expect(middle.anchors.north?.y).toBeCloseTo(middle.bbox.y, 8);
    expect(middle.anchors.south?.y).toBeCloseTo(middle.bbox.y + middle.bbox.height, 8);

    expect(middleFrame?.anchors.center?.y).toBeCloseTo((baselineMiddleFrame?.anchors.center?.y ?? 0) + appliedDy, 8);
    expect(middleFrame?.anchors.center?.x).toBeCloseTo(baselineMiddleFrame?.anchors.center?.x ?? 0, 8);

    expect(topToMiddle?.start).toEqual(top.anchors.center);
    expect(topToMiddle?.end).toEqual(middle.anchors.center);
    expect(middleToBottom?.start).toEqual(middle.anchors.center);
    expect(middleToBottom?.end).toEqual(bottom.anchors.center);
  });

  it("reports a diagnostic when distributeX references a missing object id", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 150) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "First" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "C",
          placement: { kind: "absolute", position: point(420, 190) },
          children: [
            { kind: "text", id: "C.label", center: point(0, 0), text: "Last" },
            { kind: "rect", id: "C.frame", fitToText: { textId: "C.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeX", objectIds: ["A", "Missing", "C"] }],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeX: missing object Missing",
    });
  });

  it("reports a diagnostic when distributeX has fewer than two object ids", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 150) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "Only" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeX", objectIds: ["A"] }],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeX: expected at least 2 object ids",
    });
  });

  it("reports a diagnostic when distributeX has duplicate object ids", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 150) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "First" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "B",
          placement: { kind: "absolute", position: point(300, 190) },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Second" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeX", objectIds: ["A", "B", "A"] }],
    };

    const run = () => resolveScene(scene);

    expect(run).not.toThrow();

    const result = run();

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeX: duplicate object id A",
    });
  });

  it("reports a diagnostic when distributeY references a missing object id", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Top",
          placement: { kind: "absolute", position: point(200, 90) },
          children: [
            { kind: "text", id: "Top.label", center: point(0, 0), text: "Top" },
            { kind: "rect", id: "Top.frame", fitToText: { textId: "Top.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Bottom",
          placement: { kind: "absolute", position: point(280, 360) },
          children: [
            { kind: "text", id: "Bottom.label", center: point(0, 0), text: "Bottom" },
            { kind: "rect", id: "Bottom.frame", fitToText: { textId: "Bottom.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Top", "Missing", "Bottom"] }],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeY: missing object Missing",
    });
  });

  it("reports a diagnostic when distributeY has fewer than two object ids", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Top",
          placement: { kind: "absolute", position: point(200, 90) },
          children: [
            { kind: "text", id: "Top.label", center: point(0, 0), text: "Top" },
            { kind: "rect", id: "Top.frame", fitToText: { textId: "Top.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Top"] }],
    };

    const result = resolveScene(scene);

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeY: expected at least 2 object ids",
    });
  });

  it("reports a diagnostic when distributeY has duplicate object ids", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Top",
          placement: { kind: "absolute", position: point(200, 90) },
          children: [
            { kind: "text", id: "Top.label", center: point(0, 0), text: "Top" },
            { kind: "rect", id: "Top.frame", fitToText: { textId: "Top.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Bottom",
          placement: { kind: "absolute", position: point(280, 360) },
          children: [
            { kind: "text", id: "Bottom.label", center: point(0, 0), text: "Bottom" },
            { kind: "rect", id: "Bottom.frame", fitToText: { textId: "Bottom.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Top", "Bottom", "Top"] }],
    };

    const run = () => resolveScene(scene);

    expect(run).not.toThrow();

    const result = run();

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Could not distributeY: duplicate object id Top",
    });
  });

  it("reports a diagnostic when an unsupported distribution relation is provided", () => {
    const scene = {
      objects: [
        {
          kind: "group",
          id: "A",
          placement: { kind: "absolute", position: point(120, 150) },
          children: [
            { kind: "text", id: "A.label", center: point(0, 0), text: "Only" },
            { kind: "rect", id: "A.frame", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      distribution: [{ relation: "distributeZ" as never, objectIds: ["A"] }],
    } as unknown as ObjectScene;

    const run = () => resolveScene(scene);

    expect(run).not.toThrow();

    const result = run();

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Unsupported distribution relation distributeZ",
    });
  });

  it("reports a diagnostic when an unsupported placement relation is provided", () => {
    const scene = {
      objects: [
        {
          kind: "group",
          id: "B",
          placement: { kind: "diagonalOf" as never, reference: { objectId: "B", anchor: "west" }, gap: 32 },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Target" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    } as unknown as ObjectScene;

    const run = () => resolveScene(scene);

    expect(run).not.toThrow();

    const result = run();

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Unsupported placement relation diagonalOf for B",
    });
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
          align: { relation: "alignDiagonal" as never, reference: { objectId: "B", anchor: "west" } },
          children: [
            { kind: "text", id: "B.label", center: point(0, 0), text: "Target" },
            { kind: "rect", id: "B.frame", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
    } as unknown as ObjectScene;

    const run = () => resolveScene(scene);

    expect(run).not.toThrow();

    const result = run();

    expect(result.diagnostics).toContainEqual({
      severity: "error",
      message: "Unsupported alignment relation alignDiagonal for B",
    });
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