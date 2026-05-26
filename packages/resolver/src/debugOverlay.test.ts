import { describe, expect, it } from "vitest";
import { createBasicDemoScene } from "@vizx/cli/src/demoScene";
import { createDebugOverlay, createDebugRenderScene } from "./debugOverlay";
import { resolveScene } from "./resolveScene";

describe("debug overlay", () => {
  it("returns render nodes for bboxes, anchors, ids, and connector endpoints", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved);

    expect(overlay.some((node) => node.kind === "rect" && node.id === "debug-bbox-A")).toBe(true);
    expect(overlay.some((node) => node.kind === "text" && node.id === "debug-label-A")).toBe(true);
    expect(overlay.some((node) => node.kind === "circle" && node.id === "debug-anchor-A-center")).toBe(true);
    expect(overlay.some((node) => node.kind === "circle" && node.id === "debug-endpoint-edge-1-from")).toBe(true);
    expect(overlay.some((node) => node.kind === "circle" && node.id === "debug-endpoint-edge-1-to")).toBe(true);
  });

  it("includes nested child object overlay nodes", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved);

    expect(overlay.some((node) => node.id === "debug-bbox-A.label")).toBe(true);
    expect(overlay.some((node) => node.id === "debug-bbox-A.frame")).toBe(true);
  });

  it("omits bounding boxes when disabled", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved, { showBoundingBoxes: false });

    expect(overlay.some((node) => node.id === "debug-bbox-A")).toBe(false);
    expect(overlay.some((node) => node.id === "debug-label-A")).toBe(true);
  });

  it("omits anchor markers when disabled", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved, { showAnchors: false });

    expect(overlay.some((node) => node.id === "debug-anchor-A-center")).toBe(false);
    expect(overlay.some((node) => node.id === "debug-bbox-A")).toBe(true);
  });

  it("omits labels when disabled", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved, { showLabels: false });

    expect(overlay.some((node) => node.id === "debug-label-A")).toBe(false);
    expect(overlay.some((node) => node.id === "debug-bbox-A")).toBe(true);
  });

  it("omits connector endpoints when disabled", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved, { showConnectorEndpoints: false });

    expect(overlay.some((node) => node.id === "debug-endpoint-edge-1-from")).toBe(false);
    expect(overlay.some((node) => node.id === "debug-endpoint-edge-1-to")).toBe(false);
  });

  it("omits nested child overlay nodes when disabled", () => {
    const result = resolveScene(createBasicDemoScene());
    const overlay = createDebugOverlay(result.resolved, { includeChildren: false });

    expect(overlay.some((node) => node.id === "debug-bbox-A")).toBe(true);
    expect(overlay.some((node) => node.id === "debug-bbox-A.label")).toBe(false);
    expect(overlay.some((node) => node.id === "debug-bbox-A.frame")).toBe(false);
  });

  it("creates a debug render scene without mutating the original render scene", () => {
    const result = resolveScene(createBasicDemoScene());
    const originalChildren = result.renderScene.children;
    const debugScene = createDebugRenderScene(result);

    expect(debugScene.children.length).toBeGreaterThan(result.renderScene.children.length);
    expect(debugScene.children.at(-1)?.kind).toBe("group");
    expect(debugScene.children.at(-1)?.id).toBe("debug-overlay");
    expect(result.renderScene.children).toBe(originalChildren);
    expect(result.renderScene.children.some((node) => node.id === "debug-overlay")).toBe(false);
  });
});