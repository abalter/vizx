import {
  defaultConnectorStyle,
  type RenderNode,
  type RenderScene,
  type ResolvedDiagram,
} from "@vizx/core";

export interface RenderSceneOptions {
  readonly padding?: number;
}

export function diagramToRenderScene(
  diagram: ResolvedDiagram,
  options: RenderSceneOptions = {},
): RenderScene {
  const padding = options.padding ?? 24;

  const nodes: RenderNode[] = [];

  for (const connector of diagram.connectors) {
    nodes.push({
      kind: "path",
      id: connector.id,
      d: `M ${connector.start.x} ${connector.start.y} L ${connector.end.x} ${connector.end.y}`,
      style: connector.style,
    });
  }

  for (const object of diagram.objects) {
    if (object.kind === "textBox") {
      nodes.push({
        kind: "group",
        id: object.id,
        children: [
          {
            kind: "rect",
            id: `${object.id}.rect`,
            x: object.box.x,
            y: object.box.y,
            width: object.box.width,
            height: object.box.height,
            rx: 6,
            ry: 6,
            style: {
              stroke: object.style.stroke,
              fill: object.style.fill,
              strokeWidth: object.style.strokeWidth,
            },
          },
          {
            kind: "text",
            id: `${object.id}.text`,
            x: object.textPosition.x,
            y: object.textPosition.y,
            text: object.label,
            style: {
              fontFamily: object.style.fontFamily,
              fontSize: object.style.fontSize,
              textAnchor: "middle",
              dominantBaseline: "alphabetic",
              fill: "black",
            },
          },
        ],
      });
    }
  }

  const bounds = getSceneBounds(nodes);

  return {
    kind: "scene",
    width: Math.max(1, bounds.maxX - bounds.minX + padding * 2),
    height: Math.max(1, bounds.maxY - bounds.minY + padding * 2),
    defs: [
      {
        kind: "marker",
        id: "arrowhead",
        viewBox: "0 0 10 10",
        path: "M 0 0 L 10 5 L 0 10 z",
        refX: 10,
        refY: 5,
        markerWidth: 8,
        markerHeight: 8,
        orient: "auto",
        style: {
          fill: defaultConnectorStyle.stroke,
        },
      },
    ],
    children: [
      {
        kind: "group",
        id: "viewport-shift",
        transform: `translate(${padding - bounds.minX}, ${padding - bounds.minY})`,
        children: nodes,
      },
    ],
  };
}

function getSceneBounds(nodes: readonly RenderNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const points: { x: number; y: number }[] = [];

  const visit = (node: RenderNode): void => {
    switch (node.kind) {
      case "group":
        node.children.forEach(visit);
        break;
      case "rect":
        points.push({ x: node.x, y: node.y });
        points.push({ x: node.x + node.width, y: node.y + node.height });
        break;
      case "circle":
        points.push({ x: node.cx - node.r, y: node.cy - node.r });
        points.push({ x: node.cx + node.r, y: node.cy + node.r });
        break;
      case "text":
        points.push({ x: node.x, y: node.y });
        break;
      case "path": {
        const numbers = node.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        for (let index = 0; index < numbers.length; index += 2) {
          const x = numbers[index];
          const y = numbers[index + 1];
          if (x !== undefined && y !== undefined) points.push({ x, y });
        }
        break;
      }
    }
  };

  nodes.forEach(visit);

  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  }

  return {
    minX: Math.min(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxX: Math.max(...points.map((p) => p.x)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}
