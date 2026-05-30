import type { Style } from "@vizx/core";
import type { RenderDef, RenderNode, RenderScene, RenderTransform } from "./scene";

export interface SvgRenderOptions {
  readonly pretty?: boolean;
}

const builtInArrowMarkerId = "vizx-marker-arrow";

export function renderSvg(scene: RenderScene, options: SvgRenderOptions = {}): string {
  const indent = options.pretty === false ? "" : "  ";
  const newline = options.pretty === false ? "" : "\n";
  const builtInDefs = createBuiltInMarkerDefs(scene.children);
  const defs = [...builtInDefs, ...(scene.defs ?? [])];

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.viewBox.width}" height="${scene.viewBox.height}" viewBox="${scene.viewBox.minX} ${scene.viewBox.minY} ${scene.viewBox.width} ${scene.viewBox.height}">`,
  );

  if (defs.length > 0) {
    parts.push(`${indent}<defs>`);
    for (const def of defs) {
      parts.push(renderDef(def, indent + indent));
    }
    parts.push(`${indent}</defs>`);
  }

  for (const child of scene.children) {
    parts.push(renderNode(child, indent));
  }

  parts.push(`</svg>`);
  return parts.join(newline);
}

function renderDef(def: RenderDef, indent: string): string {
  switch (def.kind) {
    case "marker": {
      const attrs = attrsToString({
        id: def.id,
        viewBox: def.viewBox,
        refX: def.refX,
        refY: def.refY,
        markerWidth: def.markerWidth,
        markerHeight: def.markerHeight,
        orient: def.orient,
      });
      return `${indent}<marker ${attrs}><path d="${escapeAttr(def.path)}"${styleAttrs(def.style)} /></marker>`;
    }
  }
}

function renderNode(node: RenderNode, indent: string): string {
  const common = commonAttrs(node);

  switch (node.kind) {
    case "group": {
      const open = `${indent}<g${common}>`;
      const children = node.children.map((child) => renderNode(child, indent + "  ")).join("\n");
      return `${open}\n${children}\n${indent}</g>`;
    }

    case "rect": {
      const attrs = attrsToString({
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        rx: node.rx,
        ry: node.ry,
      });
      return `${indent}<rect${common} ${attrs} />`;
    }

    case "text": {
      const attrs = attrsToString({ x: node.x, y: node.y });
      return `${indent}<text${common} ${attrs}>${escapeText(node.text)}</text>`;
    }

    case "line": {
      const attrs = attrsToString({ x1: node.x1, y1: node.y1, x2: node.x2, y2: node.y2 });
      return `${indent}<line${common} ${attrs} />`;
    }

    case "ellipse": {
      const attrs = attrsToString({ cx: node.cx, cy: node.cy, rx: node.rx, ry: node.ry });
      return `${indent}<ellipse${common} ${attrs} />`;
    }

    case "polyline": {
      const attrs = attrsToString({ points: node.points.map((point) => `${point.x},${point.y}`).join(" ") });
      return `${indent}<polyline${common} ${attrs} />`;
    }

    case "polygon": {
      const attrs = attrsToString({ points: node.points.map((point) => `${point.x},${point.y}`).join(" ") });
      return `${indent}<polygon${common} ${attrs} />`;
    }

    case "path": {
      const attrs = attrsToString({ d: node.d });
      return `${indent}<path${common} ${attrs} />`;
    }

    case "circle": {
      const attrs = attrsToString({ cx: node.cx, cy: node.cy, r: node.r });
      return `${indent}<circle${common} ${attrs} />`;
    }
  }
}

function commonAttrs(node: { id?: string; transform?: RenderTransform; style?: Style }): string {
  return attrsToString({ id: node.id, transform: transformToString(node.transform) }) + styleAttrs(node.style);
}

function transformToString(transform?: RenderTransform): string | undefined {
  if (!transform) return undefined;

  switch (transform.kind) {
    case "translate":
      return `translate(${transform.x} ${transform.y})`;
  }
}

function styleAttrs(style?: Style): string {
  if (!style) return "";

  const attrs: Record<string, unknown> = {
    stroke: style.stroke,
    fill: style.fill,
    "stroke-width": style.strokeWidth,
    "stroke-dasharray": dasharrayAttr(style.strokeDasharray),
    "stroke-linecap": style.strokeLineCap,
    "stroke-linejoin": style.strokeLineJoin,
    "fill-rule": style.fillRule,
    "font-family": style.fontFamily,
    "font-size": style.fontSize,
    "text-anchor": style.textAnchor,
    "dominant-baseline": style.dominantBaseline,
    opacity: style.opacity,
    "marker-start": markerReference(style.markerStart),
    "marker-end": markerReference(style.markerEnd),
  };

  return attrsToString(attrs);
}

function dasharrayAttr(dasharray: readonly number[] | undefined): string | undefined {
  if (!dasharray || dasharray.length === 0) {
    return undefined;
  }

  return dasharray.join(" ");
}

function markerReference(markerName: string | undefined): string | undefined {
  if (!markerName) {
    return undefined;
  }

  return `url(#${resolveMarkerId(markerName)})`;
}

function resolveMarkerId(markerName: string): string {
  if (isBuiltInArrowMarker(markerName)) {
    return builtInArrowMarkerId;
  }

  return markerName;
}

function createBuiltInMarkerDefs(nodes: readonly RenderNode[]): RenderDef[] {
  return collectBuiltInMarkers(nodes).has("arrow")
    ? [{
        kind: "marker",
        id: builtInArrowMarkerId,
        viewBox: "0 0 10 10",
        path: "M 0 0 L 10 5 L 0 10 z",
        refX: 10,
        refY: 5,
        markerWidth: 8,
        markerHeight: 8,
        orient: "auto",
        style: { fill: "black" },
      }]
    : [];
}

function collectBuiltInMarkers(nodes: readonly RenderNode[]): Set<string> {
  const markers = new Set<string>();

  const visit = (node: RenderNode): void => {
    if (node.style?.markerStart && isBuiltInArrowMarker(node.style.markerStart)) {
      markers.add("arrow");
    }

    if (node.style?.markerEnd && isBuiltInArrowMarker(node.style.markerEnd)) {
      markers.add("arrow");
    }

    if (node.kind === "group") {
      node.children.forEach(visit);
    }
  };

  nodes.forEach(visit);
  return markers;
}

function isBuiltInArrowMarker(markerName: string): boolean {
  return markerName === "arrow" || markerName === "arrowhead";
}

function attrsToString(attrs: Record<string, unknown>): string {
  const rendered = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${escapeAttr(String(value))}"`);

  return rendered.length > 0 ? ` ${rendered.join(" ")}` : "";
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
