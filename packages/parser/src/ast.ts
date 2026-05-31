import type { SourceSpan } from "@vizx/core";
import type { AnchorName } from "@vizx/object-model";

export interface AstProgram {
  readonly kind: "program";
  readonly statements: readonly AstStatement[];
}

export type AstStatement = BoxStatement | ConnectStatement;

export interface BoxStatement {
  readonly kind: "box";
  readonly id: string;
  readonly label: string;
  readonly placement:
    | { readonly kind: "absolute"; readonly x: number; readonly y: number }
    | { readonly kind: "rightOf"; readonly referenceId: string; readonly distance: number }
    | { readonly kind: "none" };
  readonly span?: SourceSpan;
}

export interface ConnectStatement {
  readonly kind: "connect";
  readonly fromObjectId: string;
  readonly fromAnchorName: string;
  readonly toObjectId: string;
  readonly toAnchorName: string;
  readonly span?: SourceSpan;
}

export interface VizxAstPoint {
  readonly x: number;
  readonly y: number;
}

export interface VizxAstAnchorRef {
  readonly objectId: string;
  readonly anchor: AnchorName;
}

export interface VizxAstAbsolutePlacement {
  readonly kind: "absolute";
  readonly position: VizxAstPoint;
}

export interface VizxAstRelativePlacement {
  readonly kind: "rightOf" | "leftOf" | "above" | "below";
  readonly reference: VizxAstAnchorRef;
  readonly gap: number;
}

export type VizxAstPlacement = VizxAstAbsolutePlacement | VizxAstRelativePlacement;

export interface VizxAstAlignment {
  readonly relation: "alignX" | "alignY" | "alignLeft" | "alignRight" | "alignTop" | "alignBottom";
  readonly reference: VizxAstAnchorRef;
}

export interface VizxAstBaseObject {
  readonly id: string;
  readonly placement?: VizxAstPlacement;
  readonly align?: VizxAstAlignment;
  readonly style?: VizxAstStyle;
  readonly transform?: VizxAstTransform;
}

export interface VizxAstStyle {
  readonly stroke?: string;
  readonly fill?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: readonly number[];
  readonly strokeLineCap?: "butt" | "round" | "square";
  readonly strokeLineJoin?: "miter" | "round" | "bevel";
  readonly fillRule?: "nonzero" | "evenodd";
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly textAnchor?: "start" | "middle" | "end";
  readonly dominantBaseline?: string;
  readonly opacity?: number;
  readonly markerStart?: string;
  readonly markerEnd?: string;
}

export interface VizxAstTranslateTransform {
  readonly kind: "translate";
  readonly x: number;
  readonly y: number;
}

export interface VizxAstRotateTransform {
  readonly kind: "rotate";
  readonly angleDegrees: number;
  readonly around?: VizxAstPoint;
}

export interface VizxAstScaleTransform {
  readonly kind: "scale";
  readonly sx: number;
  readonly sy?: number;
  readonly around?: VizxAstPoint;
}

export interface VizxAstLegacyTranslateTransform {
  readonly translateX: number;
  readonly translateY: number;
}

export type VizxAstTransformOperation = VizxAstTranslateTransform | VizxAstRotateTransform | VizxAstScaleTransform;
export type VizxAstTransform = VizxAstTransformOperation | VizxAstLegacyTranslateTransform | readonly VizxAstTransformOperation[];

export interface VizxAstRectFitToText {
  readonly textId: string;
  readonly paddingX: number;
  readonly paddingY: number;
}

export interface VizxAstRectObject extends VizxAstBaseObject {
  readonly kind: "rect";
  readonly fitToText?: VizxAstRectFitToText;
  readonly center?: VizxAstPoint;
  readonly width?: number;
  readonly height?: number;
  readonly rx?: number;
  readonly ry?: number;
}

export interface VizxAstLineObject extends VizxAstBaseObject {
  readonly kind: "line";
  readonly start: VizxAstPoint;
  readonly end: VizxAstPoint;
}

export interface VizxAstPolylineObject extends VizxAstBaseObject {
  readonly kind: "polyline";
  readonly points: readonly VizxAstPoint[];
}

export interface VizxAstEllipseObject extends VizxAstBaseObject {
  readonly kind: "ellipse";
  readonly center: VizxAstPoint;
  readonly rx: number;
  readonly ry: number;
}

export interface VizxAstPolygonObject extends VizxAstBaseObject {
  readonly kind: "polygon";
  readonly points: readonly VizxAstPoint[];
}

export interface VizxAstCircleObject extends VizxAstBaseObject {
  readonly kind: "circle";
  readonly center: VizxAstPoint;
  readonly radius: number;
}

export interface VizxAstMoveToPathCommand {
  readonly kind: "moveTo";
  readonly point: VizxAstPoint;
}

export interface VizxAstLineToPathCommand {
  readonly kind: "lineTo";
  readonly point: VizxAstPoint;
}

export interface VizxAstQuadraticCurveToPathCommand {
  readonly kind: "quadraticCurveTo";
  readonly control: VizxAstPoint;
  readonly point: VizxAstPoint;
}

export interface VizxAstCubicCurveToPathCommand {
  readonly kind: "cubicCurveTo";
  readonly control1: VizxAstPoint;
  readonly control2: VizxAstPoint;
  readonly point: VizxAstPoint;
}

export interface VizxAstArcPathCommand {
  readonly kind: "arc";
  readonly center: VizxAstPoint;
  readonly radius: number;
  readonly startAngleDegrees: number;
  readonly endAngleDegrees: number;
  readonly clockwise?: boolean;
}

export interface VizxAstClosePathCommand {
  readonly kind: "closePath";
}

export type VizxAstPathCommand =
  | VizxAstMoveToPathCommand
  | VizxAstLineToPathCommand
  | VizxAstQuadraticCurveToPathCommand
  | VizxAstCubicCurveToPathCommand
  | VizxAstArcPathCommand
  | VizxAstClosePathCommand;

export interface VizxAstPathObject extends VizxAstBaseObject {
  readonly kind: "path";
  readonly commands: readonly VizxAstPathCommand[];
}

export interface VizxAstTextObject extends VizxAstBaseObject {
  readonly kind: "text";
  readonly center: VizxAstPoint;
  readonly text: string;
}

export interface VizxAstGroupObject extends VizxAstBaseObject {
  readonly kind: "group";
  readonly children: readonly VizxAstObject[];
}

export type VizxAstObject =
  | VizxAstRectObject
  | VizxAstLineObject
  | VizxAstPolylineObject
  | VizxAstEllipseObject
  | VizxAstPolygonObject
  | VizxAstCircleObject
  | VizxAstPathObject
  | VizxAstTextObject
  | VizxAstGroupObject;

export interface VizxAstConnector {
  readonly kind: "connector";
  readonly id: string;
  readonly from: VizxAstAnchorRef;
  readonly to: VizxAstAnchorRef;
  readonly style?: VizxAstStyle;
}

export interface VizxAstDistributionOperation {
  readonly relation: "distributeX" | "distributeY";
  readonly objectIds: readonly string[];
}

export interface VizxAstScene {
  readonly kind: "scene";
  readonly objects: readonly VizxAstObject[];
  readonly connectors?: readonly VizxAstConnector[];
  readonly distribution?: readonly VizxAstDistributionOperation[];
}
