import { describe, expect, it } from "vitest";
import type { ObjectScene } from "@vizx/object-model";
import type { RenderNode, RenderScene } from "@vizx/renderer-svg";
import { renderSvg } from "@vizx/renderer-svg";
import { createDebugRenderScene, inspectScene, resolveScene } from "@vizx/resolver";
import { createAspirationalGalleryManifest } from "./aspirationalGalleryManifest";
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

  it("provides standardized metadata for aspirational examples", () => {
    const aspirationalExamples = vizxExamples.filter((example) => example.id.startsWith("aspirational-"));

    expect(aspirationalExamples.length).toBeGreaterThan(0);

    for (const example of aspirationalExamples) {
      expect(example.sourcePath).toBeTruthy();
      expect(example.reproductionLevel).toBeTruthy();
      expect(example.helperFamilies?.length ?? 0).toBeGreaterThan(0);
      expect(example.compromises?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("creates a stable aspirational gallery manifest from registry metadata", () => {
    const manifest = createAspirationalGalleryManifest(vizxExamples);
    const aspirationalExamples = vizxExamples.filter((example) => example.id.startsWith("aspirational-"));

    expect(manifest.version).toBe(1);
    expect(manifest.generatedFrom).toBe("packages/examples/src/index.ts");
    expect(manifest.examples).toHaveLength(aspirationalExamples.length);

    const manifestIds = manifest.examples.map((entry) => entry.id);
    const sortedManifestIds = [...manifestIds].sort((a, b) => a.localeCompare(b));
    expect(manifestIds).toEqual(sortedManifestIds);

    for (const entry of manifest.examples) {
      expect(entry.id.startsWith("aspirational-")).toBe(true);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.sourcePath.length).toBeGreaterThan(0);
      expect(entry.reproductionLevel.length).toBeGreaterThan(0);
      expect(entry.helperFamilies.length).toBeGreaterThan(0);
      expect(entry.compromises.length).toBeGreaterThan(0);
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
      expect(connector.renderNode.style?.markerEnd).toBe("arrow");
    }
  });

  it("registers and resolves the arrowheads example", () => {
    const scene = requireVizxExample("arrowheads").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "arrow.line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "arrow.polyline")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "arrow.path")).toBe(true);
    expect(result.resolved.connectors.some((connector) => connector.id === "arrow.connector")).toBe(true);
    expect(svg).toContain('id="vizx-marker-arrow"');
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the rotated-primitives example", () => {
    const scene = requireVizxExample("rotated-primitives").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "rot.line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "rot.polyline")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "rot.polygon")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "rot.path")).toBe(true);
    expect(svg).toContain("<line");
    expect(svg).toContain("<polyline");
    expect(svg).toContain("<polygon");
    expect(svg).toContain("<path");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the polyline primitive example", () => {
    const scene = requireVizxExample("polyline-primitive").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.kind === "polyline")).toBe(true);
    expect(result.resolved.objects.some((object) => object.kind === "polyline")).toBe(true);
    expect(result.renderScene.children.some((child) => child.kind === "polyline")).toBe(true);
    expect(svg).toContain("<polyline");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the ellipse primitive example", () => {
    const scene = requireVizxExample("ellipse-primitive").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.kind === "ellipse")).toBe(true);
    expect(result.resolved.objects.some((object) => object.kind === "ellipse")).toBe(true);
    expect(result.renderScene.children.some((child) => child.kind === "ellipse")).toBe(true);
    expect(svg).toContain("<ellipse");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the polygon primitive example", () => {
    const scene = requireVizxExample("polygon-primitive").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.kind === "polygon")).toBe(true);
    expect(result.resolved.objects.some((object) => object.kind === "polygon")).toBe(true);
    expect(result.renderScene.children.some((child) => child.kind === "polygon")).toBe(true);
    expect(svg).toContain("<polygon");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the path primitive example", () => {
    const scene = requireVizxExample("path-primitive").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.kind === "path")).toBe(true);
    expect(result.resolved.objects.some((object) => object.kind === "path")).toBe(true);
    expect(result.renderScene.children.some((child) => child.kind === "path")).toBe(true);
    expect(svg).toContain("<path");
    expect(svg).toContain(' d="M ');
    expect(svg).toContain(" L ");
    expect(svg).toContain(" Z\"");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the bezier-path example", () => {
    const scene = requireVizxExample("bezier-path").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "bezier.demo")).toBe(true);
    expect(svg).toContain(" Q ");
    expect(svg).toContain(" C ");
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the builder-bezier-path example", () => {
    const scene = requireVizxExample("builder-bezier-path").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "bezier.demo")).toBe(true);
    expect(svg).toContain(" Q ");
    expect(svg).toContain(" C ");
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the builder-basic example", () => {
    const scene = requireVizxExample("builder-basic").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "A")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "B")).toBe(true);
    expect(result.resolved.connectors.some((resolvedConnector) => resolvedConnector.id === "A->B")).toBe(true);
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the builder-relative-placement example", () => {
    const scene = requireVizxExample("builder-relative-placement").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "Center")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "Right")).toBe(true);
    expect(result.resolved.connectors.some((resolvedConnector) => resolvedConnector.id === "center-right")).toBe(true);
    expect(svg).toContain("<path");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and resolves the styled primitives example", () => {
    const scene = requireVizxExample("styled-primitives").createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "styled.line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "styled.ellipse")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "styled.polygon")).toBe(true);
    expect(svg).toContain('stroke="#ef4444"');
    expect(svg).toContain('stroke="#0ea5e9"');
    expect(svg).toContain('stroke="#0f766e"');
    expect(svg).toContain('opacity="0.8"');
    expect(svg).toContain('stroke-dasharray="8 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('stroke-linejoin="round"');
    expect(svg).toContain('fill-rule="evenodd"');
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

  it("keeps builder-relative-placement semantically aligned with relative-placement", () => {
    const literalScene = requireVizxExample("relative-placement").createScene();
    const builderScene = requireVizxExample("builder-relative-placement").createScene();
    const literalResult = resolveScene(literalScene);
    const builderResult = resolveScene(builderScene);

    expect(literalResult.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(builderResult.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    const literalObjectIds = literalScene.objects.map((object) => object.id);
    const builderObjectIds = builderScene.objects.map((object) => object.id);
    expect(builderObjectIds).toEqual(literalObjectIds);

    const literalConnectorRefs = (literalScene.connectors ?? [])
      .map((connector) => ({ id: connector.id, from: connector.from, to: connector.to }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const builderConnectorRefs = (builderScene.connectors ?? [])
      .map((connector) => ({ id: connector.id, from: connector.from, to: connector.to }))
      .sort((a, b) => a.id.localeCompare(b.id));
    expect(builderConnectorRefs).toEqual(literalConnectorRefs);

    const literalPlacements = literalScene.objects.map((object) => ({ id: object.id, placement: object.placement }));
    const builderPlacements = builderScene.objects.map((object) => ({ id: object.id, placement: object.placement }));
    expect(builderPlacements).toEqual(literalPlacements);

    const builderCenter = requireResolvedObject(builderResult, "Center");
    const builderRight = requireResolvedObject(builderResult, "Right");
    const builderLeft = requireResolvedObject(builderResult, "Left");
    const builderAbove = requireResolvedObject(builderResult, "Above");
    const builderBelow = requireResolvedObject(builderResult, "Below");

    expect(builderRight.anchors.west?.x).toBeGreaterThan(builderCenter.anchors.east!.x);
    expect(builderLeft.anchors.east?.x).toBeLessThan(builderCenter.anchors.west!.x);
    expect(builderAbove.anchors.south?.y).toBeLessThan(builderCenter.anchors.north!.y);
    expect(builderBelow.anchors.north?.y).toBeGreaterThan(builderCenter.anchors.south!.y);
  });

  it("keeps builder-bezier-path semantically aligned with bezier-path", () => {
    const literalScene = requireVizxExample("bezier-path").createScene();
    const builderScene = requireVizxExample("builder-bezier-path").createScene();
    const literalResult = resolveScene(literalScene);
    const builderResult = resolveScene(builderScene);
    const literalSvg = renderSvg(literalResult.renderScene, { pretty: true });
    const builderSvg = renderSvg(builderResult.renderScene, { pretty: true });

    expect(literalResult.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(builderResult.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    const literalObjectIds = literalScene.objects.map((object) => object.id);
    const builderObjectIds = builderScene.objects.map((object) => object.id);
    expect(builderObjectIds).toEqual(literalObjectIds);

    const literalPath = literalScene.objects.find((object) => object.id === "bezier.demo");
    const builderPath = builderScene.objects.find((object) => object.id === "bezier.demo");
    expect(literalPath?.kind).toBe("path");
    expect(builderPath?.kind).toBe("path");

    if (!literalPath || literalPath.kind !== "path" || !builderPath || builderPath.kind !== "path") {
      throw new Error("Expected bezier.demo to be path objects in both scenes");
    }

    const literalCommandKinds = literalPath.commands.map((command) => command.kind);
    const builderCommandKinds = builderPath.commands.map((command) => command.kind);
    expect(builderCommandKinds).toEqual(literalCommandKinds);

    const literalResolved = requireResolvedObject(literalResult, "bezier.demo");
    const builderResolved = requireResolvedObject(builderResult, "bezier.demo");
    expect(builderResolved.bbox).toEqual(literalResolved.bbox);

    expect(literalSvg).toContain(" Q ");
    expect(literalSvg).toContain(" C ");
    expect(builderSvg).toContain(" Q ");
    expect(builderSvg).toContain(" C ");
    expect(builderSvg).toContain('marker-end="url(#vizx-marker-arrow)"');
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

  it("keeps alignment-family inspection output readable with object and connector references", () => {
    const inspection = inspectScene(requireVizxExample("alignment-family").createScene());
    const expectedIds = ["Reference", "AxisX", "AxisY", "EdgeLeft", "EdgeRight", "EdgeTop", "EdgeBottom"];
    const topLevelIds = inspection.objects.map((object) => object.id);

    expect(inspection.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(topLevelIds).toEqual(expectedIds);
    expect(inspection.connectors.length).toBeGreaterThanOrEqual(6);

    for (const connector of inspection.connectors) {
      expect(connector.id.length).toBeGreaterThan(0);
      expect(connector.from.objectId.length).toBeGreaterThan(0);
      expect(connector.from.anchor.length).toBeGreaterThan(0);
      expect(connector.to.objectId.length).toBeGreaterThan(0);
      expect(connector.to.anchor.length).toBeGreaterThan(0);
      expect(Number.isFinite(connector.from.point.x)).toBe(true);
      expect(Number.isFinite(connector.from.point.y)).toBe(true);
      expect(Number.isFinite(connector.to.point.x)).toBe(true);
      expect(Number.isFinite(connector.to.point.y)).toBe(true);
    }

    for (const objectId of expectedIds) {
      const object = requireInspectionObject(inspection, objectId);

      expect(object.bbox).toBeDefined();
      expect(object.anchors).toBeDefined();

      if (objectId === "Reference" || objectId.startsWith("Axis") || objectId.startsWith("Edge")) {
        const anchorNames = ["center", "north", "south", "east", "west"] as const;

        for (const anchorName of anchorNames) {
          const anchor = object.anchors[anchorName];

          expect(anchor).toBeDefined();

          if (!anchor) {
            throw new Error(`Expected ${objectId}.${anchorName} anchor in inspection`);
          }

          expect(Number.isFinite(anchor.x)).toBe(true);
          expect(Number.isFinite(anchor.y)).toBe(true);
        }
      }
    }
  });

  it("registers and semantically validates aspirational-android-lifecycle", () => {
    const example = requireVizxExample("aspirational-android-lifecycle");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const connectorRefs = (scene.connectors ?? []).map((connector) => ({
      id: connector.id,
      from: connector.from.objectId,
      to: connector.to.objectId,
    }));

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "start")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "onResume")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "running")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "onDestroy")).toBe(true);

    expect(connectorRefs).toContainEqual({ id: "lifecycle.start-create", from: "start", to: "onCreate" });
    expect(connectorRefs).toContainEqual({ id: "lifecycle.pause-stop", from: "onPause", to: "onStop" });
    expect(connectorRefs).toContainEqual({ id: "lifecycle.stop-restart", from: "onStop", to: "onRestart" });
    expect(connectorRefs).toContainEqual({ id: "lifecycle.pause-killed", from: "onPause", to: "killed" });

    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(svg.length).toBeGreaterThan(0);
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-labeled-polygon", () => {
    const example = requireVizxExample("aspirational-labeled-polygon");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const polygon = requireResolvedObject(result, "poly.main");
    const angleMark = scene.objects.find((object) => object.id === "beta.arc.0");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "poly.main" && object.kind === "polygon")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "vertex.A")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "vertex.C")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "vertex.E")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "beta.arc.0" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "beta.0")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "beta.1")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "beta.2")).toBe(true);
    expect(polygon.bbox.width).toBeGreaterThan(0);
    expect(polygon.bbox.height).toBeGreaterThan(0);
    expect(angleMark?.kind).toBe("path");
    if (!angleMark || angleMark.kind !== "path") {
      throw new Error("Expected beta.arc.0 path object");
    }

    expect(angleMark.commands.some((command) => command.kind === "arc")).toBe(true);
    expect(svg).toContain("<polygon");
    expect(svg).toContain(" A ");
    expect(svg).toContain('stroke-linejoin="round"');
    expect(svg).toContain('stroke-dasharray="6 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-projectile-motion-lite", () => {
    const example = requireVizxExample("aspirational-projectile-motion-lite");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const trajectory = scene.objects.find((object) => object.id === "proj.trajectory");
    const angleMark = scene.objects.find((object) => object.id === "proj.angle.arc");
    const launchVector = result.resolved.objects.find((object) => object.id === "proj.launch.vector");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "proj.ground")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "proj.trajectory" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "proj.launch.vector" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "proj.angle.arc" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "proj.angle.label")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "proj.caption")).toBe(true);

    expect(trajectory?.kind).toBe("path");
    if (!trajectory || trajectory.kind !== "path") {
      throw new Error("Expected proj.trajectory path object");
    }

    expect(
      trajectory.commands.some((command) => command.kind === "quadraticCurveTo")
      || trajectory.commands.some((command) => command.kind === "cubicCurveTo"),
    ).toBe(true);

    expect(angleMark?.kind).toBe("path");
    if (!angleMark || angleMark.kind !== "path") {
      throw new Error("Expected proj.angle.arc path object");
    }

    expect(angleMark.commands.some((command) => command.kind === "arc")).toBe(true);
    expect(launchVector?.renderNode.style?.markerEnd).toBe("arrow");
    expect(svg).toContain('id="proj.trajectory"');
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(svg).toContain('stroke-dasharray="6 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-geometry-1-lite", () => {
    const example = requireVizxExample("aspirational-geometry-1-lite");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const angleMark = scene.objects.find((object) => object.id === "geo1.angle.frame");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "geo1.axis.x" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.origin.circle" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.map.p_to_pp" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.point.pp" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.label.p")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.label.pp")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.label.ppp")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.label.map")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "geo1.right.angle" && object.kind === "path")).toBe(true);
    expect(angleMark?.kind).toBe("path");

    const rightAngleMark = scene.objects.find((object) => object.id === "geo1.right.angle");

    if (!angleMark || angleMark.kind !== "path") {
      throw new Error("Expected geo1.angle.frame path object");
    }

    expect(angleMark.commands.some((command) => command.kind === "arc")).toBe(true);
    expect(rightAngleMark?.kind).toBe("path");
    if (!rightAngleMark || rightAngleMark.kind !== "path") {
      throw new Error("Expected geo1.right.angle path object");
    }
    expect(rightAngleMark.commands.filter((command) => command.kind === "lineTo").length).toBeGreaterThanOrEqual(2);
    expect(svg).toContain("<circle");
    expect(svg).toContain("<line");
    expect(svg).toContain(" A ");
    expect(svg).toContain('stroke-dasharray="4 3"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-pendagon-lite", () => {
    const example = requireVizxExample("aspirational-pendagon-lite");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "pend.main.circle" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.pentagon" && object.kind === "polygon")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.guide.ou" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.point.p1" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.point.t" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.label.p1" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.label.t" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.label.ou" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.tick.ap.0" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "pend.tick.ap.1" && object.kind === "path")).toBe(true);
    expect(svg).toContain("<circle");
    expect(svg).toContain("<line");
    expect(svg).toContain("<polygon");
    expect(svg).toContain("<text");
    expect(svg).toContain("<path");
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('stroke-linejoin="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-pullys-lite", () => {
    const example = requireVizxExample("aspirational-pullys-lite");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const belt = scene.objects.find((object) => object.id === "apl.belt.main");
    const leftAngle = scene.objects.find((object) => object.id === "apl.angle.left");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "apl.pulley.left" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.pulley.right" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.belt.main" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.guide.radius.left.upper" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.guide.branch.left.radius" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.rope.left.branch" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.point.left.branch" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.tick.left.0" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.angle.left" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.label.alpha1" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "apl.label.mass.center" && object.kind === "text")).toBe(true);

    expect(belt?.kind).toBe("path");
    if (!belt || belt.kind !== "path") {
      throw new Error("Expected apl.belt.main path object");
    }

    expect(belt.commands.filter((command) => command.kind === "arc")).toHaveLength(2);
    expect(belt.commands.filter((command) => command.kind === "lineTo").length).toBeGreaterThanOrEqual(2);

    expect(leftAngle?.kind).toBe("path");
    if (!leftAngle || leftAngle.kind !== "path") {
      throw new Error("Expected apl.angle.left path object");
    }

    expect(leftAngle.commands.some((command) => command.kind === "arc")).toBe(true);
    expect(svg).toContain("<circle");
    expect(svg).toContain("<rect");
    expect(svg).toContain("<line");
    expect(svg).toContain("<path");
    expect(svg).toContain(" A ");
    expect(svg).toContain("<text");
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates aspirational-arrow-label", () => {
    const example = requireVizxExample("aspirational-arrow-label");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const segment = requireResolvedObject(result, "arrow.segment");
    const label = requireResolvedObject(result, "arrow.label");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "arrow.segment")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "arrow.label")).toBe(true);
    expect(svg).toContain('marker-start="url(#vizx-marker-arrow)"');
    expect(svg).toContain('marker-end="url(#vizx-marker-arrow)"');
    expect(label.anchors.center?.x).toBeGreaterThanOrEqual(segment.bbox.x - 16);
    expect(label.anchors.center?.x).toBeLessThanOrEqual(segment.bbox.x + segment.bbox.width + 16);
    expect(Math.abs((label.anchors.center?.y ?? 0) - segment.bbox.y)).toBeLessThan(36);
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates technical-angle-arc", () => {
    const example = requireVizxExample("technical-angle-arc");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const angleMark = scene.objects.find((object) => object.id === "angle.mark");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(inspection.objects.some((object) => object.id === "angle.mark" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "angle.label")).toBe(true);
    expect(angleMark?.kind).toBe("path");

    if (!angleMark || angleMark.kind !== "path") {
      throw new Error("Expected angle.mark path object");
    }

    expect(angleMark.commands.some((command) => command.kind === "arc")).toBe(true);
    expect(svg).toContain(" A ");
    expect(svg).toContain("<path");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates technical-linear-plot", () => {
    const example = requireVizxExample("technical-linear-plot");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const series = scene.objects.find((object) => object.id === "plot.series");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "plot.frame")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "plot.x.axis" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "plot.y.axis" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "plot.x.label.0" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "plot.series" && object.kind === "polyline")).toBe(true);
    expect(series?.kind).toBe("polyline");
    expect(svg).toContain('id="plot.series"');
    expect(svg).toContain("<polyline");
    expect(svg).toContain("<text");
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates technical-tangents", () => {
    const example = requireVizxExample("technical-tangents");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "tg.circle" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.segment.0" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.segment.1" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.tangent.line.atA" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.external.point" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.label.t0" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tg.label.t1" && object.kind === "text")).toBe(true);
    expect(svg).toContain('id="tg.tangent.line.atA"');
    expect(svg).toContain('stroke-dasharray="5 4"');
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates technical-common-tangents", () => {
    const example = requireVizxExample("technical-common-tangents");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "tct.circle.a" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.circle.b" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.tangent.external.0" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.tangent.external.1" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.tangent.internal.0" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.point.external.a.0" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.label.external.a.0" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tct.radius.external.a.0" && object.kind === "line")).toBe(true);
    expect(svg).toContain("<circle");
    expect(svg).toContain("<line");
    expect(svg).toContain("<text");
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
  });

  it("registers and semantically validates technical-belt-pulley", () => {
    const example = requireVizxExample("technical-belt-pulley");
    const scene = example.createScene();
    const result = resolveScene(scene);
    const inspection = inspectScene(scene);
    const svg = renderSvg(result.renderScene, { pretty: true });
    const debugScene = createDebugRenderScene(result);
    const belt = scene.objects.find((object) => object.id === "tbp.belt");
    const crossedBelt = scene.objects.find((object) => object.id === "tbp.crossed.belt");

    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(svg.length).toBeGreaterThan(0);
    expect(inspection.objects.some((object) => object.id === "tbp.pulley.a" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.pulley.b" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.belt" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.label.a" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.label.b" && object.kind === "text")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.contact.a.upper" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.guide.radius.a.upper" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.crossed.belt" && object.kind === "path")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.cross.contact.c.upper" && object.kind === "circle")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.cross.guide.radius.c.upper" && object.kind === "line")).toBe(true);
    expect(inspection.objects.some((object) => object.id === "tbp.caption.crossed" && object.kind === "text")).toBe(true);

    expect(belt?.kind).toBe("path");
    if (!belt || belt.kind !== "path") {
      throw new Error("Expected tbp.belt path object");
    }

    expect(belt.commands.filter((command) => command.kind === "arc")).toHaveLength(2);
    expect(belt.commands.filter((command) => command.kind === "lineTo").length).toBeGreaterThanOrEqual(2);

    expect(crossedBelt?.kind).toBe("path");
    if (!crossedBelt || crossedBelt.kind !== "path") {
      throw new Error("Expected tbp.crossed.belt path object");
    }

    expect(crossedBelt.commands.filter((command) => command.kind === "arc")).toHaveLength(2);
    expect(crossedBelt.commands.filter((command) => command.kind === "lineTo").length).toBeGreaterThanOrEqual(2);

    expect(svg).toContain("<circle");
    expect(svg).toContain("<path");
    expect(svg).toContain(" A ");
    expect(svg).toContain("<text");
    expect(svg).toContain('stroke-dasharray="4 4"');
    expect(svg).toContain('stroke-dasharray="7 4"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
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