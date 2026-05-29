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