import type { Style } from "@vizx/core";

export interface RenderViewBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

export interface RenderStyle extends Style {}

export interface RenderTranslateTransform {
  readonly kind: "translate";
  readonly x: number;
  readonly y: number;
}

export type RenderTransform = RenderTranslateTransform;

export interface RenderScene {
  readonly kind: "scene";
  readonly viewBox: RenderViewBox;
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
  readonly style?: RenderStyle;
}

export type RenderNode = RenderGroup | RenderRect | RenderCircle | RenderEllipse | RenderLine | RenderPolyline | RenderPath | RenderText;

export interface BaseRenderNode {
  readonly id?: string;
  readonly style?: RenderStyle;
  readonly transform?: RenderTransform;
}

export interface RenderGroup extends BaseRenderNode {
  readonly kind: "group";
  readonly children: readonly RenderNode[];
}

export interface RenderRect extends BaseRenderNode {
  readonly kind: "rect";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface RenderCircle extends BaseRenderNode {
  readonly kind: "circle";
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export interface RenderEllipse extends BaseRenderNode {
  readonly kind: "ellipse";
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export interface RenderLine extends BaseRenderNode {
  readonly kind: "line";
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface RenderPolyline extends BaseRenderNode {
  readonly kind: "polyline";
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

export interface RenderPath extends BaseRenderNode {
  readonly kind: "path";
  readonly d: string;
}

export interface RenderText extends BaseRenderNode {
  readonly kind: "text";
  readonly x: number;
  readonly y: number;
  readonly text: string;
}