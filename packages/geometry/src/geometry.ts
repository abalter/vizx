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
  | { readonly kind: "closePath" };

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