import { describe, expect, it } from "vitest";
import { lowerAstToObjectScene, type VizxAstScene } from "@vizx/parser";
import { inspectScene, resolveScene } from "@vizx/resolver";
import type { ObjectAlignment, ObjectPlacement, ObjectScene } from "@vizx/object-model";
import { requireVizxExample } from "./index";

function createAstLabelBox(
  id: string,
  label: string,
  placement: Exclude<ObjectPlacement, { kind: "absolute" }> | { kind: "absolute"; position: { x: number; y: number } },
  align?: ObjectAlignment,
) {
  return {
    kind: "group" as const,
    id,
    placement,
    align,
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

function summarizeAlignments(scene: ObjectScene) {
  return scene.objects.map((object) => ({
    id: object.id,
    relation: object.align?.relation,
    reference: object.align
      ? {
        objectId: object.align.reference.objectId,
        anchor: object.align.reference.anchor,
      }
      : undefined,
  }));
}

function summarizeDistribution(scene: ObjectScene) {
  return (scene.distribution ?? []).map((operation) => ({
    relation: operation.relation,
    objectIds: [...operation.objectIds],
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

  it("lowers a hand-authored AST for alignment-family and matches example semantics", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        createAstLabelBox("Reference", "Reference nucleus", { kind: "absolute", position: { x: 260, y: 180 } }),
        createAstLabelBox(
          "AxisX",
          "Axis X target",
          { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 88 },
          { relation: "alignX", reference: { objectId: "Reference", anchor: "center" } },
        ),
        createAstLabelBox(
          "AxisY",
          "Axis Y receiver with wider text",
          { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 96 },
          { relation: "alignY", reference: { objectId: "Reference", anchor: "center" } },
        ),
        createAstLabelBox(
          "EdgeLeft",
          "Left edge",
          { kind: "below", reference: { objectId: "Reference", anchor: "south" }, gap: 24 },
          { relation: "alignLeft", reference: { objectId: "Reference", anchor: "west" } },
        ),
        createAstLabelBox(
          "EdgeRight",
          "Right edge with longer text",
          { kind: "above", reference: { objectId: "Reference", anchor: "north" }, gap: 24 },
          { relation: "alignRight", reference: { objectId: "Reference", anchor: "east" } },
        ),
        createAstLabelBox(
          "EdgeTop",
          "Top edge target",
          { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 48 },
          { relation: "alignTop", reference: { objectId: "Reference", anchor: "north" } },
        ),
        createAstLabelBox(
          "EdgeBottom",
          "Bottom edge",
          { kind: "leftOf", reference: { objectId: "Reference", anchor: "west" }, gap: 48 },
          { relation: "alignBottom", reference: { objectId: "Reference", anchor: "south" } },
        ),
      ],
      connectors: [
        { kind: "connector", id: "reference-axis-x", from: { objectId: "Reference", anchor: "center" }, to: { objectId: "AxisX", anchor: "center" } },
        { kind: "connector", id: "reference-axis-y", from: { objectId: "Reference", anchor: "center" }, to: { objectId: "AxisY", anchor: "center" } },
        { kind: "connector", id: "reference-edge-left", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "EdgeLeft", anchor: "west" } },
        { kind: "connector", id: "reference-edge-right", from: { objectId: "Reference", anchor: "east" }, to: { objectId: "EdgeRight", anchor: "east" } },
        { kind: "connector", id: "reference-edge-top", from: { objectId: "Reference", anchor: "north" }, to: { objectId: "EdgeTop", anchor: "north" } },
        { kind: "connector", id: "reference-edge-bottom", from: { objectId: "Reference", anchor: "south" }, to: { objectId: "EdgeBottom", anchor: "south" } },
      ],
    };

    const loweredScene = lowerAstToObjectScene(ast);
    const loweredResolved = resolveScene(loweredScene);
    const loweredInspection = inspectScene(loweredScene);

    const referenceScene = requireVizxExample("alignment-family").createScene();
    const referenceResolved = resolveScene(referenceScene);
    const referenceInspection = inspectScene(referenceScene);

    expect(loweredResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(referenceResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(loweredInspection.objects.map((object) => object.id)).toEqual(referenceInspection.objects.map((object) => object.id));
    expect(summarizeAlignments(loweredScene)).toEqual(summarizeAlignments(referenceScene));
    expect(summarizeConnectors(loweredScene)).toEqual(summarizeConnectors(referenceScene));

    const byId = new Map(loweredInspection.objects.map((object) => [object.id, object]));
    const reference = byId.get("Reference")!;
    const axisX = byId.get("AxisX")!;
    const axisY = byId.get("AxisY")!;
    const edgeLeft = byId.get("EdgeLeft")!;
    const edgeRight = byId.get("EdgeRight")!;
    const edgeTop = byId.get("EdgeTop")!;
    const edgeBottom = byId.get("EdgeBottom")!;

    expect(axisX.anchors.center?.x).toBe(reference.anchors.center?.x);
    expect(axisY.anchors.center?.y).toBe(reference.anchors.center?.y);
    expect(edgeLeft.anchors.west?.x).toBe(reference.anchors.west?.x);
    expect(edgeRight.anchors.east?.x).toBe(reference.anchors.east?.x);
    expect(edgeTop.anchors.north?.y).toBe(reference.anchors.north?.y);
    expect(edgeBottom.anchors.south?.y).toBe(reference.anchors.south?.y);
  });

  it("lowers a hand-authored AST for distribute-x and matches example semantics", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        createAstLabelBox("A", "First", { kind: "absolute", position: { x: 120, y: 150 } }),
        createAstLabelBox("B", "Middle", { kind: "below", reference: { objectId: "A", anchor: "south" }, gap: 52 }),
        createAstLabelBox("C", "Last", { kind: "absolute", position: { x: 420, y: 190 } }),
      ],
      connectors: [
        { kind: "connector", id: "a-b", from: { objectId: "A", anchor: "center" }, to: { objectId: "B", anchor: "center" } },
        { kind: "connector", id: "b-c", from: { objectId: "B", anchor: "center" }, to: { objectId: "C", anchor: "center" } },
      ],
      distribution: [{ relation: "distributeX", objectIds: ["A", "B", "C"] }],
    };

    const loweredScene = lowerAstToObjectScene(ast);
    const loweredResolved = resolveScene(loweredScene);
    const loweredInspection = inspectScene(loweredScene);

    const referenceScene = requireVizxExample("distribute-x").createScene();
    const referenceResolved = resolveScene(referenceScene);
    const referenceInspection = inspectScene(referenceScene);

    expect(loweredResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(referenceResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(loweredInspection.objects.map((object) => object.id)).toEqual(referenceInspection.objects.map((object) => object.id));
    expect(summarizeDistribution(loweredScene)).toEqual(summarizeDistribution(referenceScene));
    expect(summarizeConnectors(loweredScene)).toEqual(summarizeConnectors(referenceScene));

    const byId = new Map(loweredInspection.objects.map((object) => [object.id, object]));
    const a = byId.get("A")!;
    const b = byId.get("B")!;
    const c = byId.get("C")!;
    const spacingAB = (b.anchors.center?.x ?? 0) - (a.anchors.center?.x ?? 0);
    const spacingBC = (c.anchors.center?.x ?? 0) - (b.anchors.center?.x ?? 0);

    expect(spacingAB).toBeCloseTo(spacingBC, 8);

    const baselineResolved = resolveScene({ ...loweredScene, distribution: undefined });
    const baselineById = new Map(baselineResolved.resolved.objects.map((object) => [object.id, object]));
    const baselineB = baselineById.get("B")!;

    expect(b.anchors.center?.y).toBe(baselineB.anchors.center?.y);
  });

  it("lowers a hand-authored AST for distribute-y and matches example semantics", () => {
    const ast: VizxAstScene = {
      kind: "scene",
      objects: [
        createAstLabelBox("Top", "Top", { kind: "absolute", position: { x: 200, y: 90 } }),
        createAstLabelBox("Middle", "Middle", { kind: "rightOf", reference: { objectId: "Top", anchor: "east" }, gap: 74 }),
        createAstLabelBox("Bottom", "Bottom", { kind: "absolute", position: { x: 280, y: 360 } }),
      ],
      connectors: [
        { kind: "connector", id: "top-middle", from: { objectId: "Top", anchor: "center" }, to: { objectId: "Middle", anchor: "center" } },
        { kind: "connector", id: "middle-bottom", from: { objectId: "Middle", anchor: "center" }, to: { objectId: "Bottom", anchor: "center" } },
      ],
      distribution: [{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }],
    };

    const loweredScene = lowerAstToObjectScene(ast);
    const loweredResolved = resolveScene(loweredScene);
    const loweredInspection = inspectScene(loweredScene);

    const referenceScene = requireVizxExample("distribute-y").createScene();
    const referenceResolved = resolveScene(referenceScene);
    const referenceInspection = inspectScene(referenceScene);

    expect(loweredResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(referenceResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(loweredInspection.objects.map((object) => object.id)).toEqual(referenceInspection.objects.map((object) => object.id));
    expect(summarizeDistribution(loweredScene)).toEqual(summarizeDistribution(referenceScene));
    expect(summarizeConnectors(loweredScene)).toEqual(summarizeConnectors(referenceScene));

    const byId = new Map(loweredInspection.objects.map((object) => [object.id, object]));
    const top = byId.get("Top")!;
    const middle = byId.get("Middle")!;
    const bottom = byId.get("Bottom")!;
    const spacingTopMiddle = (middle.anchors.center?.y ?? 0) - (top.anchors.center?.y ?? 0);
    const spacingMiddleBottom = (bottom.anchors.center?.y ?? 0) - (middle.anchors.center?.y ?? 0);

    expect(spacingTopMiddle).toBeCloseTo(spacingMiddleBottom, 8);

    const baselineResolved = resolveScene({ ...loweredScene, distribution: undefined });
    const baselineById = new Map(baselineResolved.resolved.objects.map((object) => [object.id, object]));
    const baselineMiddle = baselineById.get("Middle")!;

    expect(middle.anchors.center?.x).toBe(baselineMiddle.anchors.center?.x);
  });
});
