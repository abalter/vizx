import type { Style } from "./style";

export interface RenderScene {
  readonly kind: "scene";
  readonly width: number;
  readonly height: number;
  readonly children: readonly RenderNode[];
  readonly defs?: readonly RenderDef[];
}

export type RenderDef = RenderMarkerDef;

export interface RenderMarkerDef {
  readonly kind: "marker";
  readonly id: string;
  readonly path: string;
  readonly viewBox: string;
  readonly refX: number;
  readonly refY: number;
  readonly markerWidth: number;
  readonly markerHeight: number;
  readonly orient: "auto" | "auto-start-reverse" | number;
  readonly style?: Style;
}

export type RenderNode =
  | RenderGroupNode
  | RenderRectNode
  | RenderTextNode
  | RenderPathNode
  | RenderCircleNode;

export interface BaseRenderNode {
  readonly id?: string;
  readonly style?: Style;
  readonly transform?: string;
}

export interface RenderGroupNode extends BaseRenderNode {
  readonly kind: "group";
  readonly children: readonly RenderNode[];
}

export interface RenderRectNode extends BaseRenderNode {
  readonly kind: "rect";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface RenderTextNode extends BaseRenderNode {
  readonly kind: "text";
  readonly x: number;
  readonly y: number;
  readonly text: string;
}

export interface RenderPathNode extends BaseRenderNode {
  readonly kind: "path";
  readonly d: string;
}

export interface RenderCircleNode extends BaseRenderNode {
  readonly kind: "circle";
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}
