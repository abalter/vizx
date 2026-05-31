export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Vector {
  readonly dx: number;
  readonly dy: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TranslateTransform {
  readonly kind: "translate";
  readonly x: number;
  readonly y: number;
}

export interface RotateTransform {
  readonly kind: "rotate";
  readonly angleDegrees: number;
  readonly around?: Point;
}

export interface ScaleTransform {
  readonly kind: "scale";
  readonly sx: number;
  readonly sy?: number;
  readonly around?: Point;
}

export type TransformOperation = TranslateTransform | RotateTransform | ScaleTransform;

// Compatibility path for the previous transform shape.
export interface LegacyTranslateTransform {
  readonly translateX: number;
  readonly translateY: number;
}

export type Transform = TransformOperation | LegacyTranslateTransform;

export const identityTransform: readonly TransformOperation[] = [];

export function translation(dx: number, dy: number): TransformOperation {
  return { kind: "translate", x: dx, y: dy };
}

export function point(x: number, y: number): Point {
  return { x, y };
}

export function offsetPoint(source: Point, dx: number, dy: number): Point {
  return point(source.x + dx, source.y + dy);
}

export function vector(dx: number, dy: number): Vector {
  return { dx, dy };
}

export function size(width: number, height: number): Size {
  return { width, height };
}

export function addPointVector(source: Point, offset: Vector): Point {
  return {
    x: source.x + offset.dx,
    y: source.y + offset.dy,
  };
}

export function subtractPoints(a: Point, b: Point): Vector {
  return {
    dx: a.x - b.x,
    dy: a.y - b.y,
  };
}

export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angleOf(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function labelAlongSegment(a: Point, b: Point, t: number, offset = 0): Point {
  assertFinitePoint(a, "a");
  assertFinitePoint(b, "b");
  assertFiniteNumber(t, "t");
  assertFiniteNumber(offset, "offset");

  const base = point(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
  );

  if (Math.abs(offset) <= GEOMETRY_EPSILON) {
    return base;
  }

  const segmentLength = distance(a, b);
  if (segmentLength <= GEOMETRY_EPSILON) {
    throw new RangeError("segment must use distinct points when offset is non-zero");
  }

  const perpendicular = vector(-(b.y - a.y) / segmentLength, (b.x - a.x) / segmentLength);

  return point(
    base.x + perpendicular.dx * offset,
    base.y + perpendicular.dy * offset,
  );
}

export interface AngleBetweenPointsResult {
  readonly startAngleDegrees: number;
  readonly endAngleDegrees: number;
  readonly clockwise: boolean;
}

export interface TangentLineAtCirclePoint {
  readonly point: Point;
  readonly direction: Vector;
}

export interface CircleCircleTangent {
  readonly kind: "external" | "internal";
  readonly pointA: Point;
  readonly pointB: Point;
}

export type NumericInterval = readonly [number, number];

export interface LinearScale {
  readonly domain: NumericInterval;
  readonly range: NumericInterval;
  map(value: number): number;
}

export interface PlotFrame {
  readonly xDomain: NumericInterval;
  readonly yDomain: NumericInterval;
  readonly xRange: NumericInterval;
  readonly yRange: NumericInterval;
}

export interface DataPoint {
  readonly x: number;
  readonly y: number;
}

const GEOMETRY_EPSILON = 1e-9;

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`);
  }
}

function assertFinitePoint(value: Point, label: string): void {
  assertFiniteNumber(value.x, `${label}.x`);
  assertFiniteNumber(value.y, `${label}.y`);
}

function assertNonNegativeRadius(radius: number, label: string): void {
  assertFiniteNumber(radius, label);

  if (radius < 0) {
    throw new RangeError(`${label} must be >= 0`);
  }
}

function assertNonDegenerateLine(a: Point, b: Point, label: string): void {
  if (distance(a, b) <= GEOMETRY_EPSILON) {
    throw new RangeError(`${label} must use distinct points`);
  }
}

function cross2D(a: Vector, b: Vector): number {
  return a.dx * b.dy - a.dy * b.dx;
}

function dot2D(a: Vector, b: Vector): number {
  return a.dx * b.dx + a.dy * b.dy;
}

function assertFiniteInterval(interval: NumericInterval, label: string): void {
  assertFiniteNumber(interval[0], `${label}[0]`);
  assertFiniteNumber(interval[1], `${label}[1]`);
}

function assertNonZeroDomain(domain: NumericInterval, label: string): void {
  if (Math.abs(domain[1] - domain[0]) <= 1e-12) {
    throw new RangeError(`${label} must have non-zero width`);
  }
}

export function linearScale(domain: NumericInterval, range: NumericInterval): LinearScale {
  assertFiniteInterval(domain, "domain");
  assertFiniteInterval(range, "range");
  assertNonZeroDomain(domain, "domain");

  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;
  const domainSpan = domainMax - domainMin;
  const rangeSpan = rangeMax - rangeMin;

  return {
    domain: [domainMin, domainMax],
    range: [rangeMin, rangeMax],
    map(value: number): number {
      assertFiniteNumber(value, "value");
      const ratio = (value - domainMin) / domainSpan;
      return rangeMin + ratio * rangeSpan;
    },
  };
}

export function mapDataPoint(frame: PlotFrame, dataPoint: DataPoint): Point {
  assertFiniteInterval(frame.xDomain, "xDomain");
  assertFiniteInterval(frame.yDomain, "yDomain");
  assertFiniteInterval(frame.xRange, "xRange");
  assertFiniteInterval(frame.yRange, "yRange");
  assertNonZeroDomain(frame.xDomain, "xDomain");
  assertNonZeroDomain(frame.yDomain, "yDomain");
  assertFiniteNumber(dataPoint.x, "dataPoint.x");
  assertFiniteNumber(dataPoint.y, "dataPoint.y");

  const x = linearScale(frame.xDomain, frame.xRange).map(dataPoint.x);
  const y = linearScale(frame.yDomain, frame.yRange).map(dataPoint.y);

  return point(x, y);
}

export function lineLineIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  assertFinitePoint(a1, "a1");
  assertFinitePoint(a2, "a2");
  assertFinitePoint(b1, "b1");
  assertFinitePoint(b2, "b2");
  assertNonDegenerateLine(a1, a2, "line a");
  assertNonDegenerateLine(b1, b2, "line b");

  const p = a1;
  const q = b1;
  const r = subtractPoints(a2, a1);
  const s = subtractPoints(b2, b1);
  const qMinusP = subtractPoints(q, p);
  const denominator = cross2D(r, s);

  if (Math.abs(denominator) <= GEOMETRY_EPSILON) {
    // v0 behavior: parallel and coincident infinite lines both return null.
    return null;
  }

  const t = cross2D(qMinusP, s) / denominator;

  return point(
    p.x + r.dx * t,
    p.y + r.dy * t,
  );
}

export function pointOnSegment(testPoint: Point, a: Point, b: Point): boolean {
  assertFinitePoint(testPoint, "testPoint");
  assertFinitePoint(a, "a");
  assertFinitePoint(b, "b");

  const segment = subtractPoints(b, a);
  const segmentLength = Math.hypot(segment.dx, segment.dy);

  if (segmentLength <= GEOMETRY_EPSILON) {
    return distance(testPoint, a) <= GEOMETRY_EPSILON;
  }

  const fromA = subtractPoints(testPoint, a);
  const cross = cross2D(fromA, segment);

  if (Math.abs(cross) > GEOMETRY_EPSILON * Math.max(1, segmentLength)) {
    return false;
  }

  const projection = dot2D(fromA, segment);
  const segmentLengthSquared = dot2D(segment, segment);

  return projection >= -GEOMETRY_EPSILON
    && projection <= segmentLengthSquared + GEOMETRY_EPSILON;
}

export function pointOnRay(testPoint: Point, origin: Point, through: Point): boolean {
  assertFinitePoint(testPoint, "testPoint");
  assertFinitePoint(origin, "origin");
  assertFinitePoint(through, "through");
  assertNonDegenerateLine(origin, through, "ray");

  const direction = subtractPoints(through, origin);
  const fromOrigin = subtractPoints(testPoint, origin);
  const cross = cross2D(fromOrigin, direction);
  const directionLength = Math.hypot(direction.dx, direction.dy);

  if (Math.abs(cross) > GEOMETRY_EPSILON * Math.max(1, directionLength)) {
    return false;
  }

  const projection = dot2D(fromOrigin, direction);

  return projection >= -GEOMETRY_EPSILON;
}

export function segmentSegmentIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  assertFinitePoint(a1, "a1");
  assertFinitePoint(a2, "a2");
  assertFinitePoint(b1, "b1");
  assertFinitePoint(b2, "b2");
  assertNonDegenerateLine(a1, a2, "segment a");
  assertNonDegenerateLine(b1, b2, "segment b");

  const intersection = lineLineIntersection(a1, a2, b1, b2);

  if (!intersection) {
    // v0 behavior: parallel and overlapping collinear segments return null.
    return null;
  }

  if (!pointOnSegment(intersection, a1, a2)) {
    return null;
  }

  if (!pointOnSegment(intersection, b1, b2)) {
    return null;
  }

  return intersection;
}

export function segmentCircleIntersections(
  a: Point,
  b: Point,
  center: Point,
  radius: number,
): readonly Point[] {
  assertFinitePoint(a, "a");
  assertFinitePoint(b, "b");
  assertFinitePoint(center, "center");
  assertNonNegativeRadius(radius, "radius");
  assertNonDegenerateLine(a, b, "segment");

  return lineCircleIntersections(a, b, center, radius)
    .filter((entry) => pointOnSegment(entry, a, b));
}

export function trimSegment(
  a: Point,
  b: Point,
  startDistance: number,
  endDistance: number,
): { readonly a: Point; readonly b: Point } {
  assertFinitePoint(a, "a");
  assertFinitePoint(b, "b");
  assertFiniteNumber(startDistance, "startDistance");
  assertFiniteNumber(endDistance, "endDistance");

  if (startDistance < 0) {
    throw new RangeError("startDistance must be >= 0");
  }

  if (endDistance < 0) {
    throw new RangeError("endDistance must be >= 0");
  }

  const segment = subtractPoints(b, a);
  const segmentLength = Math.hypot(segment.dx, segment.dy);

  if (segmentLength <= GEOMETRY_EPSILON) {
    throw new RangeError("segment must use distinct points");
  }

  const combinedTrim = startDistance + endDistance;
  if (combinedTrim > segmentLength + GEOMETRY_EPSILON) {
    throw new RangeError("trim distance exceeds segment length");
  }

  const startT = Math.min(Math.max(startDistance / segmentLength, 0), 1);
  const endT = Math.min(Math.max(1 - endDistance / segmentLength, 0), 1);
  const clampedEndT = endT < startT ? startT : endT;

  return {
    a: point(
      a.x + segment.dx * startT,
      a.y + segment.dy * startT,
    ),
    b: point(
      a.x + segment.dx * clampedEndT,
      a.y + segment.dy * clampedEndT,
    ),
  };
}

export function trimSegmentStart(
  a: Point,
  b: Point,
  distance: number,
): { readonly a: Point; readonly b: Point } {
  return trimSegment(a, b, distance, 0);
}

export function trimSegmentEnd(
  a: Point,
  b: Point,
  distance: number,
): { readonly a: Point; readonly b: Point } {
  return trimSegment(a, b, 0, distance);
}

export function trimSegmentToCircle(
  a: Point,
  b: Point,
  center: Point,
  radius: number,
): { readonly a: Point; readonly b: Point } | null {
  assertFinitePoint(a, "a");
  assertFinitePoint(b, "b");
  assertFinitePoint(center, "center");
  assertNonNegativeRadius(radius, "radius");
  assertNonDegenerateLine(a, b, "segment");

  const intersections = segmentCircleIntersections(a, b, center, radius);

  if (intersections.length < 2) {
    return null;
  }

  const direction = subtractPoints(b, a);
  const directionLengthSquared = dot2D(direction, direction);
  const ordered = [...intersections].sort((left, right) => {
    const leftProjection = dot2D(subtractPoints(left, a), direction) / directionLengthSquared;
    const rightProjection = dot2D(subtractPoints(right, a), direction) / directionLengthSquared;

    return leftProjection - rightProjection;
  });

  const first = ordered[0];
  const second = ordered[1];

  if (!first || !second) {
    return null;
  }

  return { a: first, b: second };
}

export function rayCircleIntersections(
  origin: Point,
  through: Point,
  center: Point,
  radius: number,
): readonly Point[] {
  assertFinitePoint(origin, "origin");
  assertFinitePoint(through, "through");
  assertFinitePoint(center, "center");
  assertNonNegativeRadius(radius, "radius");
  assertNonDegenerateLine(origin, through, "ray");

  return lineCircleIntersections(origin, through, center, radius)
    .filter((entry) => pointOnRay(entry, origin, through));
}

export function lineCircleIntersections(
  lineA: Point,
  lineB: Point,
  center: Point,
  radius: number,
): readonly Point[] {
  assertFinitePoint(lineA, "lineA");
  assertFinitePoint(lineB, "lineB");
  assertFinitePoint(center, "center");
  assertNonNegativeRadius(radius, "radius");
  assertNonDegenerateLine(lineA, lineB, "line");

  const direction = subtractPoints(lineB, lineA);
  const fromCenter = subtractPoints(lineA, center);
  const a = dot2D(direction, direction);
  const b = 2 * dot2D(fromCenter, direction);
  const c = dot2D(fromCenter, fromCenter) - radius * radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < -GEOMETRY_EPSILON) {
    return [];
  }

  if (Math.abs(discriminant) <= GEOMETRY_EPSILON) {
    const t = -b / (2 * a);

    return [point(
      lineA.x + direction.dx * t,
      lineA.y + direction.dy * t,
    )];
  }

  const sqrtDiscriminant = Math.sqrt(Math.max(0, discriminant));
  const t1 = (-b - sqrtDiscriminant) / (2 * a);
  const t2 = (-b + sqrtDiscriminant) / (2 * a);

  return [t1, t2].map((t) => point(
    lineA.x + direction.dx * t,
    lineA.y + direction.dy * t,
  ));
}

export function circleCircleIntersections(
  centerA: Point,
  radiusA: number,
  centerB: Point,
  radiusB: number,
): readonly Point[] {
  assertFinitePoint(centerA, "centerA");
  assertFinitePoint(centerB, "centerB");
  assertNonNegativeRadius(radiusA, "radiusA");
  assertNonNegativeRadius(radiusB, "radiusB");

  const delta = subtractPoints(centerB, centerA);
  const d = distance(centerA, centerB);

  if (d <= GEOMETRY_EPSILON && Math.abs(radiusA - radiusB) <= GEOMETRY_EPSILON) {
    // v0 behavior: coincident circles (infinite intersections) return empty.
    return [];
  }

  if (d > radiusA + radiusB + GEOMETRY_EPSILON) {
    return [];
  }

  if (d < Math.abs(radiusA - radiusB) - GEOMETRY_EPSILON) {
    return [];
  }

  if (d <= GEOMETRY_EPSILON) {
    return [];
  }

  const a = (radiusA * radiusA - radiusB * radiusB + d * d) / (2 * d);
  const hSquared = radiusA * radiusA - a * a;

  if (hSquared < -GEOMETRY_EPSILON) {
    return [];
  }

  const midX = centerA.x + (a * delta.dx) / d;
  const midY = centerA.y + (a * delta.dy) / d;

  if (Math.abs(hSquared) <= GEOMETRY_EPSILON) {
    return [point(midX, midY)];
  }

  const h = Math.sqrt(Math.max(0, hSquared));
  const rx = (-delta.dy * h) / d;
  const ry = (delta.dx * h) / d;

  return [
    point(midX + rx, midY + ry),
    point(midX - rx, midY - ry),
  ];
}

export function tangentLineAtCirclePoint(
  center: Point,
  pointOnCircle: Point,
): TangentLineAtCirclePoint {
  assertFinitePoint(center, "center");
  assertFinitePoint(pointOnCircle, "pointOnCircle");

  const radiusVector = subtractPoints(pointOnCircle, center);
  const radiusLength = distance(center, pointOnCircle);

  if (radiusLength <= GEOMETRY_EPSILON) {
    throw new RangeError("pointOnCircle must differ from center");
  }

  // Tangent direction is a normalized perpendicular to the radius vector.
  const direction = vector(-radiusVector.dy / radiusLength, radiusVector.dx / radiusLength);

  return {
    point: pointOnCircle,
    direction,
  };
}

export function tangentPointsFromPointToCircle(
  externalPoint: Point,
  center: Point,
  radius: number,
): readonly Point[] {
  assertFinitePoint(externalPoint, "externalPoint");
  assertFinitePoint(center, "center");
  assertFiniteNumber(radius, "radius");

  if (radius <= 0) {
    throw new RangeError("radius must be > 0");
  }

  const delta = subtractPoints(externalPoint, center);
  const distanceToCenter = distance(externalPoint, center);

  if (distanceToCenter < radius - GEOMETRY_EPSILON) {
    return [];
  }

  if (Math.abs(distanceToCenter - radius) <= GEOMETRY_EPSILON) {
    return [point(externalPoint.x, externalPoint.y)];
  }

  const baseAngle = Math.atan2(delta.dy, delta.dx);
  const offsetAngle = Math.acos(radius / distanceToCenter);
  const angleA = baseAngle - offsetAngle;
  const angleB = baseAngle + offsetAngle;

  return [
    point(
      center.x + radius * Math.cos(angleA),
      center.y + radius * Math.sin(angleA),
    ),
    point(
      center.x + radius * Math.cos(angleB),
      center.y + radius * Math.sin(angleB),
    ),
  ];
}

function dedupeCircleCircleTangents(entries: readonly CircleCircleTangent[]): readonly CircleCircleTangent[] {
  const deduped: CircleCircleTangent[] = [];

  for (const entry of entries) {
    const duplicate = deduped.some((candidate) =>
      candidate.kind === entry.kind
      && distance(candidate.pointA, entry.pointA) <= GEOMETRY_EPSILON
      && distance(candidate.pointB, entry.pointB) <= GEOMETRY_EPSILON);

    if (!duplicate) {
      deduped.push(entry);
    }
  }

  return deduped;
}

export function circleCircleTangents(
  centerA: Point,
  radiusA: number,
  centerB: Point,
  radiusB: number,
): readonly CircleCircleTangent[] {
  assertFinitePoint(centerA, "centerA");
  assertFinitePoint(centerB, "centerB");
  assertFiniteNumber(radiusA, "radiusA");
  assertFiniteNumber(radiusB, "radiusB");

  if (radiusA <= 0) {
    throw new RangeError("radiusA must be > 0");
  }

  if (radiusB <= 0) {
    throw new RangeError("radiusB must be > 0");
  }

  const delta = subtractPoints(centerB, centerA);
  const distanceSquared = dot2D(delta, delta);

  if (distanceSquared <= GEOMETRY_EPSILON * GEOMETRY_EPSILON) {
    // v0 behavior: coincident centers return no common tangents.
    return [];
  }

  const baseDirectionLength = Math.sqrt(distanceSquared);
  const sideValue = (entry: CircleCircleTangent): number => {
    const contact = subtractPoints(entry.pointA, centerA);
    return cross2D(delta, contact) / baseDirectionLength;
  };

  const result: CircleCircleTangent[] = [];

  for (const kind of ["external", "internal"] as const) {
    const orientation = kind === "external" ? 1 : -1;
    const adjustedRadius = radiusA - orientation * radiusB;
    const hSquared = distanceSquared - adjustedRadius * adjustedRadius;

    if (hSquared < -GEOMETRY_EPSILON) {
      continue;
    }

    const h = Math.sqrt(Math.max(0, hSquared));
    const sides = h <= GEOMETRY_EPSILON ? [1] : [1, -1];

    for (const side of sides) {
      const normal = {
        dx: (delta.dx * adjustedRadius - delta.dy * h * side) / distanceSquared,
        dy: (delta.dy * adjustedRadius + delta.dx * h * side) / distanceSquared,
      };

      result.push({
        kind,
        pointA: point(
          centerA.x + normal.dx * radiusA,
          centerA.y + normal.dy * radiusA,
        ),
        pointB: point(
          centerB.x + normal.dx * radiusB * orientation,
          centerB.y + normal.dy * radiusB * orientation,
        ),
      });
    }
  }

  const deduped = dedupeCircleCircleTangents(result);

  const externals = deduped
    .filter((entry) => entry.kind === "external")
    .sort((a, b) => sideValue(b) - sideValue(a));
  const internals = deduped
    .filter((entry) => entry.kind === "internal")
    .sort((a, b) => sideValue(b) - sideValue(a));

  return [...externals, ...internals];
}

export function polar(origin: Point, radius: number, angleDegrees: number): Point {
  const radians = (angleDegrees * Math.PI) / 180;

  return point(
    origin.x + radius * Math.cos(radians),
    origin.y + radius * Math.sin(radians),
  );
}

export function circlePoint(center: Point, radius: number, angleDegrees: number): Point {
  return polar(center, radius, angleDegrees);
}

export function regularPolygonPoints(
  center: Point,
  radius: number,
  sides: number,
  rotationDegrees = -90,
): readonly Point[] {
  if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(radius) || !Number.isFinite(sides) || !Number.isFinite(rotationDegrees)) {
    throw new TypeError("regularPolygonPoints expects finite numeric inputs");
  }

  if (!Number.isInteger(sides) || sides < 3) {
    throw new RangeError("regularPolygonPoints expects sides >= 3");
  }

  if (radius < 0) {
    throw new RangeError("regularPolygonPoints expects radius >= 0");
  }

  const stepDegrees = 360 / sides;

  return Array.from({ length: sides }, (_, index) => circlePoint(center, radius, rotationDegrees + stepDegrees * index));
}

export function bboxFromRect(x: number, y: number, width: number, height: number): BoundingBox {
  return { x, y, width, height };
}

export function angleBetweenPoints(
  vertex: Point,
  fromPoint: Point,
  toPoint: Point,
  clockwise = false,
): AngleBetweenPointsResult {
  if (!Number.isFinite(vertex.x) || !Number.isFinite(vertex.y)
    || !Number.isFinite(fromPoint.x) || !Number.isFinite(fromPoint.y)
    || !Number.isFinite(toPoint.x) || !Number.isFinite(toPoint.y)) {
    throw new TypeError("angleBetweenPoints expects finite point coordinates");
  }

  if (distance(vertex, fromPoint) <= 1e-9) {
    throw new RangeError("angleBetweenPoints expects fromPoint to differ from vertex");
  }

  if (distance(vertex, toPoint) <= 1e-9) {
    throw new RangeError("angleBetweenPoints expects toPoint to differ from vertex");
  }

  return {
    startAngleDegrees: angleOf(vertex, fromPoint),
    endAngleDegrees: angleOf(vertex, toPoint),
    clockwise,
  };
}

interface AngleLabelPointOptions {
  readonly clockwise?: boolean;
  readonly offset?: number;
}

export function angleLabelPoint(
  vertex: Point,
  fromPoint: Point,
  toPoint: Point,
  radius: number,
  options: AngleLabelPointOptions = {},
): Point {
  if (!Number.isFinite(radius)) {
    throw new TypeError("angleLabelPoint expects a finite radius");
  }

  const { startAngleDegrees, endAngleDegrees, clockwise } = angleBetweenPoints(
    vertex,
    fromPoint,
    toPoint,
    options.clockwise ?? false,
  );
  const sweep = angleDeltaDegrees(startAngleDegrees, endAngleDegrees, clockwise);
  const labelAngleDegrees = clockwise
    ? startAngleDegrees - sweep / 2
    : startAngleDegrees + sweep / 2;
  const labelRadius = radius + (options.offset ?? 0);

  return circlePoint(vertex, labelRadius, labelAngleDegrees);
}

export function bboxFromLine(start: Point, end: Point): BoundingBox {
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const maxY = Math.max(start.y, end.y);

  return bboxFromRect(minX, minY, maxX - minX, maxY - minY);
}

export function bboxFromPoints(points: readonly Point[]): BoundingBox {
  if (points.length === 0) {
    return bboxFromRect(0, 0, 0, 0);
  }

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return bboxFromRect(minX, minY, maxX - minX, maxY - minY);
}

export function bboxFromPolygon(points: readonly Point[]): BoundingBox {
  return bboxFromPoints(points);
}

export type PathBoundingCommand =
  | { readonly kind: "moveTo"; readonly point: Point }
  | { readonly kind: "lineTo"; readonly point: Point }
  | { readonly kind: "quadraticCurveTo"; readonly control: Point; readonly point: Point }
  | { readonly kind: "cubicCurveTo"; readonly control1: Point; readonly control2: Point; readonly point: Point }
  | {
    readonly kind: "arc";
    readonly center: Point;
    readonly radius: number;
    readonly startAngleDegrees: number;
    readonly endAngleDegrees: number;
    readonly clockwise?: boolean;
  }
  | { readonly kind: "closePath" };

export function normalizeAngleDegrees(angleDegrees: number): number {
  const normalized = ((angleDegrees % 360) + 360) % 360;

  return Math.abs(normalized - 360) < 1e-9 ? 0 : normalized;
}

export function angleDeltaDegrees(startAngleDegrees: number, endAngleDegrees: number, clockwise = false): number {
  if (clockwise) {
    return normalizeAngleDegrees(startAngleDegrees - endAngleDegrees);
  }

  return normalizeAngleDegrees(endAngleDegrees - startAngleDegrees);
}

export function isAngleWithinSweep(
  angleDegrees: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  clockwise = false,
  tolerance = 1e-9,
): boolean {
  const sweep = angleDeltaDegrees(startAngleDegrees, endAngleDegrees, clockwise);
  const candidateDelta = angleDeltaDegrees(startAngleDegrees, angleDegrees, clockwise);

  if (sweep <= tolerance) {
    return Math.abs(candidateDelta) <= tolerance;
  }

  return candidateDelta >= -tolerance && candidateDelta <= sweep + tolerance;
}

export function bboxFromCircularArc(
  center: Point,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number,
  clockwise = false,
): BoundingBox {
  if (!Number.isFinite(center.x) || !Number.isFinite(center.y)
    || !Number.isFinite(radius)
    || !Number.isFinite(startAngleDegrees)
    || !Number.isFinite(endAngleDegrees)) {
    throw new TypeError("bboxFromCircularArc expects finite numeric inputs");
  }

  if (radius < 0) {
    throw new RangeError("bboxFromCircularArc expects radius >= 0");
  }

  const start = circlePoint(center, radius, startAngleDegrees);
  const end = circlePoint(center, radius, endAngleDegrees);
  const candidates: Point[] = [start, end];

  for (const cardinal of [0, 90, 180, 270]) {
    if (isAngleWithinSweep(cardinal, startAngleDegrees, endAngleDegrees, clockwise)) {
      candidates.push(circlePoint(center, radius, cardinal));
    }
  }

  return bboxFromPoints(candidates);
}

export function bboxFromPathCommands(commands: readonly PathBoundingCommand[]): BoundingBox {
  const explicitPoints = commands.flatMap((command): Point[] => {
    if (command.kind === "moveTo" || command.kind === "lineTo") {
      return [command.point];
    }

    if (command.kind === "quadraticCurveTo") {
      return [command.control, command.point];
    }

    if (command.kind === "cubicCurveTo") {
      return [command.control1, command.control2, command.point];
    }

    if (command.kind === "arc") {
      const arcBBox = bboxFromCircularArc(
        command.center,
        command.radius,
        command.startAngleDegrees,
        command.endAngleDegrees,
        command.clockwise ?? false,
      );

      return [
        point(arcBBox.x, arcBBox.y),
        point(arcBBox.x + arcBBox.width, arcBBox.y + arcBBox.height),
      ];
    }

    return [];
  });

  return bboxFromPoints(explicitPoints);
}

export function bboxFromEllipse(center: Point, rx: number, ry: number): BoundingBox {
  return bboxFromRect(center.x - rx, center.y - ry, rx * 2, ry * 2);
}

export function bboxUnion(...boxes: readonly BoundingBox[]): BoundingBox {
  if (boxes.length === 0) {
    return bboxFromRect(0, 0, 0, 0);
  }

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return bboxFromRect(minX, minY, maxX - minX, maxY - minY);
}

export function bboxTranslate(box: BoundingBox, offset: Vector): BoundingBox {
  return bboxFromRect(box.x + offset.dx, box.y + offset.dy, box.width, box.height);
}

export function rotatePoint(source: Point, angleDegrees: number, around: Point = point(0, 0)): Point {
  const radians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const relativeX = source.x - around.x;
  const relativeY = source.y - around.y;

  return point(
    around.x + relativeX * cos - relativeY * sin,
    around.y + relativeX * sin + relativeY * cos,
  );
}

export function scalePoint(source: Point, sx: number, sy: number = sx, around: Point = point(0, 0)): Point {
  return point(
    around.x + (source.x - around.x) * sx,
    around.y + (source.y - around.y) * sy,
  );
}

export function normalizeTransforms(transform: Transform | readonly Transform[] | undefined): readonly TransformOperation[] {
  if (!transform) {
    return identityTransform;
  }

  const operations = Array.isArray(transform) ? transform : [transform];

  return operations.map((operation): TransformOperation => {
    if ("kind" in operation) {
      return operation;
    }

    return {
      kind: "translate",
      x: operation.translateX,
      y: operation.translateY,
    };
  });
}

export function transformPoint(source: Point, transform: Transform | readonly Transform[] | undefined): Point {
  return normalizeTransforms(transform).reduce((current, operation) => {
    if (operation.kind === "translate") {
      return point(current.x + operation.x, current.y + operation.y);
    }

    if (operation.kind === "rotate") {
      return rotatePoint(current, operation.angleDegrees, operation.around);
    }

    return scalePoint(current, operation.sx, operation.sy, operation.around);
  }, source);
}

export function transformPoints(points: readonly Point[], transform: Transform | readonly Transform[] | undefined): readonly Point[] {
  return points.map((entry) => transformPoint(entry, transform));
}

export function bboxFromTransformedCorners(box: BoundingBox, transform: Transform | readonly Transform[] | undefined): BoundingBox {
  const corners = transformPoints([
    point(box.x, box.y),
    point(box.x + box.width, box.y),
    point(box.x + box.width, box.y + box.height),
    point(box.x, box.y + box.height),
  ], transform);

  return bboxFromPoints(corners);
}