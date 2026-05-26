import { describe, expect, it } from "vitest";
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
    expect(below.anchors.north?.y).toBeGreaterThan(reference.anchors.south!.y);
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