import type { Style } from "@vizx/core";
import type { Point } from "@vizx/geometry";
import type { AnchorName, AnchorRef } from "./anchors";
import type {
  AlignBottomRelation,
  AlignLeftRelation,
  AlignRightRelation,
  AlignTopRelation,
  AlignXRelation,
  AlignYRelation,
  CircleObject,
  ConnectorObject,
  CubicCurveToPathCommand,
  EllipseObject,
  GroupObject,
  LineObject,
  LineToPathCommand,
  MoveToPathCommand,
  ObjectPlacement,
  PathObject,
  PolygonObject,
  PolylineObject,
  QuadraticCurveToPathCommand,
  RectObject,
  RelativePlacement,
  TextObject,
} from "./objects";
import type { DistributeXOperation, DistributeYOperation, ObjectScene } from "./scene";

interface SceneOptions {
  readonly connectors?: readonly ConnectorObject[];
  readonly distribution?: readonly (DistributeXOperation | DistributeYOperation)[];
}

export function sceneOf(objects: ObjectScene["objects"], options: SceneOptions = {}): ObjectScene {
  return {
    objects: [...objects],
    ...(options.connectors ? { connectors: [...options.connectors] } : {}),
    ...(options.distribution ? { distribution: [...options.distribution] } : {}),
  };
}

export const scene = sceneOf;

export function group(id: string, options: Omit<GroupObject, "kind" | "id">): GroupObject {
  return { kind: "group", id, ...options };
}

export function rect(id: string, options: Omit<RectObject, "kind" | "id">): RectObject {
  return { kind: "rect", id, ...options };
}

export function circle(id: string, options: Omit<CircleObject, "kind" | "id">): CircleObject {
  return { kind: "circle", id, ...options };
}

export function text(id: string, options: Omit<TextObject, "kind" | "id">): TextObject {
  return { kind: "text", id, ...options };
}

export function line(id: string, options: Omit<LineObject, "kind" | "id">): LineObject {
  return { kind: "line", id, ...options };
}

export function polyline(id: string, options: Omit<PolylineObject, "kind" | "id">): PolylineObject {
  return { kind: "polyline", id, ...options };
}

export function ellipse(id: string, options: Omit<EllipseObject, "kind" | "id">): EllipseObject {
  return { kind: "ellipse", id, ...options };
}

export function polygon(id: string, options: Omit<PolygonObject, "kind" | "id">): PolygonObject {
  return { kind: "polygon", id, ...options };
}

export function path(id: string, options: Omit<PathObject, "kind" | "id">): PathObject {
  return { kind: "path", id, ...options };
}

export function moveTo(point: Point): MoveToPathCommand {
  return { kind: "moveTo", point };
}

export function lineTo(point: Point): LineToPathCommand {
  return { kind: "lineTo", point };
}

export function quadraticCurveTo(control: Point, point: Point): QuadraticCurveToPathCommand {
  return { kind: "quadraticCurveTo", control, point };
}

export function cubicCurveTo(control1: Point, control2: Point, point: Point): CubicCurveToPathCommand {
  return { kind: "cubicCurveTo", control1, control2, point };
}

export function closePath(): { readonly kind: "closePath" } {
  return { kind: "closePath" };
}

export function anchor(objectId: string, name: AnchorName = "center"): AnchorRef {
  return { objectId, anchor: name };
}

export function absolute(position: Point): ObjectPlacement {
  return { kind: "absolute", position };
}

function relativePlacement(relation: RelativePlacement["kind"], objectId: string, anchorName: AnchorName, gap: number): RelativePlacement {
  return {
    kind: relation,
    reference: anchor(objectId, anchorName),
    gap,
  };
}

export function rightOf(objectId: string, anchorName: AnchorName = "east", gap = 0): RelativePlacement {
  return relativePlacement("rightOf", objectId, anchorName, gap);
}

export function leftOf(objectId: string, anchorName: AnchorName = "west", gap = 0): RelativePlacement {
  return relativePlacement("leftOf", objectId, anchorName, gap);
}

export function above(objectId: string, anchorName: AnchorName = "north", gap = 0): RelativePlacement {
  return relativePlacement("above", objectId, anchorName, gap);
}

export function below(objectId: string, anchorName: AnchorName = "south", gap = 0): RelativePlacement {
  return relativePlacement("below", objectId, anchorName, gap);
}

export function alignX(objectId: string, anchorName: AnchorName = "center"): AlignXRelation {
  return { relation: "alignX", reference: anchor(objectId, anchorName) };
}

export function alignY(objectId: string, anchorName: AnchorName = "center"): AlignYRelation {
  return { relation: "alignY", reference: anchor(objectId, anchorName) };
}

export function alignLeft(objectId: string, anchorName: AnchorName = "west"): AlignLeftRelation {
  return { relation: "alignLeft", reference: anchor(objectId, anchorName) };
}

export function alignRight(objectId: string, anchorName: AnchorName = "east"): AlignRightRelation {
  return { relation: "alignRight", reference: anchor(objectId, anchorName) };
}

export function alignTop(objectId: string, anchorName: AnchorName = "north"): AlignTopRelation {
  return { relation: "alignTop", reference: anchor(objectId, anchorName) };
}

export function alignBottom(objectId: string, anchorName: AnchorName = "south"): AlignBottomRelation {
  return { relation: "alignBottom", reference: anchor(objectId, anchorName) };
}

export function distributeX(objectIds: readonly string[]): DistributeXOperation {
  return { relation: "distributeX", objectIds: [...objectIds] };
}

export function distributeY(objectIds: readonly string[]): DistributeYOperation {
  return { relation: "distributeY", objectIds: [...objectIds] };
}

interface ConnectorOptions {
  readonly style?: Style;
}

export function connector(id: string, from: AnchorRef, to: AnchorRef, options: ConnectorOptions = {}): ConnectorObject {
  return {
    kind: "connector",
    id,
    from,
    to,
    ...(options.style ? { style: options.style } : {}),
  };
}

export function translate(x: number, y: number): { readonly kind: "translate"; readonly x: number; readonly y: number } {
  return { kind: "translate", x, y };
}

export function rotate(angleDegrees: number, around?: Point): { readonly kind: "rotate"; readonly angleDegrees: number; readonly around?: Point } {
  return {
    kind: "rotate",
    angleDegrees,
    ...(around ? { around } : {}),
  };
}

export function scale(sx: number, sy?: number, around?: Point): { readonly kind: "scale"; readonly sx: number; readonly sy?: number; readonly around?: Point } {
  return {
    kind: "scale",
    sx,
    ...(sy !== undefined ? { sy } : {}),
    ...(around ? { around } : {}),
  };
}

export function arrowEnd(style: Style = {}): Style {
  return { ...style, markerEnd: "arrow" };
}

export function arrowStart(style: Style = {}): Style {
  return { ...style, markerStart: "arrow" };
}