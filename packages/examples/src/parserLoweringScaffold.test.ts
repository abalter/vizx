import { describe, expect, it } from "vitest";
import { lowerAstToObjectScene, type VizxAstScene } from "@vizx/parser";
import { inspectScene, resolveScene } from "@vizx/resolver";
import type { ObjectPlacement, ObjectScene } from "@vizx/object-model";
import { requireVizxExample } from "./index";

function createAstLabelBox(
  id: string,
  label: string,
  placement: Exclude<ObjectPlacement, { kind: "absolute" }> | { kind: "absolute"; position: { x: number; y: number } },
) {
  return {
    kind: "group" as const,
    id,
    placement,
    children: [
      {
        kind: "text" as const,
        id: `${id}.label`,
        center: { x: 0, y: 0 },
        text: label,
      },
      {
        kind: "rect" as const,
        id: `${id}.frame`,
        fitToText: { textId: `${id}.label`, paddingX: 12, paddingY: 10 },
        rx: 6,
        ry: 6,
      },
    ],
  };
}

function summarizePlacements(scene: ObjectScene) {
  return scene.objects.map((object) => {
    if (!object.placement) {
      return { id: object.id, kind: undefined, reference: undefined, gap: undefined };
    }

    if (object.placement.kind === "absolute") {
      return { id: object.id, kind: "absolute", reference: undefined, gap: undefined };
    }

    return {
      id: object.id,
      kind: object.placement.kind,
      reference: {
        objectId: object.placement.reference.objectId,
        anchor: object.placement.reference.anchor,
      },
      gap: object.placement.gap,
    };
  });
}

function summarizeConnectors(scene: ObjectScene) {
  return (scene.connectors ?? []).map((connector) => ({
    id: connector.id,
    from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
    to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
  }));
}

describe("parser lowering scaffold", () => {
  it("lowers a hand-authored AST for relative placement and matches example semantics", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        createAstLabelBox("Center", "Center", { kind: "absolute", position: { x: 180, y: 120 } }),
        createAstLabelBox("Right", "Right", { kind: "rightOf", reference: { objectId: "Center", anchor: "east" }, gap: 44 }),
        createAstLabelBox("Left", "Left", { kind: "leftOf", reference: { objectId: "Center", anchor: "west" }, gap: 44 }),
        createAstLabelBox("Above", "Above", { kind: "above", reference: { objectId: "Center", anchor: "north" }, gap: 36 }),
        createAstLabelBox("Below", "Below", { kind: "below", reference: { objectId: "Center", anchor: "south" }, gap: 36 }),
      ],
      connectors: [
        { kind: "connector", id: "center-right", from: { objectId: "Center", anchor: "east" }, to: { objectId: "Right", anchor: "west" } },
        { kind: "connector", id: "center-left", from: { objectId: "Center", anchor: "west" }, to: { objectId: "Left", anchor: "east" } },
        { kind: "connector", id: "center-above", from: { objectId: "Center", anchor: "north" }, to: { objectId: "Above", anchor: "south" } },
        { kind: "connector", id: "center-below", from: { objectId: "Center", anchor: "south" }, to: { objectId: "Below", anchor: "north" } },
      ],
    };

    const loweredScene = lowerAstToObjectScene(ast);
    const loweredResolved = resolveScene(loweredScene);
    const loweredInspection = inspectScene(loweredScene);

    const referenceScene = requireVizxExample("relative-placement").createScene();
    const referenceResolved = resolveScene(referenceScene);
    const referenceInspection = inspectScene(referenceScene);

    expect(loweredResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(referenceResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(loweredInspection.objects.map((object) => object.id)).toEqual(referenceInspection.objects.map((object) => object.id));
    expect(summarizePlacements(loweredScene)).toEqual(summarizePlacements(referenceScene));
    expect(summarizeConnectors(loweredScene)).toEqual(summarizeConnectors(referenceScene));

    const byId = new Map(loweredInspection.objects.map((object) => [object.id, object]));
    const center = byId.get("Center");
    const right = byId.get("Right");
    const left = byId.get("Left");
    const above = byId.get("Above");
    const below = byId.get("Below");

    expect(center?.anchors.east?.x).toBeDefined();
    expect(center?.anchors.west?.x).toBeDefined();
    expect(center?.anchors.north?.y).toBeDefined();
    expect(center?.anchors.south?.y).toBeDefined();

    expect(right?.anchors.west?.x).toBeGreaterThan(center!.anchors.east!.x);
    expect(left?.anchors.east?.x).toBeLessThan(center!.anchors.west!.x);
    expect(above?.anchors.south?.y).toBeLessThan(center!.anchors.north!.y);
    expect(below?.anchors.north?.y).toBeGreaterThan(center!.anchors.south!.y);
  });
});
