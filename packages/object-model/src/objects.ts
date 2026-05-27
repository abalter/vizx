import type { Style } from "@vizx/core";
import type { Point, Transform } from "@vizx/geometry";
import type { AnchorRef } from "./anchors";

export interface AbsolutePlacement {
  readonly kind: "absolute";
  readonly position: Point;
}

export type PlacementRelation = "rightOf" | "leftOf" | "above" | "below";

export interface RelativePlacement {
  readonly kind: PlacementRelation;
  readonly reference: AnchorRef;
  readonly gap: number;
}

export type ObjectPlacement = AbsolutePlacement | RelativePlacement;

export interface AlignYRelation {
  readonly relation: "alignY";
  readonly reference: AnchorRef;
}

export interface AlignXRelation {
  readonly relation: "alignX";
  readonly reference: AnchorRef;
}

export interface AlignLeftRelation {
  readonly relation: "alignLeft";
  readonly reference: AnchorRef;
}

export interface AlignRightRelation {
  readonly relation: "alignRight";
  readonly reference: AnchorRef;
}

export interface AlignTopRelation {
  readonly relation: "alignTop";
  readonly reference: AnchorRef;
}

export interface AlignBottomRelation {
  readonly relation: "alignBottom";
  readonly reference: AnchorRef;
}

export type ObjectAlignment = AlignYRelation | AlignXRelation | AlignLeftRelation | AlignRightRelation | AlignTopRelation | AlignBottomRelation;

export interface BaseObject {
  readonly id: string;
  readonly style?: Style;
  readonly transform?: Transform;
  readonly placement?: ObjectPlacement;
  readonly align?: ObjectAlignment;
}

export interface RectFitToText {
  readonly textId: string;
  readonly paddingX: number;
  readonly paddingY: number;
}

export interface RectObject extends BaseObject {
  readonly kind: "rect";
  readonly center?: Point;
  readonly width?: number;
  readonly height?: number;
  readonly rx?: number;
  readonly ry?: number;
  readonly fitToText?: RectFitToText;
}

export interface CircleObject extends BaseObject {
  readonly kind: "circle";
  readonly center: Point;
  readonly radius: number;
}

export interface TextObject extends BaseObject {
  readonly kind: "text";
  readonly center: Point;
  readonly text: string;
}

export interface GroupObject extends BaseObject {
  readonly kind: "group";
  readonly children: readonly DrawableObject[];
}

export interface ConnectorObject {
  readonly kind: "connector";
  readonly id: string;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly style?: Style;
}

export type DrawableObject = RectObject | CircleObject | TextObject | GroupObject;