import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { convertJsonCoreIrV0ToObjectScene } from "@vizx/object-model";
import { inspectScene, resolveScene } from "@vizx/resolver";
import { requireVizxExample } from "./index";

function loadJsonCoreIrFixture(name: "basic" | "relative-placement"): unknown {
  const fixtureUrl = new URL(`../fixtures/json-core-ir-v0/${name}.json`, import.meta.url);
  const fixtureText = readFileSync(fixtureUrl, "utf8");
  return JSON.parse(fixtureText) as unknown;
}

describe("convertJsonCoreIrV0ToObjectScene", () => {
  it("loads the basic JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("basic");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["A", "B", "C"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["edge-1", "edge-2"]);
  });

  it("fixture-converted scene matches the TypeScript basic example semantically", () => {
    const fixture = loadJsonCoreIrFixture("basic");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    const convertedInspection = inspectScene(result.scene!);
    const convertedResolved = resolveScene(result.scene!);
    const exampleScene = requireVizxExample("basic").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));
  });

  it("loads the relative-placement JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("relative-placement");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["Center", "Right", "Left", "Above", "Below"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual([
      "center-right",
      "center-left",
      "center-above",
      "center-below",
    ]);
  });

  it("fixture-converted relative-placement scene matches TypeScript example semantics", () => {
    const fixture = loadJsonCoreIrFixture("relative-placement");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);
    const convertedScene = result.scene!;

    const convertedInspection = inspectScene(convertedScene);
    const convertedResolved = resolveScene(convertedScene);
    const exampleScene = requireVizxExample("relative-placement").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(convertedScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
    }))).toEqual(exampleScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
    })));

    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));

    const convertedById = new Map(convertedInspection.objects.map((object) => [object.id, object]));
    const center = convertedById.get("Center");
    const right = convertedById.get("Right");
    const left = convertedById.get("Left");
    const above = convertedById.get("Above");
    const below = convertedById.get("Below");

    expect(center).toBeDefined();
    expect(right).toBeDefined();
    expect(left).toBeDefined();
    expect(above).toBeDefined();
    expect(below).toBeDefined();

    if (!center || !right || !left || !above || !below) {
      throw new Error("Expected relative-placement objects to be present in inspection output.");
    }

    const centerAnchor = center.anchors.center;
    const rightAnchor = right.anchors.center;
    const leftAnchor = left.anchors.center;
    const aboveAnchor = above.anchors.center;
    const belowAnchor = below.anchors.center;

    if (!centerAnchor || !rightAnchor || !leftAnchor || !aboveAnchor || !belowAnchor) {
      throw new Error("Expected relative-placement objects to expose center anchors.");
    }

    expect(rightAnchor.x).toBeGreaterThan(centerAnchor.x);
    expect(leftAnchor.x).toBeLessThan(centerAnchor.x);
    expect(aboveAnchor.y).toBeLessThan(centerAnchor.y);
    expect(belowAnchor.y).toBeGreaterThan(centerAnchor.y);
  });

  it("returns diagnostics and no scene for malformed input", () => {
    const result = convertJsonCoreIrV0ToObjectScene(42);

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it("returns diagnostics for an unknown object kind", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "circle",
          center: { x: 0, y: 0 },
          radius: 10,
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("kind must be one of group, text, or rect"))).toBe(true);
  });

  it("returns diagnostics for an unsupported placement relation", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "diagonalOf", reference: { objectId: "B", anchor: "south" }, gap: 40 },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("placement.kind must be absolute, rightOf, leftOf, above, or below"))).toBe(true);
  });

  it("returns diagnostics for malformed connector endpoints", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "absolute", position: { x: 80, y: 60 } },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "edge-1",
          from: { objectId: "A" },
          to: { objectId: "A", anchor: "west" },
        },
      ],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("connectors[0].from.anchor"))).toBe(true);
  });
});