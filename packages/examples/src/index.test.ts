import { describe, expect, it } from "vitest";
import type { ObjectScene } from "@vizx/object-model";
import type { RenderNode, RenderScene } from "@vizx/renderer-svg";
import { renderSvg } from "@vizx/renderer-svg";
import { createDebugRenderScene, inspectScene, resolveScene } from "@vizx/resolver";
import { requireVizxExample, vizxExamples } from "./index";

const minimalDebugOverlay = {
  showBoundingBoxes: true,
  showAnchors: false,
  showLabels: true,
  showConnectorEndpoints: false,
  includeChildren: false,
} as const;

describe("example registry", () => {
  it("registers unique ids and required metadata", () => {
    const ids = vizxExamples.map((example) => example.id);

    expect(new Set(ids).size).toBe(ids.length);

    for (const example of vizxExamples) {
      expect(example.title.length).toBeGreaterThan(0);
      expect(example.description.length).toBeGreaterThan(0);
      expect(example.expectedCapabilities.length).toBeGreaterThan(0);
    }
  });

  it("lets every example resolve, inspect, render, and debug-render", () => {
    for (const example of vizxExamples) {
      const scene = example.createScene();
      const resolved = resolveScene(scene);
      const inspection = inspectScene(scene);
      const svg = renderSvg(resolved.renderScene, { pretty: true });
      const debugScene = createDebugRenderScene(resolved);
      const minimalDebugScene = createDebugRenderScene(resolved, minimalDebugOverlay);
      const debugOverlayChildren = getDebugOverlayChildren(debugScene);
      const minimalDebugOverlayChildren = getDebugOverlayChildren(minimalDebugScene);

      expect(resolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
      expect(resolved.renderScene.children.length).toBeGreaterThan(0);
      expect(svg.length).toBeGreaterThan(0);
      expect(inspection.objectCount).toBeGreaterThan(0);
      expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
      expect(debugScene.children.at(-1)?.kind).toBe("group");
      expect(debugOverlayChildren.length).toBeGreaterThan(0);
      expect(minimalDebugScene.children.at(-1)?.id).toBe("debug-overlay");
      expect(minimalDebugOverlayChildren.some((node) => node.id?.startsWith("debug-bbox-"))).toBe(true);
      expect(minimalDebugOverlayChildren.some((node) => node.id?.startsWith("debug-label-"))).toBe(true);
      expect(minimalDebugOverlayChildren.some((node) => node.id?.startsWith("debug-anchor-"))).toBe(false);
      expect(minimalDebugOverlayChildren.some((node) => node.id?.startsWith("debug-endpoint-"))).toBe(false);
    }
  });

  it("exposes expected anchors in the anchors example", () => {
    const inspection = inspectScene(requireVizxExample("anchors").createScene());
    const anchorBox = inspection.objects.find((object) => object.id === "anchor-box");

    expect(anchorBox?.anchors.center).toBeDefined();
    expect(anchorBox?.anchors.north).toBeDefined();
    expect(anchorBox?.anchors.south).toBeDefined();
    expect(anchorBox?.anchors.east).toBeDefined();
    expect(anchorBox?.anchors.west).toBeDefined();
  });

  it("includes nested child inspection for the nested groups example", () => {
    const inspection = inspectScene(requireVizxExample("nested-groups").createScene());
    const panel = inspection.objects.find((object) => object.id === "panel");
    const nestedGroup = panel?.children?.find((child) => child.id === "panel.inner");

    expect(panel?.children?.length).toBeGreaterThan(0);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(nestedGroup?.children?.some((child) => child.id === "panel.inner.label")).toBe(true);
  });

  it("resolves connector endpoint points for the connectors example", () => {
    const result = resolveScene(requireVizxExample("connectors").createScene());

    expect(result.resolved.connectors).toHaveLength(2);

    for (const connector of result.resolved.connectors) {
      expect(connector.start.x).toBeTypeOf("number");
      expect(connector.start.y).toBeTypeOf("number");
      expect(connector.end.x).toBeTypeOf("number");
      expect(connector.end.y).toBeTypeOf("number");
    }
  });

  it("positions the relative-placement example around its center object", () => {
    const inspection = inspectScene(requireVizxExample("relative-placement").createScene());
    const center = requireInspectionObject(inspection, "Center");
    const right = requireInspectionObject(inspection, "Right");
    const left = requireInspectionObject(inspection, "Left");
    const above = requireInspectionObject(inspection, "Above");
    const below = requireInspectionObject(inspection, "Below");

    expect(right.anchors.west?.x).toBeGreaterThan(center.anchors.east!.x);
    expect(left.anchors.east?.x).toBeLessThan(center.anchors.west!.x);
    expect(above.anchors.south?.y).toBeLessThan(center.anchors.north!.y);
    expect(below.anchors.north?.y).toBeGreaterThan(center.anchors.south!.y);
  });

  it("resolves mixed nested placement with nested children, side placements, and concrete connector points", () => {
    const scene = requireVizxExample("mixed-nested-placement").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const center = requireInspectionObject(inspection, "Hub");
    const right = requireInspectionObject(inspection, "Right");
    const left = requireInspectionObject(inspection, "Left");
    const above = requireInspectionObject(inspection, "Above");
    const below = requireInspectionObject(inspection, "Below");
    const nestedGroup = center.children?.find((child) => child.id === "Hub.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Hub.inner.frame");
    const debugOverlayChildren = getDebugOverlayChildren(debugScene);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(debugOverlayChildren.length).toBeGreaterThan(0);
    expect(center.children?.length).toBeGreaterThan(0);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(right.anchors.west?.x).toBeGreaterThan(center.anchors.east!.x);
    expect(left.anchors.east?.x).toBeLessThan(center.anchors.west!.x);
    expect(above.anchors.south?.y).toBeLessThan(center.anchors.north!.y);
    expect(below.anchors.north?.y).toBeGreaterThan(center.anchors.south!.y);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.x).toBeGreaterThan(center.bbox.x);
    expect(nestedFrame?.anchors.center?.y).toBeGreaterThan(center.bbox.y);
    expect(result.resolved.connectors.length).toBeGreaterThanOrEqual(2);

    for (const connector of result.resolved.connectors) {
      expect(connector.start.x).toBeTypeOf("number");
      expect(connector.start.y).toBeTypeOf("number");
      expect(connector.end.x).toBeTypeOf("number");
      expect(connector.end.y).toBeTypeOf("number");
    }
  });

  it("resolves alignment-reference with varied bbox sizes and reference objects on all sides", () => {
    const scene = requireVizxExample("alignment-reference").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const reference = requireInspectionObject(inspection, "Reference");
    const left = requireInspectionObject(inspection, "Left");
    const right = requireInspectionObject(inspection, "Right");
    const above = requireInspectionObject(inspection, "Above");
    const below = requireInspectionObject(inspection, "Below");
    const nestedGroup = reference.children?.find((child) => child.id === "Reference.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Reference.inner.frame");
    const debugOverlayChildren = getDebugOverlayChildren(debugScene);
    const topLevelIds = inspection.objects.map((object) => object.id);

    expect(topLevelIds).toEqual(["Reference", "Left", "Right", "Above", "Below"]);
    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(debugOverlayChildren.length).toBeGreaterThan(0);
    expect(reference.children?.length).toBeGreaterThan(0);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(left.bbox.width).not.toBe(right.bbox.width);
    expect(below.bbox.width).toBeGreaterThan(above.bbox.width);
    expect(left.anchors.east?.x).toBeLessThan(reference.anchors.west!.x);
    expect(right.anchors.west?.x).toBeGreaterThan(reference.anchors.east!.x);
    expect(above.anchors.south?.y).toBeLessThan(reference.anchors.north!.y);
    expect(below.anchors.center?.y).toBe(reference.anchors.center?.y);
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(nestedFrame?.anchors.center?.x).toBeGreaterThan(reference.bbox.x);
    expect(nestedFrame?.anchors.center?.y).toBeGreaterThan(reference.bbox.y);
    expect(result.resolved.connectors.length).toBeGreaterThanOrEqual(2);

    for (const connector of result.resolved.connectors) {
      expect(connector.start.x).toBeTypeOf("number");
      expect(connector.start.y).toBeTypeOf("number");
      expect(connector.end.x).toBeTypeOf("number");
      expect(connector.end.y).toBeTypeOf("number");
    }
  });

  it("locks down the current alignment-reference baseline geometry and anchor lines", () => {
    const result = resolveScene(requireVizxExample("alignment-reference").createScene());
    const reference = requireResolvedObject(result, "Reference");
    const left = requireResolvedObject(result, "Left");
    const right = requireResolvedObject(result, "Right");
    const above = requireResolvedObject(result, "Above");
    const below = requireResolvedObject(result, "Below");
    const nestedGroup = reference.children?.find((child) => child.id === "Reference.inner");
    const nestedFrame = nestedGroup?.children?.find((child) => child.id === "Reference.inner.frame");
    const leftConnector = requireResolvedConnector(result, "reference-left");
    const rightConnector = requireResolvedConnector(result, "reference-right");
    const aboveConnector = requireResolvedConnector(result, "reference-above");
    const belowConnector = requireResolvedConnector(result, "reference-below");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(reference.children?.length).toBeGreaterThan(0);
    expect(nestedGroup?.children?.length).toBeGreaterThan(0);
    expect(left.bbox.width).toBeLessThan(right.bbox.width);
    expect(above.bbox.width).toBeLessThan(below.bbox.width);
    expect(left.bbox.x + left.bbox.width).toBeLessThan(reference.bbox.x);
    expect(right.bbox.x).toBeGreaterThan(reference.bbox.x + reference.bbox.width);
    expect(above.bbox.y + above.bbox.height).toBeLessThan(reference.bbox.y);
    expect(below.anchors.center?.y).toBe(reference.anchors.center?.y);

    expect(leftConnector.start.y).toBe(reference.anchors.west?.y);
    expect(leftConnector.end.y).toBe(left.anchors.east?.y);
    expect(leftConnector.start.y).toBe(leftConnector.end.y);
    expect(rightConnector.start.y).toBe(reference.anchors.east?.y);
    expect(rightConnector.end.y).toBe(right.anchors.west?.y);
    expect(rightConnector.start.y).toBe(rightConnector.end.y);
    expect(aboveConnector.start.x).toBe(reference.anchors.north?.x);
    expect(aboveConnector.end.x).toBe(above.anchors.south?.x);
    expect(aboveConnector.start.x).toBe(aboveConnector.end.x);
    expect(belowConnector.start.x).toBe(reference.anchors.south?.x);
    expect(belowConnector.end.x).toBe(below.anchors.north?.x);
    expect(belowConnector.start.x).toBe(belowConnector.end.x);

    for (const connector of result.resolved.connectors) {
      expect(Number.isFinite(connector.start.x)).toBe(true);
      expect(Number.isFinite(connector.start.y)).toBe(true);
      expect(Number.isFinite(connector.end.x)).toBe(true);
      expect(Number.isFinite(connector.end.y)).toBe(true);
    }

    expect(reference.geometry).toBeUndefined();
    expect(left.geometry).toBeUndefined();
    expect(right.geometry).toBeUndefined();
    expect(above.geometry).toBeUndefined();
    expect(below.geometry).toBeUndefined();
    expect(nestedFrame?.geometry?.x).toBe(nestedFrame?.bbox.x);
    expect(nestedFrame?.geometry?.y).toBe(nestedFrame?.bbox.y);
    expect(left.anchors.east?.x).toBe(left.bbox.x + left.bbox.width);
    expect(right.anchors.west?.x).toBe(right.bbox.x);
    expect(above.anchors.south?.y).toBe(above.bbox.y + above.bbox.height);
    expect(below.anchors.north?.y).toBe(below.bbox.y);
  });

  it("alignY makes a target center.y match its reference center.y", () => {
    const result = resolveScene(requireVizxExample("alignment-reference").createScene());
    const reference = requireResolvedObject(result, "Reference");
    const target = requireResolvedObject(result, "Below");

    expect(reference.anchors.center?.y).toBeDefined();
    expect(target.anchors.center?.y).toBeDefined();

    if (!reference.anchors.center || !target.anchors.center) {
      throw new Error("Expected alignment-reference objects to resolve center anchors");
    }

    expect(target.anchors.center.y).toBe(reference.anchors.center.y);
  });

  it("alignLeft makes target.west.x match reference.west.x", () => {
    const scene: ObjectScene = {
      objects: [
        {
          kind: "group",
          id: "Reference",
          placement: { kind: "absolute", position: { x: 220, y: 160 } },
          children: [
            { kind: "text", id: "Reference.label", center: { x: 0, y: 0 }, text: "Reference" },
            { kind: "rect", id: "Reference.frame", fitToText: { textId: "Reference.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
        {
          kind: "group",
          id: "Target",
          placement: { kind: "rightOf", reference: { objectId: "Reference", anchor: "east" }, gap: 64 },
          align: { relation: "alignLeft", reference: { objectId: "Reference", anchor: "west" } },
          children: [
            { kind: "text", id: "Target.label", center: { x: 0, y: 0 }, text: "Target" },
            { kind: "rect", id: "Target.frame", fitToText: { textId: "Target.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        { kind: "connector", id: "reference-to-target-left", from: { objectId: "Reference", anchor: "west" }, to: { objectId: "Target", anchor: "west" } },
      ],
    };

    const result = resolveScene(scene);
    const reference = requireResolvedObject(result, "Reference");
    const target = requireResolvedObject(result, "Target");

    expect(target.anchors.west?.x).toBe(reference.anchors.west?.x);
  });

  it("covers the full alignment family in a registry-backed example", () => {
    const example = requireVizxExample("alignment-family");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(example.title).toBe("Alignment Family");
    expect(example.expectedCapabilities).toEqual([
      "alignX",
      "alignY",
      "alignLeft",
      "alignRight",
      "alignTop",
      "alignBottom",
      "rect anchors",
      "group bbox",
      "inspect output",
      "debug overlay",
    ]);

    const expectedIds = ["Reference", "AxisX", "AxisY", "EdgeLeft", "EdgeRight", "EdgeTop", "EdgeBottom"];
    const topLevelIds = inspection.objects.map((object) => object.id);

    expect(topLevelIds).toEqual(expectedIds);
    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");

    const reference = requireResolvedObject(result, "Reference");
    const axisX = requireResolvedObject(result, "AxisX");
    const axisY = requireResolvedObject(result, "AxisY");
    const edgeLeft = requireResolvedObject(result, "EdgeLeft");
    const edgeRight = requireResolvedObject(result, "EdgeRight");
    const edgeTop = requireResolvedObject(result, "EdgeTop");
    const edgeBottom = requireResolvedObject(result, "EdgeBottom");

    expect(axisX.anchors.center?.x).toBe(reference.anchors.center?.x);
    expect(axisY.anchors.center?.y).toBe(reference.anchors.center?.y);
    expect(edgeLeft.anchors.west?.x).toBe(reference.anchors.west?.x);
    expect(edgeRight.anchors.east?.x).toBe(reference.anchors.east?.x);
    expect(edgeTop.anchors.north?.y).toBe(reference.anchors.north?.y);
    expect(edgeBottom.anchors.south?.y).toBe(reference.anchors.south?.y);

    for (const object of [reference, axisX, axisY, edgeLeft, edgeRight, edgeTop, edgeBottom]) {
      const frame = object.children?.find((child) => child.id === `${object.id}.frame`);

      expect(frame?.geometry?.x).toBe(frame?.bbox.x);
      expect(frame?.geometry?.y).toBe(frame?.bbox.y);
      expect(object.anchors.north?.y).toBe(object.bbox.y);
      expect(object.anchors.south?.y).toBeCloseTo(object.bbox.y + object.bbox.height, 8);
      expect(object.anchors.west?.x).toBeCloseTo(object.bbox.x, 8);
      expect(object.anchors.east?.x).toBeCloseTo(object.bbox.x + object.bbox.width, 8);
    }

    expect(result.resolved.connectors.length).toBeGreaterThanOrEqual(6);

    for (const connector of result.resolved.connectors) {
      expect(Number.isFinite(connector.start.x)).toBe(true);
      expect(Number.isFinite(connector.start.y)).toBe(true);
      expect(Number.isFinite(connector.end.x)).toBe(true);
      expect(Number.isFinite(connector.end.y)).toBe(true);
    }
  });
});

function getDebugOverlayChildren(scene: RenderScene): readonly RenderNode[] {
  const overlay = scene.children.at(-1);

  if (!overlay || overlay.kind !== "group") {
    return [];
  }

  return overlay.children;
}

function requireInspectionObject(
  inspection: ReturnType<typeof inspectScene>,
  id: string,
) {
  const object = inspection.objects.find((entry) => entry.id === id);

  if (!object) {
    throw new Error(`Expected inspection object ${id}`);
  }

  return object;
}

function requireResolvedObject(result: ReturnType<typeof resolveScene>, id: string) {
  const object = result.resolved.objects.find((entry) => entry.id === id);

  if (!object) {
    throw new Error(`Expected resolved object ${id}`);
  }

  return object;
}

function requireResolvedConnector(result: ReturnType<typeof resolveScene>, id: string) {
  const connector = result.resolved.connectors.find((entry) => entry.id === id);

  if (!connector) {
    throw new Error(`Expected resolved connector ${id}`);
  }

  return connector;
}