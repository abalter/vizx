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
          kind: "circle",
        },
      ],
    } as unknown as VizxAstScene;

    expect(() => lowerAstToObjectScene(ast)).toThrow("Unsupported AST object kind: circle");
  });
});
