import type { ResolveSceneResult, ResolvedObject, ResolvedObjectGraph } from "./resolveScene";
import type { RenderNode, RenderScene } from "@vizx/renderer-svg";

const debugColors = {
  bbox: "#d92d20",
  anchor: "#2563eb",
  endpoint: "#16a34a",
  label: "#7c3aed",
} as const;

export interface DebugOverlayOptions {
  readonly showBoundingBoxes?: boolean;
  readonly showAnchors?: boolean;
  readonly showLabels?: boolean;
  readonly showConnectorEndpoints?: boolean;
  readonly includeChildren?: boolean;
}

const defaultDebugOverlayOptions: Required<DebugOverlayOptions> = {
  showBoundingBoxes: true,
  showAnchors: true,
  showLabels: true,
  showConnectorEndpoints: true,
  includeChildren: true,
};

export function createDebugOverlay(
  resolved: ResolvedObjectGraph,
  options: DebugOverlayOptions = {},
): RenderNode[] {
  const resolvedOptions = resolveDebugOverlayOptions(options);
  const overlayNodes: RenderNode[] = [];

  for (const object of resolved.objects) {
    overlayNodes.push(...createDebugNodesForObject(object, resolvedOptions));
  }

  if (resolvedOptions.showConnectorEndpoints) {
    for (const connector of resolved.connectors) {
    overlayNodes.push(
      {
        kind: "circle",
        id: `debug-endpoint-${connector.id}-from`,
        cx: connector.start.x,
        cy: connector.start.y,
        r: 2.5,
        style: { stroke: debugColors.endpoint, fill: debugColors.endpoint, strokeWidth: 1 },
      },
      {
        kind: "circle",
        id: `debug-endpoint-${connector.id}-to`,
        cx: connector.end.x,
        cy: connector.end.y,
        r: 2.5,
        style: { stroke: debugColors.endpoint, fill: debugColors.endpoint, strokeWidth: 1 },
      },
    );
  }
  }

  return overlayNodes;
}

export function createDebugRenderScene(
  result: ResolveSceneResult,
  options: DebugOverlayOptions = {},
): RenderScene {
  return {
    ...result.renderScene,
    children: [
      ...result.renderScene.children,
      {
        kind: "group",
        id: "debug-overlay",
        children: createDebugOverlay(result.resolved, options),
      },
    ],
  };
}

function createDebugNodesForObject(
  object: ResolvedObject,
  options: Required<DebugOverlayOptions>,
): RenderNode[] {
  const nodes: RenderNode[] = [];

  if (options.showBoundingBoxes) {
    nodes.push({
      kind: "rect",
      id: `debug-bbox-${object.id}`,
      x: object.bbox.x,
      y: object.bbox.y,
      width: object.bbox.width,
      height: object.bbox.height,
      style: {
        stroke: debugColors.bbox,
        fill: "none",
        strokeWidth: 0.75,
        opacity: 0.9,
      },
    });
  }

  if (options.showLabels) {
    nodes.push({
      kind: "text",
      id: `debug-label-${object.id}`,
      x: object.bbox.x,
      y: object.bbox.y - 4,
      text: object.id,
      style: {
        fill: debugColors.label,
        fontSize: 10,
        fontFamily: "system-ui, sans-serif",
        textAnchor: "start",
        dominantBaseline: "alphabetic",
      },
    });
  }

  if (options.showAnchors) {
    for (const [anchorName, anchor] of Object.entries(object.anchors)) {
      if (!anchor) {
        continue;
      }

      nodes.push({
        kind: "circle",
        id: `debug-anchor-${object.id}-${anchorName}`,
        cx: anchor.x,
        cy: anchor.y,
        r: 1.8,
        style: {
          stroke: debugColors.anchor,
          fill: debugColors.anchor,
          strokeWidth: 1,
        },
      });
    }
  }

  if (options.includeChildren) {
    for (const child of object.children ?? []) {
      nodes.push(...createDebugNodesForObject(child, options));
    }
  }

  return nodes;
}

function resolveDebugOverlayOptions(options: DebugOverlayOptions): Required<DebugOverlayOptions> {
  return {
    ...defaultDebugOverlayOptions,
    ...options,
  };
}