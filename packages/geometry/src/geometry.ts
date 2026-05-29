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

export interface Transform {
  readonly translateX: number;
  readonly translateY: number;
}

export const identityTransform: Transform = {
  translateX: 0,
  translateY: 0,
};

export function translation(dx: number, dy: number): Transform {
  return { translateX: dx, translateY: dy };
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

export function transformPoint(source: Point, transform: Transform): Point {
  return point(source.x + transform.translateX, source.y + transform.translateY);
}