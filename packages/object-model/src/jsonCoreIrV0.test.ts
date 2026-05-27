import { describe, expect, it } from "vitest";
import { inspectScene, resolveScene } from "@vizx/resolver";
import { requireVizxExample } from "@vizx/examples";
import { convertJsonCoreIrV0ToObjectScene } from "./jsonCoreIrV0";

describe("convertJsonCoreIrV0ToObjectScene", () => {
  it("converts a minimal basic-like JSON object to an ObjectScene", () => {
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
        {
          id: "B",
          kind: "group",
          placement: { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 90 },
          children: [
            { id: "B.label", kind: "text", center: { x: 0, y: 0 }, text: "Clean" },
            { id: "B.frame", kind: "rect", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "edge-1", from: { objectId: "A", anchor: "east" }, to: { objectId: "B", anchor: "west" } },
      ],
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["A", "B"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["edge-1"]);
  });

  it("converts a basic-like scene that resolves without error diagnostics", () => {
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
        {
          id: "B",
          kind: "group",
          placement: { kind: "rightOf", reference: { objectId: "A", anchor: "east" }, gap: 90 },
          children: [
            { id: "B.label", kind: "text", center: { x: 0, y: 0 }, text: "Clean" },
            { id: "B.frame", kind: "rect", fitToText: { textId: "B.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          id: "C",
          kind: "group",
          placement: { kind: "rightOf", reference: { objectId: "B", anchor: "east" }, gap: 90 },
          children: [
            { id: "C.label", kind: "text", center: { x: 0, y: 0 }, text: "Model" },
            { id: "C.frame", kind: "rect", fitToText: { textId: "C.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "edge-1", from: { objectId: "A", anchor: "east" }, to: { objectId: "B", anchor: "west" } },
        { kind: "connector", id: "edge-2", from: { objectId: "B", anchor: "east" }, to: { objectId: "C", anchor: "west" } },
      ],
    });

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