import { describe, expect, it } from "vitest";
import { lowerAstToObjectScene, type VizxAstScene } from "./index";

describe("lowerAstToObjectScene", () => {
  it("lowers a direct scene AST into ObjectScene", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        {
          kind: "group",
          id: "Center",
          placement: { kind: "absolute", position: { x: 180, y: 120 } },
          children: [
            {
              kind: "text",
              id: "Center.label",
              center: { x: 0, y: 0 },
              text: "Center",
            },
            {
              kind: "rect",
              id: "Center.frame",
              fitToText: { textId: "Center.label", paddingX: 12, paddingY: 10 },
              rx: 6,
              ry: 6,
            },
          ],
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "self",
          from: { objectId: "Center", anchor: "east" },
          to: { objectId: "Center", anchor: "west" },
        },
      ],
    };

    const scene = lowerAstToObjectScene(ast);

    expect(scene.objects.map((object) => object.id)).toEqual(["Center"]);
    expect(scene.objects[0]?.placement?.kind).toBe("absolute");
    expect(scene.connectors?.map((connector) => connector.id)).toEqual(["self"]);
  });

  it("throws a clear error for unsupported AST object kinds", () => {
    const ast = {
      kind: "scene",
      objects: [
        {
          id: "bad",
          kind: "triangle",
        },
      ],
    } as unknown as VizxAstScene;

    expect(() => lowerAstToObjectScene(ast)).toThrow("Unsupported AST object kind: triangle");
  });

  it("lowers alignX on an AST object into ObjectScene align", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: { x: 180, y: 120 } },
          children: [],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 40 },
          align: { relation: "alignX", reference: { objectId: "Reference", anchor: "center" } },
          children: [],
        },
      ],
    };

    const scene = lowerAstToObjectScene(ast);
    const target = scene.objects.find((object) => object.id === "Target");

    expect(target?.align).toEqual({
      relation: "alignX",
      reference: { objectId: "Reference", anchor: "center" },
    });
  });

  it("lowers edge alignment relations such as alignLeft", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: { x: 180, y: 120 } },
          children: [],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 16 },
          align: { relation: "alignLeft", reference: { objectId: "Reference", anchor: "west" } },
          children: [],
        },
      ],
    };

    const scene = lowerAstToObjectScene(ast);
    const target = scene.objects.find((object) => object.id === "Target");

    expect(target?.align).toEqual({
      relation: "alignLeft",
      reference: { objectId: "Reference", anchor: "west" },
    });
  });

  it("throws a clear error for unsupported alignment relations", () => {
    const ast = {
      kind: "scene",
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: { x: 180, y: 120 } },
          children: [],
        },
        {
          kind: "group",
          id: "Target",
          align: { relation: "alignDiagonal", reference: { objectId: "Reference", anchor: "center" } },
          children: [],
        },
      ],
    } as unknown as VizxAstScene;

    expect(() => lowerAstToObjectScene(ast)).toThrow("Unsupported AST alignment relation: alignDiagonal");
  });

  it("lowers distributeX into ObjectScene distribution", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        { kind: "group", id: "A", children: [] },
        { kind: "group", id: "B", children: [] },
        { kind: "group", id: "C", children: [] },
      ],
      distribution: [{ relation: "distributeX", objectIds: ["A", "B", "C"] }],
    };

    const scene = lowerAstToObjectScene(ast);

    expect(scene.distribution).toEqual([{ relation: "distributeX", objectIds: ["A", "B", "C"] }]);
  });

  it("lowers distributeY into ObjectScene distribution", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        { kind: "group", id: "Top", children: [] },
        { kind: "group", id: "Middle", children: [] },
        { kind: "group", id: "Bottom", children: [] },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }],
    };

    const scene = lowerAstToObjectScene(ast);

    expect(scene.distribution).toEqual([{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }]);
  });

  it("preserves distribution objectIds ordering", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        { kind: "group", id: "Top", children: [] },
        { kind: "group", id: "Middle", children: [] },
        { kind: "group", id: "Bottom", children: [] },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Bottom", "Top", "Middle"] }],
    };

    const scene = lowerAstToObjectScene(ast);

    expect(scene.distribution?.[0]?.objectIds).toEqual(["Bottom", "Top", "Middle"]);
  });

  it("throws a clear error for unsupported distribution relations", () => {
    const ast = {
      kind: "scene",
      objects: [
        { kind: "group", id: "A", children: [] },
        { kind: "group", id: "B", children: [] },
      ],
      distribution: [{ relation: "distributeZ", objectIds: ["A", "B"] }],
    } as unknown as VizxAstScene;

    expect(() => lowerAstToObjectScene(ast)).toThrow("Unsupported AST distribution relation: distributeZ");
  });

  it("lowers path commands with technical styles and ordered transforms", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        {
          kind: "path",
          id: "styled.path",
          commands: [
            { kind: "moveTo", point: { x: 10, y: 10 } },
            { kind: "lineTo", point: { x: 40, y: 10 } },
            {
              kind: "arc",
              center: { x: 40, y: 20 },
              radius: 10,
              startAngleDegrees: -90,
              endAngleDegrees: 0,
              clockwise: false,
            },
            { kind: "closePath" },
          ],
          style: {
            stroke: "#0f172a",
            fill: "none",
            strokeWidth: 2,
            strokeDasharray: [6, 3],
            strokeLineCap: "round",
            strokeLineJoin: "bevel",
            fillRule: "evenodd",
            markerEnd: "arrow",
          },
          transform: [
            { kind: "translate", x: 4, y: -2 },
            { kind: "rotate", angleDegrees: 10, around: { x: 40, y: 20 } },
            { kind: "scale", sx: 1.1, sy: 0.9, around: { x: 40, y: 20 } },
          ],
        },
      ],
    };

    const scene = lowerAstToObjectScene(ast);
    const loweredPath = scene.objects.find((object) => object.id === "styled.path");

    expect(loweredPath?.kind).toBe("path");
    expect(loweredPath?.style?.strokeDasharray).toEqual([6, 3]);
    expect(loweredPath?.style?.strokeLineCap).toBe("round");
    expect(loweredPath?.style?.strokeLineJoin).toBe("bevel");
    expect(loweredPath?.style?.fillRule).toBe("evenodd");

    if (loweredPath?.kind !== "path") {
      throw new Error("Expected lowered path object.");
    }

    expect(loweredPath.commands.map((command) => command.kind)).toEqual(["moveTo", "lineTo", "arc", "closePath"]);
    expect(Array.isArray(loweredPath.transform)).toBe(true);
    if (Array.isArray(loweredPath.transform)) {
      expect(loweredPath.transform.map((transform) => ("kind" in transform ? transform.kind : "legacy"))).toEqual([
        "translate",
        "rotate",
        "scale",
      ]);
    }
  });

  it("lowers line/polyline/ellipse/polygon/circle objects", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        { kind: "line", id: "L", start: { x: 0, y: 0 }, end: { x: 10, y: 10 } },
        {
          kind: "polyline",
          id: "PL",
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
          ],
        },
        { kind: "ellipse", id: "E", center: { x: 20, y: 20 }, rx: 6, ry: 4 },
        {
          kind: "polygon",
          id: "PG",
          points: [
            { x: 0, y: 0 },
            { x: 8, y: 0 },
            { x: 4, y: 7 },
          ],
        },
        { kind: "circle", id: "C", center: { x: 40, y: 40 }, radius: 12 },
      ],
    };

    const scene = lowerAstToObjectScene(ast);
    expect(scene.objects.map((object) => object.kind)).toEqual(["line", "polyline", "ellipse", "polygon", "circle"]);
  });

  it("lowers connector style and legacy translate transform", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        {
          kind: "group",
          id: "A",
          transform: { translateX: 8, translateY: -6 },
          children: [],
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "A.loop",
          from: { objectId: "A", anchor: "east" },
          to: { objectId: "A", anchor: "west" },
          style: {
            stroke: "#0f172a",
            strokeWidth: 1.5,
            markerEnd: "arrow",
          },
        },
      ],
    };

    const scene = lowerAstToObjectScene(ast);
    expect(scene.connectors?.[0]?.style).toEqual({
      stroke: "#0f172a",
      strokeWidth: 1.5,
      markerEnd: "arrow",
    });

    const objectA = scene.objects.find((object) => object.id === "A");
    expect(objectA?.transform).toEqual({ translateX: 8, translateY: -6 });
  });

  it("throws a clear error for unsupported path command kinds", () => {
    const ast = {
      kind: "scene",
      objects: [
        {
          kind: "path",
          id: "bad.path",
          commands: [
            { kind: "moveTo", point: { x: 0, y: 0 } },
            { kind: "smoothCurveTo", point: { x: 10, y: 10 } },
          ],
        },
      ],
    } as unknown as VizxAstScene;

    expect(() => lowerAstToObjectScene(ast)).toThrow("Unsupported AST path command kind: smoothCurveTo");
  });
});
