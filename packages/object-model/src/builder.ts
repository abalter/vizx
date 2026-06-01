import type { Style } from "@vizx/core";
import {
  angleOf,
  angleBetweenPoints,
  circlePoint,
  circleCircleTangents,
  distance,
  labelAlongSegment,
  linearScale,
  mapDataPoint,
  normalizeAngleDegrees,
  trimSegment,
  type PlotFrame,
  type Point,
} from "@vizx/geometry";
import type { AnchorName, AnchorRef } from "./anchors";
import type {
  ArcPathCommand,
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

interface ArcCommandOptions {
  readonly clockwise?: boolean;
}

interface AngleMarkPathOptions {
  readonly vertex: Point;
  readonly fromPoint: Point;
  readonly toPoint: Point;
  readonly radius: number;
  readonly clockwise?: boolean;
  readonly style?: Style;
}

interface RightAngleMarkPathOptions {
  readonly vertex: Point;
  readonly from: Point;
  readonly to: Point;
  readonly size: number;
  readonly style?: Style;
}

interface SegmentTickMarkPathOptions {
  readonly a: Point;
  readonly b: Point;
  readonly t: number;
  readonly size: number;
  readonly style?: Style;
}

interface SegmentTickMarksOptions {
  readonly a: Point;
  readonly b: Point;
  readonly count: number;
  readonly size: number;
  readonly centerT?: number;
  readonly spacingT?: number;
  readonly style?: Style;
}

interface OpenBeltPathOptions {
  readonly centerA: Point;
  readonly radiusA: number;
  readonly centerB: Point;
  readonly radiusB: number;
  readonly style?: Style;
}

type CrossedBeltPathOptions = OpenBeltPathOptions;

interface AxisOptions {
  readonly axisValue?: number;
  readonly tickValues?: readonly number[];
  readonly tickSize?: number;
  readonly labelOffset?: number;
  readonly labelFormatter?: (value: number) => string;
  readonly gridLines?: boolean;
  readonly axisStyle?: Style;
  readonly tickStyle?: Style;
  readonly gridStyle?: Style;
  readonly labelStyle?: Style;
}

type AxisObject = LineObject | TextObject;

interface TrimmedLineOptions {
  readonly a: Point;
  readonly b: Point;
  readonly startDistance?: number;
  readonly endDistance?: number;
  readonly style?: Style;
  readonly markerStart?: Style["markerStart"];
  readonly markerEnd?: Style["markerEnd"];
}

interface CircleToCircleLineOptions {
  readonly centerA: Point;
  readonly radiusA: number;
  readonly centerB: Point;
  readonly radiusB: number;
  readonly style?: Style;
  readonly markerStart?: Style["markerStart"];
  readonly markerEnd?: Style["markerEnd"];
}

type CircleToCircleArrowOptions = CircleToCircleLineOptions;

export function trimmedLine(id: string, options: TrimmedLineOptions): LineObject {
  const trimmed = trimSegment(
    options.a,
    options.b,
    options.startDistance ?? 0,
    options.endDistance ?? 0,
  );
  const style = {
    ...(options.style ?? {}),
    ...(options.markerStart !== undefined ? { markerStart: options.markerStart } : {}),
    ...(options.markerEnd !== undefined ? { markerEnd: options.markerEnd } : {}),
  };

  return line(id, {
    start: trimmed.a,
    end: trimmed.b,
    ...(Object.keys(style).length > 0 ? { style } : {}),
  });
}

export function circleToCircleLine(id: string, options: CircleToCircleLineOptions): LineObject {
  assertFinitePointValue(options.centerA, "centerA");
  assertFinitePointValue(options.centerB, "centerB");
  assertPositiveFinite(options.radiusA, "radiusA");
  assertPositiveFinite(options.radiusB, "radiusB");

  const centerDistance = distance(options.centerA, options.centerB);
  if (centerDistance <= 1e-9) {
    throw new RangeError("circleToCircleLine requires distinct circle centers");
  }

  if (centerDistance <= options.radiusA + options.radiusB + 1e-9) {
    throw new RangeError("circleToCircleLine requires separated circles");
  }

  const unitDirection = {
    x: (options.centerB.x - options.centerA.x) / centerDistance,
    y: (options.centerB.y - options.centerA.y) / centerDistance,
  };

  const start = {
    x: options.centerA.x + unitDirection.x * options.radiusA,
    y: options.centerA.y + unitDirection.y * options.radiusA,
  };
  const end = {
    x: options.centerB.x - unitDirection.x * options.radiusB,
    y: options.centerB.y - unitDirection.y * options.radiusB,
  };
  const style = {
    ...(options.style ?? {}),
    ...(options.markerStart !== undefined ? { markerStart: options.markerStart } : {}),
    ...(options.markerEnd !== undefined ? { markerEnd: options.markerEnd } : {}),
  };

  return line(id, {
    start,
    end,
    ...(Object.keys(style).length > 0 ? { style } : {}),
  });
}

export function circleToCircleArrow(id: string, options: CircleToCircleArrowOptions): LineObject {
  return circleToCircleLine(id, {
    ...options,
    markerEnd: options.markerEnd ?? "arrow",
  });
}

export function arc(
  center: Point,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  options: ArcCommandOptions = {},
): ArcPathCommand {
  return {
    kind: "arc",
    center,
    radius,
    startAngleDegrees,
    endAngleDegrees,
    ...(options.clockwise !== undefined ? { clockwise: options.clockwise } : {}),
  };
}

export function angleMarkPath(id: string, options: AngleMarkPathOptions): PathObject {
  const angle = angleBetweenPoints(
    options.vertex,
    options.fromPoint,
    options.toPoint,
    options.clockwise ?? false,
  );
  const startPoint = circlePoint(options.vertex, options.radius, angle.startAngleDegrees);

  return path(id, {
    commands: [
      moveTo(startPoint),
      arc(
        options.vertex,
        options.radius,
        angle.startAngleDegrees,
        angle.endAngleDegrees,
        { clockwise: angle.clockwise },
      ),
    ],
    ...(options.style ? { style: options.style } : {}),
  });
}

function assertFinitePointValue(value: Point, label: string): void {
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    throw new TypeError(`${label} must use finite coordinates`);
  }
}

function normalizeDirection(from: Point, to: Point, label: string): Point {
  assertFinitePointValue(from, `${label}.from`);
  assertFinitePointValue(to, `${label}.to`);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (length <= 1e-9) {
    throw new RangeError(`${label} must use distinct points`);
  }

  return {
    x: dx / length,
    y: dy / length,
  };
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`);
  }

  if (value <= 0) {
    throw new RangeError(`${label} must be > 0`);
  }
}

function sweepDeltaDegrees(startAngleDegrees: number, endAngleDegrees: number, clockwise: boolean): number {
  if (clockwise) {
    return normalizeAngleDegrees(startAngleDegrees - endAngleDegrees);
  }

  return normalizeAngleDegrees(endAngleDegrees - startAngleDegrees);
}

function arcMidpoint(
  center: Point,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  clockwise: boolean,
): Point {
  const sweep = sweepDeltaDegrees(startAngleDegrees, endAngleDegrees, clockwise);
  const midpointAngle = clockwise
    ? startAngleDegrees - sweep / 2
    : startAngleDegrees + sweep / 2;

  return circlePoint(center, radius, midpointAngle);
}

function chooseOuterArcDirection(
  center: Point,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  awayFrom: Point,
): boolean {
  const midpointCcw = arcMidpoint(center, radius, startAngleDegrees, endAngleDegrees, false);
  const midpointCw = arcMidpoint(center, radius, startAngleDegrees, endAngleDegrees, true);

  return distance(midpointCw, awayFrom) > distance(midpointCcw, awayFrom);
}

export function rightAngleMarkPath(id: string, options: RightAngleMarkPathOptions): PathObject {
  assertFinitePointValue(options.vertex, "vertex");
  assertFinitePointValue(options.from, "from");
  assertFinitePointValue(options.to, "to");
  assertPositiveFinite(options.size, "size");

  const fromDirection = normalizeDirection(options.vertex, options.from, "from ray");
  const toDirection = normalizeDirection(options.vertex, options.to, "to ray");
  const legA = {
    x: options.vertex.x + fromDirection.x * options.size,
    y: options.vertex.y + fromDirection.y * options.size,
  };
  const corner = {
    x: options.vertex.x + (fromDirection.x + toDirection.x) * options.size,
    y: options.vertex.y + (fromDirection.y + toDirection.y) * options.size,
  };
  const legB = {
    x: options.vertex.x + toDirection.x * options.size,
    y: options.vertex.y + toDirection.y * options.size,
  };

  return path(id, {
    commands: [
      moveTo(legA),
      lineTo(corner),
      lineTo(legB),
    ],
    ...(options.style ? { style: options.style } : {}),
  });
}

export function segmentTickMarkPath(id: string, options: SegmentTickMarkPathOptions): PathObject {
  assertFinitePointValue(options.a, "a");
  assertFinitePointValue(options.b, "b");
  assertPositiveFinite(options.size, "size");

  const direction = normalizeDirection(options.a, options.b, "segment");
  const center = labelAlongSegment(options.a, options.b, options.t);
  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };
  const half = options.size / 2;
  const start = {
    x: center.x - perpendicular.x * half,
    y: center.y - perpendicular.y * half,
  };
  const end = {
    x: center.x + perpendicular.x * half,
    y: center.y + perpendicular.y * half,
  };

  return path(id, {
    commands: [
      moveTo(start),
      lineTo(end),
    ],
    ...(options.style ? { style: options.style } : {}),
  });
}

export function segmentTickMarks(idPrefix: string, options: SegmentTickMarksOptions): readonly PathObject[] {
  assertFinitePointValue(options.a, "a");
  assertFinitePointValue(options.b, "b");
  assertPositiveFinite(options.size, "size");

  if (!Number.isInteger(options.count) || options.count <= 0) {
    throw new RangeError("count must be a positive integer");
  }

  const centerT = options.centerT ?? 0.5;
  const spacingT = options.spacingT ?? 0.06;

  if (!Number.isFinite(centerT)) {
    throw new TypeError("centerT must be finite");
  }

  if (!Number.isFinite(spacingT)) {
    throw new TypeError("spacingT must be finite");
  }

  const startT = centerT - ((options.count - 1) * spacingT) / 2;

  return Array.from({ length: options.count }, (_, index) => segmentTickMarkPath(`${idPrefix}.${index}`, {
    a: options.a,
    b: options.b,
    t: startT + index * spacingT,
    size: options.size,
    style: options.style,
  }));
}

export function openBeltPath(id: string, options: OpenBeltPathOptions): PathObject {
  assertFinitePointValue(options.centerA, "centerA");
  assertFinitePointValue(options.centerB, "centerB");
  assertPositiveFinite(options.radiusA, "radiusA");
  assertPositiveFinite(options.radiusB, "radiusB");

  const centerDistance = distance(options.centerA, options.centerB);
  if (centerDistance <= options.radiusA + options.radiusB + 1e-9) {
    throw new RangeError("open belt requires disjoint circles");
  }

  const externalTangents = circleCircleTangents(
    options.centerA,
    options.radiusA,
    options.centerB,
    options.radiusB,
  ).filter((entry) => entry.kind === "external");

  if (externalTangents.length < 2) {
    throw new RangeError("open belt requires two external tangents");
  }

  const upper = externalTangents[0];
  const lower = externalTangents[1];

  if (!upper || !lower) {
    throw new RangeError("open belt requires two external tangents");
  }

  const upperAngleA = angleOf(options.centerA, upper.pointA);
  const lowerAngleA = angleOf(options.centerA, lower.pointA);
  const upperAngleB = angleOf(options.centerB, upper.pointB);
  const lowerAngleB = angleOf(options.centerB, lower.pointB);

  const arcClockwiseB = chooseOuterArcDirection(
    options.centerB,
    options.radiusB,
    upperAngleB,
    lowerAngleB,
    options.centerA,
  );
  const arcClockwiseA = chooseOuterArcDirection(
    options.centerA,
    options.radiusA,
    lowerAngleA,
    upperAngleA,
    options.centerB,
  );

  return path(id, {
    commands: [
      moveTo(upper.pointA),
      lineTo(upper.pointB),
      arc(options.centerB, options.radiusB, upperAngleB, lowerAngleB, { clockwise: arcClockwiseB }),
      lineTo(lower.pointA),
      arc(options.centerA, options.radiusA, lowerAngleA, upperAngleA, { clockwise: arcClockwiseA }),
      closePath(),
    ],
    ...(options.style ? { style: options.style } : {}),
  });
}

export function crossedBeltPath(id: string, options: CrossedBeltPathOptions): PathObject {
  assertFinitePointValue(options.centerA, "centerA");
  assertFinitePointValue(options.centerB, "centerB");
  assertPositiveFinite(options.radiusA, "radiusA");
  assertPositiveFinite(options.radiusB, "radiusB");

  const centerDistance = distance(options.centerA, options.centerB);
  if (centerDistance <= options.radiusA + options.radiusB + 1e-9) {
    throw new RangeError("crossed belt requires separated circles");
  }

  const internalTangents = circleCircleTangents(
    options.centerA,
    options.radiusA,
    options.centerB,
    options.radiusB,
  ).filter((entry) => entry.kind === "internal");

  if (internalTangents.length < 2) {
    throw new RangeError("crossed belt requires two internal tangents");
  }

  const first = internalTangents[0];
  const second = internalTangents[1];

  if (!first || !second) {
    throw new RangeError("crossed belt requires two internal tangents");
  }

  const firstAngleA = angleOf(options.centerA, first.pointA);
  const secondAngleA = angleOf(options.centerA, second.pointA);
  const firstAngleB = angleOf(options.centerB, first.pointB);
  const secondAngleB = angleOf(options.centerB, second.pointB);

  const arcClockwiseB = chooseOuterArcDirection(
    options.centerB,
    options.radiusB,
    firstAngleB,
    secondAngleB,
    options.centerA,
  );
  const arcClockwiseA = chooseOuterArcDirection(
    options.centerA,
    options.radiusA,
    secondAngleA,
    firstAngleA,
    options.centerB,
  );

  return path(id, {
    commands: [
      moveTo(first.pointA),
      lineTo(first.pointB),
      arc(options.centerB, options.radiusB, firstAngleB, secondAngleB, { clockwise: arcClockwiseB }),
      lineTo(second.pointA),
      arc(options.centerA, options.radiusA, secondAngleA, firstAngleA, { clockwise: arcClockwiseA }),
      closePath(),
    ],
    ...(options.style ? { style: options.style } : {}),
  });
}

export function xAxis(idPrefix: string, frame: PlotFrame, options: AxisOptions = {}): readonly AxisObject[] {
  const axisValue = options.axisValue ?? frame.yDomain[0];
  const tickValues = options.tickValues ?? [];
  const tickSize = options.tickSize ?? 6;
  const labelOffset = options.labelOffset ?? 12;
  const format = options.labelFormatter ?? ((value: number) => String(value));
  const yScale = linearScale(frame.yDomain, frame.yRange);
  const axisY = yScale.map(axisValue);
  const [xStart, xEnd] = frame.xRange;

  const objects: AxisObject[] = [
    line(`${idPrefix}.axis`, {
      start: { x: xStart, y: axisY },
      end: { x: xEnd, y: axisY },
      style: options.axisStyle,
    }),
  ];

  for (const [index, value] of tickValues.entries()) {
    const tickX = mapDataPoint(frame, { x: value, y: axisValue }).x;

    if (options.gridLines) {
      objects.push(line(`${idPrefix}.grid.${index}`, {
        start: { x: tickX, y: frame.yRange[0] },
        end: { x: tickX, y: frame.yRange[1] },
        style: options.gridStyle,
      }));
    }

    objects.push(line(`${idPrefix}.tick.${index}`, {
      start: { x: tickX, y: axisY - tickSize / 2 },
      end: { x: tickX, y: axisY + tickSize / 2 },
      style: options.tickStyle,
    }));

    objects.push(text(`${idPrefix}.label.${index}`, {
      center: { x: tickX, y: axisY + labelOffset },
      text: format(value),
      style: options.labelStyle,
    }));
  }

  return objects;
}

export function yAxis(idPrefix: string, frame: PlotFrame, options: AxisOptions = {}): readonly AxisObject[] {
  const axisValue = options.axisValue ?? frame.xDomain[0];
  const tickValues = options.tickValues ?? [];
  const tickSize = options.tickSize ?? 6;
  const labelOffset = options.labelOffset ?? 14;
  const format = options.labelFormatter ?? ((value: number) => String(value));
  const xScale = linearScale(frame.xDomain, frame.xRange);
  const axisX = xScale.map(axisValue);
  const [yStart, yEnd] = frame.yRange;

  const objects: AxisObject[] = [
    line(`${idPrefix}.axis`, {
      start: { x: axisX, y: yStart },
      end: { x: axisX, y: yEnd },
      style: options.axisStyle,
    }),
  ];

  for (const [index, value] of tickValues.entries()) {
    const tickY = mapDataPoint(frame, { x: axisValue, y: value }).y;

    if (options.gridLines) {
      objects.push(line(`${idPrefix}.grid.${index}`, {
        start: { x: frame.xRange[0], y: tickY },
        end: { x: frame.xRange[1], y: tickY },
        style: options.gridStyle,
      }));
    }

    objects.push(line(`${idPrefix}.tick.${index}`, {
      start: { x: axisX - tickSize / 2, y: tickY },
      end: { x: axisX + tickSize / 2, y: tickY },
      style: options.tickStyle,
    }));

    objects.push(text(`${idPrefix}.label.${index}`, {
      center: { x: axisX - labelOffset, y: tickY },
      text: format(value),
      style: options.labelStyle,
    }));
  }

  return objects;
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