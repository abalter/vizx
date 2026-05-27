import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { convertJsonCoreIrV0ToObjectScene } from "@vizx/object-model";
import { inspectScene, resolveScene } from "@vizx/resolver";
import { requireVizxExample } from "./index";

function loadBasicJsonCoreIrFixture(): unknown {
  const fixtureUrl = new URL("../fixtures/json-core-ir-v0/basic.json", import.meta.url);
  const fixtureText = readFileSync(fixtureUrl, "utf8");
  return JSON.parse(fixtureText) as unknown;
}

describe("convertJsonCoreIrV0ToObjectScene", () => {
  it("loads the basic JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadBasicJsonCoreIrFixture();
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["A", "B", "C"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["edge-1", "edge-2"]);
  });

  it("fixture-converted scene matches the TypeScript basic example semantically", () => {
    const fixture = loadBasicJsonCoreIrFixture();
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
          placement: { kind: "below", reference: { objectId: "B", anchor: "south" }, gap: 40 },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("placement.kind must be absolute or rightOf"))).toBe(true);
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